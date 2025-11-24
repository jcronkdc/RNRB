'use client';

/**
 * SHOWS MANAGEMENT PAGE
 * 
 * List all shows with filtering, sorting, and CRUD operations
 * Link setlists to shows, track show history
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
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
  ExternalLink,
  Filter,
  Search,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { ToastNotification, useToast } from '@/components/toast-notification';

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
  doors_time?: string;
  show_time?: string;
  soundcheck_time?: string;
  capacity?: number;
  expected_attendance?: number;
  guarantee?: number;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  setlist?: {
    id: string;
    name: string;
  };
};

export default function ShowsPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();

  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadShows();
    }
  }, [user]);

  const loadShows = async () => {
    setLoadingShows(true);
    try {
      const response = await fetch('/api/shows');
      if (response.ok) {
        const data = await response.json();
        setShows(data);
      } else if (response.status === 401) {
        error('Please sign in to view shows');
      } else {
        error('Failed to load shows');
      }
    } catch (err) {
      error('Error loading shows');
      console.error('Error loading shows:', err);
    } finally {
      setLoadingShows(false);
    }
  };

  const deleteShow = async (showId: string, showName: string) => {
    if (!confirm(`Delete "${showName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success(`Deleted "${showName}"`);
        loadShows();
      } else {
        error('Failed to delete show');
      }
    } catch (err) {
      error('Error deleting show');
      console.error('Error deleting show:', err);
    }
  };

  const filteredShows = shows.filter((show) => {
    const matchesSearch =
      show.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      show.venue?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      show.venue?.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || show.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const upcomingShows = filteredShows.filter(
    (show) => new Date(show.date) >= new Date() && show.status !== 'cancelled'
  );
  const pastShows = filteredShows.filter(
    (show) => new Date(show.date) < new Date() || show.status === 'completed'
  );

  if (loading || loadingShows) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-brand-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading shows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen px-4 py-12">
      <div className="rnrb-container mx-auto max-w-7xl">
        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}

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

        {/* Empty State */}
        {shows.length === 0 ? (
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
        ) : (
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
              <div>
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
          </>
        )}
      </div>
    </div>
  );
}

function ShowCard({
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={`rnrb-card group p-4 transition hover:border-brand-primary/30 sm:p-6 ${
          isPast ? 'opacity-75' : ''
        }`}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1 min-w-0">
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
            <span>{new Date(show.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}</span>
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

          {show.show_time && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Show at {show.show_time}</span>
              {show.doors_time && <span>• Doors at {show.doors_time}</span>}
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
        {(show.capacity || show.expected_attendance || show.guarantee) && (
          <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
            {show.expected_attendance && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {show.expected_attendance}
                  {show.capacity && ` / ${show.capacity}`}
                </span>
              </div>
            )}
            {show.guarantee && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>${show.guarantee.toLocaleString()} guarantee</span>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

