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
 * Uses shared Ably client to prevent connection leaks
 */

import type { RealtimeChannel } from 'ably';
import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

import { useAblyClient } from './use-ably-client';

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

  // Use shared Ably client instead of creating separate connection
  const { client: ablyClient, isConnected: ablyConnected } = useAblyClient(userData.userId);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const awayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

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

  // Initialize presence using shared client
  useEffect(() => {
    // Wait for shared client to be connected
    if (!ablyClient || !ablyConnected) return;

    mountedRef.current = true;

    const initPresence = async () => {
      try {
        // Get presence channel from shared client
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

        if (!mountedRef.current) return;
        setIsConnected(true);

        // Subscribe to presence updates
        channel.presence.subscribe(() => {
          if (!mountedRef.current) return;

          // Get all current members
          channel.presence
            .get()
            .then((presenceMembers) => {
              if (!mountedRef.current) return;

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
            if (!mountedRef.current) return;

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
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      }
    };

    initPresence();

    return () => {
      mountedRef.current = false;

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
      }

      // Leave presence - wrap in try/catch for cleanup safety
      if (channelRef.current) {
        try {
          channelRef.current.presence.leave();
          channelRef.current.presence.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }
      // Don't close shared client - it's managed by useAblyClient
    };
  }, [channelName, userData.userId, ablyClient, ablyConnected]);

  // Activity detection - idle after 2 minutes, away after 5 minutes
  // Debounced to prevent flooding Ably with presence updates
  useEffect(() => {
    if (!isConnected || !channelRef.current) return;

    // Debounce presence updates to max 1 update per 2 seconds
    const debouncedPresenceUpdate = debounce(
      (status: PresenceStatus) => {
        if (!mountedRef.current || !channelRef.current) return;
        channelRef.current.presence.update({
          ...userData,
          status,
          lastActive: new Date().toISOString(),
        });
      },
      2000,
      { leading: true, trailing: false }
    );

    const resetActivityTimers = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
      }

      // Update to active (debounced)
      if (myStatus !== 'active' && myStatus !== 'dnd') {
        setMyStatus('active');
        debouncedPresenceUpdate('active');
      }

      // Set idle after 2 minutes
      idleTimerRef.current = setTimeout(
        () => {
          if (!mountedRef.current) return;
          setMyStatus('idle');
          debouncedPresenceUpdate('idle');

          // Set away after 5 minutes total
          awayTimerRef.current = setTimeout(
            () => {
              if (!mountedRef.current) return;
              setMyStatus('away');
              debouncedPresenceUpdate('away');
            },
            3 * 60 * 1000
          ); // 3 more minutes (5 total)
        },
        2 * 60 * 1000
      ); // 2 minutes
    };

    // Debounce the activity listener itself
    const debouncedActivityListener = debounce(resetActivityTimers, 500, {
      leading: true,
      trailing: false,
    });

    // Listen for user activity
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', debouncedActivityListener);
      window.addEventListener('keydown', debouncedActivityListener);
      window.addEventListener('click', debouncedActivityListener);
      window.addEventListener('scroll', debouncedActivityListener);
      resetActivityTimers(); // Initial call
    }

    return () => {
      debouncedPresenceUpdate.cancel();
      debouncedActivityListener.cancel();
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', debouncedActivityListener);
        window.removeEventListener('keydown', debouncedActivityListener);
        window.removeEventListener('click', debouncedActivityListener);
        window.removeEventListener('scroll', debouncedActivityListener);
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
