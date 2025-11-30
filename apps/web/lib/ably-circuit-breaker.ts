/**
 * Ably Circuit Breaker
 *
 * Prevents runaway connection loops that cause ERR_INSUFFICIENT_RESOURCES.
 * This module provides a centralized way to check if Ably is available
 * before attempting to create connections.
 *
 * Usage:
 * ```typescript
 * import { canUseAbly, recordAblyFailure, recordAblySuccess, createSafeAblyClient } from '@/lib/ably-circuit-breaker';
 *
 * // Option 1: Check before creating client
 * if (!canUseAbly()) return;
 * const client = new Ably.Realtime({ ... });
 *
 * // Option 2: Use the safe client creator
 * const client = await createSafeAblyClient(userId);
 * if (!client) return; // Ably not available
 * ```
 */

import Ably from 'ably';

// ============================================================================
// CIRCUIT BREAKER STATE (Global, persists across component remounts)
// ============================================================================

const FAILURE_THRESHOLD = 3; // Open circuit after 3 consecutive failures
const RESET_TIMEOUT_MS = 60000; // 60 seconds before trying again
const TOKEN_TIMEOUT_MS = 8000; // 8 second timeout for token requests

let consecutiveFailures = 0;
let circuitOpenedAt: number | null = null;
let permanentlyDisabled = false;

/**
 * Check if Ably can be used (circuit breaker is not open)
 */
export function canUseAbly(): boolean {
  if (permanentlyDisabled) {
    return false;
  }

  if (circuitOpenedAt) {
    const timeSinceOpen = Date.now() - circuitOpenedAt;

    // Allow retry after reset timeout
    if (timeSinceOpen > RESET_TIMEOUT_MS) {
      console.log('[Ably Circuit Breaker] Reset after timeout - allowing retry');
      circuitOpenedAt = null;
      consecutiveFailures = 0;
      return true;
    }

    // Circuit still open
    return false;
  }

  return true;
}

/**
 * Record a failure (token request failed, connection failed, etc.)
 */
export function recordAblyFailure(reason?: string): void {
  consecutiveFailures++;
  console.warn(
    `[Ably Circuit Breaker] Failure recorded (${consecutiveFailures}/${FAILURE_THRESHOLD})${reason ? `: ${reason}` : ''}`
  );

  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    circuitOpenedAt = Date.now();
    console.error('[Ably Circuit Breaker] CIRCUIT OPEN - Ably disabled for 60 seconds');
  }
}

/**
 * Record a success (connection established successfully)
 */
export function recordAblySuccess(): void {
  if (consecutiveFailures > 0 || circuitOpenedAt) {
    console.log('[Ably Circuit Breaker] Success recorded - resetting');
  }
  consecutiveFailures = 0;
  circuitOpenedAt = null;
}

/**
 * Permanently disable Ably (used when ABLY_API_KEY is not configured)
 */
export function disableAblyPermanently(reason?: string): void {
  permanentlyDisabled = true;
  console.info(`[Ably Circuit Breaker] Permanently disabled${reason ? `: ${reason}` : ''}`);
}

/**
 * Check if Ably is permanently disabled
 */
export function isAblyPermanentlyDisabled(): boolean {
  return permanentlyDisabled;
}

/**
 * Get circuit breaker status (for debugging)
 */
export function getCircuitBreakerStatus(): {
  canUse: boolean;
  consecutiveFailures: number;
  isOpen: boolean;
  permanentlyDisabled: boolean;
  timeUntilReset: number | null;
} {
  const isOpen = circuitOpenedAt !== null;
  const timeUntilReset = circuitOpenedAt
    ? Math.max(0, RESET_TIMEOUT_MS - (Date.now() - circuitOpenedAt))
    : null;

  return {
    canUse: canUseAbly(),
    consecutiveFailures,
    isOpen,
    permanentlyDisabled,
    timeUntilReset,
  };
}

// ============================================================================
// SAFE CLIENT CREATION
// ============================================================================

/**
 * Fetch Ably token with circuit breaker protection
 */
export async function fetchAblyTokenSafely(): Promise<Ably.TokenRequest | null> {
  if (!canUseAbly()) {
    console.log('[Ably Circuit Breaker] Cannot fetch token - circuit open');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TOKEN_TIMEOUT_MS);

    const response = await fetch('/api/ably/token', {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });

    clearTimeout(timeoutId);

    // 503 = ABLY_API_KEY not configured - permanently disable
    if (response.status === 503) {
      disableAblyPermanently('ABLY_API_KEY not configured');
      return null;
    }

    // 401 = Not authenticated - don't count as failure, just return null
    if (response.status === 401) {
      console.log('[Ably Circuit Breaker] Not authenticated');
      return null;
    }

    // 429 = Rate limited - don't count as failure, will retry later
    if (response.status === 429) {
      console.warn('[Ably Circuit Breaker] Rate limited (429) - will retry later');
      return null;
    }

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const token = await response.json();
    recordAblySuccess();
    return token;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = message.includes('abort') || message.includes('timeout');
    recordAblyFailure(isTimeout ? 'timeout' : message);
    return null;
  }
}

/**
 * Create an Ably client with circuit breaker protection
 *
 * @param clientId - User ID for the client
 * @returns Ably.Realtime client or null if unavailable
 */
export async function createSafeAblyClient(clientId: string): Promise<Ably.Realtime | null> {
  if (!canUseAbly()) {
    console.log('[Ably Circuit Breaker] Cannot create client - circuit open');
    return null;
  }

  // Pre-check token availability
  const token = await fetchAblyTokenSafely();
  if (!token) {
    return null;
  }

  try {
    const client = new Ably.Realtime({
      authCallback: async (tokenParams, callback) => {
        if (!canUseAbly()) {
          callback(
            { code: 40000, statusCode: 400, message: 'Circuit breaker open' } as Ably.ErrorInfo,
            null
          );
          return;
        }

        const newToken = await fetchAblyTokenSafely();
        if (newToken) {
          callback(null, newToken);
        } else {
          callback(
            { code: 40000, statusCode: 400, message: 'Failed to fetch token' } as Ably.ErrorInfo,
            null
          );
        }
      },
      clientId,
      echoMessages: false,
      closeOnUnload: true,
      // Longer retry timeouts to prevent hammering
      disconnectedRetryTimeout: 15000,
      suspendedRetryTimeout: 30000,
      transports: ['web_socket'],
      autoConnect: false,
    });

    return client;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    recordAblyFailure(`Client creation failed: ${message}`);
    return null;
  }
}

// Expose for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__ablyCircuitBreaker = {
    getStatus: getCircuitBreakerStatus,
    reset: () => {
      consecutiveFailures = 0;
      circuitOpenedAt = null;
      permanentlyDisabled = false;
      console.log('[Ably Circuit Breaker] Manually reset');
    },
  };
}
