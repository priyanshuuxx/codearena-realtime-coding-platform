import { Router } from 'express';
import { demoStore } from '../data/demo-store.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ challenges: demoStore.debugChallenges });
});

router.post('/:id/submit', authenticate, (req, res) => {
  const challenge = demoStore.debugChallenges.find((item) => item.id === req.params.id);
  const code = String(req.body.code || '');
  const passed = code.includes('nums.length') || code.includes('?.') || code.toLowerCase().includes('guest');

  if (!challenge) {
    res.status(404).json({ message: 'Debugging challenge not found.' });
    return;
  }

  demoStore.debugAttempts.unshift({
    id: `debug_attempt_${Date.now()}`,
    userId: req.user.id,
    challengeId: challenge.id,
    passed,
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({
    verdict: passed ? 'ACCEPTED' : 'WRONG_ANSWER',
    score: passed ? 20 : 0,
    feedback: passed
      ? 'Nice fix. The demo tests pass.'
      : 'The fix is close, but the demo tests still fail for one edge case.',
  });
});

export default router;
