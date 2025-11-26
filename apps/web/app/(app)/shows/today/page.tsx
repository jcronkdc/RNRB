'use client';

/**
 * MOBILE DAY-OF-SHOW PAGE
 * 
 * Dedicated mobile-optimized page for today's show
 * Auto-detects today's show or shows nearest show
 */

import { Button } from '@cronkwaters/ui';
import { Loader2, ArrowLeft, Calendar } from 'lucide-react';
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
      const response = await fetch(
        `/api/shows?upcoming=true&limit=10&includeSetlist=true`
      );

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
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-brand-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="bg-background min-h-screen px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Toast Notifications */}
          <ToastNotification toasts={toasts} onRemove={removeToast} />

          <Link href="/shows">
            <Button variant="ghost" className="mb-6 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shows
            </Button>
          </Link>

          <div className="text-center py-12">
            <Calendar className="text-muted-foreground/50 mx-auto mb-6 h-24 w-24" />
            <h2 className="font-display mb-3 text-2xl font-bold">No Shows Today</h2>
            <p className="text-muted-foreground mx-auto mb-6 max-w-md">
              You don&apos;t have any shows scheduled for today. Check your calendar to see upcoming gigs.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/shows">
                <Button variant="outline">View All Shows</Button>
              </Link>
              <Link href="/shows/new">
                <Button className="rnrb-button-primary">Schedule a Show</Button>
              </Link>
            </div>
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
    <div className="bg-background min-h-screen pb-12">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="border-border sticky top-0 z-10 border-b bg-background/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/shows">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Shows
            </Button>
          </Link>

          {!isToday && (
            <div className="text-brand-primary rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium">
              Upcoming Show
            </div>
          )}
        </div>
      </div>

      {/* Day of Show View */}
      <DayOfShowView show={show} onComplete={isToday ? handleCompleteShow : undefined} />
    </div>
  );
}

