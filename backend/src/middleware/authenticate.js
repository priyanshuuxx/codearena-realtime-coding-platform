import { prisma } from '../lib/prisma.js';
import { demoStore } from '../data/demo-store.js';
import { env } from '../config/env.js';
import { verifyAuthToken } from '../utils/auth.js';
import { HttpError } from '../utils/http-error.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authentication token is required.');
    }

    const token = header.replace('Bearer ', '');
    const payload = verifyAuthToken(token);

    if (env.DEMO_MODE) {
      const user = demoStore.users.find((item) => item.id === payload.sub);

      if (!user) {
        throw new HttpError(401, 'User account no longer exists.');
      }

      req.user = user;
      next();
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new HttpError(401, 'User account no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, 'Invalid or expired token.'));
  }
}

export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      next(new HttpError(403, 'You do not have permission to access this resource.'));
      return;
    }

    next();
  };
}
