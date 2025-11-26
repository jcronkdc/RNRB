'use client';

/**
 * OPTIMIZED TOURS PAGE
 * 
 * Features:
 * - Efficient data loading with pagination
 * - Skeleton loading states
 * - Memoized components for better performance
 * - Optimistic UI updates
 * - Reduced re-renders
 */

import { Card, Button } from '@cronkwaters/ui';
import Daily from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';
import { motion } from 'framer-motion';
import { formatDateLong } from '@/lib/format-date';
import {
  MapPin,
  Calendar,
  Radio,
  Plus,
  ChevronDown,
  Loader2,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, memo, useCallback } from 'react';

import { LivePerformance } from '@/components/daily/live-performance';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTours } from '@/hooks/use-tours';
import { ToursListSkeleton } from '@/components/tours/loading-skeletons';
import { ToastNotification, useToast } from '@/components/toast-notification';

type Tour = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  posterImage?: string;
  public: boolean;
  org: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    shows: number;
  };
};

export default function ToursPageOptimized() {
  const { user, loading: authLoading } = useRequireAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [callObject, setCallObject] = useState<any>(null);

  const {
    tours,
    loading: toursLoading,
    error: toursError,
    total,
    hasMore,
    loadMore,
    refresh,
    deleteTourOptimistic,
  } = useTours({ autoFetch: !!user, includeShows: false });

  useEffect(() => {
    if (showLiveStream) {
      const daily = Daily.createCallObject({
        subscribeToTracksAutomatically: true,
      });
      setCallObject(daily);

      return () => {
        daily.destroy();
      };
    }
  }, [showLiveStream]);

  const deleteTour = useCallback(
    async (tourId: string, tourName: string) => {
      if (!confirm(`Delete "${tourName}"? This cannot be undone.`)) {
        return;
      }

      // Optimistic update
      deleteTourOptimistic(tourId);

      try {
        const response = await fetch(`/api/tours/${tourId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          success(`Deleted "${tourName}"`);
        } else {
          const data = await response.json();
          // Revert on error
          refresh();
          error(data.error || 'Failed to delete tour');
        }
      } catch (err) {
        // Revert on error
        refresh();
        error('Error deleting tour');
        console.error('Error deleting tour:', err);
      }
    },
    [deleteTourOptimistic, refresh, success, error]
  );

  if (authLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-brand-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (toursError) {
    error(toursError);
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      {/* Hero Section */}
      <div className="border-border/50 relative overflow-hidden border-b">
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="bg-brand-primary/10 absolute left-1/4 top-0 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <Radio className="text-brand-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Live Performance</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Tours & Shows</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Manage your live shows, venues, and virtual performances
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl px-4 py-12">
        {showLiveStream && callObject ? (
          <DailyProvider callObject={callObject}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowLiveStream(false);
                  }}
                >
                  Back to Tours
                </Button>
              </div>

              <LivePerformance
                performanceName="Virtual Concert"
                description="Live streaming performance"
                scheduledTime={new Date().toISOString()}
                ticketUrl="#"
              />
            </div>
          </DailyProvider>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-display mb-2 text-2xl font-bold">Your Tours</h2>
                <p className="text-muted-foreground">
                  {total > 0 ? `${total} total tours` : 'No tours yet'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => setShowLiveStream(true)} variant="outline">
                  <Radio className="mr-2 h-4 w-4" />
                  Start Virtual Show
                </Button>
                <Link href="/tours/new">
                  <Button className="rnrb-button-primary flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    New Tour
                  </Button>
                </Link>
              </div>
            </div>

            {/* Loading State */}
            {toursLoading && tours.length === 0 && <ToursListSkeleton count={6} />}

            {/* Empty State */}
            {!toursLoading && tours.length === 0 && (
              <Card className="rnrb-card border-blue-500/20 bg-blue-500/5 p-12 text-center">
                <Calendar className="text-muted-foreground/50 mx-auto mb-6 h-24 w-24" />
                <h2 className="font-display mb-4 text-3xl font-bold">
                  Tour Management - Ready to Build
                </h2>
                <p className="text-muted-foreground mx-auto mb-6 max-w-2xl text-lg">
                  Create your first tour to start managing shows, venues, setlists, and more all in
                  one place.
                </p>
                <Link href="/tours/new">
                  <Button className="rnrb-button-primary inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold">
                    <Plus className="h-6 w-6" />
                    Create Your First Tour
                  </Button>
                </Link>
              </Card>
            )}

            {/* Tours List */}
            {tours.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} onDelete={deleteTour} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={loadMore}
                      disabled={toursLoading}
                      variant="outline"
                      className="inline-flex items-center gap-2"
                    >
                      {toursLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Load More Tours
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Feature Information */}
            <div className="mt-12">
              <Card className="rnrb-card border-green-500/20 bg-green-500/5 p-8">
                <div className="mb-4 flex items-start gap-4">
                  <div className="bg-green-500/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <Radio className="text-green-500 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">✓ AVAILABLE NOW: Virtual Concerts</h3>
                    <p className="text-muted-foreground">
                      Use Daily.co integration to stream live performances to YouTube, Twitch,
                      Facebook via RTMP. Up to 32 participants.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Memoized TourCard to prevent unnecessary re-renders
const TourCard = memo(function TourCard({
  tour,
  onDelete,
}: {
  tour: Tour;
  onDelete: (id: string, name: string) => void;
}) {
  const statusColors: Record<string, string> = {
    planning: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    announced: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    ongoing: 'bg-green-500/10 text-green-500 border-green-500/20',
    completed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rnrb-card group h-full p-6 transition hover:border-brand-primary/30">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <Link
              href={`/tours/${tour.slug}`}
              className="hover:text-brand-primary mb-2 block truncate text-xl font-bold transition"
            >
              {tour.name}
            </Link>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                statusColors[tour.status] || statusColors.planning
              }`}
            >
              {tour.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/tours/${tour.slug}/edit`}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 transition group-hover:opacity-100"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(tour.id, tour.name)}
              className="opacity-0 transition hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {tour.description && (
          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">{tour.description}</p>
        )}

        {/* Dates */}
        <div className="mb-4 space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {formatDateLong(tour.startDate)}
              {tour.endDate && ` - ${formatDateLong(tour.endDate)}`}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-muted-foreground text-sm">
            <span className="font-medium">{tour._count?.shows || 0}</span> shows
          </div>
          <Link href={`/tours/${tour.slug}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              View Details
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
});





