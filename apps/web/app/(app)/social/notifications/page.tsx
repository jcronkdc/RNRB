'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Users,
  Music,
  Loader2,
  Check,
  CheckCheck,
  Settings,
  Trash2,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'friend_request'
  | 'mention'
  | 'track_like'
  | 'collab_invite';

interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  fromUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  data?: {
    postId?: string;
    trackId?: string;
    commentPreview?: string;
    projectId?: string;
  };
}

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: typeof Heart; color: string; label: (name: string) => string }
> = {
  like: {
    icon: Heart,
    color: '#ef4444',
    label: (name) => `${name} liked your post`,
  },
  comment: {
    icon: MessageCircle,
    color: '#3b82f6',
    label: (name) => `${name} commented on your post`,
  },
  follow: {
    icon: UserPlus,
    color: '#22c55e',
    label: (name) => `${name} started following you`,
  },
  friend_request: {
    icon: Users,
    color: '#8b5cf6',
    label: (name) => `${name} wants to be your friend`,
  },
  mention: {
    icon: MessageCircle,
    color: '#f59e0b',
    label: (name) => `${name} mentioned you`,
  },
  track_like: {
    icon: Music,
    color: '#ec4899',
    label: (name) => `${name} liked your track`,
  },
  collab_invite: {
    icon: Users,
    color: '#06b6d4',
    label: (name) => `${name} invited you to collaborate`,
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/social/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/social/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setMarkingRead(true);
    try {
      await fetch('/api/social/notifications/read-all', {
        method: 'POST',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingRead(false);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/social/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const filteredNotifications =
    activeFilter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        return notification.data?.postId ? `/social/post/${notification.data.postId}` : '/social';
      case 'track_like':
        return notification.data?.trackId
          ? `/library/track/${notification.data.trackId}`
          : '/library';
      case 'follow':
      case 'friend_request':
        return `/social/profile/${notification.fromUser.id}`;
      case 'collab_invite':
        return notification.data?.projectId
          ? `/projects/${notification.data.projectId}`
          : '/projects';
      default:
        return '/social';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex justify-center"
          >
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </motion.div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                style={{
                  display: 'flex',
                  height: '56px',
                  width: '56px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
                  position: 'relative',
                }}
              >
                <Bell style={{ height: '28px', width: '28px', color: 'white' }} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      minWidth: '22px',
                      height: '22px',
                      borderRadius: '9999px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                  Notifications
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  Stay updated on your activity
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingRead}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {markingRead ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </>
                )}
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '500',
                backgroundColor: activeFilter === 'all' ? 'var(--accent)' : 'var(--bg)',
                color: 'var(--text)',
                border: activeFilter === 'all' ? 'none' : '1px solid var(--border)',
              }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '500',
                backgroundColor: activeFilter === 'unread' ? 'var(--accent)' : 'var(--bg)',
                color: 'var(--text)',
                border: activeFilter === 'unread' ? 'none' : '1px solid var(--border)',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--panel)',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <Bell
              style={{
                margin: '0 auto 16px',
                height: '64px',
                width: '64px',
                color: 'var(--muted)',
              }}
            />
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '8px',
              }}
            >
              {activeFilter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              {activeFilter === 'unread'
                ? 'You have no unread notifications'
                : 'When you get activity, it will show up here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => {
              const config = NOTIFICATION_CONFIG[notification.type];
              const IconComponent = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: notification.read ? 'var(--panel)' : 'var(--accent-dim)',
                    overflow: 'hidden',
                  }}
                >
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className="flex items-start gap-4 p-4 transition-all hover:bg-white/5"
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${config.color}20`,
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent
                        style={{ height: '20px', width: '20px', color: config.color }}
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: 'var(--panel)',
                            flexShrink: 0,
                          }}
                        >
                          {notification.fromUser.image ? (
                            <img
                              src={notification.fromUser.image}
                              alt={notification.fromUser.name || 'User'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Users
                                style={{ height: '14px', width: '14px', color: 'var(--muted)' }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: '600' }}>
                              {notification.fromUser.name || 'Someone'}
                            </span>{' '}
                            {config
                              .label(notification.fromUser.name || 'Someone')
                              .replace(notification.fromUser.name || 'Someone', '')}
                          </p>
                          {notification.data?.commentPreview && (
                            <p
                              style={{
                                color: 'var(--muted)',
                                fontSize: '0.875rem',
                                marginTop: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              "{notification.data.commentPreview}"
                            </p>
                          )}
                          <p
                            style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '4px' }}
                          >
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Link>

                  {/* Quick actions */}
                  <div
                    className="flex items-center justify-end gap-2 px-4 py-2"
                    style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
                  >
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--muted)',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check className="h-3 w-3" />
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--muted)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
