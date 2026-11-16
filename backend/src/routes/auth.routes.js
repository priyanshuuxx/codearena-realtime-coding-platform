import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { demoStore, createId, persistUsers } from '../data/demo-store.js';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { createAuthToken, toPublicUser } from '../utils/auth.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  email: z.string().trim().email('Enter a valid email address.').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

router.post('/signup', async (req, res, next) => {
  try {
    const input = signupSchema.parse(req.body);

    if (env.DEMO_MODE) {
      const existingUser = demoStore.users.find((user) => user.email === input.email);

      if (existingUser) {
        throw new HttpError(409, 'An account already exists with this email.');
      }

      const user = {
        id: createId('user'),
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12),
        role: 'USER',
        rating: 1000,
        wins: 0,
        losses: 0,
        mcqScore: 0,
        debuggingScore: 0,
        createdAt: new Date().toISOString(),
      };

      demoStore.users.push(user);
      persistUsers();

      res.status(201).json({
        user: toPublicUser(user),
        token: createAuthToken(user),
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new HttpError(409, 'An account already exists with this email.');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    res.status(201).json({
      user: toPublicUser(user),
      token: createAuthToken(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);

    if (env.DEMO_MODE) {
      const user = demoStore.users.find((item) => item.email === input.email);

      if (!user) {
        throw new HttpError(401, 'Invalid email or password.');
      }

      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new HttpError(401, 'Invalid email or password.');
      }

      res.status(200).json({
        user: toPublicUser(user),
        token: createAuthToken(user),
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    res.status(200).json({
      user: toPublicUser(user),
      token: createAuthToken(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    user: toPublicUser(req.user),
  });
});

export default router;
