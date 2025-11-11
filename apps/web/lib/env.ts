import { z } from 'zod';

/**
 * Comprehensive environment variable validation
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),

  // Email
  EMAIL_SERVER_URL: z.string().url().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  // Storage (S3/R2)
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_PUBLIC_URL: z.string().url().optional(),

  // Development
  DEMO_BYPASS: z.string().optional(),

  // Analytics (optional)
  SENTRY_DSN: z.string().url().optional(),
  ANALYTICS_ID: z.string().optional(),

  // Payments (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  GIVE_LIVELY_API_KEY: z.string().optional()
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Get validated environment variables
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    validatedEnv = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      EMAIL_SERVER_URL: process.env.EMAIL_SERVER_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
      APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET,
      STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
      STORAGE_ACCESS_KEY_ID: process.env.STORAGE_ACCESS_KEY_ID,
      STORAGE_SECRET_ACCESS_KEY: process.env.STORAGE_SECRET_ACCESS_KEY,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      STORAGE_REGION: process.env.STORAGE_REGION,
      STORAGE_PUBLIC_URL: process.env.STORAGE_PUBLIC_URL,
      DEMO_BYPASS: process.env.DEMO_BYPASS,
      SENTRY_DSN: process.env.SENTRY_DSN,
      ANALYTICS_ID: process.env.ANALYTICS_ID,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      GIVE_LIVELY_API_KEY: process.env.GIVE_LIVELY_API_KEY
    });
  }

  return validatedEnv;
}

/**
 * Check if storage is configured
 */
export function isStorageConfigured(): boolean {
  const env = getEnv();
  return !!(
    env.STORAGE_ENDPOINT &&
    env.STORAGE_ACCESS_KEY_ID &&
    env.STORAGE_SECRET_ACCESS_KEY &&
    env.STORAGE_BUCKET
  );
}

