import { CheckCircle2, Swords, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const fallback = [
  { icon: CheckCircle2, title: 'Two Sum', meta: 'Accepted · C++ · 32ms', color: 'text-emerald-600' },
  { icon: XCircle, title: 'Reverse Linked List', meta: 'Wrong Answer · C++', color: 'text-red-500' },
  { icon: Swords, title: '1v1 Battle', meta: 'Victory · +24 rating', color: 'text-indigo-600' },
];

function RecentActivity({ submissions }) {
  const activities = submissions?.length
    ? submissions.slice(0, 3).map((submission) => ({
        icon: submission.verdict === 'ACCEPTED' ? CheckCircle2 : XCircle,
        title: submission.problem.title,
        meta: `${submission.verdict} · ${submission.language} · ${submission.runtimeMs || '-'}ms`,
        color: submission.verdict === 'ACCEPTED' ? 'text-emerald-600' : 'text-red-500',
      }))
    : fallback;

  return (
    <section className="dashboard-reveal rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-950">Recent Activity</h2>
        <Link className="text-sm font-semibold text-indigo-600 hover:text-indigo-800" to="/analytics">
          View activity →
        </Link>
      </div>
      <div className="mt-4 space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div key={`${activity.title}-${activity.meta}`} className="flex items-center gap-3">
              <Icon className={activity.color} size={20} />
              <div>
                <p className="font-medium text-slate-900">{activity.title}</p>
                <p className="text-sm text-slate-500">{activity.meta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RecentActivity;
