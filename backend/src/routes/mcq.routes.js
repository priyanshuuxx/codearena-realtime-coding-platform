import { Router } from 'express';
import { demoStore } from '../data/demo-store.js';
import { authenticate } from '../middleware/authenticate.js';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', (_req, res) => {
  const questions = demoStore.mcqQuestions.map((item) => {
    const question = { ...item };
    delete question.answer;
    return question;
  });

  res.status(200).json({ questions });
});

router.post('/:id/attempt', authenticate, async (req, res, next) => {
  try {
  const question = demoStore.mcqQuestions.find((item) => item.id === req.params.id);

  if (!question) {
    res.status(404).json({ message: 'MCQ question not found.' });
    return;
  }

  const isCorrect = Number(req.body.answer) === question.answer;
  const attempt = {
    id: `mcq_attempt_${Date.now()}`,
    userId: req.user.id,
    questionId: question.id,
    isCorrect,
    score: isCorrect ? 10 : 0,
    createdAt: new Date().toISOString(),
  };

  if (env.DEMO_MODE) {
    demoStore.mcqAttempts.unshift(attempt);
  } else {
    await prisma.mCQAttempt.create({
      data: {
        selectedAnswer: Number(req.body.answer),
        isCorrect,
        score: attempt.score,
        userId: req.user.id,
        questionId: question.id,
      },
    });
  }

  res.status(200).json({
    isCorrect,
    score: isCorrect ? 10 : 0,
    correctAnswer: question.answer,
    explanation: question.explanation,
  });
  } catch (error) {
    next(error);
  }
});

export default router;
