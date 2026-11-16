function Panel({ children, className = '' }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm [&_.bg-white\\/6]:bg-slate-50 [&_.border-white\\/10]:border-slate-200 [&_.text-cyan-100]:text-cyan-700 [&_.text-cyan-200]:text-cyan-700 [&_.text-cyan-300]:text-indigo-600 [&_.text-emerald-300]:text-emerald-600 [&_.text-rose-300]:text-rose-600 [&_.text-slate-300]:text-slate-600 [&_.text-slate-400]:text-slate-500 [&_.text-white]:text-slate-950 ${className}`}
    >
      {children}
    </section>
  );
}

export default Panel;
