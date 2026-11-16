import { Link } from 'react-router-dom';

function NextMove({ recommendation }) {
  const next = recommendation || {
    title: 'Binary Search',
    type: 'Medium',
    description: 'Based on your recent practice, this is a good next challenge.',
  };

  return (
    <section className="dashboard-reveal rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Your Next Move</p>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{next.title}</h2>
          <p className="mt-1 text-sm font-medium text-indigo-600">{next.type || 'Medium'}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{next.description}</p>
      <Link className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700" to="/problems">
        Start Problem →
      </Link>
    </section>
  );
}

export default NextMove;
