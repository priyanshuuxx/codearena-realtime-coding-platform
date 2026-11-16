import { Router } from 'express';
import { demoStore } from '../data/demo-store.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '../lib/prisma.js';
import { toPublicUser } from '../utils/auth.js';

const router = Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (env.DEMO_MODE) {
      const userSubmissions = demoStore.submissions.filter((submission) => submission.userId === req.user.id);
      const acceptedProblemIds = new Set(
        userSubmissions.filter((submission) => submission.verdict === 'ACCEPTED').map((submission) => submission.problemId),
      );

      res.status(200).json({
        user: toPublicUser(req.user),
        stats: {
          totalSolvedProblems: acceptedProblemIds.size,
          currentRating: req.user.rating,
          wins: req.user.wins,
          losses: req.user.losses,
          mcqScore: req.user.mcqScore,
          debuggingScore: req.user.debuggingScore,
        },
        recentSubmissions: userSubmissions.slice(0, 5),
        recommendedPractice: [
          {
            title: 'Two Sum',
            description: 'Start with hash map fundamentals before timed battles.',
            type: 'coding',
          },
          {
            title: 'Fix Average Calculator',
            description: 'Practice identifying off-by-one logic errors.',
            type: 'debugging',
          },
          {
            title: 'SQL Indexing',
            description: 'Prepare for DBMS interview questions.',
            type: 'mcq',
          },
        ],
      });
      return;
    }

    const [acceptedProblemIds, recentSubmissions, mcqStats] = await Promise.all([
      prisma.submission.findMany({
        where: {
          userId: req.user.id,
          verdict: 'ACCEPTED',
        },
        distinct: ['problemId'],
        select: { problemId: true },
      }),
      prisma.submission.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          language: true,
          verdict: true,
          runtimeMs: true,
          memoryKb: true,
          createdAt: true,
          problem: {
            select: {
              title: true,
              difficulty: true,
            },
          },
        },
      }),
      prisma.mCQAttempt.aggregate({
        where: { userId: req.user.id },
        _sum: { score: true },
        _count: { id: true },
      }),
    ]);

    res.status(200).json({
      user: toPublicUser(req.user),
      stats: {
        totalSolvedProblems: acceptedProblemIds.length,
        currentRating: req.user.rating,
        wins: req.user.wins,
        losses: req.user.losses,
        mcqScore: mcqStats._sum.score || req.user.mcqScore,
        debuggingScore: req.user.debuggingScore,
      },
      recentSubmissions,
      recommendedPractice: [
        {
          title: 'Start with Easy Arrays',
          description: 'Build speed and accuracy before entering battles.',
          type: 'coding',
        },
        {
          title: 'Debug Runtime Errors',
          description: 'Practice common edge cases seen in interviews.',
          type: 'debugging',
        },
        {
          title: 'DBMS Fundamentals',
          description: 'Improve technical round readiness with SQL and indexing MCQs.',
          type: 'mcq',
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
