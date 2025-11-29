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
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ToastNotification, useToast } from '@/components/toast-notification';

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
        {/* Animated Background Orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-orange-500/20 blur-[100px]" />
          <div className="absolute -right-32 top-1/4 h-80 w-80 animate-pulse rounded-full bg-pink-500/15 blur-[100px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="relative mx-auto mb-4 h-14 w-14">
            <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/20">
              <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
            </div>
          </div>
          <p className="text-lg text-gray-400">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        {/* Animated Background Orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-orange-500/20 blur-[100px]" />
          <div className="absolute -right-32 top-1/4 h-80 w-80 animate-pulse rounded-full bg-pink-500/15 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 h-72 w-72 animate-pulse rounded-full bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 min-h-screen px-4 py-12">
          <div className="mx-auto max-w-2xl">
            {/* Toast Notifications */}
            <ToastNotification toasts={toasts} onRemove={removeToast} />

            <Link href="/shows">
              <Button
                variant="ghost"
                className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shows
              </Button>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 text-center"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                <Calendar className="h-12 w-12 text-orange-400" />
              </div>
              <h2 className="font-display mb-3 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                No Shows Today
              </h2>
              <p className="mx-auto mb-6 max-w-md text-gray-400">
                You don&apos;t have any shows scheduled for today. Check your calendar to see
                upcoming gigs.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/shows">
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                  >
                    View All Shows
                  </Button>
                </Link>
                <Link href="/shows/new">
                  <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600">
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
    <div className="relative min-h-screen overflow-hidden bg-black pb-12">
      {/* Animated Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-orange-500/20 blur-[100px]" />
        <div
          className="absolute -right-32 top-1/4 h-80 w-80 animate-pulse rounded-full bg-pink-500/15 blur-[100px]"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 h-72 w-72 animate-pulse rounded-full bg-purple-500/10 blur-[100px]"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur-xl">
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
