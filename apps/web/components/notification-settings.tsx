'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface NotificationPreferences {
  liveStreams: boolean;
  meetingReminders: boolean;
  collaborationUpdates: boolean;
  projectActivity: boolean;
  messages: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  liveStreams: true,
  meetingReminders: true,
  collaborationUpdates: true,
  projectActivity: true,
  messages: true,
};

/**
 * NotificationSettings - Complete notification management component
 * Handles permission requests, subscription management, and preferences
 */
export function NotificationSettings() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabling, setIsEnabling] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [showTestSuccess, setShowTestSuccess] = useState(false);

  // Check notification support and current state
  useEffect(() => {
    const checkNotificationState = async () => {
      // Check if notifications are supported
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setPermission('unsupported');
        setIsLoading(false);
        return;
      }

      // Get current permission
      setPermission(Notification.permission as PermissionState);

      // Check if already subscribed
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('Failed to check subscription:', err);
      }

      // Load saved preferences
      try {
        const savedPrefs = localStorage.getItem('notification-preferences');
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }
      } catch (e) {
        console.warn('Failed to load notification preferences:', e);
      }

      setIsLoading(false);
    };

    checkNotificationState();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('notification-preferences', JSON.stringify(preferences));
    }
  }, [preferences, isLoading]);

  // Enable notifications
  const enableNotifications = useCallback(async () => {
    setIsEnabling(true);

    try {
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result !== 'granted') {
        setIsEnabling(false);
        return;
      }

      // Subscribe to push
      const registration = await navigator.serviceWorker.ready;

      // For now, create a local subscription (in production, you'd send this to your server)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This is a placeholder VAPID key - in production, use your real one
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        ) as BufferSource,
      });

      setIsSubscribed(true);
      console.log('Push subscription:', subscription);

      // TODO: Send subscription to your server
      // await fetch('/api/notifications/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscription),
      // });
    } catch (err) {
      console.error('Failed to enable notifications:', err);
    } finally {
      setIsEnabling(false);
    }
  }, []);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);

        // TODO: Remove subscription from server
        // await fetch('/api/notifications/unsubscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ endpoint: subscription.endpoint }),
        // });
      }
    } catch (err) {
      console.error('Failed to disable notifications:', err);
    }
  }, []);

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Rock N' Roll Basement", {
        body: "Notifications are working! You'll get alerts for live streams, meetings, and more.",
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test',
      } as NotificationOptions);

      setShowTestSuccess(true);
      setTimeout(() => setShowTestSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  }, [permission]);

  // Toggle a preference
  const togglePreference = useCallback((key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle Card */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Bell Icon */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background:
                    permission === 'granted'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    color: permission === 'granted' ? '#22c55e' : 'var(--text-secondary)',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  Push Notifications
                </h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {permission === 'unsupported' &&
                    "Your browser doesn't support push notifications"}
                  {permission === 'denied' &&
                    'Notifications are blocked. Enable them in your browser settings.'}
                  {permission === 'default' &&
                    'Get notified about live streams, meetings, and collaboration updates'}
                  {permission === 'granted' &&
                    (isSubscribed
                      ? "You're receiving notifications from Rock N' Roll Basement"
                      : 'Permission granted. Enable to start receiving notifications.')}
                </p>
              </div>
            </div>

            {/* Toggle/Enable Button */}
            {permission !== 'unsupported' && permission !== 'denied' && (
              <div className="shrink-0">
                {permission === 'granted' && isSubscribed ? (
                  <button
                    onClick={disableNotifications}
                    className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
                    style={{ background: '#22c55e' }}
                  >
                    <span
                      className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform"
                      style={{ transform: 'translateX(26px)' }}
                    />
                  </button>
                ) : (
                  <motion.button
                    onClick={enableNotifications}
                    disabled={isEnabling}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
                    style={{ background: '#22c55e' }}
                  >
                    {isEnabling ? (
                      <>
                        <svg className="animate-spin\ h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Enabling...
                      </>
                    ) : (
                      'Enable'
                    )}
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Blocked Warning */}
          {permission === 'denied' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-3 rounded-xl p-4"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#ef4444' }}
                className="mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <div>
                <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                  Notifications Blocked
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  To enable notifications, click the lock icon in your browser's address bar and
                  change notification settings to "Allow".
                </p>
              </div>
            </motion.div>
          )}

          {/* Test Notification Button */}
          {permission === 'granted' && isSubscribed && (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={sendTestNotification}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                Send Test Notification
              </button>

              <AnimatePresence>
                {showTestSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-sm"
                    style={{ color: '#22c55e' }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Sent!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      {permission === 'granted' && isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
            <h4 className="font-semibold" style={{ color: 'var(--text)' }}>
              Notification Preferences
            </h4>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Choose what you want to be notified about
            </p>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            <PreferenceToggle
              title="Live Streams"
              description="When artists you follow go live"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              }
              enabled={preferences.liveStreams}
              onToggle={() => togglePreference('liveStreams')}
            />

            <PreferenceToggle
              title="Meeting Reminders"
              description="5 minutes before scheduled meetings"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              enabled={preferences.meetingReminders}
              onToggle={() => togglePreference('meetingReminders')}
            />

            <PreferenceToggle
              title="Collaboration Updates"
              description="When someone edits shared documents"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              enabled={preferences.collaborationUpdates}
              onToggle={() => togglePreference('collaborationUpdates')}
            />

            <PreferenceToggle
              title="Project Activity"
              description="Comments, approvals, and milestones"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              }
              enabled={preferences.projectActivity}
              onToggle={() => togglePreference('projectActivity')}
            />

            <PreferenceToggle
              title="Messages"
              description="Direct messages and mentions"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
              enabled={preferences.messages}
              onToggle={() => togglePreference('messages')}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Individual preference toggle row
 */
function PreferenceToggle({
  title,
  description,
  icon,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-white/2"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            color: enabled ? '#22c55e' : 'var(--text-secondary)',
          }}
        >
          {icon}
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--text)' }}>
            {title}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
        style={{ background: enabled ? '#22c55e' : 'rgba(255, 255, 255, 0.1)' }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: enabled ? 'translateX(24px)' : 'translateX(4px)' }}
        />
      </button>
    </div>
  );
}

/**
 * Compact notification toggle button (for NavBar or header)
 */
export function NotificationToggleButton() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission as PermissionState);
    } else {
      setPermission('unsupported');
    }
  }, []);

  const handleClick = async () => {
    if (permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
    }
  };

  if (permission === 'unsupported' || permission === 'granted') {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'var(--text-secondary)',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
          />
        </svg>

        {/* Dot indicator */}
        <span
          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full"
          style={{ background: '#f59e0b' }}
        />
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium shadow-xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            Enable Notifications
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
