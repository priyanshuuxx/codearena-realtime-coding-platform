import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  BarChart3,
  Bell,
  Bug,
  Code2,
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  Swords,
  Target,
  Trophy,
  UserCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/problems', label: 'Problems', icon: Code2 },
  { to: '/debugging', label: 'Debug Arena', icon: Bug },
  { to: '/mcq', label: 'MCQ Practice', icon: Target },
  { to: '/interview', label: 'Interview Mode', icon: Shield },
  { to: '/battles', label: 'Battles', icon: Swords },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

function AppLayout({ children, title, eyebrow, action, variant = 'default' }) {
  const { logout, user } = useAuth();
  const contentRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const root = contentRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!root || reduceMotion) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        '.app-reveal',
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.48,
          ease: 'power3.out',
          stagger: 0.045,
        },
      );

      gsap.to('.app-ambient-glow', {
        xPercent: 6,
        yPercent: -4,
        scale: 1.05,
        duration: 12,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
      });
    }, root);

    return () => context.revert();
  }, [location.pathname]);

  return (
    <main className={`app-shell min-h-screen bg-slate-50 text-slate-950 ${variant === 'workspace' ? 'workspace-shell' : ''}`}>
      <div className="app-ambient-glow pointer-events-none fixed right-[12%] top-[10%] h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_78%_12%,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_10%_20%,rgba(14,165,233,0.07),transparent_25%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[260px_1fr]">
        <aside className="app-reveal hidden border-r border-slate-200 bg-white p-6 lg:block">
          <Link className="flex items-center gap-3" to="/dashboard">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-indigo-600 text-white">
              <Code2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">CodeArena</p>
              <h1 className="text-lg font-bold text-slate-950">Control Room</h1>
            </div>
          </Link>

          <nav className="mt-10 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-slate-950'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`
                  }
                  to={item.to}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={isActive ? 'text-indigo-600' : 'text-slate-400'} size={18} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {(user?.name || 'P').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">{user?.name || 'Priyanshu Singh'}</p>
                <p className="text-xs text-slate-500">Profile</p>
              </div>
            </div>
          </div>
        </aside>

        <section ref={contentRef} className="px-4 py-5 sm:px-6 lg:px-8">
          <header className="app-reveal mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/80 p-4 backdrop-blur lg:rounded-xl lg:border lg:shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
              <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
              {user?.email && <p className="mt-1 text-sm text-slate-500">{user.email}</p>}
            </div>
            <div className="flex flex-1 items-center justify-end gap-3">
              <form
                className="hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 md:flex"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigate(`/problems?search=${encodeURIComponent(search)}`);
                }}
              >
                <Search size={17} />
                <input className="w-full bg-transparent outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problems..." />
              </form>
              {action}
              <button className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600" type="button" onClick={() => setIsNotificationsOpen(true)} aria-label="Notifications">
                <Bell size={18} />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600" type="button" onClick={() => setIsProfileOpen(true)} aria-label="Profile">
                <UserCircle size={20} />
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600"
                type="button"
                onClick={logout}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </header>

          <div className="app-reveal">{children}</div>
        </section>
      </div>
      {(isNotificationsOpen || isProfileOpen) && (
        <div className="app-drawer-overlay fixed inset-0 z-50 flex justify-end bg-slate-950/20 backdrop-blur-sm">
          <aside className="app-drawer h-full w-full max-w-sm border-l border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  {isNotificationsOpen ? 'Notifications' : 'Profile'}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  {isNotificationsOpen ? 'CodeArena updates' : user?.name || 'Student Profile'}
                </h3>
              </div>
              <button className="rounded-md border border-slate-200 p-2 text-slate-500 hover:text-slate-950" type="button" onClick={() => { setIsNotificationsOpen(false); setIsProfileOpen(false); }} aria-label="Close panel">
                <X size={18} />
              </button>
            </div>
            {isNotificationsOpen ? (
              <div className="mt-6 space-y-3">
                {['New DSA catalog is ready: 220 problems.', 'Debug Arena now includes 100 practice bugs.', 'Bot battles are available for every level.'].map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                  {(user?.name || 'P').slice(0, 1).toUpperCase()}
                </div>
                <p><span className="font-semibold text-slate-950">Email:</span> {user?.email}</p>
                <p><span className="font-semibold text-slate-950">Role:</span> {user?.role || 'USER'}</p>
                <p><span className="font-semibold text-slate-950">Rating:</span> {user?.rating || 1000}</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export default AppLayout;
