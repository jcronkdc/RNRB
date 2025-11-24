/**
 * Collaborative Cursors Hook
 *
 * Real-time cursor tracking across collaborative spaces
 * Shows where each user is pointing/interacting
 *
 * Features:
 * - Position broadcasting (throttled to 60fps)
 * - User identification (name + color)
 * - Idle cursor hiding (after 5s of no movement)
 * - Smooth cursor animations
 * - Cursor click/interaction indicators
 *
 * Used in:
 * - Collaborative Whiteboard
 * - Songwriting Studio
 * - Setlist Builder
 * - Any shared workspace
 */

import Ably from 'ably';
import type { RealtimeChannel } from 'ably';
import { useEffect, useState, useCallback, useRef } from 'react';

export type CursorPosition = {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
  isClick?: boolean; // Flash animation on click
  isIdle?: boolean; // Hide after 5s of no movement
};

type UseCursorOptions = {
  channelName: string;
  userId: string;
  userName: string;
  userColor?: string;
  enabled?: boolean; // Toggle cursor tracking on/off
};

export function useCollaborativeCursors({
  channelName,
  userId,
  userName,
  userColor,
  enabled = true,
}: UseCursorOptions) {
  const [remoteCursors, setRemoteCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate consistent color for user if not provided
  const color = userColor || generateUserColor(userId);

  // Broadcast cursor position (throttled to ~60fps)
  const broadcastPosition = useCallback(
    (x: number, y: number, isClick = false) => {
      if (!channelRef.current || !enabled) return;

      const position: CursorPosition = {
        x,
        y,
        userId,
        userName,
        userColor: color,
        timestamp: Date.now(),
        isClick,
        isIdle: false,
      };

      // Publish cursor position
      channelRef.current.publish('cursor-move', position);

      // Reset idle timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      // Set idle after 5 seconds of no movement
      idleTimerRef.current = setTimeout(() => {
        if (!channelRef.current) return;

        channelRef.current.publish('cursor-move', {
          ...position,
          isIdle: true,
          timestamp: Date.now(),
        });
      }, 5000);

      lastPositionRef.current = { x, y };
    },
    [channelName, userId, userName, color, enabled]
  );

  // Throttle cursor broadcasts to 60fps (16ms)
  const throttledBroadcast = useThrottle(broadcastPosition, 16);

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;

      // Get position relative to viewport
      const x = e.clientX;
      const y = e.clientY;

      throttledBroadcast(x, y, false);
    },
    [throttledBroadcast, enabled]
  );

  // Handle mouse click (visual feedback)
  const handleMouseClick = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;

      const x = e.clientX;
      const y = e.clientY;

      // Send immediate click event (not throttled)
      broadcastPosition(x, y, true);
    },
    [broadcastPosition, enabled]
  );

  // Initialize Ably connection
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const initAbly = async () => {
      try {
        // Get token from API
        const response = await fetch('/api/ably/token');

        // If Ably is not configured (503), fail silently - cursors will be disabled
        if (response.status === 503) {
          console.info('Ably not configured - collaborative cursors disabled');
          return;
        }

        if (!response.ok) throw new Error('Failed to get Ably token');

        // Create Ably client
        const ablyClient = new Ably.Realtime({
          authUrl: '/api/ably/token',
          clientId: userId,
        });

        if (!mounted) {
          ablyClient.close();
          return;
        }

        ablyRef.current = ablyClient;

        // Get channel for cursor tracking
        const channel = ablyClient.channels.get(channelName);
        channelRef.current = channel;

        // Subscribe to cursor movements
        channel.subscribe('cursor-move', (message: Ably.Message) => {
          if (!mounted) return;

          const cursor = message.data as CursorPosition;

          // Don't show our own cursor
          if (cursor.userId === userId) return;

          setRemoteCursors((prev) => {
            const newMap = new Map(prev);

            if (cursor.isIdle) {
              // Remove idle cursors after a delay
              setTimeout(() => {
                setRemoteCursors((current) => {
                  const updated = new Map(current);
                  updated.delete(cursor.userId);
                  return updated;
                });
              }, 1000);
            } else {
              newMap.set(cursor.userId, cursor);
            }

            return newMap;
          });
        });

        setIsConnected(true);
      } catch (err) {
        console.error('Cursor tracking error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      }
    };

    initAbly();

    // Cleanup
    return () => {
      mounted = false;

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      channelRef.current?.unsubscribe();
      ablyRef.current?.close();

      setRemoteCursors(new Map());
      setIsConnected(false);
    };
  }, [channelName, userId, enabled]);

  // Attach mouse listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
    };
  }, [handleMouseMove, handleMouseClick, enabled]);

  return {
    remoteCursors: Array.from(remoteCursors.values()),
    isConnected,
    error,
    broadcastPosition, // Manual position broadcast if needed
  };
}

// Throttle utility
function useThrottle<T extends (...args: unknown[]) => unknown>(callback: T, delay: number): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;
}

// Generate consistent color from userId
function generateUserColor(userId: string): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
    '#84CC16', // lime
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
