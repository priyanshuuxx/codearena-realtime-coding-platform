import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import Panel from '../components/Panel.jsx';
import { api } from '../lib/api.js';

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get('/platform/leaderboard').then(({ data }) => setLeaderboard(data.leaderboard));
  }, []);

  return (
    <AppLayout eyebrow="Ratings" title="Global Leaderboard">
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="text-sm text-slate-400">
              <tr>
                <th className="pb-3">Rank</th>
                <th className="pb-3">Coder</th>
                <th className="pb-3">Rating</th>
                <th className="pb-3">Wins</th>
                <th className="pb-3">Solved</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.name} className="border-t border-white/10">
                  <td className="py-4 font-bold text-cyan-300">#{row.rank}</td>
                  <td className="py-4 font-semibold">{row.name}</td>
                  <td className="py-4">{row.rating}</td>
                  <td className="py-4">{row.wins}</td>
                  <td className="py-4">{row.solved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppLayout>
  );
}

export default LeaderboardPage;
