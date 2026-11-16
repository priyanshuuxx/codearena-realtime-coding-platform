function LiveSystemStatus({ status }) {
  const systems = [
    ['Matchmaking', 'Online'],
    ['Code Runner', status === 'offline' ? 'Demo' : 'Online'],
    ['Battle Server', 'Online'],
  ];

  return (
    <section className="dashboard-reveal rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2">
        <span className="live-dot h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <h2 className="font-semibold text-slate-950">CodeArena Systems Operational</h2>
      </div>
      <div className="mt-4 space-y-3">
        {systems.map(([name, value]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{name}</span>
            <span className="inline-flex items-center gap-2 font-medium text-slate-800">
              <span className="live-dot h-2 w-2 rounded-full bg-emerald-500" />
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default LiveSystemStatus;
