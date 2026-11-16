import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5050),
  CLIENT_URL: z.string().url().default('http://127.0.0.1:5173'),
  DATABASE_URL: z.string().min(1).optional(),
  DEMO_MODE: z.coerce.boolean().default(true),
  JWT_SECRET: z.string().min(16).default('codearena_dev_secret_change_before_production'),
  JUDGE0_API_URL: z.string().url().default('https://judge0-ce.p.rapidapi.com'),
  JUDGE0_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
