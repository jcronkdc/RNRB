import { z } from 'zod';

/**
 * Server-only environment variables
 * These should NEVER be exposed to the client
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Auth - Server only!
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),

  // Email - Server only!
  EMAIL_SERVER_URL: z.string().url().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // OAuth - Server only!
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  // Storage - Server only!
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),

  // Payments - Server only!
  STRIPE_SECRET_KEY: z.string().optional(),
  GIVE_LIVELY_API_KEY: z.string().optional(),

  // AI Services - Server only!
  OPENAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  
  // Rate limiting - Server only!
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional()
});

/**
 * Client-safe environment variables
 * Only variables prefixed with NEXT_PUBLIC_ are accessible on the client
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // OAuth client IDs (safe to expose)
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_APPLE_CLIENT_ID: z.string().optional(),
  
  // Public storage URL
  NEXT_PUBLIC_STORAGE_URL: z.string().url().optional(),
  
  // Analytics (safe to expose)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  
  // Payments public key (safe to expose)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // AI Voice ID (safe to expose)
  NEXT_PUBLIC_ELEVENLABS_VOICE_ID: z.string().optional()
});

// Combine schemas for full validation
const envSchema = serverEnvSchema.merge(clientEnvSchema);

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Runtime check to ensure we're not leaking server vars to client
 */
function checkServerOnlyAccess() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Attempted to access server-only environment variables on the client. ' +
      'This is a security vulnerability. Use getClientEnv() for client-safe variables.'
    );
  }
}

/**
 * Get validated environment variables (server-only)
 */
export function getEnv(): Env {
  checkServerOnlyAccess();
  
  if (!validatedEnv) {
    validatedEnv = envSchema.parse({
      // Server-only vars
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      EMAIL_SERVER_URL: process.env.EMAIL_SERVER_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET,
      STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
      STORAGE_ACCESS_KEY_ID: process.env.STORAGE_ACCESS_KEY_ID,
      STORAGE_SECRET_ACCESS_KEY: process.env.STORAGE_SECRET_ACCESS_KEY,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      STORAGE_REGION: process.env.STORAGE_REGION,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      GIVE_LIVELY_API_KEY: process.env.GIVE_LIVELY_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      
      // Client-safe vars (NEXT_PUBLIC_ prefix)
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_APPLE_CLIENT_ID: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || process.env.APPLE_CLIENT_ID,
      NEXT_PUBLIC_STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL || process.env.STORAGE_PUBLIC_URL,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
      NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || process.env.ANALYTICS_ID,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_ELEVENLABS_VOICE_ID: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID
    });
  }

  return validatedEnv;
}

/**
 * Get client-safe environment variables only
 */
export function getClientEnv() {
  return {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_APPLE_CLIENT_ID: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
    NEXT_PUBLIC_STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ELEVENLABS_VOICE_ID: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID
  };
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

