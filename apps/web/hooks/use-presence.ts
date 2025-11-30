/**
 * Real-time Presence Hook (SAFE v4)
 *
 * Tracks who's actively working where across the platform
 * Uses Ably presence API for instant updates
 *
 * CRITICAL: Does NOT use ably/react hooks to avoid crashes
 * when AblyProvider doesn't have a client. Instead, manages
 * its own Ably connection with circuit breaker protection.
 *
 * Shows presence in:
 * - Projects (who's viewing)
 * - Songs (who's editing)
 * - Songwriting Studio (who's creating)
 * - Video rooms (who's connected)
 */

import type { RealtimeChannel, PresenceMessage } from 'ably';
import { Realtime } from 'ably';
import { useEffect, useState, useRef, useCallback } from 'react';

import {
  canUseAbly,
  recordAblyFailure,
  recordAblySuccess,
  disableAblyPermanently,
} from '@/lib/ably-circuit-breaker';

type PresenceMember = {
  clientId: string;
  data: {
    userId: string;
    userName: string;
    userEmail: string;
    avatar?: string;
    status: 'active' | 'idle' | 'away';
    location: string;
  };
};

type UsePresenceOptions = {
  channelName: string;
  userData: {
    userId: string;
    userName: string;
    userEmail: string;
    avatar?: string;
    location: string;
  };
};

type PresenceResult = {
  members: PresenceMember[];
  isConnected: boolean;
  error: string | null;
  totalMembers: number;
  activeMembers: number;
  idleMembers: number;
};

/**
 * Safe presence hook that manages its own Ably connection
 * Does NOT use ably/react hooks - prevents crashes when provider is unavailable
 */
export function usePresence({ channelName, userData }: UsePresenceOptions): PresenceResult {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ablyRef = useRef<Realtime | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract individual fields to stabilize dependencies
  const { userId, userName, userEmail, avatar, location } = userData;

  // Update presence data
  const updatePresence = useCallback(
    (status: 'active' | 'idle' | 'away' = 'active') => {
      if (!channelRef.current || !isConnected) return;

      try {
        channelRef.current.presence.update({
          userId,
          userName,
          userEmail,
          avatar,
          status,
          location,
          joinedAt: Date.now(),
        });
      } catch (err) {
        console.warn('[usePresence] Failed to update presence:', err);
      }
    },
    [userId, userName, userEmail, avatar, location, isConnected]
  );

  // Initialize Ably connection
  useEffect(() => {
    if (!userId || !channelName) return;

    mountedRef.current = true;

    // Check circuit breaker
    if (!canUseAbly()) {
      console.log('[usePresence] Circuit breaker open - skipping init');
      return;
    }

    const initPresence = async () => {
      try {
        // Pre-check token availability
        const tokenCheck = await fetch('/api/ably/token', {
          signal: AbortSignal.timeout(5000),
        }).catch(() => ({ ok: false, status: 0 }));

        if (!mountedRef.current) return;

        // 503 = ABLY_API_KEY not configured
        if (tokenCheck.status === 503) {
          disableAblyPermanently('ABLY_API_KEY not configured');
          return;
        }

        if (!tokenCheck.ok) {
          recordAblyFailure('Token pre-check failed');
          return;
        }

        // Create Ably client
        const ablyClient = new Realtime({
          authCallback: async (tokenParams, callback) => {
            if (!canUseAbly()) {
              callback(
                { code: 40000, statusCode: 400, message: 'Circuit breaker open' } as any,
                null
              );
              return;
            }
            try {
              const response = await fetch('/api/ably/token', {
                signal: AbortSignal.timeout(5000),
              });
              if (!response.ok) throw new Error(`Token failed: ${response.status}`);
              const token = await response.json();
              recordAblySuccess();
              callback(null, token);
            } catch (err) {
              recordAblyFailure('Token callback failed');
              callback({ code: 40000, statusCode: 400, message: 'Token failed' } as any, null);
            }
          },
          clientId: userId,
          closeOnUnload: true,
          disconnectedRetryTimeout: 15000,
          suspendedRetryTimeout: 30000,
        });

        if (!mountedRef.current) {
          ablyClient.close();
          return;
        }

        ablyRef.current = ablyClient;

        // Get channel and subscribe to presence
        const channel = ablyClient.channels.get(channelName);
        channelRef.current = channel;

        // Handle presence events
        channel.presence.subscribe('enter', (msg: PresenceMessage) => {
          if (!mountedRef.current) return;
          setMembers((prev) => {
            const exists = prev.some((m) => m.clientId === msg.clientId);
            if (exists) return prev;
            return [...prev, { clientId: msg.clientId, data: msg.data }];
          });
        });

        channel.presence.subscribe('leave', (msg: PresenceMessage) => {
          if (!mountedRef.current) return;
          setMembers((prev) => prev.filter((m) => m.clientId !== msg.clientId));
        });

        channel.presence.subscribe('update', (msg: PresenceMessage) => {
          if (!mountedRef.current) return;
          setMembers((prev) =>
            prev.map((m) =>
              m.clientId === msg.clientId ? { clientId: msg.clientId, data: msg.data } : m
            )
          );
        });

        // Wait for connection
        ablyClient.connection.once('connected', async () => {
          if (!mountedRef.current) return;

          recordAblySuccess();
          setIsConnected(true);
          setError(null);

          // Enter presence
          try {
            await channel.presence.enter({
              userId,
              userName,
              userEmail,
              avatar,
              status: 'active',
              location,
              joinedAt: Date.now(),
            });

            // Get initial presence members
            const presenceSet = await channel.presence.get();
            if (mountedRef.current) {
              setMembers(
                presenceSet.map((msg) => ({
                  clientId: msg.clientId,
                  data: msg.data,
                }))
              );
            }
          } catch (err) {
            console.error('[usePresence] Failed to enter presence:', err);
          }
        });

        ablyClient.connection.on('disconnected', () => {
          if (mountedRef.current) setIsConnected(false);
        });

        ablyClient.connection.on('failed', () => {
          if (mountedRef.current) {
            setIsConnected(false);
            setError('Connection failed');
          }
          recordAblyFailure();
        });
      } catch (err) {
        console.error('[usePresence] Init error:', err);
        recordAblyFailure(err instanceof Error ? err.message : 'Unknown error');
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Connection failed');
        }
      }
    };

    initPresence();

    // Cleanup
    return () => {
      mountedRef.current = false;

      if (channelRef.current) {
        try {
          channelRef.current.presence.leave();
          channelRef.current.presence.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }

      if (ablyRef.current) {
        ablyRef.current.close();
        ablyRef.current = null;
      }
    };
  }, [userId, userName, userEmail, avatar, location, channelName]);

  // Idle detection
  useEffect(() => {
    if (!isConnected) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      updatePresence('active');

      idleTimerRef.current = setTimeout(
        () => {
          updatePresence('idle');
        },
        2 * 60 * 1000
      ); // 2 minutes
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', resetIdleTimer);
      window.addEventListener('keydown', resetIdleTimer);
      window.addEventListener('click', resetIdleTimer);
      resetIdleTimer();
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', resetIdleTimer);
        window.removeEventListener('keydown', resetIdleTimer);
        window.removeEventListener('click', resetIdleTimer);
      }
    };
  }, [isConnected, updatePresence]);

  return {
    members,
    isConnected,
    error,
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.data?.status === 'active').length,
    idleMembers: members.filter((m) => m.data?.status === 'idle').length,
  };
}
