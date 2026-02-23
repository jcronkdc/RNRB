'use client';

import { useChannel } from 'ably/react';
import { Bell, X } from '@/components/ui/custom-icons';
import { useState } from 'react';

import { formatDateTime } from '@/lib/format-date';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationFeedProps {
  channelName: string;
}

export function NotificationFeed({ channelName }: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useChannel(channelName, (message) => {
    if (message.name === 'notification') {
      setNotifications((prev) =>
        [
          {
            id: message.id || Date.now().toString(),
            title: message.data.title || 'Notification',
            message: message.data.message || '',
            timestamp: message.timestamp || Date.now(),
            type: message.data.type || 'info',
          },
          ...prev,
        ].slice(0, 50)
      ); // Keep last 50 notifications
    }
  });

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.id.startsWith('read-')).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 z-50 w-80 rounded-lg border border-white/10 bg-[#050816] shadow-xl">
          <div className="border-b border-white/10 p-4">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <li key={notif.id} className="group relative p-4 hover:bg-white/5">
                    <div className="pr-6">
                      <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                      <p className="mt-1 text-sm text-gray-400">{notif.message}</p>
                      <span className="mt-1 text-xs text-gray-500">
                        {formatDateTime(notif.timestamp)}
                      </span>
                    </div>
                    <button
                      onClick={() => clearNotification(notif.id)}
                      className="absolute top-4 right-4 text-gray-500 opacity-0 transition group-hover:opacity-100 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
