/**
 * Notifications Hook
 *
 * Alert system for the mycelial network
 * Like Tokyo subway notifications for incoming trains
 *
 * Notification types:
 * - mention - Someone mentioned you in chat
 * - invite - You were invited to a project
 * - comment - Someone commented on your song
 * - upload - Someone uploaded to your project
 * - video_start - Video session started (you should join)
 * - collab_request - Collaboration request received
 */

import type { Message, RealtimeChannel } from 'ably';
import { Realtime } from 'ably';
import { useEffect, useState } from 'react';

import {
  canUseAbly,
  recordAblyFailure,
  recordAblySuccess,
  disableAblyPermanently,
} from '@/lib/ably-circuit-breaker';

export type NotificationType =
  | 'mention'
  | 'invite'
  | 'comment'
  | 'upload'
  | 'video_start'
  | 'collab_request';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  link?: string; // Where to navigate when clicked
  read: boolean;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

type UseNotificationsOptions = {
  userId: string;
  onNewNotification?: (notification: Notification) => void;
};

export function useNotifications({ userId, onNewNotification }: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ably, setAbly] = useState<Realtime | null>(null);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    let channel: RealtimeChannel | null = null;
    let ablyInstance: Realtime | null = null;
    let connectionHandler: (() => void) | null = null;
    let connectionClient: Realtime | null = null;

    const initAbly = async () => {
      // Circuit breaker check - prevent runaway connection loops
      if (!canUseAbly()) {
        console.log('[useNotifications] Circuit breaker open - skipping Ably init');
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
        const ablyClient = new Realtime({
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
          clientId: userId,
          closeOnUnload: true,
          disconnectedRetryTimeout: 15000,
          suspendedRetryTimeout: 30000,
        });

        if (!mounted) {
          ablyClient.close();
          return;
        }

        connectionHandler = () => {
          recordAblySuccess();
        };
        connectionClient = ablyClient;
        ablyClient.connection.on('connected', connectionHandler);

        ablyInstance = ablyClient;
        setAbly(ablyClient);

        // Get user-specific notification channel
        channel = ablyClient.channels.get(`notifications:user:${userId}`);

        // Subscribe to notifications
        channel.subscribe('notification', (message: Message) => {
          if (!mounted) return;

          const notification: Notification = {
            id: message.id || `notif_${Date.now()}`,
            ...message.data,
            read: false,
            timestamp: message.timestamp || Date.now(),
          };

          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Trigger callback if provided
          onNewNotification?.(notification);

          // Browser notification if permission granted
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: notification.fromUserAvatar || '/logo-dark.png',
                tag: notification.id,
              });
            }
          }
        });

        // Load notification history from localStorage
        // Note: Validation failures should skip loading but NOT exit the function
        // The Ably connection is already established above, so we must call setIsConnected(true)
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem(`notifications_${userId}`);
            if (stored) {
              // Security: Limit JSON size to prevent DoS attacks (max 1MB)
              const MAX_JSON_SIZE = 1024 * 1024; // 1MB
              if (stored.length > MAX_JSON_SIZE) {
                console.warn('Notifications JSON too large, skipping load');
                // Don't return - continue to setIsConnected(true)
              } else {
                const storedNotifications = JSON.parse(stored);

                // Security: Ensure it's an array and limit size (max 1000 notifications)
                if (!Array.isArray(storedNotifications)) {
                  console.warn('Invalid notifications format, skipping load');
                  // Don't return - continue to setIsConnected(true)
                } else {
                  const MAX_NOTIFICATIONS = 1000;
                  const limitedNotifications = storedNotifications.slice(0, MAX_NOTIFICATIONS);

                  setNotifications(limitedNotifications);
                  setUnreadCount(limitedNotifications.filter((n: Notification) => !n.read).length);
                }
              }
            }
          } catch (err) {
            console.warn('Failed to load notifications from localStorage:', err);
            // Continue - Ably connection is already established, just skip loading cached notifications
          }
        }

        setIsConnected(true);
      } catch (err) {
        console.error('Ably notifications error:', err);
        recordAblyFailure(err instanceof Error ? err.message : 'Unknown error');
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

      if (connectionHandler && connectionClient) {
        try {
          connectionClient.connection.off('connected', connectionHandler);
        } catch {
          // Ignore connection handler removal errors
        }
        connectionHandler = null;
        connectionClient = null;
      }

      if (ablyInstance) {
        ablyInstance.close();
        ablyInstance = null;
      } else if (ably) {
        ably.close();
      }
    };
  }, [userId, onNewNotification]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && notifications.length > 0) {
      try {
        localStorage.setItem(
          `notifications_${userId}`,
          JSON.stringify(notifications.slice(0, 100))
        ); // Keep last 100
      } catch (error) {
        console.warn('Failed to save notifications to localStorage:', error);
        // Continue - notifications are still in memory
      }
    }
  }, [notifications, userId]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => {
      const notif = prev.find((n) => n.id === notificationId);
      if (notif && !notif.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`notifications_${userId}`);
      } catch (error) {
        console.warn('Failed to remove notifications from localStorage:', error);
        // Continue - notifications are still cleared from memory
      }
    }
  };

  // Send notification to another user (for components to use)
  const sendNotification = async (
    toUserId: string,
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    if (!ably || !isConnected) {
      console.error('Cannot send notification: Ably not connected');
      return;
    }

    try {
      const channel = ably.channels.get(`notifications:user:${toUserId}`);
      await channel.publish('notification', notification);
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  // Request browser notification permission
  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    sendNotification,
    requestPermission,
  };
}

/**
 * Helper functions
 */

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'mention':
      return '💬';
    case 'invite':
      return '✉️';
    case 'comment':
      return '💭';
    case 'upload':
      return '🎧';
    case 'video_start':
      return '📹';
    case 'collab_request':
      return '🤝';
    default:
      return '🔔';
  }
}

export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'mention':
      return 'text-cyan-400';
    case 'invite':
      return 'text-yellow-400';
    case 'comment':
      return 'text-purple-400';
    case 'upload':
      return 'text-orange-400';
    case 'video_start':
      return 'text-pink-400';
    case 'collab_request':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
}
