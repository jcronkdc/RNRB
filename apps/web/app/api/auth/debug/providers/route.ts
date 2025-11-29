import { env } from '@cronkwaters/auth';
import { NextResponse } from 'next/server';

export function GET() {
  // SECURITY: Block in production - this endpoint exposes config info
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }

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
      // SECURITY: Don't expose URL even in dev
      urlPresent: Boolean(env.NEXTAUTH_URL),
      secretPresent: Boolean(env.NEXTAUTH_SECRET),
    },
  });
}
