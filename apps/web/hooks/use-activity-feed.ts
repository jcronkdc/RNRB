/**
 * Activity Feed Hook
 *
 * Tracks all real-time activity across the platform
 * Like the nervous system of the mycelial network
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

import { useEffect, useState } from 'react';
import { Realtime, Types } from 'ably';

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
  metadata?: any;
  timestamp: number;
};

type UseActivityFeedOptions = {
  channelName: string; // e.g., 'activity:project:{slug}' or 'activity:global'
  limit?: number;
};

export function useActivityFeed({ channelName, limit = 50 }: UseActivityFeedOptions) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ably, setAbly] = useState<Realtime | null>(null);

  useEffect(() => {
    let mounted = true;
    let channel: Types.RealtimeChannelCallbacks | null = null;

    const initAbly = async () => {
      try {
        // Create Ably client
        const ablyClient = new Realtime({
          authUrl: '/api/ably/token',
        });

        if (!mounted) {
          ablyClient.close();
          return;
        }

        setAbly(ablyClient);

        // Get channel
        channel = ablyClient.channels.get(channelName);

        // Subscribe to all activity events
        channel.subscribe((message) => {
          if (!mounted) return;

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
        channel.history({ limit }, (err, resultPage) => {
          if (err) {
            console.error('Error fetching activity history:', err);
            return;
          }

          if (!mounted || !resultPage) return;

          const historicalActivities: ActivityEvent[] = resultPage.items.map((message) => ({
            id: message.id || `activity_${message.timestamp}`,
            ...message.data,
            timestamp: message.timestamp || Date.now(),
          }));

          // Reverse so newest is first
          setActivities(historicalActivities.reverse());
        });

        setIsConnected(true);
      } catch (err) {
        console.error('Ably activity feed error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      }
    };

    initAbly();

    // Cleanup
    return () => {
      mounted = false;
      channel?.unsubscribe();
      ably?.close();
    };
  }, [channelName, limit]);

  // Function to publish activity (for components to use)
  const publishActivity = async (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    if (!ably || !isConnected) {
      console.error('Cannot publish: Ably not connected');
      return;
    }

    try {
      const channel = ably.channels.get(channelName);
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
      return `${activity.userName} invited ${activity.metadata?.inviteeEmail || 'someone'}`;
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
