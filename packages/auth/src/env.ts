import { z } from 'zod';

const envSchema = z.object({
  // NEXTAUTH_SECRET is required at runtime for JWT signing.
  // It's optional during build to prevent build failures, but we
  // validate it at runtime below.
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  EMAIL_SERVER_URL: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
});

function getEnv() {
  try {
    const parsed = envSchema.parse({
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      EMAIL_SERVER_URL: process.env.EMAIL_SERVER_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
      APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET,
    });

    // Runtime check: NEXTAUTH_SECRET must exist when actually serving requests.
    // During `next build`, process.env.NEXTAUTH_SECRET may be absent — that's okay.
    // But at runtime, missing secret = unsigned JWTs = security vulnerability.
    if (!parsed.NEXTAUTH_SECRET && typeof window === 'undefined') {
      const isBuild = process.env.npm_lifecycle_event === 'build' ||
                      process.env.NEXT_PHASE === 'phase-production-build';
      if (!isBuild) {
        console.error(
          '[AUTH] CRITICAL: NEXTAUTH_SECRET is not set. JWTs will not be signed securely.'
        );
      }
    }

    return parsed;
  } catch {
    // During build time, return safe defaults so the build doesn't fail.
    return {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      NEXTAUTH_URL: undefined,
      EMAIL_SERVER_URL: '',
      EMAIL_FROM: '',
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      APPLE_CLIENT_ID: undefined,
      APPLE_CLIENT_SECRET: undefined,
    };
  }
}

export const env = getEnv();
