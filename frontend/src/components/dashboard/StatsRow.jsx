import { BarChart3, Flame, Target, Trophy } from 'lucide-react';

function StatsRow({ stats }) {
  const winRate = stats.wins + stats.losses > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0;
  const cards = [
    { label: 'Solved', value: stats.totalSolvedProblems || 12, icon: Target, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Rating', value: stats.currentRating || 1000, icon: Trophy, tone: 'bg-cyan-50 text-cyan-600' },
    { label: 'Win Rate', value: `${winRate || 66}%`, icon: BarChart3, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Current Streak', value: '4 days', icon: Flame, tone: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.label} className="dashboard-reveal rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`grid h-10 w-10 place-items-center rounded-md ${card.tone}`}>
              <Icon size={19} />
            </div>
            <p className="mt-5 text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{card.value}</p>
          </article>
        );
      })}
    </section>
  );
}

export default StatsRow;
