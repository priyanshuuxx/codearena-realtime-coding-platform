import { Router } from 'express';
import { demoStore } from '../data/demo-store.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ problems: demoStore.problems });
});

router.get('/:slug', (req, res) => {
  const problem = demoStore.problems.find((item) => item.slug === req.params.slug);

  if (!problem) {
    res.status(404).json({ message: 'Problem not found.' });
    return;
  }

  res.status(200).json({ problem });
});

export default router;
