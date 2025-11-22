import Ably from 'ably';
import { NextResponse } from 'next/server';

const ablyApiKey = process.env.ABLY_API_KEY;
const ablyRest = ablyApiKey ? new Ably.Rest(ablyApiKey) : null;

export async function GET() {
  if (!ablyRest) {
    // Return 503 (Service Unavailable) instead of 500 to indicate optional service
    return NextResponse.json(
      { error: 'ABLY_API_KEY is not configured - real-time features disabled' },
      { status: 503 },
    );
  }

  try {
    const tokenRequest = await ablyRest.auth.createTokenRequest({
      clientId: process.env.NEXT_PUBLIC_ABLY_CLIENT_ID ?? 'rnrb-web',
    });
    return NextResponse.json(tokenRequest, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    // Only log errors when API key exists but auth fails (real issue)
    console.warn('Ably token request failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create Ably token request' },
      { status: 500 },
    );
  }
}

