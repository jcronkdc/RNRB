/**
 * Real-time Presence Hook (OPTIMIZED v2)
 *
 * Tracks who's actively working where across the platform
 * Uses Ably presence API for instant updates
 *
 * NOW USES: Official Ably React hooks (uses shared client from provider)
 *
 * Shows presence in:
 * - Projects (who's viewing)
 * - Songs (who's editing)
 * - Songwriting Studio (who's creating)
 * - Video rooms (who's connected)
 */

import type { PresenceMessage } from 'ably';
import { usePresence as useAblyPresence, useConnectionStateListener } from 'ably/react';
import { useEffect, useState, useRef } from 'react';

type PresenceMember = {
  clientId: string;
  data: {
    userId: string;
    userName: string;
    userEmail: string;
    avatar?: string;
    status: 'active' | 'idle' | 'away';
    location: string; // e.g., 'project:my-album', 'song:track-1'
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

export function usePresence({ channelName, userData }: UsePresenceOptions) {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract individual fields to stabilize dependencies
  const { userId, userName, userEmail, avatar, location } = userData;

  // Use official Ably React hooks (uses shared client from provider)
  // The usePresence hook returns { presenceData: PresenceMessage[], updateStatus: (data) => void }
  // Cast to any to handle type mismatches with the ably/react types
  const presenceHookResult = useAblyPresence(channelName, {
    userId,
    userName,
    userEmail,
    avatar,
    status: 'active',
    location,
    joinedAt: Date.now(),
  }) as any;

  // Extract presenceData and updateStatus with proper types
  const presenceData: PresenceMessage[] = presenceHookResult?.presenceData ?? [];
  const updateStatus = presenceHookResult?.updateStatus;

  // Monitor connection state
  const [isConnected, setIsConnected] = useState(false);
  useConnectionStateListener((stateChange) => {
    setIsConnected(stateChange.current === 'connected');

    if (stateChange.current === 'failed') {
      setError('Connection failed');
    } else if (stateChange.current === 'connected') {
      setError(null);
    }
  });

  // Transform Ably presence data to our format
  useEffect(() => {
    const transformed = presenceData.map((msg: PresenceMessage) => ({
      clientId: msg.clientId,
      data: msg.data,
    }));
    setMembers(transformed);
  }, [presenceData]);

  // Update status to idle after 2 minutes of inactivity
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      // Update to active
      updateStatus?.({
        userId,
        userName,
        userEmail,
        avatar,
        location,
        status: 'active',
        joinedAt: Date.now(),
      });

      idleTimerRef.current = setTimeout(
        () => {
          updateStatus?.({
            userId,
            userName,
            userEmail,
            avatar,
            location,
            status: 'idle',
            joinedAt: Date.now(),
          });
        },
        2 * 60 * 1000
      ); // 2 minutes
    };

    // Listen for user activity
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
  }, [userId, userName, userEmail, avatar, location, updateStatus]);

  // Update presence data when location changes
  useEffect(() => {
    if (!isConnected) return;

    updateStatus?.({
      userId,
      userName,
      userEmail,
      avatar,
      location,
      status: 'active',
      joinedAt: Date.now(),
    });
  }, [userId, userName, userEmail, avatar, location, isConnected, updateStatus]);

  return {
    members,
    isConnected,
    error,
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.data.status === 'active').length,
    idleMembers: members.filter((m) => m.data.status === 'idle').length,
  };
}
