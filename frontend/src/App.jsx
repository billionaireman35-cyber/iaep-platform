import './loader.js';
import { useState } from 'react';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from './auth.jsx';
import { Home, Apply, Events, Courses, Login, Portal, Admin, Disciplines, Verify, News, About, Contact, AdminMessages, AdminContent, Signup, Pay, PaymentReturn, CourseView, Community, Teach, Certificate, MyLearning, Profile, VerifyEmail, InstructorList, InstructorPage, Governance, Constitution, Treasury, Chapters, Corporate } from './pages.jsx';

export const Logo = ({ size = 40 }) => (
  <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/60 bg-navy font-serif text-xs font-bold text-gold" style={{ width: size, height: size }}>
    IAEP
    <img src="/iaep_official_logo.jpg" alt="" className="absolute inset-0 h-full w-full bg-navy object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
  </span>
);

const main = [['/membership', 'Membership'], ['/events', 'Events'], ['/learning', 'Learning and CPD'], ['/disciplines', 'Disciplines'], ['/verify', 'Verify credential'], ['/pay', 'Pay dues'], ['/community', 'Community']];
const inst = [['/about', 'About IAEP'], ['/governance', 'Governance and Council'], ['/constitution', 'Constitution, Policies and Ethics'], ['/treasury', 'Council Treasury and Finances'], ['/chapters', 'Chapters and Countries'], ['/corporate', 'Corporate Partnerships'], ['/news', 'News and Statements'], ['/contact', 'Contact the Secretariat']];

function Header() {
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState(false);
  const { user, logout } = useAuth();
  const acct = [[user ? '/portal' : '/login', user ? 'My portal' : 'Member sign in'], ['/instructors', 'Instructors']];
  if (user && user.role === 'INSTRUCTOR') acct.push(['/teach', 'Teach']);
  if (user) acct.push(['/my-learning', 'My learning'], ['/profile', 'My profile']);
  const adminLinks = user && user.role === 'ADMIN' ? [['/admin', 'Admissions'], ['/messages', 'Messages'], ['/content', 'Manage content'], ['/teach', 'Courses']] : [];
  const cls = ({ isActive }) => 'whitespace-nowrap py-2 text-sm ' + (isActive ? 'font-semibold text-gold' : 'text-slate-200');
  const close = () => { setOpen(false); setDd(false); };
  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3" onClick={close}>
          <Logo />
          <span className="leading-tight"><span className="block font-serif text-lg font-bold">IAEP</span><span className="hidden text-[11px] text-slate-400 sm:block">International Association of Engineering Professionals</span></span>
        </Link>
        <nav className="hidden items-center gap-5 xl:flex">
          {main.map(([to, t]) => <NavLink key={to} to={to} className={cls}>{t}</NavLink>)}
          <div className="relative">
            <button onClick={() => setDd(!dd)} className="flex items-center gap-1 py-2 text-sm text-slate-200">Institution <ChevronDown size={14} /></button>
            {dd && <div className="absolute right-0 top-full mt-1 w-72 rounded border border-slate-700 bg-[#2E2A26] py-2 shadow-xl" onClick={close}>{inst.map(([to, t]) => <NavLink key={to} to={to} className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">{t}</NavLink>)}</div>}
          </div>
          {acct.map(([to, t]) => <NavLink key={to} to={to} className={cls}>{t}</NavLink>)}
          {user && <button onClick={logout} className="text-sm text-slate-400">Sign out</button>}
        </nav>
        <button className="p-2 xl:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {adminLinks.length > 0 && <div className="border-t border-white/10 bg-[#141211]"><div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-4 py-1"><span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-widest text-gold">Secretariat</span>{adminLinks.map(([to, t]) => <NavLink key={to} to={to} className={cls}>{t}</NavLink>)}</div></div>}
      {open && (
        <nav className="flex max-h-[75vh] flex-col gap-1 overflow-y-auto border-t border-white/10 bg-[#1B1917] px-6 py-3 xl:hidden" onClick={close}>
          {[...main, ...inst, ...acct].map(([to, t]) => <NavLink key={to} to={to} className={cls}>{t}</NavLink>)}
          {user && <button onClick={logout} className="py-2 text-left text-sm text-slate-400">Sign out</button>}
        </nav>
      )}
    </header>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {user && user.emailVerified === false ? <VerifyEmail /> : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Apply />} />
          <Route path="/events" element={<Events />} />
          <Route path="/learning" element={<Courses />} />
          <Route path="/disciplines" element={<Disciplines />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/about" element={<About />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/constitution" element={<Constitution />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/chapters" element={<Chapters />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/payment/return" element={<PaymentReturn />} />
          <Route path="/course/:id" element={<CourseView />} />
          <Route path="/community" element={<Community />} />
          <Route path="/teach" element={<Teach />} />
          <Route path="/certificate/:code" element={<Certificate />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/instructors" element={<InstructorList />} />
          <Route path="/instructor/:id" element={<InstructorPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/content" element={<AdminContent />} />
          <Route path="/messages" element={<AdminMessages />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        )}
      </main>
      <footer className="bg-navy px-4 py-12 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3"><Logo size={44} /><span className="font-serif text-lg font-semibold text-white">IAEP</span></div>
            <p className="mt-3 text-sm text-slate-400">International Association of Engineering Professionals. Ughevwughe Secretariat, Ughelli South, Delta State, Nigeria.</p>
          </div>
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-slate-400">Membership</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm"><Link to="/membership">Apply for membership</Link><Link to="/pay">Pay dues</Link><Link to="/verify">Verify a credential</Link><Link to="/login">Member sign in</Link></div>
          </div>
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-slate-400">The institution</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm"><Link to="/about">About IAEP</Link><Link to="/governance">Governance and Council</Link><Link to="/constitution">Constitution, Policies and Ethics</Link><Link to="/news">News and Statements</Link><Link to="/contact">Contact the Secretariat</Link></div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-slate-400">IAEP is an independent international professional association. IAEP membership grades do not substitute for mandatory statutory engineering licences, such as COREN registration in Nigeria.</p>
      </footer>
    </div>
  );
}
