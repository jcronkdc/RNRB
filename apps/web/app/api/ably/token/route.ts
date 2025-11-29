import Ably from 'ably';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit';

// Validate and initialize Ably Rest client
function initializeAblyRest(): Ably.Rest | null {
  const ablyApiKey = process.env.ABLY_API_KEY;

  if (!ablyApiKey) {
    console.error('[Ably Init] ABLY_API_KEY not found in environment');
    return null;
  }

  // Validate API key format: appId.keyId:keySecret
  const keyParts = ablyApiKey.split(':');
  if (keyParts.length !== 2) {
    console.error('[Ably Init] Invalid API key format - expected "appId.keyId:keySecret"');
    return null;
  }

  const [appAndKeyId, secret] = keyParts;
  const appKeyParts = appAndKeyId.split('.');

  if (appKeyParts.length !== 2 || !secret) {
    console.error('[Ably Init] Invalid API key structure');
    return null;
  }

  try {
    const rest = new Ably.Rest({
      key: ablyApiKey,
      // Use JSON for better error messages
      useBinaryProtocol: false,
    });
    console.log(`[Ably Init] ✅ Initialized with app ID: ${appKeyParts[0]}`);
    return rest;
  } catch (error) {
    console.error('[Ably Init] Failed to create Rest client:', error);
    return null;
  }
}

const ablyRest = initializeAblyRest();

export async function GET() {
  const startTime = Date.now();

  // ✅ SECURITY: Require authentication for real-time features
  const session = await auth();
  if (!session?.user?.id) {
    console.warn('[Ably Token] Unauthorized request - no session');
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const user = session.user;

  // Rate limit: 30 token requests per minute (prevent token abuse)
  try {
    await checkRateLimit(strictLimiter, `ably-token:${user.id}`);
  } catch {
    return NextResponse.json({ error: 'Too many token requests' }, { status: 429 });
  }

  console.log(`[Ably Token] Request for user: ${user.id}`);

  if (!ablyRest) {
    console.error('[Ably Token] Ably Rest client not initialized - check ABLY_API_KEY');
    // Return 503 (Service Unavailable) to indicate optional service
    return NextResponse.json(
      { error: 'Ably service unavailable - real-time features disabled' },
      { status: 503 }
    );
  }

  try {
    console.log('[Ably Token] Creating token request...');

    // Create token request with explicit parameters
    const tokenParams: Ably.TokenParams = {
      clientId: user.id,
      // Token valid for 1 hour
      ttl: 60 * 60 * 1000,
    };

    const tokenRequest = await ablyRest.auth.createTokenRequest(tokenParams);

    const duration = Date.now() - startTime;
    console.log(`[Ably Token] ✅ Token created successfully in ${duration}ms`, {
      clientId: tokenRequest.clientId,
      keyName: tokenRequest.keyName,
      nonce: tokenRequest.nonce?.substring(0, 8) + '...',
    });

    return NextResponse.json(tokenRequest, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Enhanced error logging with more details
    const errorDetails = {
      duration: `${duration}ms`,
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownError',
      userId: user.id,
    };

    console.error('[Ably Token] ❌ Token creation failed:', errorDetails);

    // Check if it's an Ably-specific error
    if (error instanceof Error && 'code' in error) {
      const ablyError = error as Ably.ErrorInfo;
      console.error(
        '[Ably Token] Ably error code:',
        ablyError.code,
        'statusCode:',
        ablyError.statusCode
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create Ably token request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
