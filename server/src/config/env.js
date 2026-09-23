import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BASE_URL: z.string().default('http://localhost:3001'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,https://game.weblunar.com.br'),
  DATABASE_URL: z.string().optional().default(''),
  MP_ACCESS_TOKEN: z.string().default(''),
  MP_WEBHOOK_SECRET: z.string().optional().default(''),
  RESEND_API_KEY: z.string().optional().default(''),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('Dossiê Confidencial <quizweblunar@gmail.com>')
});

export const env = envSchema.parse(process.env);
