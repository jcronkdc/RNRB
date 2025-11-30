/**
 * Notifications Hook
 *
 * Alert system for the mycelial network
 * Like Tokyo subway notifications for incoming trains
 *
 * NOW USES: Shared Ably client from AblyProvider (NO separate connections!)
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
import { useEffect, useState, useRef } from 'react';

import { useAblyClient } from './use-ably-client';

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
  const [error, setError] = useState<string | null>(null);

  // Use shared Ably client from AblyProvider (NO separate connections!)
  const { client: ablyClient, isConnected, error: ablyError } = useAblyClient(userId);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Sync error state from shared client
  useEffect(() => {
    if (ablyError) {
      setError(ablyError);
    } else {
      setError(null);
    }
  }, [ablyError]);

  // Initialize notification channel when shared client is ready
  useEffect(() => {
    if (!userId || !ablyClient || !isConnected) return;

    let mounted = true;

    try {
      // Get user-specific notification channel from shared client
      const channel = ablyClient.channels.get(`notifications:user:${userId}`);
      channelRef.current = channel;

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
          if (window.Notification.permission === 'granted') {
            new window.Notification(notification.title, {
              body: notification.message,
              icon: notification.fromUserAvatar || '/logo-dark.png',
              tag: notification.id,
            });
          }
        }
      });

      // Load notification history from localStorage
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`notifications_${userId}`);
          if (stored) {
            // Security: Limit JSON size to prevent DoS attacks (max 1MB)
            const MAX_JSON_SIZE = 1024 * 1024; // 1MB
            if (stored.length > MAX_JSON_SIZE) {
              console.warn('Notifications JSON too large, skipping load');
            } else {
              const storedNotifications = JSON.parse(stored);

              // Security: Ensure it's an array and limit size (max 1000 notifications)
              if (!Array.isArray(storedNotifications)) {
                console.warn('Invalid notifications format, skipping load');
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
        }
      }
    } catch (err) {
      console.error('Notifications channel error:', err);
      if (mounted) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
      }
    }

    // Cleanup - only unsubscribe, don't close shared client
    return () => {
      mounted = false;
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }
    };
  }, [userId, ablyClient, isConnected, onNewNotification]);

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
    if (!ablyClient || !isConnected) {
      console.error('Cannot send notification: Ably not connected');
      return;
    }

    try {
      const channel = ablyClient.channels.get(`notifications:user:${toUserId}`);
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
