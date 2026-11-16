import { Link, NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bug,
  Code2,
  LayoutDashboard,
  Shield,
  Swords,
  Target,
  Trophy,
} from 'lucide-react';

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

function Sidebar({ user, mobile = false }) {
  return (
    <aside className={`${mobile ? 'flex h-full flex-col' : 'hidden min-h-screen border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col'}`}>
      <Link className="flex items-center gap-3" to="/dashboard">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-indigo-600 text-white">
          <Code2 size={21} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">CodeArena</p>
          <h1 className="text-lg font-bold text-slate-950">Control Room</h1>
        </div>
      </Link>

      <nav className="mt-9 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
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

      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
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
  );
}

export default Sidebar;
