'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Loader2,
  ChevronDown,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { EmptyState } from '@/components/empty-states';
import {
  useNotifications,
  getNotificationIcon,
  getNotificationColor,
  type Notification,
} from '@/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/format-date';
import { NotificationSettings } from '@/components/notification-settings';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [showSettings, setShowSettings] = useState(false);

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
  });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view notifications</p>
      </div>
    );
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-64 -left-64 h-[500px] w-[500px] rounded-full bg-linear-to-br from-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-linear-to-tl from-orange-500/10 to-transparent blur-3xl" />
      </div>

      {/* Hero Section with Logo */}
      <div className="relative z-10 border-b border-white/5">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center"
          >
            <Link href="/" className="group relative inline-block">
              <div className="absolute -inset-4 rounded-full bg-white/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={160}
                height={65}
                priority
                className="relative transition-all duration-300 group-hover:scale-105"
              />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-indigo-600">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-muted-foreground text-sm">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                    : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  showSettings ? 'bg-white/10 text-white' : 'hover:bg-white/5'
                }`}
                title="Notification settings"
              >
                <Settings className="h-4 w-4" />
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
            />
            {isConnected ? 'Connected to live updates' : 'Connecting...'}
          </div>
        </motion.div>

        {/* Notification Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <NotificationSettings />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <EmptyState
              type="messages"
              title="No notifications yet"
              description="We'll notify you when something happens"
              actionLabel="Explore"
              actionHref="/explore"
            />
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all ${
                  !notification.read
                    ? 'border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="bg-brand-primary absolute top-0 left-0 h-full w-1" />
                )}

                <div className="flex items-start gap-4 p-6">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getNotificationColor(notification.type).replace('text-', 'bg-').replace('400', '500/20')}`}
                  >
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-white">{notification.title}</h3>
                    <p className="text-muted-foreground mb-3 text-sm">{notification.message}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(notification.timestamp)}
                      </span>
                      {notification.link && (
                        <span className="text-brand-primary text-xs font-medium">
                          Click to view →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="rounded-lg p-2 transition-colors hover:bg-white/10"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <button
              onClick={clearAll}
              className="text-muted-foreground rounded-lg px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white"
            >
              Clear all notifications
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
