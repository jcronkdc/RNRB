'use client';

import Ably from 'ably';
import { useEffect, useRef, useState, useCallback } from 'react';

export type BlockEditor = {
  blockId: string;
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
};

type UseBlockEditingOptions = {
  channelName: string;
  userId: string;
  userName: string;
  enabled?: boolean;
};

const USER_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export function useBlockEditing({
  channelName,
  userId,
  userName,
  enabled = true,
}: UseBlockEditingOptions) {
  const [activeEditors, setActiveEditors] = useState<Record<string, BlockEditor>>({});
  const [userColor] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const clearTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const initAbly = async () => {
      try {
        // Create Ably client
        const ablyClient = new Ably.Realtime({
          authUrl: '/api/ably/token',
        });

        if (!mounted) {
          ablyClient.close();
          return;
        }

        ablyRef.current = ablyClient;

        // Get channel
        const channel = ablyClient.channels.get(channelName);
        channelRef.current = channel;

        // Subscribe to block editing events
        channel.subscribe('block-editing', (message) => {
          if (!mounted) return;

          const editor: BlockEditor = message.data;

          // Don't show our own editing indicator
          if (editor.userId === userId) return;

          // Update active editors
          setActiveEditors((prev) => ({
            ...prev,
            [editor.blockId]: editor,
          }));

          // Clear any existing timer for this block
          if (clearTimersRef.current[editor.blockId]) {
            clearTimeout(clearTimersRef.current[editor.blockId]);
          }

          // Set timer to clear editing indicator after 3 seconds of inactivity
          clearTimersRef.current[editor.blockId] = setTimeout(() => {
            setActiveEditors((prev) => {
              const updated = { ...prev };
              delete updated[editor.blockId];
              return updated;
            });
          }, 3000);
        });

        // Subscribe to block editing stop events
        channel.subscribe('block-editing-stop', (message) => {
          if (!mounted) return;

          const { blockId, userId: editorUserId } = message.data;

          // Only remove if it's not our own event
          if (editorUserId !== userId) {
            setActiveEditors((prev) => {
              const updated = { ...prev };
              delete updated[blockId];
              return updated;
            });

            // Clear timer
            if (clearTimersRef.current[blockId]) {
              clearTimeout(clearTimersRef.current[blockId]);
              delete clearTimersRef.current[blockId];
            }
          }
        });
      } catch (error_) {
        console.error('Block editing Ably error:', error_);
      }
    };

    initAbly();

    // Cleanup
    return () => {
      mounted = false;

      // Clear all timers
      Object.values(clearTimersRef.current).forEach(clearTimeout);

      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (ablyRef.current) {
        ablyRef.current.close();
      }
    };
  }, [channelName, userId, enabled]);

  // Notify that user is editing a block
  const notifyEditing = useCallback(
    (blockId: string) => {
      if (!channelRef.current || !enabled) return;

      const editor: BlockEditor = {
        blockId,
        userId,
        userName,
        userColor,
        timestamp: Date.now(),
      };

      channelRef.current.publish('block-editing', editor);
    },
    [userId, userName, userColor, enabled]
  );

  // Notify that user stopped editing a block
  const notifyStopEditing = useCallback(
    (blockId: string) => {
      if (!channelRef.current || !enabled) return;

      channelRef.current.publish('block-editing-stop', { blockId, userId });
    },
    [userId, enabled]
  );

  return {
    activeEditors,
    userColor,
    notifyEditing,
    notifyStopEditing,
  };
}

