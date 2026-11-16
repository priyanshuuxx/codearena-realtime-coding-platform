import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Compass, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdaptiveMission({ stats, user }) {
  const storageKey = `codearena_mission_${user?.id || user?.email || 'guest'}`;
  const [isComplete, setIsComplete] = useState(() => localStorage.getItem(storageKey) === 'complete');

  const mission = useMemo(() => {
    const debuggingScore = Number(stats?.debuggingScore || 0);
    const mcqScore = Number(stats?.mcqScore || 0);
    const losses = Number(stats?.losses || 0);
    const wins = Number(stats?.wins || 0);

    if (debuggingScore < 60) {
      return {
        mode: 'Repair mode',
        title: 'Close one debugging gap',
        reason: 'Your debugging score is the lowest signal in your current profile.',
        detail: 'Fix one runtime or boundary bug before starting another timed battle.',
        to: '/debugging',
        action: 'Open Debug Arena',
        metric: `${debuggingScore}% debugging score`,
      };
    }

    if (mcqScore < 100) {
      return {
        mode: 'Recall mode',
        title: 'Build interview recall',
        reason: 'Your technical knowledge queue has room to grow.',
        detail: 'Complete a short MCQ set to strengthen the concepts behind your coding speed.',
        to: '/mcq',
        action: 'Start MCQ set',
        metric: `${mcqScore} MCQ points`,
      };
    }

    if (losses > wins) {
      return {
        mode: 'Resilience mode',
        title: 'Run a low-stakes rematch',
        reason: 'Recent battles show more losses than wins.',
        detail: 'Use a bot battle to practise decisions under a clock without risking your rating.',
        to: '/battles',
        action: 'Find a bot battle',
        metric: `${wins} wins / ${losses} losses`,
      };
    }

    return {
      mode: 'Momentum mode',
      title: 'Convert momentum into speed',
      reason: 'Your current signals are balanced and ready for a timed challenge.',
      detail: 'Solve one medium problem, then review the edge cases before submitting.',
      to: '/problems',
      action: 'Open next problem',
      metric: `${stats?.totalSolvedProblems || 0} solved problems`,
    };
  }, [stats]);

  function completeMission() {
    const nextValue = !isComplete;
    setIsComplete(nextValue);

    if (nextValue) {
      localStorage.setItem(storageKey, 'complete');
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  return (
    <section className="dashboard-reveal adaptive-mission overflow-hidden rounded-xl border border-cyan-400/20 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-cyan-300">
          <Compass size={18} />
          <h2 className="font-semibold">Adaptive Training Loop</h2>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-cyan-200">
          {mission.mode}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Today's mission</p>
          <h3 className="mt-2 text-xl font-bold text-slate-100">{mission.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{mission.detail}</p>
        </div>
        <div className="rounded-lg border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.12em] text-slate-500">Signal</p>
          <p className="mt-1 text-sm font-semibold text-cyan-200">{mission.metric}</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-700/60 bg-slate-950/30 p-3 text-xs leading-5 text-slate-400">
        <LockKeyhole className="mt-0.5 shrink-0 text-cyan-300" size={14} />
        <span><strong className="font-semibold text-slate-200">Why this was chosen:</strong> {mission.reason}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300" to={mission.to}>
          {mission.action}
          <ArrowRight size={16} />
        </Link>
        <button className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${isComplete ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-slate-600 text-slate-300 hover:border-cyan-300/50 hover:text-cyan-200'}`} type="button" onClick={completeMission}>
          <CheckCircle2 size={16} />
          {isComplete ? 'Mission complete' : 'Mark complete'}
        </button>
      </div>
    </section>
  );
}

export default AdaptiveMission;
