/**
 * Activity Feed Hook
 *
 * Tracks all real-time activity across the platform
 * Uses shared Ably client to prevent connection leaks
 *
 * Activity types:
 * - user_joined - User joined project
 * - song_created - New song added
 * - song_updated - Song edited
 * - audio_uploaded - Audio file uploaded
 * - chat_message - Message sent
 * - video_started - Video session started
 * - invite_sent - Invitation sent
 * - presence_active - User became active
 */

import type { Message, RealtimeChannel } from 'ably';
import { useEffect, useRef, useState } from 'react';

import { useAblyClient } from './use-ably-client';

export type ActivityType =
  | 'user_joined'
  | 'song_created'
  | 'song_updated'
  | 'audio_uploaded'
  | 'chat_message'
  | 'video_started'
  | 'invite_sent'
  | 'presence_active';

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId?: string;
  projectName?: string;
  songId?: string;
  songName?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
};

type UseActivityFeedOptions = {
  channelName: string; // e.g., 'activity:project:{slug}' or 'activity:global'
  userId?: string; // Required for real-time connection
  limit?: number;
  enabled?: boolean; // Whether to connect to Ably (prevents connection when auth is loading)
};

export function useActivityFeed({
  channelName,
  userId,
  limit = 50,
  enabled = true,
}: UseActivityFeedOptions) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use shared Ably client instead of creating separate connection
  const {
    client: ablyClient,
    isConnected: ablyConnected,
    error: ablyError,
  } = useAblyClient(enabled ? userId : undefined);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);

  // Sync error state from shared client
  useEffect(() => {
    if (ablyError) {
      setError(ablyError);
    }
  }, [ablyError]);

  // Initialize activity feed using shared client
  useEffect(() => {
    // Wait for shared client to be connected
    if (!enabled || !ablyClient || !ablyConnected) {
      return;
    }

    mountedRef.current = true;

    const initActivityFeed = async () => {
      try {
        // Get channel from shared client
        const channel = ablyClient.channels.get(channelName);
        channelRef.current = channel;

        // Subscribe to all activity events
        channel.subscribe((message: Message) => {
          if (!mountedRef.current) return;

          const activity: ActivityEvent = {
            id: message.id || `activity_${Date.now()}`,
            ...message.data,
            timestamp: message.timestamp || Date.now(),
          };

          setActivities((prev) => {
            // Add new activity at the start
            const updated = [activity, ...prev];
            // Limit to max items
            return updated.slice(0, limit);
          });
        });

        // Get recent history (last 50 messages)
        try {
          const resultPage = await channel.history({ limit });

          if (!mountedRef.current || !resultPage) return;

          const historicalActivities: ActivityEvent[] = resultPage.items.map(
            (message: Message) => ({
              id: message.id || `activity_${message.timestamp}`,
              ...message.data,
              timestamp: message.timestamp || Date.now(),
            })
          );

          // Set activities in reverse order so newest is first
          const reversedActivities = [...historicalActivities].reverse();
          setActivities(reversedActivities);
        } catch (error_) {
          console.error('Error fetching activity history:', error_);
        }

        if (mountedRef.current) {
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Ably activity feed error:', err);
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      }
    };

    initActivityFeed();

    // Cleanup - only unsubscribe, don't close shared client
    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {
          // Ignore unsubscribe errors during cleanup
        }
        channelRef.current = null;
      }
    };
  }, [channelName, limit, enabled, ablyClient, ablyConnected]);

  // Function to publish activity (for components to use)
  const publishActivity = async (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    if (!ablyClient || !isConnected) {
      console.error('Cannot publish: Ably not connected');
      return;
    }

    try {
      const channel = ablyClient.channels.get(channelName);
      await channel.publish('activity', activity);
    } catch (err) {
      console.error('Error publishing activity:', err);
    }
  };

  return {
    activities,
    isConnected,
    error,
    publishActivity,
  };
}

/**
 * Helper function to generate activity message
 */
export function getActivityMessage(activity: ActivityEvent): string {
  switch (activity.type) {
    case 'user_joined':
      return `${activity.userName} joined ${activity.projectName || 'the project'}`;
    case 'song_created':
      return `${activity.userName} created "${activity.songName}"`;
    case 'song_updated':
      return `${activity.userName} updated "${activity.songName}"`;
    case 'audio_uploaded':
      return `${activity.userName} uploaded audio to "${activity.songName}"`;
    case 'chat_message':
      return `${activity.userName}: ${activity.message}`;
    case 'video_started':
      return `${activity.userName} started a video session`;
    case 'invite_sent':
      return `${activity.userName} invited ${String(activity.metadata?.inviteeEmail) || 'someone'}`;
    case 'presence_active':
      return `${activity.userName} is now active`;
    default:
      return `${activity.userName} performed an action`;
  }
}

/**
 * Helper function to get activity icon
 */
export function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case 'user_joined':
      return '👋';
    case 'song_created':
      return '🎵';
    case 'song_updated':
      return '✏️';
    case 'audio_uploaded':
      return '🎧';
    case 'chat_message':
      return '💬';
    case 'video_started':
      return '📹';
    case 'invite_sent':
      return '✉️';
    case 'presence_active':
      return '✨';
    default:
      return '📌';
  }
}

/**
 * Helper function to get activity color
 */
export function getActivityColor(type: ActivityType): string {
  switch (type) {
    case 'user_joined':
      return 'text-green-400';
    case 'song_created':
      return 'text-purple-400';
    case 'song_updated':
      return 'text-blue-400';
    case 'audio_uploaded':
      return 'text-orange-400';
    case 'chat_message':
      return 'text-cyan-400';
    case 'video_started':
      return 'text-pink-400';
    case 'invite_sent':
      return 'text-yellow-400';
    case 'presence_active':
      return 'text-emerald-400';
    default:
      return 'text-gray-400';
  }
}
