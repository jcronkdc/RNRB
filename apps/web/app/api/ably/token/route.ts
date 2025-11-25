import Ably from 'ably';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

const ablyApiKey = process.env.ABLY_API_KEY;
const ablyRest = ablyApiKey ? new Ably.Rest(ablyApiKey) : null;

export async function GET() {
  const startTime = Date.now();
  
  // ✅ SECURITY: Require authentication for real-time features
  const session = await auth();
  if (!session?.user?.id) {
    console.warn('[Ably Token] Unauthorized request - no session');
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  const user = session.user;
  console.log(`[Ably Token] Request for user: ${user.id}`);

  if (!ablyRest) {
    console.error('[Ably Token] ABLY_API_KEY is not configured in environment');
    // Return 503 (Service Unavailable) instead of 500 to indicate optional service
    return NextResponse.json(
      { error: 'ABLY_API_KEY is not configured - real-time features disabled' },
      { status: 503 }
    );
  }

  try {
    console.log('[Ably Token] Creating token request...');
    const tokenRequest = await ablyRest.auth.createTokenRequest({
      clientId: user.id, // Use actual user ID instead of generic client ID
    });
    const duration = Date.now() - startTime;
    console.log(`[Ably Token] ✅ Token created successfully in ${duration}ms`);
    return NextResponse.json(tokenRequest, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const duration = Date.now() - startTime;
    // Enhanced error logging
    console.error('[Ably Token] ❌ Token creation failed:', {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
    });
    return NextResponse.json({ 
      error: 'Failed to create Ably token request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
