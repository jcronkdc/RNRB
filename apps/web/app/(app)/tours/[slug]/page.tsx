'use client';

/**
 * TOUR DETAIL PAGE
 *
 * Features:
 * - Show schedule with ticket links
 * - Route optimization
 * - Practical tour management
 */

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Share2,
  Calendar,
  MapPin,
  Users,
  Plus,
  MoreVertical,
  Ticket,
  ExternalLink,
  Clock,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { TourAnalyticsDashboard } from '@/components/tours/tour-analytics-dashboard';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function TourDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useRequireAuth();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'shows'>('overview');

  const tourSlug = params.slug as string;

  useEffect(() => {
    if (user && tourSlug) {
      loadTourData();
    }
  }, [user, tourSlug]);

  const loadTourData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tours/${tourSlug}?includeShowDetails=true`);
      if (response.ok) {
        const data = await response.json();
        setTour(data.tour);
      }
    } catch (error) {
      console.error('Error loading tour:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <p style={{ color: 'var(--muted)' }}>Loading tour...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <Card
          className="p-8 text-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="mb-4" style={{ color: 'var(--muted)' }}>
            Tour not found
          </p>
          <Link href="/tours">
            <Button>Back to Tours</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const upcomingShows = tour.shows?.filter((show: any) => new Date(show.date) >= now) || [];
  const pastShows = tour.shows?.filter((show: any) => new Date(show.date) < now) || [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={120}
                height={48}
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </div>

          <div className="mb-4">
            <Link href="/tours">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tours
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display mb-2 text-3xl font-bold md:text-4xl">{tour.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--muted)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(tour.startDate).toLocaleDateString()}
                      {tour.endDate && ` - ${new Date(tour.endDate).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{tour._count?.shows || tour.shows?.length || 0} shows</span>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      tour.status === 'ongoing'
                        ? 'bg-green-500/10 text-green-500'
                        : tour.status === 'planning'
                          ? 'bg-blue-500/10 text-blue-500'
                          : tour.status === 'completed'
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-gray-500/10 text-gray-500'
                    }`}
                  >
                    {tour.status}
                  </span>
                </div>
                {tour.description && (
                  <p className="mt-3 max-w-2xl text-[color:var(--muted)]">{tour.description}</p>
                )}
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/tours/${tourSlug}/edit`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex gap-2 border-b border-[color:var(--border)]">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeSection === 'overview'
                  ? 'border-b-2 border-brand-primary text-[color:var(--accent)]'
                  : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
              }`}
            >
              Overview & Routing
            </button>
            <button
              onClick={() => setActiveSection('shows')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeSection === 'shows'
                  ? 'border-b-2 border-brand-primary text-[color:var(--accent)]'
                  : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
              }`}
            >
              All Shows ({tour._count?.shows || tour.shows?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {activeSection === 'overview' && (
          <TourAnalyticsDashboard tourId={tour.id} tourSlug={tourSlug} />
        )}

        {activeSection === 'shows' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tour Shows</h2>
              <Link href={`/tours/${tourSlug}/shows/new`}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Show
                </Button>
              </Link>
            </div>

            {tour.shows && tour.shows.length > 0 ? (
              <div className="space-y-6">
                {/* Upcoming Shows */}
                {upcomingShows.length > 0 && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-500">
                      <Calendar className="h-5 w-5" />
                      Upcoming ({upcomingShows.length})
                    </h3>
                    <div className="space-y-3">
                      {upcomingShows.map((show: any) => (
                        <ShowCard key={show.id} show={show} tourSlug={tourSlug} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Shows */}
                {pastShows.length > 0 && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[color:var(--muted)]">
                      <Clock className="h-5 w-5" />
                      Completed ({pastShows.length})
                    </h3>
                    <div className="space-y-3">
                      {pastShows.map((show: any) => (
                        <ShowCard key={show.id} show={show} tourSlug={tourSlug} isPast />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="text-[color:var(--muted)]/50 mx-auto mb-4 h-16 w-16" />
                <h3 className="mb-2 text-lg font-semibold">No Shows Yet</h3>
                <p className="mb-6 text-[color:var(--muted)]">
                  Start adding shows to your tour to manage your schedule.
                </p>
                <Link href={`/tours/${tourSlug}/shows/new`}>
                  <Button className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Show
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Show card with ticket link prominently displayed
function ShowCard({
  show,
  tourSlug,
  isPast = false,
}: {
  show: any;
  tourSlug: string;
  isPast?: boolean;
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Card
      className={`p-4 transition ${isPast ? 'border-[color:var(--border)]/50 bg-muted/10' : 'hover:border-brand-primary/30'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/shows/${show.slug}`}
            className={`block font-semibold transition hover:text-[color:var(--accent)] ${isPast ? 'text-[color:var(--muted)]' : ''}`}
          >
            {show.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(show.date)}
            </div>
            {show.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {show.venue.name}, {show.venue.city}
              </div>
            )}
            {show.doorsTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Doors: {formatTime(show.doorsTime)}
              </div>
            )}
            {isPast && show.attendance && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {show.attendance.toLocaleString()} attended
              </div>
            )}
          </div>

          {/* Show times */}
          {(show.loadInTime || show.soundcheckTime || show.setTime) && (
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[color:var(--muted)]">
              {show.loadInTime && <span>Load-in: {formatTime(show.loadInTime)}</span>}
              {show.soundcheckTime && <span>Soundcheck: {formatTime(show.soundcheckTime)}</span>}
              {show.setTime && <span>Set: {formatTime(show.setTime)}</span>}
              {show.setLength && <span>({show.setLength} min)</span>}
            </div>
          )}

          {/* Notes */}
          {show.notes && (
            <p className="mt-2 line-clamp-2 text-sm italic text-[color:var(--muted)]">
              {show.notes}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Status badge */}
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
              show.status === 'completed'
                ? 'bg-green-500/10 text-green-500'
                : show.status === 'scheduled'
                  ? 'bg-blue-500/10 text-blue-500'
                  : show.status === 'cancelled'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-gray-500/10 text-gray-500'
            }`}
          >
            {show.status}
          </span>

          {/* Ticket Link - prominently displayed */}
          {show.ticketUrl && !isPast && (
            <a
              href={show.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-[color:var(--accent)]/90 flex items-center gap-1.5 rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              <Ticket className="h-4 w-4" />
              Get Tickets
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
