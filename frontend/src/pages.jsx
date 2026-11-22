import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { useAuth } from './auth.jsx';
import { Logo } from './App.jsx';

const Wrap = ({ title, intro, children }) => (
  <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <div className="space-y-2"><h1 className="font-serif text-2xl font-bold text-navy sm:text-3xl">{title}</h1>{intro && <p className="max-w-2xl text-sm text-slate-600">{intro}</p>}</div>
    {children}
  </div>
);
const Field = ({ label, children }) => <label className="block space-y-1 text-sm"><span className="font-medium text-slate-700">{label}</span>{children}</label>;
const Err = ({ msg }) => msg ? <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{msg}</p> : null;
const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function Home() {
  return (
    <div>
      <section className="bg-navy px-4 py-14 text-white">
        <div className="mx-auto max-w-5xl space-y-5">
          <Logo size={120} />
          <h1 className="max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-5xl">Connecting professionals. Advancing engineering. Building the future.</h1>
          <p className="max-w-xl text-slate-300">IAEP admits qualified engineers, records their continuing professional development, and gives members credentials recognised across borders.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/membership" className="btn btn-gold">Apply for membership</Link>
            <Link to="/login" className="btn border border-white/30 bg-transparent">Member sign in</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-10 sm:grid-cols-3">
        {[['Membership', 'Five grades from student to Fellow, each with clear entry criteria.', '/membership'], ['Events', 'Congresses, symposia and webinars that count toward your CPD.', '/events'], ['Learning and CPD', 'Courses and a personal CPD record you can keep up to date.', '/learning']].map(([t, d, to]) => (
          <Link key={t} to={to} className="rounded border border-slate-200 bg-white p-5 hover:border-gold"><h3 className="font-serif text-lg font-bold text-navy">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></Link>
        ))}
      </section>
    </div>
  );
}

export function Apply() {
  const [meta, setMeta] = useState({ grades: [], disciplines: [] });
  const [f, setF] = useState({ name: '', email: '', phone: '', country: 'Nigeria', city: '', disciplineId: 'civil', gradeId: 'professional', degree: '', institution: '', gradYear: 2020, employer: '', jobTitle: '', years: 5, summary: '', sponsorName: '', sponsorNo: '', agree: false });
  const [err, setErr] = useState(''); const [ref, setRef] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { api('/meta').then(setMeta).catch((e) => setErr(e.message)); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const grade = meta.grades.find((g) => g.id === f.gradeId);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!f.agree) return setErr('Please accept the code of professional conduct to continue.');
    setBusy(true);
    try { const { agree, ...body } = f; setRef((await api('/applications', { method: 'POST', body })).ref); } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  if (ref) return <Wrap title="Application received"><div className="space-y-2 rounded border border-emerald-200 bg-emerald-50 p-5 text-sm"><p>Your reference is <strong className="font-mono text-lg">{ref}</strong>. Keep it safe.</p><p>The Admissions Board will review your application and contact you at {f.email}.</p></div></Wrap>;
  return (
    <Wrap title="Apply for membership" intro="Choose your grade, tell us about your training and practice, and the Admissions Board will review your file.">
      <form onSubmit={submit} className="space-y-6 rounded border border-slate-200 bg-white p-5">
        <Err msg={err} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><input className="inp" required value={f.name} onChange={set('name')} /></Field>
          <Field label="Email"><input className="inp" type="email" required value={f.email} onChange={set('email')} /></Field>
          <Field label="Phone or WhatsApp"><input className="inp" type="tel" value={f.phone} onChange={set('phone')} /></Field>
          <Field label="Country"><input className="inp" required value={f.country} onChange={set('country')} /></Field>
          <Field label="City or state"><input className="inp" value={f.city} onChange={set('city')} /></Field>
          <Field label="Engineering discipline"><select className="inp" value={f.disciplineId} onChange={set('disciplineId')}>{meta.disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          <Field label="Membership grade"><select className="inp" value={f.gradeId} onChange={set('gradeId')}>{meta.grades.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.postNominal})</option>)}</select></Field>
          {grade && <p className="self-end rounded bg-slate-50 p-3 text-xs text-slate-600">{grade.description} Minimum {grade.minYears} years of experience. {grade.cpdHours} CPD hours a year.</p>}
          <Field label="Highest qualification"><input className="inp" required value={f.degree} onChange={set('degree')} placeholder="BEng Mechanical Engineering" /></Field>
          <Field label="Institution"><input className="inp" required value={f.institution} onChange={set('institution')} /></Field>
          <Field label="Graduation year"><input className="inp" type="number" required value={f.gradYear} onChange={set('gradYear')} /></Field>
          <Field label="Years of experience"><input className="inp" type="number" min="0" required value={f.years} onChange={set('years')} /></Field>
          <Field label="Current employer"><input className="inp" required value={f.employer} onChange={set('employer')} /></Field>
          <Field label="Job title"><input className="inp" required value={f.jobTitle} onChange={set('jobTitle')} /></Field>
          <Field label="Sponsor name (optional)"><input className="inp" value={f.sponsorName} onChange={set('sponsorName')} /></Field>
          <Field label="Sponsor membership number (optional)"><input className="inp" value={f.sponsorNo} onChange={set('sponsorNo')} /></Field>
        </div>
        <Field label="Summary of your engineering work"><textarea className="inp" rows="4" value={f.summary} onChange={set('summary')} /></Field>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={f.agree} onChange={set('agree')} /><span>I pledge to follow the IAEP Code of Professional Conduct. I understand IAEP membership does not replace statutory licensing such as COREN in Nigeria.</span></label>
        <button className="btn btn-gold w-full sm:w-auto" disabled={busy}>{busy ? 'Sending...' : 'Submit application'}</button>
      </form>
    </Wrap>
  );
}

function useList(path) {
  const [items, setItems] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api(path).then(setItems).catch((e) => setErr(e.message)); }, [path]);
  return [items, err];
}

function ActionCard({ title, meta, body, done, doneText, actionText, onAct, user }) {
  const nav = useNavigate(); const [busy, setBusy] = useState(false); const [ok, setOk] = useState(done);
  const click = async () => { if (!user) return nav('/login'); setBusy(true); try { await onAct(); setOk(true); } catch {} setBusy(false); };
  return (
    <div className="space-y-2 rounded border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-500">{meta}</p>
      <h3 className="font-serif text-lg font-bold text-navy">{title}</h3>
      {body && <p className="text-sm text-slate-600">{body}</p>}
      <button className={'btn ' + (ok ? 'bg-emerald-700' : '')} disabled={busy || ok} onClick={click}>{ok ? doneText : user ? actionText : 'Sign in to ' + actionText.toLowerCase()}</button>
    </div>
  );
}

export function Events() {
  const { user, refresh } = useAuth(); const [items, err] = useList('/events');
  return (
    <Wrap title="Events" intro="Congresses, symposia and webinars. Attending counts toward your CPD.">
      <Err msg={err} />
      <div className="space-y-4">{(items || []).map((e) => (
        <ActionCard key={e.id} user={user} title={e.title} meta={`${e.category}, ${fmt(e.date)}, ${e.venue}, ${e.cpdHours} CPD hours`} body={`Speaker: ${e.speaker}`}
          done={user?.registrations?.some((r) => r.eventId === e.id)} doneText="You are registered" actionText="Register"
          onAct={async () => { await api(`/events/${e.id}/register`, { method: 'POST' }); refresh(); }} />
      ))}</div>
    </Wrap>
  );
}

export function Courses() {
  const { user, refresh } = useAuth(); const [items, err] = useList('/courses');
  return (
    <Wrap title="Learning and CPD" intro="Short courses for working engineers.">
      <Err msg={err} />
      <div className="grid gap-4 sm:grid-cols-2">{(items || []).map((c) => (
        <ActionCard key={c.id} user={user} title={c.title} meta={`${c.level}, ${c.cpdHours} CPD hours`} body={c.description}
          done={user?.enrollments?.some((r) => r.courseId === c.id)} doneText="You are enrolled" actionText="Enrol"
          onAct={async () => { await api(`/courses/${c.id}/enroll`, { method: 'POST' }); refresh(); }} />
      ))}</div>
    </Wrap>
  );
}

export function Login() {
  const { login, user } = useAuth(); const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('');
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/portal'} />;
  const go = async (e) => { e.preventDefault(); setErr(''); try { await login(email, pw); } catch (x) { setErr(x.message); } };
  return (
    <Wrap title="Member sign in" intro="Use the email and password sent to you after your application was approved.">
      <form onSubmit={go} className="max-w-sm space-y-4 rounded border border-slate-200 bg-white p-5">
        <Err msg={err} />
        <Field label="Email"><input className="inp" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><input className="inp" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
        <button className="btn w-full">Sign in</button>
        <p className="text-xs text-slate-500">Not a member yet? <Link to="/membership" className="underline">Apply for membership</Link>.</p>
      </form>
    </Wrap>
  );
}

export function Portal() {
  const { user, ready, refresh } = useAuth(); const [f, setF] = useState({ title: '', provider: '', category: 'Technical', hours: 4 }); const [err, setErr] = useState('');
  if (!ready) return null; if (!user) return <Navigate to="/login" />;
  const pct = Math.min(100, Math.round((user.cpdDone / user.cpdTarget) * 100));
  const add = async (e) => { e.preventDefault(); setErr(''); try { await api('/cpd', { method: 'POST', body: { ...f, hours: Number(f.hours) } }); setF({ ...f, title: '' }); refresh(); } catch (x) { setErr(x.message); } };
  return (
    <Wrap title={user.name}>
      {user.memberNo && (
        <div className="max-w-md space-y-4 rounded-lg border-2 border-gold/60 bg-navy p-5 text-white">
          <div className="flex items-center gap-3"><Logo /><p className="text-xs font-semibold uppercase tracking-wide text-gold">International Association of Engineering Professionals</p></div>
          <div><p className="font-serif text-xl font-bold">{user.name}</p><p className="font-mono text-sm text-gold">{user.postNominal}</p></div>
          <div className="grid grid-cols-2 gap-2 text-xs"><div><span className="block text-slate-400">Member number</span>{user.memberNo}</div><div><span className="block text-slate-400">Grade</span>{user.grade?.name}</div></div>
        </div>
      )}
      <section className="space-y-3 rounded border border-slate-200 bg-white p-5">
        <div className="flex justify-between text-sm"><h2 className="font-serif text-lg font-bold text-navy">CPD record</h2><span>{user.cpdDone} of {user.cpdTarget} hours</span></div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-700" style={{ width: pct + '%' }} /></div>
        <ul className="divide-y text-sm">{user.cpd.map((c) => <li key={c.id} className="flex justify-between py-2"><span>{c.title}<span className="block text-xs text-slate-500">{c.provider}, {c.category}, {fmt(c.date)}</span></span><span className="font-semibold">+{c.hours} h</span></li>)}{!user.cpd.length && <li className="py-2 text-slate-500">No CPD logged yet. Add your first activity below.</li>}</ul>
      </section>
      <form onSubmit={add} className="space-y-3 rounded border border-slate-200 bg-white p-5">
        <h2 className="font-serif text-lg font-bold text-navy">Log CPD hours</h2><Err msg={err} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Activity"><input className="inp" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Provider"><input className="inp" value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} /></Field>
          <Field label="Category"><select className="inp" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{['Technical', 'Ethics', 'Safety', 'Management'].map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Hours"><input className="inp" type="number" min="1" max="60" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} /></Field>
        </div>
        <button className="btn">Add to record</button>
      </form>
    </Wrap>
  );
}

export function Admin() {
  const { user, ready } = useAuth(); const [items, setItems] = useState([]); const [err, setErr] = useState(''); const [issued, setIssued] = useState(null);
  const load = () => api('/admin/applications').then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { if (user?.role === 'ADMIN') load(); }, [user]);
  if (!ready) return null; if (user?.role !== 'ADMIN') return <Navigate to="/login" />;
  const act = async (id, what) => { setErr(''); try { const r = await api(`/admin/applications/${id}/${what}`, { method: 'POST' }); if (what === 'approve') setIssued(r); load(); } catch (x) { setErr(x.message); } };
  return (
    <Wrap title="Admissions" intro="Review applications. Approving creates the member account and shows a temporary password to pass on to the applicant.">
      <Err msg={err} />
      {issued && <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm">Account created for <strong>{issued.email}</strong>. Member number <strong>{issued.memberNo}</strong>. Temporary password <strong className="font-mono">{issued.tempPassword}</strong>. Send it to them now, it is shown only once.</div>}
      <div className="space-y-3">{items.map((a) => (
        <div key={a.id} className="space-y-1 rounded border border-slate-200 bg-white p-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2"><strong>{a.name}</strong><span className="font-mono text-xs">{a.ref}, {a.status}</span></div>
          <p className="text-slate-600">{a.grade.name}, {a.disciplineId}. {a.degree}, {a.institution} ({a.gradYear}). {a.jobTitle} at {a.employer}, {a.years} years.</p>
          <p className="text-xs text-slate-500">{a.email} {a.phone} {a.country} {a.city}{a.sponsorName ? `, sponsor ${a.sponsorName} ${a.sponsorNo || ''}` : ''}</p>
          {a.summary && <p className="text-slate-600">{a.summary}</p>}
          {a.status === 'PENDING' && <div className="flex gap-2 pt-2"><button className="btn bg-emerald-700" onClick={() => act(a.id, 'approve')}>Approve</button><button className="btn bg-rose-700" onClick={() => act(a.id, 'reject')}>Reject</button></div>}
        </div>
      ))}{!items.length && <p className="text-sm text-slate-500">No applications yet.</p>}</div>
    </Wrap>
  );
}
