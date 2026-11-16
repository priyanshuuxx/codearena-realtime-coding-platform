import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    rating: user.rating,
    wins: user.wins,
    losses: user.losses,
    mcqScore: user.mcqScore,
    debuggingScore: user.debuggingScore,
    createdAt: user.createdAt,
  };
}
