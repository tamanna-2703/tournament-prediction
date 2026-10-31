import { config } from 'dotenv';
import { z } from 'zod';
import { STAGES } from './stages';

config();

const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3000),
  STAGE: z.nativeEnum(STAGES).default(STAGES.Local),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  // JWT_REFRESH_TOKEN_SECRET: z.string().optional(),
  // JWT_PASSWORD_TOKEN_SECRET: z.string().optional(),
  // COOKIE_SECRET: z.string().optional(),
});

export const envConfig = envSchema.parse({
  APP_PORT: process.env.APP_PORT,
  STAGE: process.env.STAGE,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  // JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  // JWT_PASSWORD_TOKEN_SECRET: process.env.JWT_PASSWORD_TOKEN_SECRET,
  // COOKIE_SECRET: process.env.COOKIE_SECRET,
});

export type EnvConfig = z.infer<typeof envSchema>;
