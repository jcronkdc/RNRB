/**
 * Teleprompter Sync Hook
 *
 * Everyone sees the same lyrics scrolling at the same speed.
 * Perfect for live performances and band rehearsals.
 *
 * Features:
 * - Synchronized scroll position
 * - Auto-scroll with BPM sync
 * - Manual scroll override
 * - Section markers
 * - Host control mode
 */

import type { Message } from 'ably';
import { useChannel, useConnectionStateListener } from 'ably/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TeleprompterState = {
  scrollPosition: number; // 0-100 percentage
  isAutoScrolling: boolean;
  scrollSpeed: number; // pixels per second
  currentSection: string | null;
  isPaused: boolean;
};

export type TeleprompterCommand = {
  type: 'scroll' | 'auto-start' | 'auto-stop' | 'speed' | 'section' | 'reset';
  value?: number | string;
  timestamp: number;
  userId: string;
  userName: string;
};

export type TeleprompterUser = {
  userId: string;
  userName: string;
  isHost: boolean;
  scrollPosition: number;
  lastUpdate: number;
};

type UseTeleprompterSyncOptions = {
  channelName: string;
  userId: string;
  userName: string;
  containerRef: React.RefObject<HTMLElement>;
  isHost?: boolean;
  sections?: Array<{ id: string; name: string; position: number }>;
  enabled?: boolean;
};

export function useTeleprompterSync({
  channelName,
  userId,
  userName,
  containerRef,
  isHost = false,
  sections = [],
  enabled = true,
}: UseTeleprompterSyncOptions) {
  const [state, setState] = useState<TeleprompterState>({
    scrollPosition: 0,
    isAutoScrolling: false,
    scrollSpeed: 50, // Default: 50px/s
    currentSection: null,
    isPaused: false,
  });
  const [connectedUsers, setConnectedUsers] = useState<Map<string, TeleprompterUser>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autoScrollRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Monitor connection state
  useConnectionStateListener((stateChange) => {
    setIsConnected(stateChange.current === 'connected');
    if (stateChange.current === 'failed') {
      setError('Connection failed');
    } else if (stateChange.current === 'connected') {
      setError(null);
    }
  });

  // Channel for teleprompter commands
  const { publish: publishCommand } = useChannel(
    channelName,
    'teleprompter-command',
    (message: Message) => {
      if (!enabled) return;
      const command = message.data as TeleprompterCommand;
      if (command.userId === userId) return;

      const container = containerRef.current;

      switch (command.type) {
        case 'scroll':
          if (container && typeof command.value === 'number') {
            const maxScroll = container.scrollHeight - container.clientHeight;
            container.scrollTop = (command.value / 100) * maxScroll;
            setState((prev) => ({ ...prev, scrollPosition: command.value as number }));
          }
          break;

        case 'auto-start':
          setState((prev) => ({ ...prev, isAutoScrolling: true, isPaused: false }));
          break;

        case 'auto-stop':
          setState((prev) => ({ ...prev, isAutoScrolling: false }));
          break;

        case 'speed':
          if (typeof command.value === 'number') {
            setState((prev) => ({ ...prev, scrollSpeed: command.value as number }));
          }
          break;

        case 'section':
          if (typeof command.value === 'string') {
            setState((prev) => ({ ...prev, currentSection: command.value as string }));
            // Scroll to section
            const section = sections.find((s) => s.id === command.value);
            if (section && container) {
              const maxScroll = container.scrollHeight - container.clientHeight;
              container.scrollTop = (section.position / 100) * maxScroll;
            }
          }
          break;

        case 'reset':
          if (container) {
            container.scrollTop = 0;
          }
          setState((prev) => ({
            ...prev,
            scrollPosition: 0,
            isAutoScrolling: false,
            currentSection: null,
          }));
          break;
      }
    }
  );

  // Channel for user presence
  const { publish: publishPresence } = useChannel(
    channelName,
    'teleprompter-presence',
    (message: Message) => {
      if (!enabled) return;
      const user = message.data as TeleprompterUser;

      setConnectedUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(user.userId, user);
        return newMap;
      });

      if (user.isHost && user.userId !== userId) {
        setHostId(user.userId);
      }
    }
  );

  // Broadcast a command
  const broadcastCommand = useCallback(
    (type: TeleprompterCommand['type'], value?: number | string) => {
      if (!publishCommand || !enabled) return;

      // In host mode, only the host can send commands
      if (hostId && hostId !== userId && !isHost) {
        return;
      }

      const command: TeleprompterCommand = {
        type,
        value,
        timestamp: Date.now(),
        userId,
        userName,
      };

      publishCommand({ name: 'teleprompter-command', data: command });
    },
    [userId, userName, hostId, isHost, enabled, publishCommand]
  );

  // Set scroll position
  const setScrollPosition = useCallback(
    (position: number) => {
      const container = containerRef.current;
      if (!container) return;

      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = (position / 100) * maxScroll;
      setState((prev) => ({ ...prev, scrollPosition: position }));
      broadcastCommand('scroll', position);
    },
    [containerRef, broadcastCommand]
  );

  // Start auto-scroll
  const startAutoScroll = useCallback(() => {
    setState((prev) => ({ ...prev, isAutoScrolling: true, isPaused: false }));
    broadcastCommand('auto-start');
  }, [broadcastCommand]);

  // Stop auto-scroll
  const stopAutoScroll = useCallback(() => {
    setState((prev) => ({ ...prev, isAutoScrolling: false }));
    broadcastCommand('auto-stop');
  }, [broadcastCommand]);

  // Toggle auto-scroll
  const toggleAutoScroll = useCallback(() => {
    if (state.isAutoScrolling) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  }, [state.isAutoScrolling, startAutoScroll, stopAutoScroll]);

  // Set scroll speed
  const setScrollSpeed = useCallback(
    (speed: number) => {
      setState((prev) => ({ ...prev, scrollSpeed: speed }));
      broadcastCommand('speed', speed);
    },
    [broadcastCommand]
  );

  // Jump to section
  const jumpToSection = useCallback(
    (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      setState((prev) => ({ ...prev, currentSection: sectionId }));
      setScrollPosition(section.position);
      broadcastCommand('section', sectionId);
    },
    [sections, setScrollPosition, broadcastCommand]
  );

  // Reset to beginning
  const reset = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    setState((prev) => ({
      ...prev,
      scrollPosition: 0,
      isAutoScrolling: false,
      currentSection: null,
    }));
    broadcastCommand('reset');
  }, [containerRef, broadcastCommand]);

  // Auto-scroll effect
  useEffect(() => {
    if (!state.isAutoScrolling || state.isPaused) {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let lastTime = performance.now();

    const scroll = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      const scrollAmount = state.scrollSpeed * deltaTime;
      container.scrollTop += scrollAmount;

      // Update position
      const maxScroll = container.scrollHeight - container.clientHeight;
      const newPosition = maxScroll > 0 ? (container.scrollTop / maxScroll) * 100 : 0;

      // Throttle state updates
      if (Date.now() - lastUpdateRef.current > 100) {
        setState((prev) => ({ ...prev, scrollPosition: newPosition }));
        lastUpdateRef.current = Date.now();
      }

      // Check if reached end
      if (container.scrollTop >= maxScroll) {
        setState((prev) => ({ ...prev, isAutoScrolling: false }));
        return;
      }

      // Determine current section
      const currentSection = sections.find((s, i) => {
        const nextSection = sections[i + 1];
        if (nextSection) {
          return newPosition >= s.position && newPosition < nextSection.position;
        }
        return newPosition >= s.position;
      });

      if (currentSection) {
        setState((prev) => {
          if (prev.currentSection !== currentSection.id) {
            return { ...prev, currentSection: currentSection.id };
          }
          return prev;
        });
      }

      autoScrollRef.current = requestAnimationFrame(scroll);
    };

    autoScrollRef.current = requestAnimationFrame(scroll);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [state.isAutoScrolling, state.isPaused, state.scrollSpeed, containerRef, sections]);

  // Broadcast presence periodically
  useEffect(() => {
    if (!enabled || !publishPresence) return;

    const broadcast = () => {
      const user: TeleprompterUser = {
        userId,
        userName,
        isHost,
        scrollPosition: state.scrollPosition,
        lastUpdate: Date.now(),
      };

      publishPresence({ name: 'teleprompter-presence', data: user });
    };

    broadcast();
    const interval = setInterval(broadcast, 2000);

    return () => clearInterval(interval);
  }, [userId, userName, isHost, state.scrollPosition, enabled, publishPresence]);

  // Clean up stale users
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setConnectedUsers((prev) => {
        const newMap = new Map(prev);
        for (const [key, user] of newMap) {
          if (now - user.lastUpdate > 10000) {
            newMap.delete(key);
          }
        }
        return newMap;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    state,
    connectedUsers: Array.from(connectedUsers.values()),
    isConnected,
    error,
    isHost,
    hostId,
    setScrollPosition,
    startAutoScroll,
    stopAutoScroll,
    toggleAutoScroll,
    setScrollSpeed,
    jumpToSection,
    reset,
    sections,
  };
}
