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

import type { Message, RealtimeChannel } from 'ably';
import Ably from 'ably';
import { useEffect, useRef, useState } from 'react';

import {
  canUseAbly,
  recordAblyFailure,
  recordAblySuccess,
  disableAblyPermanently,
} from '@/lib/ably-circuit-breaker';

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
  limit?: number;
  enabled?: boolean; // Whether to connect to Ably (prevents connection when auth is loading)
};

export function useActivityFeed({
  channelName,
  limit = 50,
  enabled = true,
}: UseActivityFeedOptions) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ablyRef = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    // Skip connection if not enabled (e.g., auth still loading)
    if (!enabled) {
      return;
    }

    let mounted = true;
    let channel: RealtimeChannel | null = null;

    const initAbly = async () => {
      // Circuit breaker check - prevent runaway connection loops
      if (!canUseAbly()) {
        console.log('[useActivityFeed] Circuit breaker open - skipping Ably init');
        return;
      }

      try {
        // Pre-check token availability
        const tokenCheck = await fetch('/api/ably/token', {
          signal: AbortSignal.timeout(5000),
        }).catch(() => ({ ok: false, status: 0 }));

        if (!mounted) return;

        // 503 = ABLY_API_KEY not configured
        if (tokenCheck.status === 503) {
          disableAblyPermanently('ABLY_API_KEY not configured');
          return;
        }

        if (!tokenCheck.ok) {
          recordAblyFailure('Token pre-check failed');
          return;
        }

        // Create Ably client with authCallback for circuit breaker control
        const ablyClient = new Ably.Realtime({
          authCallback: async (tokenParams, callback) => {
            if (!canUseAbly()) {
              callback(new Error('Circuit breaker open'), null);
              return;
            }
            try {
              const response = await fetch('/api/ably/token', {
                signal: AbortSignal.timeout(5000),
              });
              if (!response.ok) throw new Error(`Token failed: ${response.status}`);
              const token = await response.json();
              recordAblySuccess();
              callback(null, token);
            } catch (err) {
              recordAblyFailure('Token callback failed');
              callback(err as Error, null);
            }
          },
          closeOnUnload: true,
          disconnectedRetryTimeout: 15000,
          suspendedRetryTimeout: 30000,
        });

        if (!mounted) {
          try {
            ablyClient.close();
          } catch {
            // Ignore close errors when component unmounted
          }
          return;
        }

        recordAblySuccess();
        ablyRef.current = ablyClient;

        // Get channel
        channel = ablyClient.channels.get(channelName);

        // Subscribe to all activity events
        channel.subscribe((message: Message) => {
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
        try {
          const resultPage = await channel.history({ limit });

          if (!mounted || !resultPage) return;

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

        if (mounted) {
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Ably activity feed error:', err);
        recordAblyFailure(err instanceof Error ? err.message : 'Unknown error');
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      }
    };

    initAbly();

    // Cleanup - wrap in try/catch to prevent unhandled promise rejections
    return () => {
      mounted = false;
      if (channel) {
        try {
          channel.unsubscribe();
        } catch {
          // Ignore unsubscribe errors during cleanup
        }
      }
      if (ablyRef.current) {
        try {
          ablyRef.current.close();
        } catch {
          // Ignore close errors during cleanup (prevents "Connection closed" unhandled rejection)
        }
        ablyRef.current = null;
      }
    };
  }, [channelName, limit, enabled]);

  // Function to publish activity (for components to use)
  const publishActivity = async (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    if (!ablyRef.current || !isConnected) {
      console.error('Cannot publish: Ably not connected');
      return;
    }

    try {
      const channel = ablyRef.current.channels.get(channelName);
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
