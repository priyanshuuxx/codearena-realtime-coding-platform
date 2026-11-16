import { ArrowRight, CheckCircle2, CircleAlert, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';

function BattleDebrief({ stats = {} }) {
  const wins = Number(stats.wins || 0);
  const losses = Number(stats.losses || 0);
  const total = wins + losses;
  const winRate = total ? Math.round((wins / total) * 100) : 0;
  const isReady = total > 0 && winRate >= 60;
  const lesson = total === 0
    ? 'Start a battle to create your first evidence-based debrief.'
    : isReady
      ? 'Your conversion rate is healthy. Increase difficulty and protect your solve time.'
      : 'Your next improvement is consistency: practise one pattern before increasing difficulty.';

  return (
    <section className="battle-debrief dashboard-reveal">
      <div className="battle-debrief__intro">
        <div className="battle-debrief__eyebrow"><Swords size={15} /> BATTLE DEBRIEF</div>
        <h2>Turn competition into progress.</h2>
        <p>CodeArena records what happened in a battle and turns the result into a next-step lesson—not just a win or loss.</p>
        <Link className="battle-debrief__link" to="/battles">Open battle rooms <ArrowRight size={15} /></Link>
      </div>
      <div className="battle-debrief__signal">
        <div className="battle-debrief__metric"><span>Battle record</span><strong>{wins}W · {losses}L</strong></div>
        <div className="battle-debrief__metric"><span>Conversion rate</span><strong>{total ? `${winRate}%` : 'No data'}</strong></div>
        <div className="battle-debrief__lesson">
          {isReady ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}
          <span><b>Why this is your next step:</b> {lesson}</span>
        </div>
      </div>
    </section>
  );
}

export default BattleDebrief;
