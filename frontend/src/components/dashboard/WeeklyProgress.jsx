function WeeklyProgress() {
  const rows = [
    ['Problems', '8 / 10', 80],
    ['Battles', '3 / 5', 60],
    ['Practice', '4.5 hrs', 72],
  ];

  return (
    <section className="dashboard-reveal rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <h2 className="font-semibold text-slate-950">This Week</h2>
      <div className="mt-5 space-y-5">
        {rows.map(([label, value, percent]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">{label}</span>
              <span className="font-semibold text-slate-900">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="progress-fill h-2 rounded-full bg-indigo-600" data-width={`${percent}%`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WeeklyProgress;
