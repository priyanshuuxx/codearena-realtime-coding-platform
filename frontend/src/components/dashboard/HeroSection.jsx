import { Link } from 'react-router-dom';
import { Code2, Play, Swords } from 'lucide-react';

function HeroSection() {
  return (
    <section className="dashboard-reveal overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-8 p-7 lg:grid-cols-[1fr_360px] lg:p-9">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Student Dashboard</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl">
            Train. Compete. Improve.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Sharpen your problem-solving skills through coding practice, debugging and real-time competition.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md" to="/problems">
              <Play size={17} />
              Start Practice
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-sm" to="/battles">
              <Swords size={17} />
              Find Battle
            </Link>
          </div>
        </div>
        <div className="relative min-h-60 rounded-lg border border-slate-200 bg-slate-50">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 220" fill="none">
            <path d="M68 64H176L238 104M176 64V144M88 154L176 144L238 104M176 144L160 178" stroke="#CBD5E1" strokeWidth="1.3" />
            <path className="mini-particle" d="M68 64H108" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
            <path className="mini-particle" d="M176 64V104" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            {[['68', '64'], ['176', '64'], ['238', '104'], ['88', '154'], ['176', '144'], ['160', '178']].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} className="live-dot" cx={cx} cy={cy} r="4.5" fill="#4F46E5" />
            ))}
          </svg>
          <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-white text-indigo-600 shadow-lg ring-1 ring-slate-200">
            <Code2 size={25} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
