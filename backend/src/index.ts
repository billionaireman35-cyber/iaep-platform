import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
app.use(helmet());
app.use(cors());
app.use(express.json());

const DISCIPLINES = [
  ['civil', 'Civil and Structural'], ['mechanical', 'Mechanical and Marine'], ['electrical', 'Electrical and Electronics'],
  ['chemical', 'Chemical and Process'], ['petroleum', 'Petroleum and Gas'], ['software', 'Software and Computer'],
  ['environmental', 'Environmental and Safety'],
].map(([id, name]) => ({ id, name }));

type Req = Request & { uid?: string };
const h = (fn: (req: Req, res: Response) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => fn(req as Req, res).catch(next);
const auth = (admin = false) => (req: Req, res: Response, next: NextFunction) => {
  try {
    const p = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET) as { id: string; role: string };
    if (admin && p.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    req.uid = p.id; next();
  } catch { res.status(401).json({ error: 'Please sign in' }); }
};

app.get('/api/health', (_q, r) => r.json({ ok: true }));
app.get('/api/meta', h(async (_q, r) => { const dv = await prisma.division.findMany({ orderBy: { name: 'asc' } }); r.json({ grades: await prisma.grade.findMany({ orderBy: [{ duesUsd: 'asc' }] }), disciplines: dv.length ? dv.map((x) => ({ id: x.id, name: x.name })) : DISCIPLINES }); }));

app.post('/api/auth/login', h(async (q, r) => {
  const { email, password } = z.object({ email: z.string(), password: z.string() }).parse(q.body);
  const u = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) return r.status(401).json({ error: 'Wrong email or password' });
  r.json({ token: jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: '7d' }) });
}));

app.get('/api/me', auth(), h(async (q, r) => {
  const u = await prisma.user.findUnique({ where: { id: q.uid }, include: { grade: true, enrollments: true, registrations: true, cpd: { orderBy: { date: 'desc' } } } });
  if (!u) return r.status(401).json({ error: 'Please sign in' });
  const { passwordHash, ...user } = u;
  r.json({ ...user, cpdDone: u.cpd.reduce((s, c) => s + c.hours, 0) });
}));

app.get('/api/courses', h(async (_q, r) => r.json(await prisma.course.findMany())));
app.post('/api/courses/:id/enroll', auth(), h(async (q, r) => {
  await prisma.enrollment.upsert({ where: { userId_courseId: { userId: q.uid!, courseId: q.params.id } }, update: {}, create: { userId: q.uid!, courseId: q.params.id } });
  r.json({ ok: true });
}));
app.get('/api/events', h(async (_q, r) => r.json(await prisma.event.findMany({ orderBy: { date: 'asc' } }))));
app.post('/api/events/:id/register', auth(), h(async (q, r) => {
  await prisma.registration.upsert({ where: { userId_eventId: { userId: q.uid!, eventId: q.params.id } }, update: {}, create: { userId: q.uid!, eventId: q.params.id } });
  r.json({ ok: true });
}));
app.post('/api/cpd', auth(), h(async (q, r) => {
  const d = z.object({ title: z.string().min(2), provider: z.string().default('Self-reported'), category: z.string(), hours: z.number().int().min(1).max(60) }).parse(q.body);
  r.json(await prisma.cpdEntry.create({ data: { ...d, userId: q.uid! } }));
}));

const appSchema = z.object({
  name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), country: z.string(), city: z.string().optional(),
  disciplineId: z.string(), gradeId: z.string(), degree: z.string().min(2), institution: z.string().min(2), gradYear: z.coerce.number().int(),
  employer: z.string().min(2), jobTitle: z.string().min(2), years: z.coerce.number().int().min(0), summary: z.string().optional(),
  sponsorName: z.string().optional(), sponsorNo: z.string().optional(),
});
app.post('/api/applications', h(async (q, r) => {
  const d = appSchema.parse(q.body);
  const ref = 'APP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  await prisma.application.create({ data: { ...d, email: d.email.toLowerCase().trim(), ref } });
  r.json({ ref });
}));

app.get('/api/admin/applications', auth(true), h(async (_q, r) => r.json(await prisma.application.findMany({ orderBy: { createdAt: 'desc' }, include: { grade: true } }))));
app.post('/api/admin/applications/:id/reject', auth(true), h(async (q, r) => {
  await prisma.application.update({ where: { id: q.params.id }, data: { status: 'REJECTED' } }); r.json({ ok: true });
}));
app.post('/api/admin/applications/:id/approve', auth(true), h(async (q, r) => {
  const a = await prisma.application.findUnique({ where: { id: q.params.id }, include: { grade: true } });
  if (!a || a.status !== 'PENDING') return r.status(400).json({ error: 'Application is not pending' });
  if (process.env.FLW_SECRET_KEY) {
    await prisma.application.update({ where: { id: a.id }, data: { status: 'AWAITING_PAYMENT' } });
    return r.json({ memberNo: 'Issued after payment', tempPassword: 'The applicant pays on the Pay dues page with reference ' + a.ref, email: a.email });
  }
  const n = (await prisma.user.count({ where: { role: 'MEMBER' } })) + 1;
  const memberNo = `IAEP-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
  const tempPassword = crypto.randomBytes(5).toString('hex');
  await prisma.user.create({ data: {
    email: a.email, name: a.name, passwordHash: await bcrypt.hash(tempPassword, 10), memberNo, gradeId: a.gradeId,
    postNominal: a.grade.postNominal, cpdTarget: a.grade.cpdHours, disciplineId: a.disciplineId, title: a.jobTitle, organization: a.employer,
  } });
  await prisma.application.update({ where: { id: a.id }, data: { status: 'APPROVED' } });
  r.json({ memberNo, tempPassword, email: a.email });
}));

app.get('/api/verify/:no', h(async (q, r) => {
  const u = await prisma.user.findUnique({ where: { memberNo: q.params.no.trim().toUpperCase() }, include: { grade: true } });
  if (!u) return r.json({ valid: false });
  r.json({ valid: true, name: u.name, postNominal: u.postNominal, grade: u.grade?.name, since: u.createdAt });
}));
app.get('/api/posts', h(async (_q, r) => r.json(await prisma.post.findMany({ orderBy: { createdAt: 'desc' } }))));
app.post('/api/admin/posts', auth(true), h(async (q, r) => {
  const d = z.object({ title: z.string().min(2), body: z.string().min(2) }).parse(q.body);
  r.json(await prisma.post.create({ data: d }));
}));
app.delete('/api/admin/posts/:id', auth(true), h(async (q, r) => { await prisma.post.delete({ where: { id: q.params.id } }); r.json({ ok: true }); }));
app.post('/api/messages', h(async (q, r) => {
  const d = z.object({ name: z.string().min(2), email: z.string().email(), text: z.string().min(5) }).parse(q.body);
  await prisma.message.create({ data: d }); r.json({ ok: true });
}));
app.get('/api/admin/messages', auth(true), h(async (_q, r) => r.json(await prisma.message.findMany({ orderBy: { createdAt: 'desc' } }))));

app.get('/api/pages/:slug', h(async (q, r) => r.json((await prisma.page.findUnique({ where: { slug: q.params.slug } })) || { slug: q.params.slug, title: '', body: '' })));
app.put('/api/admin/pages/:slug', auth(true), h(async (q, r) => {
  if (!['governance', 'constitution', 'treasury', 'chapters', 'corporate'].includes(q.params.slug)) return r.status(400).json({ error: 'Unknown page' });
  const d = z.object({ title: z.string().min(2), body: z.string() }).parse(q.body);
  r.json(await prisma.page.upsert({ where: { slug: q.params.slug }, update: d, create: { slug: q.params.slug, ...d } }));
}));

app.post('/api/auth/signup', h(async (q, r) => {
  const d = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }).parse(q.body);
  const email = d.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return r.status(409).json({ error: 'An account with this email already exists' });
  await prisma.user.create({ data: { email, name: d.name, passwordHash: await bcrypt.hash(d.password, 10) } });
  r.json({ ok: true });
}));

const evSchema = z.object({ title: z.string().min(3), category: z.string().min(2), date: z.coerce.date(), venue: z.string().min(2), speaker: z.string().default(''), cpdHours: z.coerce.number().int().min(0) });
const coSchema = z.object({ title: z.string().min(3), description: z.string().min(3), level: z.string().min(2), cpdHours: z.coerce.number().int().min(0) });
const grSchema = z.object({ duesUsd: z.coerce.number().int().min(0), duesNgn: z.coerce.number().int().min(0), cpdHours: z.coerce.number().int().min(0) });
app.get('/api/admin/content', auth(true), h(async (_q, r) => r.json({
  events: await prisma.event.findMany({ orderBy: { date: 'asc' } }),
  courses: await prisma.course.findMany({ orderBy: { title: 'asc' } }),
  grades: await prisma.grade.findMany({ orderBy: { minYears: 'asc' } }),
})));
app.post('/api/admin/events', auth(true), h(async (q, r) => r.json(await prisma.event.create({ data: evSchema.parse(q.body) }))));
app.delete('/api/admin/events/:id', auth(true), h(async (q, r) => { await prisma.registration.deleteMany({ where: { eventId: q.params.id } }); await prisma.event.delete({ where: { id: q.params.id } }); r.json({ ok: true }); }));
app.post('/api/admin/courses', auth(true), h(async (q, r) => r.json(await prisma.course.create({ data: coSchema.parse(q.body) }))));
app.delete('/api/admin/courses/:id', auth(true), h(async (q, r) => { await prisma.enrollment.deleteMany({ where: { courseId: q.params.id } }); await prisma.course.delete({ where: { id: q.params.id } }); r.json({ ok: true }); }));
app.put('/api/admin/grades/:id', auth(true), h(async (q, r) => r.json(await prisma.grade.update({ where: { id: q.params.id }, data: grSchema.parse(q.body) }))));

app.get('/api/public/home', h(async (_q, r) => r.json({
  grades: await prisma.grade.findMany({ orderBy: [{ duesUsd: 'asc' }] }),
  events: await prisma.event.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: 'asc' }, take: 3 }),
  posts: await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
})));

const FLW_BASE = 'https://api.flutterwave.com/v3';
const flw = async (path: string, init: any = {}) => {
  const res = await (globalThis as any).fetch(FLW_BASE + path, { ...init, headers: { Authorization: 'Bearer ' + process.env.FLW_SECRET_KEY, 'Content-Type': 'application/json' } });
  return res.json();
};
async function settle(txRef: string, transactionId: string): Promise<any> {
  const pay = await prisma.payment.findUnique({ where: { txRef } });
  if (!pay) return { status: 'unknown' };
  if (pay.status === 'PAID') return { status: 'paid', memberNo: pay.memberNo };
  const v: any = await flw('/transactions/' + encodeURIComponent(transactionId) + '/verify');
  const d = v && v.data;
  if (!v || v.status !== 'success' || !d || d.status !== 'successful' || d.tx_ref !== pay.txRef || d.currency !== pay.currency || Number(d.amount) < pay.amount) return { status: 'failed' };
  const gate = await prisma.payment.updateMany({ where: { txRef, status: 'PENDING' }, data: { status: 'PROCESSING' } });
  if (gate.count === 0) {
    const again = await prisma.payment.findUnique({ where: { txRef } });
    return again && again.status === 'PAID' ? { status: 'paid', memberNo: again.memberNo } : { status: 'processing' };
  }
  try {
    const a = await prisma.application.findUnique({ where: { id: pay.applicationId }, include: { grade: true } });
    if (!a) throw new Error('application missing');
    const n = (await prisma.user.count({ where: { role: 'MEMBER' } })) + 1;
    const memberNo = `IAEP-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
    await prisma.user.create({ data: { email: a.email, name: a.name, passwordHash: pay.passwordHash, memberNo, gradeId: a.gradeId, postNominal: a.grade.postNominal, cpdTarget: a.grade.cpdHours, disciplineId: a.disciplineId, title: a.jobTitle, organization: a.employer } });
    await prisma.application.update({ where: { id: a.id }, data: { status: 'APPROVED' } });
    await prisma.payment.update({ where: { txRef }, data: { status: 'PAID', memberNo, flwId: String(transactionId) } });
    return { status: 'paid', memberNo };
  } catch (e) {
    console.error(e);
    await prisma.payment.update({ where: { txRef }, data: { status: 'PENDING' } });
    return { status: 'error' };
  }
}
app.post('/api/payments/start', h(async (q, r) => {
  const d = z.object({ ref: z.string().min(3), email: z.string().email(), password: z.string().min(8), currency: z.enum(['NGN', 'USD']) }).parse(q.body);
  if (!process.env.FLW_SECRET_KEY) return r.status(503).json({ error: 'Online payment is not enabled yet. Please contact the Secretariat.' });
  const a = await prisma.application.findUnique({ where: { ref: d.ref.trim().toUpperCase() }, include: { grade: true } });
  if (!a || a.email !== d.email.toLowerCase().trim()) return r.status(404).json({ error: 'No application found for that reference and email' });
  if (a.status === 'APPROVED') return r.status(400).json({ error: 'This membership is already active. Please sign in.' });
  if (a.status !== 'AWAITING_PAYMENT') return r.status(400).json({ error: 'This application has not been approved for payment yet' });
  const amount = d.currency === 'NGN' ? a.grade.duesNgn : a.grade.duesUsd;
  if (!amount) return r.status(400).json({ error: 'Dues for this grade have not been set yet. Please contact the Secretariat.' });
  if (await prisma.user.findUnique({ where: { email: a.email } })) return r.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  const txRef = 'IAEP-PAY-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  await prisma.payment.create({ data: { txRef, applicationId: a.id, amount, currency: d.currency, passwordHash: await bcrypt.hash(d.password, 10) } });
  const origin = process.env.FRONTEND_URL || String(q.headers.origin || '');
  const res: any = await flw('/payments', { method: 'POST', body: JSON.stringify({
    tx_ref: txRef, amount, currency: d.currency, redirect_url: origin + '/payment/return', payment_options: 'card',
    customer: { email: a.email, name: a.name },
    customizations: { title: 'IAEP membership dues', description: a.grade.name + ', annual dues' },
  }) });
  if (!res || res.status !== 'success' || !res.data || !res.data.link) return r.status(502).json({ error: 'Could not start the payment. Please try again.' });
  r.json({ link: res.data.link });
}));
app.post('/api/payments/verify', h(async (q, r) => {
  const d = z.object({ txRef: z.string().min(3), transactionId: z.string().min(1) }).parse(q.body);
  r.json(await settle(d.txRef, d.transactionId));
}));
app.post('/api/payments/webhook', h(async (q, r) => {
  if (!process.env.FLW_SECRET_HASH || q.headers['verif-hash'] !== process.env.FLW_SECRET_HASH) return r.status(401).end();
  const d = (q.body && q.body.data) || {};
  if (d.tx_ref && d.id) await settle(String(d.tx_ref), String(d.id));
  r.sendStatus(200);
}));

app.get('/api/divisions', h(async (_q, r) => r.json(await prisma.division.findMany({ orderBy: { name: 'asc' } }))));

const memberOf = async (uid: string) => {
  const u = await prisma.user.findUnique({ where: { id: uid } });
  return u && (u.role === 'ADMIN' || u.role === 'INSTRUCTOR' || u.memberNo) ? u : null;
};
const mem = async (q: Req, r: Response) => {
  const u = await memberOf(q.uid!);
  if (!u) { r.status(403).json({ error: 'This area is for active IAEP members. Complete your membership to join.' }); return null; }
  return u;
};
const staff = async (q: Req, r: Response) => {
  const u = await prisma.user.findUnique({ where: { id: q.uid! } });
  if (!u || (u.role !== 'ADMIN' && u.role !== 'INSTRUCTOR')) { r.status(403).json({ error: 'Instructors and administrators only' }); return null; }
  return u;
};
const ownCourse = async (q: Req, r: Response, courseId: string) => {
  const u = await staff(q, r); if (!u) return null;
  const c = await prisma.course.findUnique({ where: { id: courseId } });
  if (!c) { r.status(404).json({ error: 'Course not found' }); return null; }
  if (u.role !== 'ADMIN' && c.instructorId !== u.id) { r.status(403).json({ error: 'You can only change your own courses' }); return null; }
  return c;
};
const softUid = (q: Request): string | null => {
  try { return (jwt.verify((q.headers.authorization || '').replace('Bearer ', ''), SECRET) as { id: string }).id; } catch { return null; }
};
const httpUrl = z.string().refine((v) => /^https?:\/\//i.test(v), 'Enter a full link starting with https://');
const optUrl = z.string().default('').refine((v) => v === '' || /^https?:\/\//i.test(v), 'Enter a full link starting with https://');

app.get('/api/courses/:id', h(async (q, r) => {
  const c = await prisma.course.findUnique({ where: { id: q.params.id } });
  if (!c) return r.status(404).json({ error: 'Course not found' });
  const uid = softUid(q);
  const u = uid ? await memberOf(uid) : null;
  const enrolled = uid ? !!(await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: uid, courseId: c.id } } })) : false;
  const canEdit = !!u && (u.role === 'ADMIN' || u.id === c.instructorId);
  const open = canEdit || (!!u && enrolled);
  const lessons = await prisma.lesson.findMany({ where: { courseId: c.id }, orderBy: { position: 'asc' } });
  const classes = await prisma.liveClass.findMany({ where: { courseId: c.id, startsAt: { gte: new Date(Date.now() - 3600000) } }, orderBy: { startsAt: 'asc' } });
  const done = uid ? (await prisma.lessonProgress.findMany({ where: { userId: uid, courseId: c.id } })).map((x) => x.lessonId) : [];
  const cert = uid ? await prisma.certificate.findUnique({ where: { userId_courseId: { userId: uid, courseId: c.id } } }) : null;
  r.json({
    course: c, member: !!u, enrolled, canEdit, done, certificate: cert ? cert.code : null,
    lessons: lessons.map((l) => (open ? l : { id: l.id, title: l.title, position: l.position, locked: true })),
    classes: classes.map((x) => (open ? x : { id: x.id, title: x.title, startsAt: x.startsAt, durationMins: x.durationMins, locked: true })),
  });
}));

const courseSchema = z.object({ title: z.string().min(3), description: z.string().min(10), level: z.string().min(2), cpdHours: z.coerce.number().int().min(0), divisionId: z.string().min(2) });
app.get('/api/teach/courses', auth(), h(async (q, r) => {
  const u = await staff(q, r); if (!u) return;
  r.json(await prisma.course.findMany({ where: u.role === 'ADMIN' ? {} : { instructorId: u.id }, orderBy: { title: 'asc' }, include: { lessons: { orderBy: { position: 'asc' } }, classes: { orderBy: { startsAt: 'asc' } } } }));
}));
app.post('/api/teach/courses', auth(), h(async (q, r) => {
  const u = await staff(q, r); if (!u) return;
  const d = courseSchema.parse(q.body);
  r.json(await prisma.course.create({ data: { ...d, instructorId: u.id, instructorName: u.name } }));
}));
app.delete('/api/teach/courses/:id', auth(), h(async (q, r) => {
  const c = await ownCourse(q, r, q.params.id); if (!c) return;
  await prisma.enrollment.deleteMany({ where: { courseId: c.id } });
  await prisma.course.delete({ where: { id: c.id } });
  r.json({ ok: true });
}));
app.post('/api/teach/courses/:id/lessons', auth(), h(async (q, r) => {
  const c = await ownCourse(q, r, q.params.id); if (!c) return;
  const d = z.object({ title: z.string().min(2), body: z.string().default(''), videoUrl: optUrl }).parse(q.body);
  const n = await prisma.lesson.count({ where: { courseId: c.id } });
  r.json(await prisma.lesson.create({ data: { ...d, courseId: c.id, position: n + 1 } }));
}));
app.delete('/api/teach/lessons/:id', auth(), h(async (q, r) => {
  const l = await prisma.lesson.findUnique({ where: { id: q.params.id } });
  if (!l) return r.status(404).json({ error: 'Lesson not found' });
  if (!(await ownCourse(q, r, l.courseId))) return;
  await prisma.lesson.delete({ where: { id: l.id } }); r.json({ ok: true });
}));
app.post('/api/teach/courses/:id/classes', auth(), h(async (q, r) => {
  const c = await ownCourse(q, r, q.params.id); if (!c) return;
  const d = z.object({ title: z.string().min(2), startsAt: z.coerce.date(), durationMins: z.coerce.number().int().min(15).max(480), joinUrl: httpUrl }).parse(q.body);
  r.json(await prisma.liveClass.create({ data: { ...d, courseId: c.id } }));
}));
app.delete('/api/teach/classes/:id', auth(), h(async (q, r) => {
  const k = await prisma.liveClass.findUnique({ where: { id: q.params.id } });
  if (!k) return r.status(404).json({ error: 'Class not found' });
  if (!(await ownCourse(q, r, k.courseId))) return;
  await prisma.liveClass.delete({ where: { id: k.id } }); r.json({ ok: true });
}));

app.get('/api/admin/instructors', auth(true), h(async (_q, r) => r.json((await prisma.user.findMany({ where: { role: 'INSTRUCTOR' }, orderBy: { name: 'asc' } })).map((u) => ({ id: u.id, name: u.name, email: u.email })))));
app.post('/api/admin/instructors', auth(true), h(async (q, r) => {
  const d = z.object({ email: z.string().email() }).parse(q.body);
  const u = await prisma.user.findUnique({ where: { email: d.email.toLowerCase().trim() } });
  if (!u) return r.status(404).json({ error: 'No account with that email. Ask them to create an account first.' });
  if (u.role === 'ADMIN') return r.status(400).json({ error: 'That account is already an administrator' });
  await prisma.user.update({ where: { id: u.id }, data: { role: 'INSTRUCTOR' } }); r.json({ ok: true });
}));
app.delete('/api/admin/instructors/:id', auth(true), h(async (q, r) => { await prisma.user.update({ where: { id: q.params.id }, data: { role: 'MEMBER' } }); r.json({ ok: true }); }));

app.get('/api/threads', auth(), h(async (q, r) => {
  if (!(await mem(q, r))) return;
  const courseId = typeof q.query.courseId === 'string' && q.query.courseId ? q.query.courseId : undefined;
  const divisionId = typeof q.query.divisionId === 'string' && q.query.divisionId ? q.query.divisionId : undefined;
  const where: any = courseId ? { courseId } : divisionId ? { divisionId, courseId: null } : { courseId: null, divisionId: null };
  r.json(await prisma.thread.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { _count: { select: { replies: true } } } }));
}));
app.post('/api/threads', auth(), h(async (q, r) => {
  const u = await mem(q, r); if (!u) return;
  const d = z.object({ title: z.string().min(3).max(200), body: z.string().min(3).max(5000), courseId: z.string().optional(), divisionId: z.string().optional() }).parse(q.body);
  r.json(await prisma.thread.create({ data: { title: d.title, body: d.body, courseId: d.courseId || null, divisionId: d.courseId ? null : d.divisionId || null, authorId: u.id, authorName: u.name, authorRole: u.role, authorPost: u.postNominal || '' } }));
}));
app.get('/api/threads/:id', auth(), h(async (q, r) => {
  if (!(await mem(q, r))) return;
  const t = await prisma.thread.findUnique({ where: { id: q.params.id }, include: { replies: { orderBy: { createdAt: 'asc' } } } });
  if (!t) return r.status(404).json({ error: 'Discussion not found' });
  r.json(t);
}));
app.post('/api/threads/:id/replies', auth(), h(async (q, r) => {
  const u = await mem(q, r); if (!u) return;
  const d = z.object({ body: z.string().min(1).max(5000) }).parse(q.body);
  if (!(await prisma.thread.findUnique({ where: { id: q.params.id } }))) return r.status(404).json({ error: 'Discussion not found' });
  r.json(await prisma.reply.create({ data: { body: d.body, threadId: q.params.id, authorId: u.id, authorName: u.name, authorRole: u.role, authorPost: u.postNominal || '' } }));
}));
app.delete('/api/admin/threads/:id', auth(true), h(async (q, r) => { await prisma.thread.delete({ where: { id: q.params.id } }); r.json({ ok: true }); }));
app.delete('/api/admin/replies/:id', auth(true), h(async (q, r) => { await prisma.reply.delete({ where: { id: q.params.id } }); r.json({ ok: true }); }));

app.post('/api/lessons/:id/complete', auth(), h(async (q, r) => {
  const u = await mem(q, r); if (!u) return;
  const l = await prisma.lesson.findUnique({ where: { id: q.params.id } });
  if (!l) return r.status(404).json({ error: 'Lesson not found' });
  const c = await prisma.course.findUnique({ where: { id: l.courseId } });
  if (!c) return r.status(404).json({ error: 'Course not found' });
  if (!(await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: u.id, courseId: c.id } } }))) return r.status(403).json({ error: 'Enrol in this course first' });
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: u.id, lessonId: l.id } }, update: {}, create: { userId: u.id, lessonId: l.id, courseId: c.id } });
  const ids = (await prisma.lesson.findMany({ where: { courseId: c.id }, select: { id: true } })).map((x) => x.id);
  const done = await prisma.lessonProgress.count({ where: { userId: u.id, lessonId: { in: ids } } });
  let certificate: string | null = null;
  const existing = await prisma.certificate.findUnique({ where: { userId_courseId: { userId: u.id, courseId: c.id } } });
  if (existing) certificate = existing.code;
  else if (ids.length > 0 && done >= ids.length) {
    try {
      const ops: any[] = [prisma.certificate.create({ data: { code: 'IAEP-CERT-' + crypto.randomBytes(4).toString('hex').toUpperCase(), userId: u.id, courseId: c.id, memberName: u.name, memberNo: u.memberNo || '', courseTitle: c.title, hours: c.cpdHours, instructorName: c.instructorName } })];
      if (c.cpdHours > 0) ops.push(prisma.cpdEntry.create({ data: { title: 'Course: ' + c.title, provider: 'IAEP', category: 'Course', hours: c.cpdHours, userId: u.id } }));
      const res = await prisma.$transaction(ops);
      certificate = res[0].code;
    } catch (e) {
      const again = await prisma.certificate.findUnique({ where: { userId_courseId: { userId: u.id, courseId: c.id } } });
      certificate = again ? again.code : null;
    }
  }
  r.json({ done, total: ids.length, certificate });
}));
app.get('/api/certificates/:code', h(async (q, r) => {
  const c = await prisma.certificate.findUnique({ where: { code: q.params.code.trim().toUpperCase() } });
  if (!c) return r.json({ valid: false });
  r.json({ valid: true, code: c.code, memberName: c.memberName, memberNo: c.memberNo, courseTitle: c.courseTitle, hours: c.hours, instructorName: c.instructorName, issuedAt: c.issuedAt });
}));

app.use((e: any, _q: Request, r: Response, _n: NextFunction) => {
  if (e instanceof z.ZodError) return r.status(400).json({ error: 'Please check the form: ' + e.issues.map((i) => i.path.join('.')).join(', ') });
  if (e.code === 'P2002') return r.status(409).json({ error: 'That email is already registered' });
  console.error(e); r.status(500).json({ error: 'Something went wrong on the server' });
});
app.listen(Number(process.env.PORT) || 4000, () => console.log('IAEP API running'));
