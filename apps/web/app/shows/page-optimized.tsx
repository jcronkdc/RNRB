'use client';

/**
 * OPTIMIZED SHOWS MANAGEMENT PAGE
 * 
 * Features:
 * - Pagination for better performance
 * - Skeleton loading states
 * - Memoized components
 * - Optimistic updates
 * - Efficient re-renders
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { formatDateWithDay, formatNumber } from '@/lib/format-date';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Music,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Filter,
  Search,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { memo, useCallback, useMemo, useState } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { useShows } from '@/hooks/use-shows';
import { ToastNotification, useToast } from '@/components/toast-notification';
import { ShowsListSkeleton } from '@/components/tours/loading-skeletons';

type Show = {
  id: string;
  name: string;
  date: string;
  venue?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
  };
  tour?: {
    id: string;
    name: string;
  };
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  setlist?: {
    id: string;
    name: string;
  };
  doorsTime?: string;
  attendance?: number;
  grossRevenue?: number;
};

export default function ShowsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { toasts, removeToast, success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    shows,
    loading: showsLoading,
    error: showsError,
    total,
    hasMore,
    loadMore,
    refresh,
    deleteShowOptimistic,
  } = useShows({ autoFetch: !!user });

  const deleteShow = useCallback(
    async (showId: string, showName: string) => {
      if (!confirm(`Delete "${showName}"? This cannot be undone.`)) {
        return;
      }

      // Optimistic update
      deleteShowOptimistic(showId);

      try {
        const response = await fetch(`/api/shows/${showId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          success(`Deleted "${showName}"`);
        } else {
          // Revert on error
          refresh();
          error('Failed to delete show');
        }
      } catch (err) {
        // Revert on error
        refresh();
        error('Error deleting show');
        console.error('Error deleting show:', err);
      }
    },
    [deleteShowOptimistic, refresh, success, error]
  );

  // Memoize filtered shows to avoid unnecessary recalculations
  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      const matchesSearch =
        show.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.venue?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.venue?.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || show.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shows, searchQuery, statusFilter]);

  // Memoize upcoming/past show separation
  const { upcomingShows, pastShows } = useMemo(() => {
    const now = new Date();
    const upcoming = filteredShows.filter(
      (show) => new Date(show.date) >= now && show.status !== 'cancelled'
    );
    const past = filteredShows.filter(
      (show) => new Date(show.date) < now || show.status === 'completed'
    );
    return { upcomingShows: upcoming, pastShows: past };
  }, [filteredShows]);

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

  if (showsError) {
    error(showsError);
  }

  return (
    <div className="bg-background min-h-screen px-4 py-12">
      <div className="rnrb-container mx-auto max-w-7xl">
        {/* Toast Notifications */}
        <ToastNotification toasts={toasts} onRemove={removeToast} />

        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display mb-2 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Shows
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">
              Manage your gigs, tours, and performances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/venues">
              <Button variant="outline" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Manage Venues
              </Button>
            </Link>
            <Link href="/shows/new">
              <Button className="rnrb-button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold">
                <Plus className="h-5 w-5" />
                New Show
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search shows, venues, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rnrb-input w-full rounded-xl py-2.5 pl-10 pr-4 sm:py-3 sm:pl-12"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="text-muted-foreground h-4 w-4 shrink-0" />
            {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status)}
                variant={statusFilter === status ? 'default' : 'outline'}
                className="shrink-0 rounded-xl px-3 py-2 text-xs capitalize sm:px-4 sm:text-sm"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4">
              <p className="text-muted-foreground mb-1 text-sm">Total Shows</p>
              <p className="text-2xl font-bold">{total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground mb-1 text-sm">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingShows.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground mb-1 text-sm">Past</p>
              <p className="text-2xl font-bold">{pastShows.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground mb-1 text-sm">Filtered</p>
              <p className="text-2xl font-bold">{filteredShows.length}</p>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {showsLoading && shows.length === 0 && <ShowsListSkeleton count={6} />}

        {/* Empty State */}
        {!showsLoading && shows.length === 0 && (
          <Card className="rnrb-card p-12 text-center sm:p-16">
            <Calendar className="text-muted-foreground/50 mx-auto mb-6 h-20 w-20 sm:h-24 sm:w-24" />
            <h2 className="font-display mb-4 text-2xl font-bold sm:text-3xl">
              No Shows Scheduled Yet
            </h2>
            <p className="text-muted-foreground mx-auto mb-6 max-w-2xl text-base sm:text-lg">
              Start building your touring schedule. Add shows, link them to venues and setlists,
              and keep your band organized for the road ahead.
            </p>
            <Link href="/shows/new">
              <Button className="rnrb-button-primary inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold">
                <Plus className="h-6 w-6" />
                Schedule Your First Show
              </Button>
            </Link>
          </Card>
        )}

        {/* Shows List */}
        {shows.length > 0 && (
          <>
            {/* Upcoming Shows */}
            {upcomingShows.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display mb-4 text-xl font-bold sm:text-2xl">
                  Upcoming Shows ({upcomingShows.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                  {upcomingShows.map((show) => (
                    <ShowCard key={show.id} show={show} onDelete={deleteShow} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Shows */}
            {pastShows.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display mb-4 text-xl font-bold sm:text-2xl">
                  Past Shows ({pastShows.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                  {pastShows.map((show) => (
                    <ShowCard key={show.id} show={show} onDelete={deleteShow} isPast />
                  ))}
                </div>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  onClick={loadMore}
                  disabled={showsLoading}
                  variant="outline"
                  className="inline-flex items-center gap-2"
                >
                  {showsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Load More Shows
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Memoized ShowCard component to prevent unnecessary re-renders
const ShowCard = memo(function ShowCard({
  show,
  onDelete,
  isPast = false,
}: {
  show: Show;
  onDelete: (id: string, name: string) => void;
  isPast?: boolean;
}) {
  const statusColors = {
    scheduled: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`rnrb-card group p-4 transition hover:border-brand-primary/30 sm:p-6 ${
          isPast ? 'opacity-75' : ''
        }`}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate text-lg font-semibold sm:text-xl">{show.name}</h3>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                  statusColors[show.status]
                }`}
              >
                {show.status}
              </span>
              {show.tour && (
                <span className="text-muted-foreground text-xs">• {show.tour.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/shows/${show.id}/edit`}>
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
              onClick={() => onDelete(show.id, show.name)}
              className="opacity-0 transition hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatDateWithDay(show.date)}</span>
          </div>

          {show.venue && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {show.venue.name}
                {show.venue.city && ` • ${show.venue.city}`}
                {show.venue.state && `, ${show.venue.state}`}
              </span>
            </div>
          )}

          {show.doorsTime && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Doors at {new Date(show.doorsTime).toLocaleTimeString()}</span>
            </div>
          )}

          {show.setlist && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Music className="h-4 w-4 shrink-0" />
              <Link
                href={`/projects/${show.setlist.id}`}
                className="hover:text-brand-primary transition"
              >
                {show.setlist.name}
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        {(show.attendance || show.grossRevenue) && (
          <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
            {show.attendance && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{formatNumber(show.attendance)} attended</span>
              </div>
            )}
            {show.grossRevenue && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>${formatNumber(Number(show.grossRevenue))}</span>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
});




