'use client';

import * as Ably from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react';

// Use centralized circuit breaker instead of duplicate implementation
import {
  canUseAbly,
  recordAblyFailure,
  recordAblySuccess,
  disableAblyPermanently,
  isAblyPermanentlyDisabled,
} from '@/lib/ably-circuit-breaker';

interface Props {
  children: ReactNode;
  lazy?: boolean;
}

interface ConnectionMetrics {
  latency: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  reconnectAttempts: number;
  lastConnected: number | null;
}

const MAX_INIT_RETRIES = 3; // Max initialization retries
const INIT_TIMEOUT_MS = 10000; // 10 second timeout per attempt

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================
export function AblyProvider({ children, lazy = true }: Props) {
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const [shouldInit, setShouldInit] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    quality: 'offline',
    reconnectAttempts: 0,
    lastConnected: null,
  });

  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const mountedRef = useRef(true);
  const initAttemptRef = useRef(0);
  const clientRef = useRef<Ably.Realtime | null>(null);

  // Controlled token request with circuit breaker
  const fetchToken = useCallback(async (userId: string): Promise<Ably.TokenRequest | null> => {
    // Check circuit breaker first
    if (!canUseAbly()) {
      console.log('[Ably] Circuit breaker open - skipping token request');
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch('/api/ably/token', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      // Service unavailable (503) means ABLY_API_KEY not configured - permanently disable
      if (response.status === 503) {
        console.info('[Ably] Service unavailable (503) - real-time features disabled');
        disableAblyPermanently('ABLY_API_KEY not configured');
        return null;
      }

      // Auth required (401) - don't count as failure, just skip
      if (response.status === 401) {
        console.log('[Ably] Not authenticated - skipping');
        return null;
      }

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const tokenRequest = await response.json();
      recordAblySuccess();
      return tokenRequest;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.warn('[Ably] Token request timed out');
      } else {
        console.error('[Ably] Token request failed:', error);
      }
      recordAblyFailure((error as Error).message || 'Token request failed');
      return null;
    }
  }, []);

  // Initialize Ably with controlled token callback
  const initializeAbly = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !session?.user?.id) return;

    // Check circuit breaker
    if (!canUseAbly()) {
      console.log('[Ably] Circuit breaker open - not initializing');
      if (mountedRef.current) {
        setHasError(true);
        setMetrics((prev) => ({ ...prev, quality: 'offline' }));
      }
      return;
    }

    // Check if we've exceeded max init attempts
    if (initAttemptRef.current >= MAX_INIT_RETRIES) {
      console.warn(`[Ably] Max init retries (${MAX_INIT_RETRIES}) exceeded`);
      disableAblyPermanently('Max init retries exceeded');
      if (mountedRef.current) {
        setHasError(true);
      }
      return;
    }

    initAttemptRef.current++;
    const userId = session.user.id;

    try {
      // Pre-check token availability
      const initialToken = await fetchToken(userId);
      if (!initialToken) {
        if (mountedRef.current) {
          setHasError(true);
          setMetrics((prev) => ({ ...prev, quality: 'offline' }));
        }
        return;
      }

      // Create Ably client with authCallback (gives us control over retries)
      const ablyClient = new Ably.Realtime({
        authCallback: async (tokenParams, callback) => {
          // Circuit breaker check on every token refresh
          if (!canUseAbly()) {
            callback(new Error('Circuit breaker open'), null);
            return;
          }

          const token = await fetchToken(userId);
          if (token) {
            callback(null, token);
          } else {
            callback(new Error('Failed to fetch token'), null);
          }
        },
        clientId: userId,
        echoMessages: false,
        closeOnUnload: true, // Clean up on page unload
        // CRITICAL: Disable aggressive auto-reconnect that causes resource exhaustion
        disconnectedRetryTimeout: 15000, // Wait 15s before retry
        suspendedRetryTimeout: 30000, // Wait 30s if suspended
        // Only use WebSocket (faster, less overhead)
        transports: ['web_socket'],
        // Don't auto-connect - we'll handle it
        autoConnect: false,
      });

      // Store reference for cleanup
      clientRef.current = ablyClient;

      // Set up connection handlers BEFORE connecting
      const connectionTimeout = setTimeout(() => {
        if (ablyClient.connection.state !== 'connected') {
          console.warn('[Ably] Connection timeout');
          ablyClient.close();
          recordAblyFailure();
          if (mountedRef.current) {
            setHasError(true);
            setMetrics((prev) => ({ ...prev, quality: 'offline' }));
          }
        }
      }, INIT_TIMEOUT_MS);

      ablyClient.connection.once('connected', () => {
        clearTimeout(connectionTimeout);
        if (!mountedRef.current) {
          ablyClient.close();
          return;
        }

        console.log('[Ably] ✅ Connected successfully');
        initAttemptRef.current = 0; // Reset on success
        recordAblySuccess();

        const now = Date.now();
        setClient(ablyClient);
        setHasError(false);
        setMetrics((prev) => ({
          ...prev,
          quality: 'good',
          lastConnected: now,
        }));
      });

      ablyClient.connection.on('failed', () => {
        clearTimeout(connectionTimeout);
        console.error('[Ably] Connection failed');
        recordAblyFailure();
        ablyClient.close();

        if (mountedRef.current) {
          setHasError(true);
          setMetrics((prev) => ({ ...prev, quality: 'offline' }));
        }
      });

      ablyClient.connection.on('disconnected', () => {
        console.warn('[Ably] Disconnected');
        if (mountedRef.current) {
          setMetrics((prev) => ({ ...prev, quality: 'poor' }));
        }
      });

      ablyClient.connection.on('suspended', () => {
        console.warn('[Ably] Connection suspended');
        if (mountedRef.current) {
          setMetrics((prev) => ({ ...prev, quality: 'poor' }));
        }
      });

      // Now connect
      ablyClient.connect();
    } catch (error) {
      console.error('[Ably] Initialization error:', error);
      recordAblyFailure();
      if (mountedRef.current) {
        setHasError(true);
        setMetrics((prev) => ({ ...prev, quality: 'offline' }));
      }
    }
  }, [isAuthenticated, session?.user?.id, fetchToken]);

  // Initialize Ably when ready
  useEffect(() => {
    if (typeof window === 'undefined' || !shouldInit || !isAuthenticated || !session?.user?.id) {
      return;
    }

    // Check if already disabled
    if (isAblyPermanentlyDisabled()) {
      setHasError(true);
      return;
    }

    mountedRef.current = true;

    initializeAbly();

    return () => {
      mountedRef.current = false;
      if (clientRef.current) {
        clientRef.current.close();
        clientRef.current = null;
        setClient(null);
      }
    };
  }, [shouldInit, isAuthenticated, session?.user?.id, initializeAbly]);

  // Lazy initialization with interaction detection
  useEffect(() => {
    if (!lazy || shouldInit || !isAuthenticated) return;

    // Initialize on first user interaction
    const handleInteraction = () => {
      setShouldInit(true);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) =>
      window.addEventListener(event, handleInteraction, { once: true, passive: true })
    );

    // Fallback: initialize after 3 seconds if no interaction
    const timer = setTimeout(() => setShouldInit(true), 3000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleInteraction));
      clearTimeout(timer);
    };
  }, [lazy, shouldInit, isAuthenticated]);

  // Expose metrics for debugging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).__ablyMetrics = {
        ...metrics,
        canUseAbly: canUseAbly(),
        isAblyPermanentlyDisabled: isAblyPermanentlyDisabled(),
      };
    }
  }, [metrics]);

  // Always render children - don't block app for real-time features
  if (!client || hasError) {
    return <>{children}</>;
  }

  return <ReactAblyProvider client={client}>{children}</ReactAblyProvider>;
}
