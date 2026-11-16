import { useEffect, useState } from 'react';
import AIPracticeInsight from '../components/dashboard/AIPracticeInsight.jsx';
import AdaptiveMission from '../components/dashboard/AdaptiveMission.jsx';
import BattleDebrief from '../components/dashboard/BattleDebrief.jsx';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';
import HeroSection from '../components/dashboard/HeroSection.jsx';
import LiveSystemStatus from '../components/dashboard/LiveSystemStatus.jsx';
import NextMove from '../components/dashboard/NextMove.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import StatsRow from '../components/dashboard/StatsRow.jsx';
import WeeklyProgress from '../components/dashboard/WeeklyProgress.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

const fallbackDashboard = {
  stats: {
    totalSolvedProblems: 12,
    currentRating: 1000,
    wins: 8,
    losses: 4,
    mcqScore: 0,
    debuggingScore: 0,
  },
  recentSubmissions: [],
  recommendedPractice: [
    {
      title: 'Binary Search',
      description: 'Based on your recent practice, this is a good next challenge.',
      type: 'Medium',
    },
  ],
};

function DashboardPage() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data } = await api.get('/dashboard/me');
        setDashboard(data);
        setStatus('ready');
      } catch {
        setStatus('offline');
      }
    }

    loadDashboard();
  }, []);

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="mx-auto max-w-7xl space-y-6">
        <HeroSection />
        <StatsRow stats={dashboard.stats} />

        <AdaptiveMission stats={dashboard.stats} user={user} />
        <BattleDebrief stats={dashboard.stats} />

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-6 lg:grid-cols-2">
            <NextMove recommendation={dashboard.recommendedPractice?.[0]} />
            <AIPracticeInsight />
            <RecentActivity submissions={dashboard.recentSubmissions} />
            <WeeklyProgress />
          </div>
          <LiveSystemStatus status={status} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
