/**
 * Real-time Presence Hook
 *
 * Tracks who's actively working where across the platform
 * Uses Ably presence API for instant updates
 *
 * Shows presence in:
 * - Projects (who's viewing)
 * - Songs (who's editing)
 * - Songwriting Studio (who's creating)
 * - Video rooms (who's connected)
 */

import { Realtime } from 'ably';
import type { RealtimeChannel, PresenceMessage, ErrorInfo } from 'ably';
import { useEffect, useState } from 'react';

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
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ably, setAbly] = useState<Realtime | null>(null);

  useEffect(() => {
    let mounted = true;
    let channel: RealtimeChannel | null = null;

    const initAbly = async () => {
      try {
        // Get token from API
        const response = await fetch('/api/ably/token');
        if (!response.ok) throw new Error('Failed to get Ably token');

        const tokenData = await response.json();

        // Create Ably client
        const ablyClient = new Realtime({
          authUrl: '/api/ably/token',
          clientId: userData.userId,
        });

        if (!mounted) {
          ablyClient.close();
          return;
        }

        setAbly(ablyClient);

        // Get channel and enter presence
        channel = ablyClient.channels.get(channelName);

        // Enter presence with user data
        await channel.presence.enter({
          userId: userData.userId,
          userName: userData.userName,
          userEmail: userData.userEmail,
          avatar: userData.avatar,
          status: 'active',
          location: userData.location,
          joinedAt: Date.now(),
        });

        setIsConnected(true);

        // Listen for presence updates
        channel.presence.subscribe((update: PresenceMessage) => {
          if (!mounted) return;

          // Get current members
          channel?.presence.get().then((members: PresenceMessage[]) => {
            if (!mounted) return;

            const presenceMembers = (members || []).map((member) => ({
              clientId: member.clientId,
              data: member.data,
            }));

            setMembers(presenceMembers);
          }).catch((err: ErrorInfo) => {
            console.error('Error getting presence members:', err);
          });
        });

        // Get initial members
        channel.presence.get().then((members: PresenceMessage[]) => {
          if (!mounted) return;

          const presenceMembers = (members || []).map((member) => ({
            clientId: member.clientId,
            data: member.data,
          }));

          setMembers(presenceMembers);
        }).catch((err: ErrorInfo) => {
          console.error('Error getting initial presence:', err);
        });
      } catch (err) {
        console.error('Ably presence error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      }
    };

    initAbly();

    // Update status to idle after 2 minutes of inactivity
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);

      // Update to active
      channel?.presence.update({
        ...userData,
        status: 'active',
        lastActive: Date.now(),
      });

      idleTimer = setTimeout(
        () => {
          channel?.presence.update({
            ...userData,
            status: 'idle',
            lastActive: Date.now(),
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

    // Cleanup
    return () => {
      mounted = false;
      clearTimeout(idleTimer);

      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', resetIdleTimer);
        window.removeEventListener('keydown', resetIdleTimer);
        window.removeEventListener('click', resetIdleTimer);
      }

      // Leave presence
      channel?.presence.leave();

      // Close connection
      ably?.close();
    };
  }, [channelName, userData.userId]);

  // Update presence data when location changes
  useEffect(() => {
    if (!ably || !isConnected) return;

    const channel = ably.channels.get(channelName);
    channel.presence.update({
      ...userData,
      status: 'active',
      lastActive: Date.now(),
    });
  }, [userData.location]);

  return {
    members,
    isConnected,
    error,
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.data.status === 'active').length,
    idleMembers: members.filter((m) => m.data.status === 'idle').length,
  };
}
