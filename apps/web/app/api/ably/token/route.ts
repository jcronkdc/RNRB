import Ably from 'ably';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

const ablyApiKey = process.env.ABLY_API_KEY;
const ablyRest = ablyApiKey ? new Ably.Rest(ablyApiKey) : null;

export async function GET() {
  // ✅ SECURITY: Require authentication for real-time features
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  const user = session.user;

  if (!ablyRest) {
    // Return 503 (Service Unavailable) instead of 500 to indicate optional service
    return NextResponse.json(
      { error: 'ABLY_API_KEY is not configured - real-time features disabled' },
      { status: 503 }
    );
  }

  try {
    const tokenRequest = await ablyRest.auth.createTokenRequest({
      clientId: user.id, // Use actual user ID instead of generic client ID
    });
    return NextResponse.json(tokenRequest, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    // Only log errors when API key exists but auth fails (real issue)
    console.warn(
      'Ably token request failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json({ error: 'Failed to create Ably token request' }, { status: 500 });
  }
}
