import { NextResponse } from 'next/server';
import { env } from '@cronkwaters/auth';

export function GET() {
  return NextResponse.json({
    google: {
      clientIdPresent: Boolean(env.GOOGLE_CLIENT_ID),
      clientSecretPresent: Boolean(env.GOOGLE_CLIENT_SECRET),
    },
    email: {
      serverPresent: Boolean(env.EMAIL_SERVER_URL),
      fromPresent: Boolean(env.EMAIL_FROM),
    },
    apple: {
      clientIdPresent: Boolean(env.APPLE_CLIENT_ID),
      clientSecretPresent: Boolean(env.APPLE_CLIENT_SECRET),
    },
    nextAuth: {
      url: env.NEXTAUTH_URL ?? null,
      secretPresent: Boolean(env.NEXTAUTH_SECRET),
    },
  });
}



