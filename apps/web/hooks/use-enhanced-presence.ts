/**
 * Enhanced Presence Hook
 *
 * World-class presence tracking showing:
 * - Who's viewing/editing
 * - What they're selecting
 * - Where they're scrolled to
 * - What activity they're doing
 * - Their status (active, idle, away, DND)
 *
 * Goes beyond simple "online" indicators to show rich context
 */

import Ably from 'ably';
import type { RealtimeChannel } from 'ably';
import { useEffect, useState, useCallback, useRef } from 'react';

export type PresenceStatus = 'active' | 'idle' | 'away' | 'dnd' | 'offline';

export type PresenceMember = {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  status: PresenceStatus;
  activity?: string; // "Editing verse 2", "Listening to demo"
  location: string; // "project:my-album", "song:track-1"

  // Rich context
  viewport?: {
    scroll: number; // Scroll position
    zoom: number; // Zoom level
    section: string; // "chorus", "verse-2", etc.
  };

  // Selection/cursor
  cursorPosition?: number;
  selection?: {
    start: number;
    end: number;
    text?: string;
  };

  // Device info
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;

  // Timestamps
  lastActive: Date;
  joinedAt: Date;
};

interface UseEnhancedPresenceOptions {
  channelName: string;
  channelType: 'project' | 'song' | 'room';
  userData: {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
  };
}

export function useEnhancedPresence({
  channelName,
  channelType,
  userData,
}: UseEnhancedPresenceOptions) {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myStatus, setMyStatus] = useState<PresenceStatus>('active');

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const awayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Detect device type
  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    if (typeof window === 'undefined') return 'desktop';

    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return 'mobile';
    }
    return 'desktop';
  };

  // Detect browser
  const getBrowser = (): string => {
    if (typeof window === 'undefined') return 'unknown';

    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  };

  // Initialize presence
  useEffect(() => {
    let mounted = true;

    const initPresence = async () => {
      try {
        // Get Ably token
        const response = await fetch('/api/ably/token');

        // If Ably is not configured, fail silently
        if (response.status === 503) {
          console.info('Ably not configured - enhanced presence disabled');
          return;
        }

        if (!response.ok) throw new Error('Failed to get Ably token');

        // Create Ably client
        const ablyClient = new Ably.Realtime({
          authUrl: '/api/ably/token',
          clientId: userData.userId,
        });

        if (!mounted) {
          ablyClient.close();
          return;
        }

        ablyRef.current = ablyClient;

        // Get presence channel
        const channel = ablyClient.channels.get(channelName);
        channelRef.current = channel;

        // Enter presence with rich data
        await channel.presence.enter({
          userId: userData.userId,
          userName: userData.userName,
          userEmail: userData.userEmail,
          userAvatar: userData.userAvatar,
          status: 'active',
          location: channelName,
          deviceType: getDeviceType(),
          browser: getBrowser(),
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        });

        setIsConnected(true);

        // Subscribe to presence updates
        channel.presence.subscribe((update) => {
          if (!mounted) return;

          // Get all current members
          channel.presence
            .get()
            .then((presenceMembers) => {
              if (!mounted) return;

              const formattedMembers: PresenceMember[] = (presenceMembers || [])
                .filter((m) => m.clientId !== userData.userId) // Exclude self
                .map((member) => ({
                  userId: member.data.userId || member.clientId,
                  userName: member.data.userName,
                  userEmail: member.data.userEmail,
                  userAvatar: member.data.userAvatar,
                  status: member.data.status || 'active',
                  activity: member.data.activity,
                  location: member.data.location,
                  viewport: member.data.viewport,
                  cursorPosition: member.data.cursorPosition,
                  selection: member.data.selection,
                  deviceType: member.data.deviceType,
                  browser: member.data.browser,
                  lastActive: new Date(member.data.lastActive || Date.now()),
                  joinedAt: new Date(member.data.joinedAt || Date.now()),
                }));

              setMembers(formattedMembers);
            })
            .catch((err) => {
              console.error('Error getting presence members:', err);
            });
        });

        // Get initial members
        channel.presence
          .get()
          .then((presenceMembers) => {
            if (!mounted) return;

            const formattedMembers: PresenceMember[] = (presenceMembers || [])
              .filter((m) => m.clientId !== userData.userId)
              .map((member) => ({
                userId: member.data.userId || member.clientId,
                userName: member.data.userName,
                userEmail: member.data.userEmail,
                userAvatar: member.data.userAvatar,
                status: member.data.status || 'active',
                activity: member.data.activity,
                location: member.data.location,
                viewport: member.data.viewport,
                cursorPosition: member.data.cursorPosition,
                selection: member.data.selection,
                deviceType: member.data.deviceType,
                browser: member.data.browser,
                lastActive: new Date(member.data.lastActive || Date.now()),
                joinedAt: new Date(member.data.joinedAt || Date.now()),
              }));

            setMembers(formattedMembers);
          })
          .catch((err) => {
            console.error('Error getting initial presence:', err);
          });
      } catch (err) {
        console.error('Enhanced presence error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      }
    };

    initPresence();

    return () => {
      mounted = false;

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
      }

      // Leave presence
      channelRef.current?.presence.leave();

      // Close connection
      ablyRef.current?.close();
    };
  }, [channelName, userData.userId]);

  // Activity detection - idle after 2 minutes, away after 5 minutes
  useEffect(() => {
    if (!isConnected || !channelRef.current) return;

    const resetActivityTimers = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
      }

      // Update to active
      if (myStatus !== 'active' && myStatus !== 'dnd') {
        setMyStatus('active');
        channelRef.current?.presence.update({
          ...userData,
          status: 'active',
          lastActive: new Date().toISOString(),
        });
      }

      // Set idle after 2 minutes
      idleTimerRef.current = setTimeout(
        () => {
          setMyStatus('idle');
          channelRef.current?.presence.update({
            ...userData,
            status: 'idle',
            lastActive: new Date().toISOString(),
          });

          // Set away after 5 minutes total
          awayTimerRef.current = setTimeout(
            () => {
              setMyStatus('away');
              channelRef.current?.presence.update({
                ...userData,
                status: 'away',
                lastActive: new Date().toISOString(),
              });
            },
            3 * 60 * 1000
          ); // 3 more minutes (5 total)
        },
        2 * 60 * 1000
      ); // 2 minutes
    };

    // Listen for user activity
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', resetActivityTimers);
      window.addEventListener('keydown', resetActivityTimers);
      window.addEventListener('click', resetActivityTimers);
      window.addEventListener('scroll', resetActivityTimers);
      resetActivityTimers(); // Initial call
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', resetActivityTimers);
        window.removeEventListener('keydown', resetActivityTimers);
        window.removeEventListener('click', resetActivityTimers);
        window.removeEventListener('scroll', resetActivityTimers);
      }
    };
  }, [isConnected, myStatus, userData]);

  // Update presence data
  const updatePresence = useCallback(
    (
      updates: Partial<{
        activity: string;
        viewport: { scroll: number; zoom: number; section: string };
        cursorPosition: number;
        selection: { start: number; end: number; text?: string };
      }>
    ) => {
      if (!channelRef.current || !isConnected) return;

      channelRef.current.presence.update({
        ...userData,
        status: myStatus,
        lastActive: new Date().toISOString(),
        ...updates,
      });
    },
    [isConnected, myStatus, userData]
  );

  // Set status manually
  const setStatus = useCallback(
    (newStatus: PresenceStatus) => {
      if (!channelRef.current || !isConnected) return;

      setMyStatus(newStatus);
      channelRef.current.presence.update({
        ...userData,
        status: newStatus,
        lastActive: new Date().toISOString(),
      });
    },
    [isConnected, userData]
  );

  // Set activity description
  const setActivity = useCallback(
    (activity: string) => {
      updatePresence({ activity });
    },
    [updatePresence]
  );

  // Update viewport
  const updateViewport = useCallback(
    (scroll: number, zoom: number, section: string) => {
      updatePresence({ viewport: { scroll, zoom, section } });
    },
    [updatePresence]
  );

  // Update cursor position
  const updateCursor = useCallback(
    (position: number) => {
      updatePresence({ cursorPosition: position });
    },
    [updatePresence]
  );

  // Update selection
  const updateSelection = useCallback(
    (start: number, end: number, text?: string) => {
      updatePresence({ selection: { start, end, text } });
    },
    [updatePresence]
  );

  return {
    members,
    isConnected,
    error,
    myStatus,
    setStatus,
    setActivity,
    updateViewport,
    updateCursor,
    updateSelection,
    updatePresence,

    // Computed stats
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === 'active').length,
    idleMembers: members.filter((m) => m.status === 'idle').length,
    awayMembers: members.filter((m) => m.status === 'away').length,
  };
}
