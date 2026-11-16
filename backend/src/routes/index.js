import { Router } from 'express';
import authRoutes from './auth.routes.js';
import battleRoutes from './battles.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import debuggingRoutes from './debugging.routes.js';
import mcqRoutes from './mcq.routes.js';
import platformRoutes from './platform.routes.js';
import problemRoutes from './problems.routes.js';
import submissionRoutes from './submissions.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'CodeArena API',
    version: '0.1.0',
    modules: [
      'auth',
      'dashboard',
      'problems',
      'submissions',
      'debugging',
      'mcq',
      'battles',
      'leaderboard',
      'admin',
      'analytics',
    ],
  });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/debugging', debuggingRoutes);
router.use('/mcq', mcqRoutes);
router.use('/battles', battleRoutes);
router.use('/platform', platformRoutes);

export default router;
