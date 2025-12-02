import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { ablyTokenLimiter, checkRateLimit } from '@/lib/rate-limit';

// Promise-based singleton to prevent race conditions during concurrent initialization
let ablyRestPromise: Promise<import('ably').Rest | null> | null = null;

// Validate and initialize Ably Rest client (lazy loading with race condition protection)
async function getAblyRest(): Promise<import('ably').Rest | null> {
  // Return existing promise if initialization is in progress or complete
  // This ensures concurrent requests share the same initialization
  if (ablyRestPromise !== null) {
    return ablyRestPromise;
  }

  // Create and store the initialization promise BEFORE any async work
  // This prevents race conditions where multiple requests start initialization
  ablyRestPromise = initializeAblyRest();
  return ablyRestPromise;
}

// Separated initialization logic to keep promise assignment synchronous
async function initializeAblyRest(): Promise<import('ably').Rest | null> {
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
    // Dynamic import to avoid build-time initialization
    const Ably = (await import('ably')).default;
    const client = new Ably.Rest({
      key: ablyApiKey,
      // Use JSON for better error messages
      useBinaryProtocol: false,
    });
    console.log(`[Ably Init] ✅ Initialized with app ID: ${appKeyParts[0]}`);
    return client;
  } catch (error) {
    console.error('[Ably Init] Failed to create Rest client:', error);
    // Reset promise on failure so retry is possible
    ablyRestPromise = null;
    return null;
  }
}

export async function GET() {
  const startTime = Date.now();

  // ✅ SECURITY: Require authentication for real-time features
  const session = await auth();
  if (!session?.user?.id) {
    console.warn('[Ably Token] Unauthorized request - no session');
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const user = session.user;

  // Rate limit: 60 token requests per minute (allow for multiple components initializing)
  try {
    await checkRateLimit(ablyTokenLimiter, `${user.id}`);
  } catch {
    return NextResponse.json({ error: 'Too many token requests' }, { status: 429 });
  }

  console.log(`[Ably Token] Request for user: ${user.id}`);

  const ablyRestClient = await getAblyRest();
  if (!ablyRestClient) {
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
    const tokenParams: import('ably').TokenParams = {
      clientId: user.id,
      // Token valid for 1 hour
      ttl: 60 * 60 * 1000,
    };

    const tokenRequest = await ablyRestClient.auth.createTokenRequest(tokenParams);

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
      const ablyError = error as { code?: number; statusCode?: number };
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
