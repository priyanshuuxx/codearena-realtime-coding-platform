import { Router } from 'express';
import { demoStore } from '../data/demo-store.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/leaderboard', (_req, res) => {
  res.status(200).json({
    leaderboard: demoStore.users
      .map((user, index) => ({
        rank: index + 1,
        name: user.name,
        rating: user.rating,
        wins: user.wins,
        solved: 12 - index,
      }))
      .sort((a, b) => b.rating - a.rating),
  });
});

router.get('/interview', authenticate, (_req, res) => {
  res.status(200).json({
    round: {
      title: 'SDE Mixed Interview Round',
      durationMinutes: 45,
      sections: [
        { type: 'coding', count: 1, title: 'Binary Search' },
        { type: 'debugging', count: 1, title: 'Fix Average Calculator' },
        { type: 'mcq', count: 3, title: 'Core CS MCQs' },
      ],
    },
  });
});

router.post('/interview/session', authenticate, (req, res) => {
  const level = req.body.level || 'MEDIUM';
  const coding =
    demoStore.problems.find((problem) => problem.difficulty === level) ||
    demoStore.problems.find((problem) => problem.difficulty === 'MEDIUM') ||
    demoStore.problems[0];
  const debugging =
    demoStore.debugChallenges.find((challenge) => challenge.difficulty === level) ||
    demoStore.debugChallenges.find((challenge) => challenge.difficulty === 'MEDIUM') ||
    demoStore.debugChallenges[0];
  const mcqs = demoStore.mcqQuestions
    .filter((question) => question.difficulty === level)
    .slice(0, 5)
    .map(({ answer: _answer, explanation: _explanation, ...question }) => question);

  res.status(201).json({
    session: {
      id: `interview_${Date.now()}`,
      level,
      status: 'ACTIVE',
      durationSeconds: 2700,
      startedAt: new Date().toISOString(),
      sections: {
        coding,
        debugging,
        mcqs,
      },
      interviewerNotes: [
        'Explain your brute force idea before optimizing.',
        'State time and space complexity clearly.',
        'Test edge cases before final submission.',
      ],
    },
  });
});

router.get('/analytics', authenticate, (req, res) => {
  const userSubmissions = demoStore.submissions.filter((item) => item.userId === req.user.id);
  const accepted = userSubmissions.filter((item) => item.verdict === 'ACCEPTED').length;
  const attempted = userSubmissions.length;
  const mcqAttempts = demoStore.mcqAttempts.filter((item) => item.userId === req.user.id);
  const debugAttempts = demoStore.debugAttempts.filter((item) => item.userId === req.user.id);
  const topicNames = ['Arrays', 'Strings', 'Hash Map', 'Binary Search', 'Trees', 'Dynamic Programming'];
  const topicPerformance = topicNames.map((topic, index) => {
    const score = Math.max(38, Math.min(96, 72 + ((accepted * 7 + index * 9) % 22) - (attempted > accepted ? 8 : 0)));
    return { topic, score };
  });
  const weakest = [...topicPerformance].sort((a, b) => a.score - b.score).slice(0, 3);
  const mcqAccuracy = mcqAttempts.length
    ? Math.round((mcqAttempts.filter((attempt) => attempt.isCorrect).length / mcqAttempts.length) * 100)
    : 72;
  const debuggingSuccessRate = debugAttempts.length
    ? Math.round((debugAttempts.filter((attempt) => attempt.passed).length / debugAttempts.length) * 100)
    : 58;
  const battleResults = demoStore.battles.filter((battle) => battle.userId === req.user.id && battle.status === 'COMPLETED');
  const wins = battleResults.filter((battle) => battle.result === 'WIN').length;
  const battleWinRate = battleResults.length ? Math.round((wins / battleResults.length) * 100) : 73;
  const accuracy = attempted ? Math.round((accepted / attempted) * 100) : 68;
  const skillProfile = [
    { label: 'Problem solving', score: Math.max(accuracy, 60), evidence: `${accepted} accepted submissions` },
    { label: 'Debugging discipline', score: debuggingSuccessRate, evidence: `${debugAttempts.length || 0} debugging attempts tracked` },
    { label: 'Interview readiness', score: Math.round((accuracy + mcqAccuracy + debuggingSuccessRate) / 3), evidence: 'Combined coding, MCQ, and debugging signal' },
  ];
  res.status(200).json({
    analytics: {
      userId: req.user.id,
      solvedByDifficulty: { EASY: 2, MEDIUM: 1, HARD: 0 },
      topicPerformance,
      mcqAccuracy,
      debuggingSuccessRate,
      battleWinRate,
      streak: 5,
      skillProfile,
      weaknessMap: weakest.map((item) => ({ ...item, reason: `Recent performance is below your stronger topics.`, nextAction: `Complete one ${item.topic} medium problem.` })),
      recommendation: {
        title: `Strengthen ${weakest[0]?.topic || 'core patterns'}`,
        reason: `${weakest[0]?.topic || 'This topic'} is currently your lowest measured area, so one focused practice session should improve your interview readiness fastest.`,
        route: '/problems',
      },
      interviewReport: {
        readinessScore: Math.round((accuracy + mcqAccuracy + debuggingSuccessRate + battleWinRate) / 4),
        strengths: topicPerformance.filter((item) => item.score >= 78).map((item) => item.topic),
        focusAreas: weakest.map((item) => item.topic),
        nextSession: 'Timed mixed interview with one coding, one debugging, and three MCQs',
      },
    },
  });
});

router.get('/admin/summary', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Admin access required.' });
    return;
  }

  res.status(200).json({
    summary: {
      users: demoStore.users.length,
      problems: demoStore.problems.length,
      debugChallenges: demoStore.debugChallenges.length,
      mcqQuestions: demoStore.mcqQuestions.length,
      activeBattles: demoStore.battles.filter((battle) => battle.status === 'ACTIVE').length,
      submissions: demoStore.submissions.length,
    },
  });
});

export default router;
