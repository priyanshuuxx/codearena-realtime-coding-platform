import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5050),
  CLIENT_URL: z.string().url().default('http://127.0.0.1:5173'),
  CLIENT_URLS: z.string().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  DEMO_MODE: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  JWT_SECRET: z.string().min(16).optional(),
  JUDGE0_API_URL: z.string().url().default('https://judge0-ce.p.rapidapi.com'),
  JUDGE0_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV === 'production' && !parsedEnv.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set to a strong value in production.');
}

if (parsedEnv.NODE_ENV === 'production' && !parsedEnv.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in production.');
}

export const env = {
  ...parsedEnv,
  JWT_SECRET: parsedEnv.JWT_SECRET || 'codearena_dev_secret_change_before_production',
};
