import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  LLM_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(512),
  LLM_MAX_HISTORY_MESSAGES: z.coerce.number().int().nonnegative().default(12),
  LLM_MAX_PROMPT_CHARS: z.coerce.number().int().positive().default(12000),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(60),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid backend environment configuration', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
