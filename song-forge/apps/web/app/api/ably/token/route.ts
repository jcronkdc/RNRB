import Ably from 'ably/promises';
import { NextResponse } from 'next/server';

const ablyApiKey = process.env.ABLY_API_KEY;
const ablyRest = ablyApiKey ? new Ably.Rest(ablyApiKey) : null;

export async function GET() {
  if (!ablyRest) {
    return NextResponse.json(
      { error: 'ABLY_API_KEY is not configured' },
      { status: 500 },
    );
  }

  try {
    const tokenRequest = await ablyRest.auth.createTokenRequest({
      clientId: process.env.NEXT_PUBLIC_ABLY_CLIENT_ID ?? 'rnrb-web',
    });
    return NextResponse.json(tokenRequest, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('RN\'RB: Failed to create Ably token request', error);
    return NextResponse.json(
      { error: 'Failed to create Ably token request' },
      { status: 500 },
    );
  }
}

