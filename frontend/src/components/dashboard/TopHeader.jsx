import { Bell, LogOut, Search, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TopHeader({ title, logout, onNotifications, onProfile }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur xl:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Student Dashboard</p>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <form
          className="hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 shadow-sm md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(`/problems?search=${encodeURIComponent(search)}`);
          }}
        >
          <Search size={17} />
          <input className="w-full bg-transparent outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problems..." />
        </form>
        <button className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600" type="button" onClick={onNotifications} aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600" type="button" onClick={onProfile} aria-label="Profile">
          <UserCircle size={20} />
        </button>
        <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600" type="button" onClick={logout}>
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default TopHeader;
