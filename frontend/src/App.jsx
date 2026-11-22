import { useState } from 'react';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from './auth.jsx';
import { Home, Apply, Events, Courses, Login, Portal, Admin, Disciplines, Verify, News, About, Contact, AdminMessages } from './pages.jsx';

export const Logo = ({ size = 40 }) => (
  <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/60 bg-navy font-serif text-xs font-bold text-gold" style={{ width: size, height: size }}>
    IAEP
    <img src="/iaep_official_logo.jpg" alt="" className="absolute inset-0 h-full w-full bg-navy object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
  </span>
);

function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const links = [['/membership', 'Membership'], ['/events', 'Events'], ['/learning', 'Learning and CPD'], ['/disciplines', 'Disciplines'], ['/verify', 'Verify credential'], ['/news', 'News'], ['/about', 'About'], ['/contact', 'Contact'], [user ? '/portal' : '/login', user ? 'My portal' : 'Member sign in'], ...(user?.role === 'ADMIN' ? [['/admin', 'Admissions'], ['/messages', 'Messages']] : [])];
  const cls = ({ isActive }) => 'py-2 text-sm ' + (isActive ? 'font-semibold text-gold' : 'text-slate-200');
  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo />
          <span className="leading-tight"><span className="block font-serif text-lg font-bold">IAEP</span><span className="hidden text-[11px] text-slate-400 sm:block">International Association of Engineering Professionals</span></span>
        </Link>
        <nav className="hidden items-center gap-6 xl:flex">
          {links.map(([to, t]) => <NavLink key={to} to={to} className={cls}>{t}</NavLink>)}
          {user && <button onClick={logout} className="text-sm text-slate-400">Sign out</button>}
        </nav>
        <button className="p-2 xl:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-[#071324] px-6 py-3 xl:hidden" onClick={() => setOpen(false)}>
          {links.map(([to, t]) => <NavLink key={to} to={to} className={cls}>{t}</NavLink>)}
          {user && <button onClick={logout} className="py-2 text-left text-sm text-slate-400">Sign out</button>}
        </nav>
      )}
    </header>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Apply />} />
          <Route path="/events" element={<Events />} />
          <Route path="/learning" element={<Courses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/messages" element={<AdminMessages />} />
          <Route path="/disciplines" element={<Disciplines />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="bg-navy px-4 py-8 text-center text-xs text-slate-400">
        International Association of Engineering Professionals. Ughevwughe Secretariat, Ughelli South, Delta State, Nigeria.
      </footer>
    </div>
  );
}
