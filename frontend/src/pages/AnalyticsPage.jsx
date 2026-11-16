import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import Panel from '../components/Panel.jsx';
import { api } from '../lib/api.js';

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/platform/analytics').then(({ data }) => setAnalytics(data.analytics)).catch(() => setError('Analytics are temporarily unavailable.'));
  }, []);

  const stats = analytics
    ? [
        ['MCQ Accuracy', `${analytics.mcqAccuracy}%`],
        ['Debug Success', `${analytics.debuggingSuccessRate}%`],
        ['Battle Win Rate', `${analytics.battleWinRate}%`],
        ['Practice Streak', `${analytics.streak} days`],
      ]
    : [];

  return (
    <AppLayout eyebrow="Performance" title="Analytics Dashboard">
      <div className="grid gap-5 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <Panel key={label}>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          </Panel>
        ))}
      </div>
      {error && <Panel className="mt-5 border-rose-400/30"><p className="text-sm text-rose-300">{error}</p></Panel>}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Learner intelligence</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Skill profile</h3>
          <div className="mt-5 space-y-5">
            {(analytics?.skillProfile || []).map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm"><span className="text-slate-200">{item.label}</span><span className="text-cyan-300">{item.score}%</span></div>
                <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-cyan-300" style={{ width: `${item.score}%` }} /></div>
                <p className="mt-2 text-xs text-slate-500">Evidence: {item.evidence}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Explainable recommendation</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{analytics?.recommendation?.title || 'Building your recommendation'}</h3>
          <p className="mt-3 leading-7 text-slate-300">{analytics?.recommendation?.reason || 'Complete a few activities and CodeArena will explain your next best practice step.'}</p>
          <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">Focus areas: {(analytics?.interviewReport?.focusAreas || []).join(' · ') || 'Collecting signal'}</div>
        </Panel>
      </div>
      <Panel className="mt-5">
        <h3 className="text-lg font-semibold">Topic Performance</h3>
        <div className="mt-5 space-y-4">
          {(analytics?.topicPerformance || []).map((item) => (
            <div key={item.topic}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-300">{item.topic}</span>
                <span className="text-cyan-300">{item.score}%</span>
              </div>
              <div className="h-2 rounded bg-white/10">
                <div className="h-2 rounded bg-cyan-300" style={{ width: `${item.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="mt-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Post-session report</p><h3 className="mt-1 text-lg font-semibold text-white">Interview readiness</h3></div>
          <p className="text-3xl font-bold text-cyan-300">{analytics?.interviewReport?.readinessScore ?? '--'}%</p>
        </div>
        <p className="mt-3 text-sm text-slate-400">Next session: {analytics?.interviewReport?.nextSession || 'Timed mixed interview'}</p>
      </Panel>
    </AppLayout>
  );
}

export default AnalyticsPage;
