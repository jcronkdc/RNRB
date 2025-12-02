'use client';

/**
 * Notification Bell Component
 *
 * Shows notification count badge and dropdown
 * Like Tokyo subway alert system - instant, clear, actionable
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, X, Settings } from '@/components/ui/custom-icons';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import {
  useNotifications,
  getNotificationIcon,
  getNotificationColor,
  type Notification,
} from '@/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/format-date';

export function NotificationBell() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestPermission,
  } = useNotifications({
    userId: user?.id || '',
    onNewNotification: (notification) => {
      // Play sound (optional)
      if (typeof window !== 'undefined') {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if sound fails
      }
    },
  });

  const router = useRouter();

  if (!user) return null;

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 transition-colors hover:bg-muted/50"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}

        {/* Connection Status */}
        {isConnected && (
          <motion.div
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-card absolute right-0 top-full z-50 mt-2 max-h-[600px] w-96 overflow-hidden rounded-lg border border-border shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="rounded p-1.5 transition-colors hover:bg-muted"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={requestPermission}
                    className="rounded p-1.5 transition-colors hover:bg-muted"
                    title="Enable browser notifications"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded p-1.5 transition-colors hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-[500px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Bell className="mx-auto mb-3 h-12 w-12 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="mt-1 text-sm">We'll notify you when something happens</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`relative cursor-pointer p-4 transition-colors ${!notification.read ? 'bg-brand-primary/5' : ''} hover:bg-muted/50`}
                      >
                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="absolute bottom-0 left-0 top-0 w-1 bg-brand-primary" />
                        )}

                        <div className="ml-2 flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getNotificationColor(notification.type).replace('text-', 'bg-').replace('400', '500/20')} `}
                          >
                            <span className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-sm font-medium">{notification.title}</p>
                            <p className="mb-2 text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.link && (
                                <span className="text-xs text-brand-primary">→ Click to view</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="rounded p-1.5 transition-colors hover:bg-muted"
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-500/20"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border bg-muted/30 p-3">
                  <button
                    onClick={clearAll}
                    className="w-full py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions

function formatTimestamp(timestamp: number): string {
  return formatRelativeTime(timestamp);
}
