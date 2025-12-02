/**
 * ENVIRONMENT VARIABLE VALIDATION
 *
 * Centralized validation for all environment variables.
 * Fails fast at startup if required variables are missing or invalid.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const apiKey = env.ANTHROPIC_API_KEY;
 */

import { z } from 'zod';

/**
 * Environment schema with proper validation
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (required)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // NextAuth (required in production)
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters')
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || !!val,
      'NEXTAUTH_SECRET is required in production'
    ),
  NEXTAUTH_URL: z.string().url().optional(),

  // Auth Providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  // Email (optional)
  EMAIL_SERVER_URL: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Stripe (required for payments)
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_')
    .optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),

  // AI (required for AI features)
  ANTHROPIC_API_KEY: z.string().min(20, 'ANTHROPIC_API_KEY appears invalid').optional(),
  REPLICATE_API_TOKEN: z.string().startsWith('r8_').optional(),

  // Realtime (Ably)
  ABLY_API_KEY: z.string().optional(),
  NEXT_PUBLIC_ABLY_API_KEY: z.string().optional(),

  // Video (Daily.co)
  DAILY_API_KEY: z.string().optional(),

  // Live Streaming (Mux)
  MUX_TOKEN_ID: z.string().optional(),
  MUX_TOKEN_SECRET: z.string().optional(),

  // Push Notifications (Web Push)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),

  // Supabase (for storage)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Validate and get environment variables
 * Logs warnings for missing optional vars in development
 */
function getValidatedEnv(): Env {
  // In build time or when process.env is empty, return defaults
  if (typeof process === 'undefined' || !process.env) {
    console.warn('[env] Running without process.env - using defaults');
    return {
      NODE_ENV: 'development',
      DATABASE_URL: '',
    } as Env;
  }

  try {
    const parsed = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
      APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET,
      EMAIL_SERVER_URL: process.env.EMAIL_SERVER_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
      ABLY_API_KEY: process.env.ABLY_API_KEY,
      NEXT_PUBLIC_ABLY_API_KEY: process.env.NEXT_PUBLIC_ABLY_API_KEY,
      DAILY_API_KEY: process.env.DAILY_API_KEY,
      MUX_TOKEN_ID: process.env.MUX_TOKEN_ID,
      MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET,
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });

    // Log warnings for missing recommended vars in development
    if (parsed.NODE_ENV === 'development') {
      const warnings: string[] = [];

      if (!parsed.ANTHROPIC_API_KEY) warnings.push('ANTHROPIC_API_KEY (AI features disabled)');
      if (!parsed.STRIPE_SECRET_KEY) warnings.push('STRIPE_SECRET_KEY (payments disabled)');
      if (!parsed.ABLY_API_KEY) warnings.push('ABLY_API_KEY (realtime disabled)');

      if (warnings.length > 0) {
        console.warn(`[env] Missing optional vars: ${warnings.join(', ')}`);
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      console.error('[env] Invalid environment variables:', missing);

      // In development, continue with warnings
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[env] Continuing in development mode with missing vars');
        return {
          NODE_ENV: 'development',
          DATABASE_URL: process.env.DATABASE_URL || '',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
          ABLY_API_KEY: process.env.ABLY_API_KEY,
          DAILY_API_KEY: process.env.DAILY_API_KEY,
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        } as Env;
      }

      // In production, fail fast
      throw new Error(`Missing or invalid environment variables:\n${missing.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Validated environment variables
 * Use this instead of direct process.env access
 */
export const env = getValidatedEnv();

/**
 * Helper to check if a feature is enabled based on env vars
 */
export const features = {
  ai: !!(env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
  aiMusic: !!env.REPLICATE_API_TOKEN,
  payments: !!env.STRIPE_SECRET_KEY,
  realtime: !!env.ABLY_API_KEY,
  video: !!env.DAILY_API_KEY,
  liveStreaming: !!(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET),
  pushNotifications: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
  storage: !!env.NEXT_PUBLIC_SUPABASE_URL && !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
