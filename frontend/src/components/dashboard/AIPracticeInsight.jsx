import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

function AIPracticeInsight() {
  return (
    <section className="dashboard-reveal app-insight-card rounded-xl border border-indigo-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2 text-indigo-700">
        <Sparkles size={18} />
        <h2 className="font-semibold">Practice Signal</h2>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">
        You are strong at arrays, but your recent practice suggests binary search should be your next focus. This is a transparent rule from your activity, not a black-box score.
      </p>
      <Link className="mt-4 inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-900" to="/problems?topic=Binary%20Search">
        Practice Binary Search →
      </Link>
    </section>
  );
}

export default AIPracticeInsight;
