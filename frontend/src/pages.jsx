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
  const [d, setD] = useState(null);
  useEffect(() => { api('/public/home').then(setD).catch(() => setD({ grades: [], events: [], posts: [] })); }, []);
  const pillars = [
    ['Ethical practice and public welfare', 'Every member subscribes to the Code of Professional Conduct: putting human safety first, protecting the environment, keeping finances transparent and refusing corruption in engineering procurement.'],
    ['Lifelong professional development', 'Members record continuing professional development in their own portal, work toward the annual hours set for their grade, and take part in congresses, symposia and webinars.'],
    ['One profession across borders', 'IAEP admits engineers from any country, grades them on training and verified practice, and gives each member a credential that employers and clients can check online.'],
  ];
  const grades = d?.grades || [], events = d?.events || [], posts = d?.posts || [];
  return (
    <div>
      <section className="border-b border-slate-200 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <Logo size={84} />
          <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-clay">International Association of Engineering Professionals</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[1.1] text-slate-900 sm:text-6xl">Connecting professionals. Advancing engineering. Building the future.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">IAEP admits qualified engineers, records their continuing professional development, and gives members credentials recognised across borders.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/membership" className="btn btn-gold">Apply for membership</Link>
            <Link to="/verify" className="btn">Verify a credential</Link>
          </div>
        </div>
      </section>
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="max-w-2xl text-3xl font-medium text-slate-900 sm:text-4xl">Advancing the engineering profession worldwide</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {pillars.map(([t, b]) => (
              <div key={t} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="text-xl font-medium text-slate-900">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {grades.length > 0 && (
        <section className="border-t border-slate-200 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-clay">Professional recognition</p>
            <h2 className="mt-2 text-3xl font-medium text-slate-900 sm:text-4xl">Membership grades</h2>
            <p className="mt-3 max-w-2xl text-slate-600">From students to distinguished Fellows, each grade recognises verified competence, experience and ethical integrity.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {grades.map((g) => (
                <div key={g.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-baseline justify-between gap-3"><span className="text-xs font-semibold tracking-wide text-clay">{g.postNominal}</span><span className="text-xs text-slate-500">Minimum {g.minYears} {g.minYears === 1 ? 'year' : 'years'} of experience</span></div>
                  <h3 className="mt-2 text-xl font-medium text-slate-900">{g.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{g.description}</p>
                  {g.duesUsd > 0 && <p className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-700">Annual dues: <b>${g.duesUsd} USD</b> or <b>₦{Number(g.duesNgn).toLocaleString()} NGN</b></p>}
                </div>
              ))}
            </div>
            <div className="mt-8"><Link to="/membership" className="btn btn-gold">Apply for membership</Link></div>
          </div>
        </section>
      )}
      <section className="bg-navy px-4 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Public credential verification</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-medium sm:text-4xl">Verify an IAEP member in seconds</h2>
          <p className="mt-3 max-w-2xl text-slate-300">Employers, regulators and clients can confirm the standing and grade of any IAEP member using their member number.</p>
          <div className="mt-6"><Link to="/verify" className="btn btn-gold">Verify a credential</Link></div>
        </div>
      </section>
      {events.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-clay">Knowledge and continuing education</p>
            <h2 className="mt-2 text-3xl font-medium text-slate-900 sm:text-4xl">Upcoming events</h2>
            <div className="mt-8 space-y-4">
              {events.map((e) => (
                <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <p className="text-xs text-slate-500">{e.category}, {fmt(e.date)}, {e.venue}, {e.cpdHours} CPD hours</p>
                  <h3 className="mt-1 text-xl font-medium text-slate-900">{e.title}</h3>
                  {e.speaker && <p className="mt-1 text-sm text-slate-600">Speaker: {e.speaker}</p>}
                </div>
              ))}
            </div>
            <div className="mt-6"><Link to="/events" className="text-sm font-semibold text-clay underline">All events</Link></div>
          </div>
        </section>
      )}
      {posts.length > 0 && (
        <section className="border-t border-slate-200 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-medium text-slate-900 sm:text-4xl">News and statements</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {posts.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <p className="text-xs text-slate-500">{fmt(p.createdAt)}</p>
                  <h3 className="mt-1 text-lg font-medium text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{p.body.length > 160 ? p.body.slice(0, 160) + '...' : p.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6"><Link to="/news" className="text-sm font-semibold text-clay underline">All news</Link></div>
          </div>
        </section>
      )}
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
      {items && items.length === 0 && <p className="text-slate-600">No events are scheduled at the moment. New events are announced here by the Secretariat.</p>}
      <div className="space-y-4">{(items || []).map((e) => (
        <ActionCard key={e.id} user={user} title={e.title} meta={`${e.category}, ${fmt(e.date)}, ${e.venue}, ${e.cpdHours} CPD hours`} body={`Speaker: ${e.speaker}`}
          done={user?.registrations?.some((r) => r.eventId === e.id)} doneText="You are registered" actionText="Register"
          onAct={async () => { await api(`/events/${e.id}/register`, { method: 'POST' }); refresh(); }} />
      ))}</div>
    </Wrap>
  );
}

export function Courses() {
  const [items, err] = useList('/courses'); const [divs] = useList('/divisions');
  const [q, setQ] = useState(''); const [dv, setDv] = useState('');
  const dname = (id) => (divs || []).find((d) => d.id === id)?.name || '';
  const list = (items || []).filter((c) => (!dv || c.divisionId === dv) && (c.title + ' ' + c.description).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Wrap title="Learning and CPD" intro="Courses and live classes taught by experienced engineers and academics. Active members can enrol in any course.">
      <Err msg={err} />
      <div className="mb-4 flex flex-wrap gap-3">
        <input className="inp max-w-xs" placeholder="Search courses" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp max-w-xs" value={dv} onChange={(e) => setDv(e.target.value)}>
          <option value="">All divisions</option>
          {(divs || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      {items && items.length === 0 && <p className="text-slate-600">No courses have been published yet. Courses appear here as instructors add them.</p>}
      {items && items.length > 0 && list.length === 0 && <p className="text-slate-600">No course matches your search.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((c) => (
          <Link key={c.id} to={'/course/' + c.id} className="block rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{dname(c.divisionId) ? dname(c.divisionId) + ', ' : ''}{c.level}, {c.cpdHours} CPD hours</p>
            <h3 className="mt-1 text-xl font-medium text-slate-900">{c.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{c.description}</p>
            {c.instructorName && <p className="mt-3 text-xs font-semibold text-clay">Taught by {c.instructorName}</p>}
          </Link>
        ))}
      </div>
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
        <p className="text-xs text-slate-500">New here? <Link to="/signup" className="underline">Create an account</Link>. Not a member yet? <Link to="/membership" className="underline">Apply for membership</Link>.</p>
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
    <Wrap title="Admissions" intro="Review applications. Approving a file invites the applicant to pay their first annual dues by card. The member number is issued automatically once the payment is confirmed.">
      <Err msg={err} />
      {issued && (issued.memberNo === 'Issued after payment' ? <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm">Approved for payment. {issued.tempPassword}. Applicant email: <strong>{issued.email}</strong>. The member number is issued automatically when the payment is confirmed.</div> : issued && <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm">Account created for <strong>{issued.email}</strong>. Member number <strong>{issued.memberNo}</strong>. Temporary password <strong className="font-mono">{issued.tempPassword}</strong>. Send it to them now, it is shown only once.</div>)}
      <div className="space-y-3">{items.map((a) => (
        <div key={a.id} className="space-y-1 rounded border border-slate-200 bg-white p-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2"><strong>{a.name}</strong><span className="font-mono text-xs">{a.ref}, {a.status === 'AWAITING_PAYMENT' ? 'AWAITING PAYMENT' : a.status}</span></div>
          <p className="text-slate-600">{a.grade.name}, {a.disciplineId}. {a.degree}, {a.institution} ({a.gradYear}). {a.jobTitle} at {a.employer}, {a.years} years.</p>
          <p className="text-xs text-slate-500">{a.email} {a.phone} {a.country} {a.city}{a.sponsorName ? `, sponsor ${a.sponsorName} ${a.sponsorNo || ''}` : ''}</p>
          {a.summary && <p className="text-slate-600">{a.summary}</p>}
          {a.status === 'PENDING' && <div className="flex gap-2 pt-2"><button className="btn bg-emerald-700" onClick={() => act(a.id, 'approve')}>Approve</button><button className="btn bg-rose-700" onClick={() => act(a.id, 'reject')}>Reject</button></div>}
        </div>
      ))}{!items.length && <p className="text-sm text-slate-500">No applications yet.</p>}</div>
    </Wrap>
  );
}

export function Disciplines() {
  const [items, setItems] = useState(null); const [q, setQ] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { api('/divisions').then(setItems).catch((e) => setErr(e.message)); }, []);
  const list = (items || []).filter((d) => (d.name + ' ' + d.subfields.join(' ')).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Wrap title="Engineering divisions" intro="The major fields of engineering. Every member is admitted into one primary division.">
      <Err msg={err} />
      <input className="inp mb-2 max-w-md" placeholder="Search a division or field, for example aerodynamics" value={q} onChange={(e) => setQ(e.target.value)} />
      {items && <p className="mb-4 text-sm text-slate-500">Showing {list.length} of {items.length} divisions</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((d) => (
          <details key={d.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <summary className="cursor-pointer list-none">
              <h3 className="text-xl font-medium text-slate-900">{d.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{d.summary}</p>
              <p className="mt-3 text-xs font-semibold text-clay">{d.subfields.length} fields of practice. Tap to see them</p>
            </summary>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              {d.subfields.map((s) => <span key={s} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">{s}</span>)}
            </div>
          </details>
        ))}
      </div>
      {items && list.length === 0 && <p className="text-slate-600">No division matches that search.</p>}
      <div className="mt-8"><Link to="/membership" className="btn btn-gold">Apply for membership</Link></div>
    </Wrap>
  );
}

export function Verify() {
  const [no, setNo] = useState(''); const [res, setRes] = useState(null); const [err, setErr] = useState('');
  const go = async (e) => { e.preventDefault(); setErr(''); setRes(null); try { setRes(await api('/verify/' + encodeURIComponent(no.trim()))); } catch (x) { setErr(x.message); } };
  return (
    <Wrap title="Verify a credential" intro="Enter an IAEP member number to confirm that a person is a registered member.">
      <form onSubmit={go} className="max-w-sm space-y-3 rounded border border-slate-200 bg-white p-5">
        <Err msg={err} />
        <Field label="Member number"><input className="inp font-mono" required placeholder="IAEP-2026-0001" value={no} onChange={(e) => setNo(e.target.value)} /></Field>
        <button className="btn w-full">Verify</button>
      </form>
      {res && (res.valid
        ? <div className="max-w-sm space-y-1 rounded border border-emerald-300 bg-emerald-50 p-5 text-sm"><p className="font-semibold text-emerald-800">Registered member</p><p className="font-serif text-xl font-bold text-navy">{res.name}</p><p className="font-mono text-gold">{res.postNominal}</p><p>{res.grade}, member since {fmt(res.since)}</p></div>
        : <p className="max-w-sm rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">No member found with that number. Check the number and try again.</p>)}
    </Wrap>
  );
}

export function News() {
  const { user } = useAuth(); const [items, setItems] = useState([]); const [f, setF] = useState({ title: '', body: '' }); const [err, setErr] = useState('');
  const load = () => api('/posts').then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const add = async (e) => { e.preventDefault(); setErr(''); try { await api('/admin/posts', { method: 'POST', body: f }); setF({ title: '', body: '' }); load(); } catch (x) { setErr(x.message); } };
  const del = async (id) => { try { await api('/admin/posts/' + id, { method: 'DELETE' }); load(); } catch (x) { setErr(x.message); } };
  return (
    <Wrap title="News and statements" intro="Announcements from the Secretariat.">
      <Err msg={err} />
      {user?.role === 'ADMIN' && (
        <form onSubmit={add} className="space-y-3 rounded border border-slate-200 bg-white p-5">
          <h2 className="font-serif text-lg font-bold text-navy">Post an announcement</h2>
          <Field label="Title"><input className="inp" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Message"><textarea className="inp" rows="4" required value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
          <button className="btn">Publish</button>
        </form>
      )}
      <div className="space-y-4">{items.map((p) => (
        <article key={p.id} className="space-y-1 rounded border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">{fmt(p.createdAt)}</p><h3 className="font-serif text-lg font-bold text-navy">{p.title}</h3><p className="whitespace-pre-line text-sm text-slate-700">{p.body}</p>
          {user?.role === 'ADMIN' && <button className="text-xs text-rose-700 underline" onClick={() => del(p.id)}>Delete</button>}</article>
      ))}{!items.length && <p className="text-sm text-slate-500">No announcements yet.</p>}</div>
    </Wrap>
  );
}

export function About() {
  return (
    <Wrap title="About IAEP" intro="The International Association of Engineering Professionals connects engineers across borders, advances the profession and builds the future.">
      <div className="space-y-4 rounded border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700">
        <p>IAEP admits qualified engineers into five membership grades, from Student Member to Fellow. Each grade has clear entry criteria, reviewed by the Admissions Board.</p>
        <p>Members keep a personal record of continuing professional development, attend congresses, symposia and webinars, and hold a credential that anyone can verify online.</p>
        <p>The Secretariat is based at Ughevwughe Community, Ughelli South, Delta State, Nigeria.</p>
        <p className="text-xs text-slate-500">IAEP is an independent professional society. Membership does not replace statutory licensing, such as COREN in Nigeria.</p>
      </div>
      <div className="flex flex-wrap gap-3"><Link to="/membership" className="btn btn-gold">Apply for membership</Link><Link to="/verify" className="btn">Verify a credential</Link></div>
    </Wrap>
  );
}

export function Contact() {
  const [f, setF] = useState({ name: '', email: '', text: '' }); const [done, setDone] = useState(false); const [err, setErr] = useState('');
  const send = async (e) => { e.preventDefault(); setErr(''); try { await api('/messages', { method: 'POST', body: f }); setDone(true); } catch (x) { setErr(x.message); } };
  if (done) return <Wrap title="Message sent"><p className="text-sm">Thank you. The Secretariat will reply to {f.email}.</p></Wrap>;
  return (
    <Wrap title="Contact the Secretariat" intro="Ughevwughe Community, Ughelli South, Delta State, Nigeria.">
      <form onSubmit={send} className="max-w-lg space-y-3 rounded border border-slate-200 bg-white p-5">
        <Err msg={err} />
        <Field label="Your name"><input className="inp" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email"><input className="inp" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Message"><textarea className="inp" rows="5" required value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></Field>
        <button className="btn">Send message</button>
      </form>
    </Wrap>
  );
}

export function AdminMessages() {
  const { user, ready } = useAuth(); const [items, setItems] = useState([]); const [err, setErr] = useState('');
  useEffect(() => { if (user?.role === 'ADMIN') api('/admin/messages').then(setItems).catch((e) => setErr(e.message)); }, [user]);
  if (!ready) return null; if (user?.role !== 'ADMIN') return <Navigate to="/login" />;
  return (
    <Wrap title="Messages"><Err msg={err} />
      <div className="space-y-3">{items.map((m) => <div key={m.id} className="rounded border border-slate-200 bg-white p-4 text-sm"><p className="text-xs text-slate-500">{fmt(m.createdAt)}, {m.name}, {m.email}</p><p className="whitespace-pre-line">{m.text}</p></div>)}{!items.length && <p className="text-sm text-slate-500">No messages yet.</p>}</div>
    </Wrap>
  );
}

function InfoPage({ slug, title, intro }) {
  const { user } = useAuth(); const [p, setP] = useState(null); const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ title, body: '' }); const [err, setErr] = useState('');
  useEffect(() => { api('/pages/' + slug).then((d) => { setP(d); setF({ title: d.title || title, body: d.body || '' }); }).catch((e) => setErr(e.message)); }, [slug]);
  const save = async (e) => { e.preventDefault(); setErr(''); try { const d = await api('/admin/pages/' + slug, { method: 'PUT', body: f }); setP(d); setEdit(false); } catch (x) { setErr(x.message); } };
  const admin = user?.role === 'ADMIN';
  return (
    <Wrap title={p?.title || title} intro={intro}>
      <Err msg={err} />
      {edit ? (
        <form onSubmit={save} className="space-y-3 rounded border border-slate-200 bg-white p-5">
          <Field label="Page title"><input className="inp" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Content (blank lines start a new paragraph)"><textarea className="inp" rows="14" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
          <div className="flex gap-2"><button className="btn">Save page</button><button type="button" className="btn bg-slate-500" onClick={() => setEdit(false)}>Cancel</button></div>
        </form>
      ) : (
        <div className="whitespace-pre-line rounded border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700">{p?.body}</div>
      )}
      {admin && !edit && <button className="btn" onClick={() => setEdit(true)}>Edit this page</button>}
    </Wrap>
  );
}
export const Governance = () => <InfoPage slug="governance" title="Governance and Council" intro="How IAEP is governed and who serves on the Council." />;
export const Constitution = () => <InfoPage slug="constitution" title="Constitution, Policies and Ethics" intro="The rules, policies and code of conduct that members follow." />;
export const Treasury = () => <InfoPage slug="treasury" title="Council Treasury and Finances" intro="Financial information published by the Secretariat." />;
export const Chapters = () => <InfoPage slug="chapters" title="Chapters and Countries" intro="Where IAEP members are organised around the world." />;
export const Corporate = () => <InfoPage slug="corporate" title="Corporate Partnerships" intro="Organisations that work with IAEP." />;

export function Signup() {
  const { login, user } = useAuth(); const [f, setF] = useState({ name: '', email: '', password: '' }); const [err, setErr] = useState('');
  if (user) return <Navigate to="/portal" />;
  const go = async (e) => { e.preventDefault(); setErr(''); try { await api('/auth/signup', { method: 'POST', body: f }); await login(f.email.toLowerCase(), f.password); } catch (x) { setErr(x.message); } };
  return (
    <Wrap title="Create your account" intro="Create a sign-in for the IAEP member portal.">
      <form onSubmit={go} className="max-w-sm space-y-4 rounded border border-slate-200 bg-white p-5">
        <Err msg={err} />
        <Field label="Full name"><input className="inp" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email"><input className="inp" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password (at least 8 characters)"><input className="inp" type="password" minLength="8" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <button className="btn w-full">Create account</button>
        <p className="text-xs text-slate-500">Already have an account? <Link to="/login" className="underline">Sign in</Link>.</p>
      </form>
    </Wrap>
  );
}

export function AdminContent() {
  const { user } = useAuth();
  const [d, setD] = useState({ events: [], courses: [], grades: [] }); const [err, setErr] = useState('');
  const [ev, setEv] = useState({ title: '', category: 'Webinar', date: '', venue: '', speaker: '', cpdHours: 2 });
  const [co, setCo] = useState({ title: '', description: '', level: 'Foundation', cpdHours: 6 });
  const [ge, setGe] = useState({});
  const load = () => api('/admin/content').then(setD).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" />;
  const call = async (path, method, body) => { setErr(''); try { await api(path, { method, body }); await load(); return true; } catch (x) { setErr(x.message); return false; } };
  const addEv = async (e) => { e.preventDefault(); if (await call('/admin/events', 'POST', { ...ev, date: new Date(ev.date).toISOString() })) setEv({ ...ev, title: '', date: '', venue: '', speaker: '' }); };
  const addCo = async (e) => { e.preventDefault(); if (await call('/admin/courses', 'POST', co)) setCo({ ...co, title: '', description: '' }); };
  const gv = (g, k) => ge[g.id]?.[k] ?? g[k];
  const gset = (g, k, v) => setGe({ ...ge, [g.id]: { ...ge[g.id], [k]: v } });
  const row = 'flex items-center justify-between gap-3 rounded border border-slate-200 bg-white p-3 text-sm';
  return (
    <Wrap title="Manage content" intro="Add and edit what members see: events, courses and membership dues.">
      <Err msg={err} />
      <h2 className="mb-2 font-serif text-xl font-bold">Events</h2>
      <div className="mb-3 space-y-2">
        {d.events.length === 0 && <p className="text-sm text-slate-500">No events added yet.</p>}
        {d.events.map((x) => (
          <div key={x.id} className={row}><span><b>{x.title}</b><br />{new Date(x.date).toLocaleString()}, {x.venue}, {x.cpdHours} CPD hours</span>
            <button className="btn bg-red-700" onClick={() => window.confirm('Delete this event?') && call('/admin/events/' + x.id, 'DELETE')}>Delete</button></div>
        ))}
      </div>
      <form onSubmit={addEv} className="mb-8 grid gap-3 rounded border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <Field label="Title"><input className="inp" required value={ev.title} onChange={(e) => setEv({ ...ev, title: e.target.value })} /></Field>
        <Field label="Type (Congress, Symposium, Webinar, Workshop)"><input className="inp" required value={ev.category} onChange={(e) => setEv({ ...ev, category: e.target.value })} /></Field>
        <Field label="Date and time"><input className="inp" type="datetime-local" required value={ev.date} onChange={(e) => setEv({ ...ev, date: e.target.value })} /></Field>
        <Field label="Venue"><input className="inp" required value={ev.venue} onChange={(e) => setEv({ ...ev, venue: e.target.value })} /></Field>
        <Field label="Speaker (leave empty if none)"><input className="inp" value={ev.speaker} onChange={(e) => setEv({ ...ev, speaker: e.target.value })} /></Field>
        <Field label="CPD hours"><input className="inp" type="number" min="0" required value={ev.cpdHours} onChange={(e) => setEv({ ...ev, cpdHours: e.target.value })} /></Field>
        <div><button className="btn">Add event</button></div>
      </form>
      <h2 className="mb-2 font-serif text-xl font-bold">Courses</h2>
      <div className="mb-3 space-y-2">
        {d.courses.length === 0 && <p className="text-sm text-slate-500">No courses added yet.</p>}
        {d.courses.map((x) => (
          <div key={x.id} className={row}><span><b>{x.title}</b><br />{x.level}, {x.cpdHours} CPD hours</span>
            <button className="btn bg-red-700" onClick={() => window.confirm('Delete this course?') && call('/admin/courses/' + x.id, 'DELETE')}>Delete</button></div>
        ))}
      </div>
      <form onSubmit={addCo} className="mb-8 grid gap-3 rounded border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <Field label="Title"><input className="inp" required value={co.title} onChange={(e) => setCo({ ...co, title: e.target.value })} /></Field>
        <Field label="Level (Foundation, Intermediate, Advanced)"><input className="inp" required value={co.level} onChange={(e) => setCo({ ...co, level: e.target.value })} /></Field>
        <Field label="CPD hours"><input className="inp" type="number" min="0" required value={co.cpdHours} onChange={(e) => setCo({ ...co, cpdHours: e.target.value })} /></Field>
        <Field label="Description"><textarea className="inp" rows="3" required value={co.description} onChange={(e) => setCo({ ...co, description: e.target.value })} /></Field>
        <div><button className="btn">Add course</button></div>
      </form>
      <h2 className="mb-2 font-serif text-xl font-bold">Membership grades and annual dues</h2>
      <div className="space-y-2">
        {d.grades.map((g) => (
          <div key={g.id} className="rounded border border-slate-200 bg-white p-3 text-sm">
            <b>{g.name}</b> <span className="text-slate-500">({g.postNominal}, minimum {g.minYears} years)</span>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <Field label="Dues (USD)"><input className="inp w-28" type="number" min="0" value={gv(g, 'duesUsd')} onChange={(e) => gset(g, 'duesUsd', e.target.value)} /></Field>
              <Field label="Dues (NGN)"><input className="inp w-32" type="number" min="0" value={gv(g, 'duesNgn')} onChange={(e) => gset(g, 'duesNgn', e.target.value)} /></Field>
              <Field label="CPD hours a year"><input className="inp w-28" type="number" min="0" value={gv(g, 'cpdHours')} onChange={(e) => gset(g, 'cpdHours', e.target.value)} /></Field>
              <button className="btn" onClick={() => call('/admin/grades/' + g.id, 'PUT', { duesUsd: gv(g, 'duesUsd'), duesNgn: gv(g, 'duesNgn'), cpdHours: gv(g, 'cpdHours') })}>Save</button>
            </div>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

export function Pay() {
  const [f, setF] = useState({ ref: '', email: '', password: '', currency: 'NGN' }); const [err, setErr] = useState('');
  const go = async (e) => { e.preventDefault(); setErr(''); try { const d = await api('/payments/start', { method: 'POST', body: f }); window.location.href = d.link; } catch (x) { setErr(x.message); } };
  return (
    <Wrap title="Pay your membership dues" intro="When the Admissions Board approves your application, pay your first annual dues by card to activate your membership.">
      <form onSubmit={go} className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <Err msg={err} />
        <Field label="Application reference (for example APP-1A2B3C)"><input className="inp" required value={f.ref} onChange={(e) => setF({ ...f, ref: e.target.value })} /></Field>
        <Field label="Email used in your application"><input className="inp" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Choose a password for your account (at least 8 characters)"><input className="inp" type="password" minLength="8" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <Field label="Pay in"><select className="inp" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}><option value="NGN">Nigerian naira (NGN)</option><option value="USD">US dollars (USD)</option></select></Field>
        <button className="btn btn-gold w-full">Continue to secure card payment</button>
        <p className="text-xs text-slate-500">You enter your card details on the Flutterwave payment page. IAEP never sees or stores your card number.</p>
      </form>
    </Wrap>
  );
}

export function PaymentReturn() {
  const [res, setRes] = useState(null); const [err, setErr] = useState('');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('status') === 'cancelled' || !p.get('transaction_id') || !p.get('tx_ref')) { setRes({ status: p.get('status') === 'cancelled' ? 'cancelled' : 'failed' }); return; }
    api('/payments/verify', { method: 'POST', body: { txRef: p.get('tx_ref'), transactionId: p.get('transaction_id') } }).then(setRes).catch((x) => setErr(x.message));
  }, []);
  const s = res?.status;
  return (
    <Wrap title="Payment" intro="">
      <Err msg={err} />
      <div className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700">
        {s === 'paid' && (<><h2 className="text-2xl font-medium text-slate-900">Welcome to IAEP</h2><p>Your payment was received and your membership is active.</p><p>Your member number is <b>{res.memberNo}</b>. Keep it safe: anyone can use it to verify your credential.</p><Link to="/login" className="btn btn-gold">Sign in to your portal</Link></>)}
        {s === 'cancelled' && (<><p>The payment was cancelled and nothing was charged.</p><Link to="/pay" className="btn">Try again</Link></>)}
        {(s === 'failed' || s === 'unknown') && (<><p>We could not confirm this payment. If you were charged, contact the Secretariat with your application reference and it will be resolved.</p><Link to="/pay" className="btn">Back to payment</Link></>)}
        {(s === 'processing' || s === 'error') && <p>Your payment is being processed. Please wait a minute and sign in; if you cannot, contact the Secretariat.</p>}
      </div>
    </Wrap>
  );
}

export function CourseView() {
  const { user, refresh } = useAuth(); const id = window.location.pathname.split('/')[2];
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  const load = () => api('/courses/' + id).then(setD).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id, user]);
  const enroll = async () => { setErr(''); try { await api('/courses/' + id + '/enroll', { method: 'POST' }); await refresh(); await load(); } catch (x) { setErr(x.message); } };
  const complete = async (lid) => { setErr(''); try { await api('/lessons/' + lid + '/complete', { method: 'POST' }); await load(); await refresh(); } catch (x) { setErr(x.message); } };
  if (!d) return <Wrap title="Course" intro=""><Err msg={err} /></Wrap>;
  const c = d.course; const open = d.enrolled || d.canEdit; const doneIds = d.done || [];
  return (
    <Wrap title={c.title} intro={`${c.level}, ${c.cpdHours} CPD hours${c.instructorName ? ', taught by ' + c.instructorName : ''}`}>
      <Err msg={err} />
      <div className="mb-6 whitespace-pre-line rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700">{c.description}</div>
      {d.instructor && <div className="mb-6 flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5"><Avatar src={d.instructor.avatar} name={d.instructor.name} size={56} /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your instructor</p><p className="mt-1 flex flex-wrap items-center gap-2 font-medium text-slate-900">{d.instructor.name}<span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-semibold text-white">Instructor</span></p>{d.instructor.bio && <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{d.instructor.bio}</p>}</div></div>}
      <div className="mb-8">
        {!user && <Link to="/login" className="btn">Sign in to enrol</Link>}
        {user && !d.member && <p className="text-sm text-slate-700">Courses are open to active members. <Link to="/pay" className="font-semibold text-clay underline">Complete your membership</Link> to enrol.</p>}
        {user && d.member && !open && <button className="btn btn-gold" onClick={enroll}>Enrol in this course</button>}
        {user && d.member && d.enrolled && !d.canEdit && <p className="text-sm font-semibold text-clay">You are enrolled in this course.</p>}
      </div>
      {d.certificate && <div className="mb-8 rounded-xl border border-clay bg-white p-5"><h2 className="text-2xl font-medium text-slate-900">Course completed</h2><p className="mt-1 text-sm text-slate-700">Your CPD hours have been added to your record.</p><Link to={'/certificate/' + d.certificate} className="btn btn-gold mt-3">View your certificate</Link></div>}
      {d.enrolled && !d.canEdit && d.lessons.length > 0 && !d.certificate && <p className="mb-6 text-sm text-slate-600">Progress: {doneIds.length} of {d.lessons.length} lessons completed</p>}
      {d.classes.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-2xl font-medium text-slate-900">Live classes</h2>
          <div className="space-y-3">{d.classes.map((x) => (
            <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <span><b>{x.title}</b><br />{new Date(x.startsAt).toLocaleString()}, {x.durationMins} minutes</span>
              {x.locked ? <span className="text-xs text-slate-500">Enrol to see the join link</span> : <a className="btn btn-gold" href={x.joinUrl} target="_blank" rel="noopener noreferrer">Join class</a>}
            </div>
          ))}</div>
        </div>
      )}
      <div className="mb-8">
        <h2 className="mb-3 text-2xl font-medium text-slate-900">Lessons</h2>
        {d.lessons.length === 0 && <p className="text-sm text-slate-600">The instructor has not added lessons yet.</p>}
        <div className="space-y-3">{d.lessons.map((l) => (
          <div key={l.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-medium text-slate-900">{l.position}. {l.title}</h3>
            {l.locked ? <p className="mt-1 text-xs text-slate-500">Enrol to read this lesson</p> : (
              <>
                {l.body && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{l.body}</p>}
                {l.videoUrl && <a className="mt-3 inline-block text-sm font-semibold text-clay underline" href={l.videoUrl} target="_blank" rel="noopener noreferrer">Watch the lesson video</a>}
                {d.enrolled && !d.canEdit && (doneIds.includes(l.id) ? <p className="mt-3 text-sm font-semibold text-clay">Completed</p> : <button className="btn mt-3" onClick={() => complete(l.id)}>Mark as complete</button>)}
              </>
            )}
          </div>
        ))}</div>
      </div>
      {d.member && (<><h2 className="mb-3 text-2xl font-medium text-slate-900">Course discussion</h2><Discussion courseId={c.id} /></>)}
    </Wrap>
  );
}

function Avatar({ src, name = '', size = 36 }) {
  const ini = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return src
    ? <img src={src} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
    : <span style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }} className="inline-flex shrink-0 items-center justify-center rounded-full bg-clay font-semibold text-white">{ini || '?'}</span>;
}

function Discussion({ courseId, divisionId }) {
  const { user } = useAuth();
  const [items, setItems] = useState(null); const [err, setErr] = useState(''); const [f, setF] = useState({ title: '', body: '' });
  const [full, setFull] = useState(null); const [reply, setReply] = useState(''); const [av, setAv] = useState({});
  const qs = courseId ? '?courseId=' + courseId : divisionId ? '?divisionId=' + divisionId : '';
  const load = () => api('/threads' + qs).then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { setItems(null); setFull(null); setErr(''); load(); }, [qs]);
  useEffect(() => {
    const rows = [...(items || []), ...(full ? full.replies : [])];
    const ids = [...new Set(rows.map((x) => x.authorId))].filter((i) => !(i in av));
    if (!ids.length) return;
    api('/avatars?ids=' + ids.join(',')).then((m) => setAv((o) => ({ ...o, ...ids.reduce((a, i) => ({ ...a, [i]: '' }), {}), ...m }))).catch(() => {});
  }, [items, full]);
  const post = async (e) => { e.preventDefault(); setErr(''); try { await api('/threads', { method: 'POST', body: { ...f, courseId, divisionId } }); setF({ title: '', body: '' }); load(); } catch (x) { setErr(x.message); } };
  const openT = async (id) => { if (full && full.id === id) { setFull(null); return; } setErr(''); try { setFull(await api('/threads/' + id)); setReply(''); } catch (x) { setErr(x.message); } };
  const send = async (e) => { e.preventDefault(); setErr(''); try { await api('/threads/' + full.id + '/replies', { method: 'POST', body: { body: reply } }); setReply(''); setFull(await api('/threads/' + full.id)); load(); } catch (x) { setErr(x.message); } };
  const del = async (path) => { setErr(''); try { await api(path, { method: 'DELETE' }); setFull(null); load(); } catch (x) { setErr(x.message); } };
  const who = (n, role, post, id) => (<span className="inline-flex flex-wrap items-center gap-2 text-xs text-slate-500"><Avatar src={av[id]} name={n} size={26} /><b className="text-slate-700">{n}</b>{post ? ', ' + post : ''}{role === 'INSTRUCTOR' && <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-semibold text-white">Instructor</span>}{role === 'ADMIN' && <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-semibold text-white">Secretariat</span>}</span>);
  return (
    <div>
      <Err msg={err} />
      <form onSubmit={post} className="mb-5 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <input className="inp" placeholder="Start a discussion: your question or topic" required minLength="3" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <textarea className="inp" rows="3" placeholder="Add the details" required minLength="3" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <button className="btn">Post discussion</button>
      </form>
      {items && items.length === 0 && <p className="text-sm text-slate-600">No discussions yet. Start the first one.</p>}
      <div className="space-y-3">{(items || []).map((t) => (
        <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <button className="w-full text-left" onClick={() => openT(t.id)}>
            <h3 className="text-lg font-medium text-slate-900">{t.title}</h3>
            <div className="mt-1">{who(t.authorName, t.authorRole, t.authorPost, t.authorId)} <span className="text-xs text-slate-500">, {fmt(t.createdAt)}, {t._count.replies} {t._count.replies === 1 ? 'reply' : 'replies'}</span></div>
          </button>
          {full && full.id === t.id && (
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{full.body}</p>
              {user?.role === 'ADMIN' && <button className="text-xs text-red-700 underline" onClick={() => window.confirm('Delete this discussion?') && del('/admin/threads/' + full.id)}>Delete discussion</button>}
              {full.replies.map((x) => (
                <div key={x.id} className="rounded-lg bg-slate-50 p-3">
                  <div>{who(x.authorName, x.authorRole, x.authorPost, x.authorId)} <span className="text-xs text-slate-500">, {fmt(x.createdAt)}</span></div>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{x.body}</p>
                  {user?.role === 'ADMIN' && <button className="mt-1 text-xs text-red-700 underline" onClick={() => window.confirm('Delete this reply?') && del('/admin/replies/' + x.id)}>Delete reply</button>}
                </div>
              ))}
              <form onSubmit={send} className="flex flex-col gap-2">
                <textarea className="inp" rows="2" placeholder="Write a reply" required value={reply} onChange={(e) => setReply(e.target.value)} />
                <div><button className="btn">Reply</button></div>
              </form>
            </div>
          )}
        </div>
      ))}</div>
    </div>
  );
}

export function Community() {
  const { user, ready } = useAuth(); const [divs] = useList('/divisions'); const [dv, setDv] = useState('');
  if (!ready) return null; if (!user) return <Navigate to="/login" />;
  return (
    <Wrap title="Community" intro="Discuss engineering with fellow members, professors and doctorate holders. Join the general conversation or choose your division.">
      <select className="inp mb-5 max-w-md" value={dv} onChange={(e) => setDv(e.target.value)}>
        <option value="">General discussion</option>
        {(divs || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <Discussion divisionId={dv || undefined} />
    </Wrap>
  );
}

function TeachCourse({ c, call }) {
  const [l, setL] = useState({ title: '', body: '', videoUrl: '' }); const [k, setK] = useState({ title: '', startsAt: '', durationMins: 60, joinUrl: '' });
  const addL = async (e) => { e.preventDefault(); if (await call('/teach/courses/' + c.id + '/lessons', 'POST', l)) setL({ title: '', body: '', videoUrl: '' }); };
  const addK = async (e) => { e.preventDefault(); if (await call('/teach/courses/' + c.id + '/classes', 'POST', { ...k, startsAt: new Date(k.startsAt).toISOString() })) setK({ title: '', startsAt: '', durationMins: 60, joinUrl: '' }); };
  const row = 'flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm';
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-xl font-medium text-slate-900">{c.title}</h3><p className="text-xs text-slate-500">{c.level}, {c.cpdHours} CPD hours</p></div>
        <div className="flex gap-2"><Link className="btn" to={'/course/' + c.id}>View</Link><button className="btn bg-red-700" onClick={() => window.confirm('Delete this course with all its lessons and classes?') && call('/teach/courses/' + c.id, 'DELETE')}>Delete</button></div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Lessons</h4>
        <div className="mb-3 space-y-2">{c.lessons.map((x) => <div key={x.id} className={row}><span>{x.position}. {x.title}</span><button className="text-xs text-red-700 underline" onClick={() => call('/teach/lessons/' + x.id, 'DELETE')}>Remove</button></div>)}</div>
        <form onSubmit={addL} className="space-y-2">
          <input className="inp" placeholder="Lesson title" required value={l.title} onChange={(e) => setL({ ...l, title: e.target.value })} />
          <textarea className="inp" rows="4" placeholder="Lesson text (blank lines start a new paragraph)" value={l.body} onChange={(e) => setL({ ...l, body: e.target.value })} />
          <input className="inp" placeholder="Video link (optional, starting with https://)" value={l.videoUrl} onChange={(e) => setL({ ...l, videoUrl: e.target.value })} />
          <button className="btn">Add lesson</button>
        </form>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Live classes</h4>
        <div className="mb-3 space-y-2">{c.classes.map((x) => <div key={x.id} className={row}><span>{x.title}, {new Date(x.startsAt).toLocaleString()}</span><button className="text-xs text-red-700 underline" onClick={() => call('/teach/classes/' + x.id, 'DELETE')}>Remove</button></div>)}</div>
        <form onSubmit={addK} className="grid gap-2 sm:grid-cols-2">
          <input className="inp" placeholder="Class title" required value={k.title} onChange={(e) => setK({ ...k, title: e.target.value })} />
          <input className="inp" type="datetime-local" required value={k.startsAt} onChange={(e) => setK({ ...k, startsAt: e.target.value })} />
          <input className="inp" type="number" min="15" max="480" required value={k.durationMins} onChange={(e) => setK({ ...k, durationMins: e.target.value })} />
          <input className="inp" placeholder="Join link (Zoom, Meet, https://...)" required value={k.joinUrl} onChange={(e) => setK({ ...k, joinUrl: e.target.value })} />
          <div><button className="btn">Schedule class</button></div>
        </form>
      </div>
    </div>
  );
}

export function Teach() {
  const { user, ready } = useAuth(); const [divs] = useList('/divisions');
  const [items, setItems] = useState([]); const [err, setErr] = useState('');
  const [c, setC] = useState({ title: '', description: '', level: 'Foundation', cpdHours: 6, divisionId: '' });
  const [ins, setIns] = useState([]); const [email, setEmail] = useState('');
  const isStaff = !!user && (user.role === 'ADMIN' || user.role === 'INSTRUCTOR');
  const load = () => { api('/teach/courses').then(setItems).catch((e) => setErr(e.message)); if (user?.role === 'ADMIN') api('/admin/instructors').then(setIns).catch(() => {}); };
  useEffect(() => { if (isStaff) load(); }, [user]);
  if (!ready) return null; if (!isStaff) return <Navigate to="/login" />;
  const call = async (path, method, body) => { setErr(''); try { await api(path, { method, body }); await load(); return true; } catch (x) { setErr(x.message); return false; } };
  const addC = async (e) => { e.preventDefault(); if (await call('/teach/courses', 'POST', c)) setC({ ...c, title: '', description: '' }); };
  const addI = async (e) => { e.preventDefault(); if (await call('/admin/instructors', 'POST', { email })) setEmail(''); };
  return (
    <Wrap title="Teach" intro="Create courses, add lessons and schedule live classes for IAEP members.">
      <Err msg={err} />
      {user.role === 'ADMIN' && (
        <div className="mb-10">
          <h2 className="mb-2 text-2xl font-medium text-slate-900">Instructors</h2>
          <p className="mb-3 text-sm text-slate-600">Enter the email of a person who has created an account. They become an instructor and can create courses.</p>
          <div className="mb-3 space-y-2">{ins.length === 0 && <p className="text-sm text-slate-500">No instructors yet.</p>}{ins.map((x) => <div key={x.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm"><span><b>{x.name}</b>, {x.email}</span><button className="text-xs text-red-700 underline" onClick={() => call('/admin/instructors/' + x.id, 'DELETE')}>Remove</button></div>)}</div>
          <form onSubmit={addI} className="flex max-w-md gap-2"><input className="inp" type="email" placeholder="instructor@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} /><button className="btn">Add</button></form>
        </div>
      )}
      <h2 className="mb-3 text-2xl font-medium text-slate-900">New course</h2>
      <form onSubmit={addC} className="mb-10 grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Field label="Course title"><input className="inp" required minLength="3" value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} /></Field>
        <Field label="Division"><select className="inp" required value={c.divisionId} onChange={(e) => setC({ ...c, divisionId: e.target.value })}><option value="">Choose a division</option>{(divs || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
        <Field label="Level (Foundation, Intermediate, Advanced)"><input className="inp" required value={c.level} onChange={(e) => setC({ ...c, level: e.target.value })} /></Field>
        <Field label="CPD hours"><input className="inp" type="number" min="0" required value={c.cpdHours} onChange={(e) => setC({ ...c, cpdHours: e.target.value })} /></Field>
        <div className="sm:col-span-2"><Field label="What members will learn"><textarea className="inp" rows="4" required minLength="10" value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} /></Field></div>
        <div><button className="btn btn-gold">Create course</button></div>
      </form>
      <h2 className="mb-3 text-2xl font-medium text-slate-900">{user.role === 'ADMIN' ? 'All courses' : 'Your courses'}</h2>
      {items.length === 0 && <p className="text-sm text-slate-600">No courses yet.</p>}
      <div className="space-y-5">{items.map((x) => <TeachCourse key={x.id} c={x} call={call} />)}</div>
    </Wrap>
  );
}

export function Certificate() {
  const code = window.location.pathname.split('/')[2]; const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api('/certificates/' + encodeURIComponent(code)).then(setD).catch((e) => setErr(e.message)); }, [code]);
  if (!d) return <Wrap title="Certificate" intro=""><Err msg={err} /></Wrap>;
  if (!d.valid) return <Wrap title="Certificate" intro=""><p className="text-slate-700">This certificate code is not valid. Check the code and try again.</p></Wrap>;
  return (
    <Wrap title="Certificate of completion" intro="">
      <div className="mx-auto max-w-2xl rounded-xl border-4 border-double border-clay bg-white p-8 text-center sm:p-12">
        <div className="flex justify-center"><Logo size={64} /></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-clay">International Association of Engineering Professionals</p>
        <h2 className="mt-4 text-3xl font-medium text-slate-900">Certificate of Completion</h2>
        <p className="mt-6 text-sm text-slate-600">This certifies that</p>
        <p className="mt-2 font-serif text-3xl font-medium text-slate-900">{d.memberName}</p>
        {d.memberNo && <p className="mt-1 text-xs text-slate-500">Member number {d.memberNo}</p>}
        <p className="mt-6 text-sm text-slate-600">has successfully completed the course</p>
        <p className="mt-2 font-serif text-2xl font-medium text-slate-900">{d.courseTitle}</p>
        <p className="mt-4 text-sm text-slate-700">{d.hours} continuing professional development hours{d.instructorName ? ', taught by ' + d.instructorName : ''}</p>
        <p className="mt-6 text-sm text-slate-700">Issued on {fmt(d.issuedAt)}</p>
        <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">Certificate code {d.code}. Verify at {window.location.origin}/certificate/{d.code}</p>
      </div>
      <div className="no-print mt-6 text-center"><button className="btn btn-gold" onClick={() => window.print()}>Print or save as PDF</button></div>
    </Wrap>
  );
}

export function MyLearning() {
  const { user, ready } = useAuth(); const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { if (user) api('/my/learning').then(setD).catch((e) => setErr(e.message)); }, [user]);
  if (!ready) return null; if (!user) return <Navigate to="/login" />;
  const done = user.cpdDone || 0, target = user.cpdTarget || 0; const pct = target ? Math.min(100, Math.round((done / target) * 100)) : 0;
  const bar = (p) => <div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-clay" style={{ width: p + '%' }} /></div>;
  return (
    <Wrap title="My learning" intro="Your courses, upcoming classes, certificates and CPD progress in one place.">
      <Err msg={err} />
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-medium text-slate-900">CPD this year</h2>
        <p className="mt-1 text-sm text-slate-600">{done} of {target} hours recorded</p>
        <div className="mt-3">{bar(pct)}</div>
      </div>
      {d && d.classes.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-2xl font-medium text-slate-900">Upcoming live classes</h2>
          <div className="space-y-3">{d.classes.map((x) => (
            <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <span><b>{x.title}</b><br />{x.courseTitle}, {new Date(x.startsAt).toLocaleString()}</span>
              <a className="btn btn-gold" href={x.joinUrl} target="_blank" rel="noopener noreferrer">Join class</a>
            </div>
          ))}</div>
        </div>
      )}
      <h2 className="mb-3 text-2xl font-medium text-slate-900">My courses</h2>
      {d && d.courses.length === 0 && <p className="mb-8 text-sm text-slate-600">You are not enrolled in any course yet. <Link to="/learning" className="font-semibold text-clay underline">Browse courses</Link>.</p>}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">{(d ? d.courses : []).map((c) => {
        const p = c.total ? Math.round((c.done / c.total) * 100) : 0;
        return (
          <Link key={c.id} to={'/course/' + c.id} className="block rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{c.level}, {c.cpdHours} CPD hours</p>
            <h3 className="mt-1 text-lg font-medium text-slate-900">{c.title}</h3>
            <div className="mt-3">{bar(c.certificate ? 100 : p)}</div>
            <p className="mt-2 text-xs font-semibold text-clay">{c.certificate ? 'Completed' : c.total ? c.done + ' of ' + c.total + ' lessons' : 'Lessons coming soon'}</p>
          </Link>
        );
      })}</div>
      <h2 className="mb-3 text-2xl font-medium text-slate-900">My certificates</h2>
      {d && d.certificates.length === 0 && <p className="text-sm text-slate-600">Complete every lesson of a course to earn your first certificate.</p>}
      <div className="space-y-3">{(d ? d.certificates : []).map((x) => (
        <div key={x.code} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <span><b>{x.courseTitle}</b><br />{x.hours} CPD hours, issued {fmt(x.issuedAt)}</span>
          <Link className="btn" to={'/certificate/' + x.code}>View certificate</Link>
        </div>
      ))}</div>
    </Wrap>
  );
}

export function Profile() {
  const { user, ready, refresh } = useAuth(); const [bio, setBio] = useState(null); const [err, setErr] = useState(''); const [ok, setOk] = useState('');
  useEffect(() => { if (user && bio === null) setBio(user.bio || ''); }, [user]);
  if (!ready) return null; if (!user) return <Navigate to="/login" />;
  const send = async (avatar) => { setErr(''); setOk(''); try { await api('/me/avatar', { method: 'PUT', body: { avatar } }); await refresh(); setOk(avatar ? 'Photo updated' : 'Photo removed'); } catch (x) { setErr(x.message); } };
  const pick = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height), cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
      const cx = cv.getContext('2d'); cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 128, 128);
      cx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 128, 128);
      URL.revokeObjectURL(url); send(cv.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => setErr('That file could not be read as an image');
    img.src = url;
  };
  const saveBio = async (e) => { e.preventDefault(); setErr(''); setOk(''); try { await api('/me/profile', { method: 'PUT', body: { bio } }); await refresh(); setOk('Profile saved'); } catch (x) { setErr(x.message); } };
  return (
    <Wrap title="My profile" intro="Your photo and introduction appear beside your posts in the community and on courses you teach.">
      <Err msg={err} />
      {ok && <p className="mb-3 text-sm font-semibold text-clay">{ok}</p>}
      <div className="max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatar} name={user.name} size={72} />
          <div>
            <p className="font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.role === 'INSTRUCTOR' ? 'Instructor' : user.role === 'ADMIN' ? 'Secretariat' : 'Member'}{user.memberNo ? ', ' + user.memberNo : ''}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="btn cursor-pointer">Choose a photo<input type="file" accept="image/*" className="hidden" onChange={pick} /></label>
          {user.avatar && <button className="btn bg-slate-500" onClick={() => send('')}>Remove photo</button>}
        </div>
        <form onSubmit={saveBio} className="space-y-3">
          <Field label="About you (shown on courses you teach)"><textarea className="inp" rows="4" maxLength="600" value={bio || ''} onChange={(e) => setBio(e.target.value)} /></Field>
          <button className="btn btn-gold">Save</button>
        </form>
      </div>
    </Wrap>
  );
}
