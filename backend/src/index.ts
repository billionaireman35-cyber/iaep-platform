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
app.get('/api/meta', h(async (_q, r) => r.json({ grades: await prisma.grade.findMany(), disciplines: DISCIPLINES })));

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

app.use((e: any, _q: Request, r: Response, _n: NextFunction) => {
  if (e instanceof z.ZodError) return r.status(400).json({ error: 'Please check the form: ' + e.issues.map((i) => i.path.join('.')).join(', ') });
  if (e.code === 'P2002') return r.status(409).json({ error: 'That email is already registered' });
  console.error(e); r.status(500).json({ error: 'Something went wrong on the server' });
});
app.listen(Number(process.env.PORT) || 4000, () => console.log('IAEP API running'));
