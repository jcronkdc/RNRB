/**
 * Real-time Presence Hook (SAFE v5 - Uses Shared Client)
 *
 * Tracks who's actively working where across the platform
 * Uses Ably presence API for instant updates
 *
 * IMPORTANT: Uses the shared Ably client from useAblyClient
 * to prevent multiple connections and token rate limiting.
 *
 * Shows presence in:
 * - Projects (who's viewing)
 * - Songs (who's editing)
 * - Songwriting Studio (who's creating)
 * - Video rooms (who's connected)
 */

import type { RealtimeChannel, PresenceMessage } from 'ably';
import { useEffect, useState, useRef, useCallback } from 'react';

import { useAblyClient } from './use-ably-client';

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
 * Presence hook that uses the SHARED Ably client
 * Prevents multiple connections and token rate limiting
 */
export function usePresence({ channelName, userData }: UsePresenceOptions): PresenceResult {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the SHARED Ably client - this is the key change!
  const {
    client: ablyClient,
    isConnected: ablyConnected,
    error: ablyError,
  } = useAblyClient(userData.userId);

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

  // Sync error state from shared client
  useEffect(() => {
    if (ablyError) {
      setError(ablyError);
    } else {
      setError(null);
    }
  }, [ablyError]);

  // Initialize presence channel when shared client is ready
  useEffect(() => {
    if (!ablyClient || !ablyConnected || !channelName) {
      return;
    }

    mountedRef.current = true;

    const initPresence = async () => {
      try {
        // Get channel from shared client (no new connection!)
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
            setIsConnected(true);
          }
        } catch (err) {
          console.error('[usePresence] Failed to enter presence:', err);
          if (mountedRef.current) {
            setError('Failed to join presence');
          }
        }
      } catch (err) {
        console.error('[usePresence] Init error:', err);
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

      setIsConnected(false);
    };
  }, [ablyClient, ablyConnected, channelName, userId, userName, userEmail, avatar, location]);

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
