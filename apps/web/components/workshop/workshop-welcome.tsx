'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Bell, Plus, Search } from '@/components/ui/custom-icons';
import { getWelcomeMessage } from '@/lib/workshop-voice';

interface WorkshopWelcomeProps {
  className?: string;
  showActions?: boolean;
}

/**
 * Workshop Welcome Component
 *
 * The warm greeting at the top of the dashboard
 * Personal, time-aware, journey-aware
 */
export function WorkshopWelcome({ className = '', showActions = true }: WorkshopWelcomeProps) {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState({
    songCount: 0,
    practiceStreak: 0,
    lastActivityType: undefined,
    lastSongTitle: undefined,
  });
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch user stats for personalized greeting
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/ecosystem/stats');
        if (res.ok) {
          const data = await res.json();
          setUserStats({
            songCount: data.totalSongs || 0,
            practiceStreak: data.practiceStreak || 0,
            lastActivityType: data.lastActivityType,
            lastSongTitle: data.lastSongTitle,
          });
        }
      } catch (error) {
        // Silently fail - we'll show default greeting
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.count || 0);
        }
      } catch (error) {
        // Silently fail
      }
    };

    if (session?.user) {
      fetchStats();
      fetchNotifications();
    }
  }, [session]);

  const welcome = getWelcomeMessage({
    name: session?.user?.name || undefined,
    songCount: userStats.songCount,
    practiceStreak: userStats.practiceStreak,
    lastActivityType: userStats.lastActivityType,
    lastSongTitle: userStats.lastSongTitle,
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Logo and greeting */}
        <div className="flex items-center gap-6">
          {/* Logo - links home [[memory:11700420]] */}
          <Link href="/" className="group shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={120}
                height={48}
                className="transition-all"
                style={{
                  filter: 'drop-shadow(0 0 10px var(--accent-glow))',
                }}
                priority
              />
            </motion.div>
          </Link>

          {/* Greeting - desktop only */}
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {welcome.greeting}
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {welcome.subtext}
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        {showActions && (
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              className="hidden h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-(--panel-hover) sm:flex"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--muted)',
              }}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-(--panel-hover)"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--muted)',
              }}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>

            {/* Primary CTA - New Song */}
            <Link
              href="/songwriting"
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all hover:scale-105"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 4px 12px var(--accent-glow)',
              }}
              aria-label="Create new song"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Song</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile greeting - below the header */}
      <div className="mt-4 md:hidden">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
          {welcome.greeting}
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {welcome.subtext}
        </p>
      </div>
    </motion.header>
  );
}
