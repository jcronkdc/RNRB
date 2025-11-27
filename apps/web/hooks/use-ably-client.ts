/**
 * Shared Ably Client Hook
 *
 * SOLVES: Multiple simultaneous Ably connections causing token timeouts
 *
 * Problem:
 * - Each component (PresenceIndicator, useCollaborativeCursors, ChatRoom)
 *   was creating its own Ably connection
 * - This caused 3+ simultaneous token requests
 * - Token endpoint timeout after 10 seconds
 * - Browser console filled with Ably errors
 *
 * Solution:
 * - Single shared Ably instance across all components
 * - Token request happens once, reused by all
 * - Graceful degradation if ABLY_API_KEY not configured
 * - Proper cleanup and connection management
 */

import { Realtime } from 'ably';
import { useEffect, useState, useRef } from 'react';

type AblyStatus = 'disconnected' | 'connecting' | 'connected' | 'unavailable' | 'error';

let sharedAblyClient: Realtime | null = null;
let ablyInitPromise: Promise<Realtime | null> | null = null;
let connectionRefCount = 0;

/**
 * Get or create the shared Ably client instance
 */
async function getSharedAblyClient(userId: string): Promise<Realtime | null> {
  // If already initialized, return it
  if (sharedAblyClient) {
    connectionRefCount++;
    return sharedAblyClient;
  }

  // If initialization in progress, wait for it
  if (ablyInitPromise) {
    return ablyInitPromise;
  }

  // Start new initialization
  ablyInitPromise = (async () => {
    try {
      console.log('[Ably] Initializing shared client...');

      // Check if Ably is available
      const response = await fetch('/api/ably/token', {
        method: 'GET',
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });

      // Service unavailable (503) means ABLY_API_KEY not configured
      if (response.status === 503) {
        console.info('[Ably] Service unavailable - real-time features disabled');
        ablyInitPromise = null;
        return null;
      }

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      // Create Ably client with optimal configuration
      const client = new Realtime({
        authUrl: '/api/ably/token',
        clientId: userId,
        // Prevent the closeOnUnload warning
        closeOnUnload: false,
        // Auto-reconnect with exponential backoff
        disconnectedRetryTimeout: 5000,
        suspendedRetryTimeout: 10000,
        // Efficient transport
        transports: ['web_socket'],
        // Connection timeouts
        realtimeRequestTimeout: 10000,
        // Log errors only
        logLevel: 2, // errors only
      });

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        client.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });

        client.connection.once('failed', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      sharedAblyClient = client;
      connectionRefCount = 1;
      console.log('[Ably] ✅ Shared client connected');

      return client;
    } catch (error) {
      console.error('[Ably] Failed to initialize:', error);
      ablyInitPromise = null;
      return null;
    }
  })();

  return ablyInitPromise;
}

/**
 * Release the shared Ably client when no longer needed
 */
function releaseSharedAblyClient() {
  connectionRefCount--;

  // Close connection when last user disconnects
  if (connectionRefCount <= 0 && sharedAblyClient) {
    console.log('[Ably] Closing shared client (no active users)');
    sharedAblyClient.close();
    sharedAblyClient = null;
    ablyInitPromise = null;
    connectionRefCount = 0;
  }
}

/**
 * Hook to use shared Ably client
 */
export function useAblyClient(userId: string | undefined) {
  const [client, setClient] = useState<Realtime | null>(null);
  const [status, setStatus] = useState<AblyStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      setStatus('disconnected');
      return;
    }

    mountedRef.current = true;
    setStatus('connecting');

    // Get or create shared client
    getSharedAblyClient(userId)
      .then((ablyClient) => {
        if (!mountedRef.current) return;

        if (!ablyClient) {
          setStatus('unavailable');
          setError('Real-time features not available');
          return;
        }

        setClient(ablyClient);
        setStatus('connected');
        setError(null);

        // Listen for connection state changes
        const handleStateChange = (stateChange: { current: string }) => {
          if (!mountedRef.current) return;

          console.log('[Ably] Connection state:', stateChange.current);

          switch (stateChange.current) {
            case 'connected':
              setStatus('connected');
              setError(null);
              break;
            case 'connecting':
            case 'disconnected':
              setStatus('connecting');
              break;
            case 'suspended':
            case 'failed':
              setStatus('error');
              setError('Connection failed');
              break;
            case 'closed':
              setStatus('disconnected');
              break;
          }
        };

        ablyClient.connection.on(handleStateChange);

        return () => {
          ablyClient.connection.off(handleStateChange);
        };
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        console.error('[Ably] Connection error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Connection failed');
      });

    // Cleanup
    return () => {
      mountedRef.current = false;
      releaseSharedAblyClient();
      setClient(null);
      setStatus('disconnected');
    };
  }, [userId]);

  return {
    client,
    status,
    error,
    isConnected: status === 'connected',
    isAvailable: status !== 'unavailable',
  };
}

/**
 * Force close the shared Ably client (for testing or manual cleanup)
 */
export function closeSharedAblyClient() {
  if (sharedAblyClient) {
    sharedAblyClient.close();
    sharedAblyClient = null;
    ablyInitPromise = null;
    connectionRefCount = 0;
  }
}






