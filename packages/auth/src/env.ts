import { z } from 'zod';

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url().optional(),
  EMAIL_SERVER_URL: z.string().min(1, 'EMAIL_SERVER_URL is required'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional()
});

function getEnv() {
  try {
    return envSchema.parse({
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      EMAIL_SERVER_URL: process.env.EMAIL_SERVER_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
      APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET
    });
  } catch {
    // During build time, return a safe default
    return {
      NEXTAUTH_SECRET: '',
      NEXTAUTH_URL: undefined,
      EMAIL_SERVER_URL: '',
      EMAIL_FROM: '',
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      APPLE_CLIENT_ID: undefined,
      APPLE_CLIENT_SECRET: undefined
    };
  }
}

export const env = getEnv();
