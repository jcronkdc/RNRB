'use client';

/**
 * MOBILE DAY-OF-SHOW PAGE
 *
 * Dedicated mobile-optimized page for today's show
 * Auto-detects today's show or shows nearest show
 */

import { Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Show = {
  id: string;
  name: string;
  date: string;
  venue?: Record<string, unknown>;
  setlist?: Record<string, unknown>;
  [key: string]: unknown;
};

import { DayOfShowView } from '@/components/gig-calendar/day-of-show-view';
import { ToastNotification, useToast } from '@/components/toast-notification';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function DayOfShowPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();

  const [show, setShow] = useState<any>(null);
  const [loadingShow, setLoadingShow] = useState(true);

  useEffect(() => {
    if (user) {
      loadTodaysShow();
    }
  }, [user]);

  const loadTodaysShow = async () => {
    setLoadingShow(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get shows for today
      const response = await fetch(`/api/shows?upcoming=true&limit=10&includeSetlist=true`);

      if (response.ok) {
        const data = await response.json();
        const shows = (data.shows || data) as Show[];

        // Find today's show
        const todayShow = shows.find((s) => {
          const showDate = new Date(s.date);
          return showDate >= today && showDate < tomorrow;
        });

        if (todayShow) {
          setShow(todayShow);
        } else {
          // If no show today, get the nearest upcoming show
          const nextShow = shows.filter((s) => new Date(s.date) >= today)[0];
          setShow(nextShow || null);
        }
      } else {
        error('Failed to load show');
      }
    } catch (err) {
      error('Error loading show');
      console.error('Error loading show:', err);
    } finally {
      setLoadingShow(false);
    }
  };

  const handleCompleteShow = async () => {
    if (!show) return;

    try {
      const response = await fetch(`/api/shows/${show.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        success('Show marked as complete!');
        router.push('/shows');
      } else {
        error('Failed to update show');
      }
    } catch (err) {
      error('Error updating show');
      console.error('Error updating show:', err);
    }
  };

  if (loading || loadingShow) {
    return (
      <div
        className="relative flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <Loader2
            className="mx-auto mb-4 h-10 w-10 animate-spin"
            style={{ color: 'var(--accent)' }}
          />
          <p style={{ color: 'var(--muted)' }}>Loading show details...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="min-h-screen px-4 py-12">
          <div className="mx-auto max-w-2xl">
            {/* Toast Notifications */}
            <ToastNotification toasts={toasts} onRemove={removeToast} />

            <Link href="/shows">
              <Button
                variant="ghost"
                className="mb-6 flex items-center gap-2"
                style={{ color: 'var(--muted)' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shows
              </Button>
            </Link>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="py-12 text-center"
            >
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Calendar className="h-10 w-10" style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                No Shows Today
              </h2>
              <p className="mx-auto mb-6 max-w-md" style={{ color: 'var(--muted)' }}>
                You don&apos;t have any shows scheduled for today. Check your calendar to see
                upcoming gigs.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/shows">
                  <Button
                    variant="outline"
                    className="border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    View All Shows
                  </Button>
                </Link>
                <Link href="/shows/new">
                  <Button className="text-white" style={{ background: 'var(--accent)' }}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Schedule a Show
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const isToday = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const showDate = new Date(show.date);
    showDate.setHours(0, 0, 0, 0);
    return today.getTime() === showDate.getTime();
  })();

  return (
    <div className="relative min-h-screen pb-12" style={{ background: 'var(--bg)' }}>
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div
        className="sticky top-0 z-20 border-b px-4 py-4"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/shows">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Shows
            </Button>
          </Link>

          {!isToday && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full border border-orange-500/20 bg-gradient-to-r from-orange-500/20 to-pink-500/20 px-4 py-1.5 text-xs font-medium text-orange-400"
            >
              <Sparkles className="mr-1 inline-block h-3 w-3" />
              Upcoming Show
            </motion.div>
          )}
        </div>
      </div>

      {/* Day of Show View */}
      <div className="relative z-10">
        <DayOfShowView show={show} onComplete={isToday ? handleCompleteShow : undefined} />
      </div>
    </div>
  );
}
