'use client';

/**
 * GIG CALENDAR PAGE - WORLD-CLASS IMPLEMENTATION
 *
 * Features:
 * - Full calendar visualization (month/week/day/agenda views)
 * - Statistics dashboard
 * - Conflict detection
 * - Export capabilities
 * - Quick show creation from calendar
 * - Show details modal
 * - Bulk operations
 * - Responsive design
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Music,
  Plus,
  X,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle,
  Car,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, Suspense } from 'react';

import { CalendarView } from '@/components/gig-calendar/calendar-view';
import { ConflictDetector } from '@/components/gig-calendar/conflict-detector';
import { EmptyState } from '@/components/empty-states';
import { CalendarSkeleton } from '@/components/loading-skeletons';
import { ToastNotification, useToast } from '@/components/toast-notification';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { formatDateWithDay, formatTime } from '@/lib/format-date';

type Show = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  date: string;
  doorsTime?: string;
  soundcheckTime?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  venue?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    capacity?: number;
  };
  tour?: {
    id: string;
    name: string;
    slug?: string; // Made optional to match CalendarView component's Show type
  };
  project?: {
    id: string;
    name: string;
    slug: string;
  };
  setlist?: {
    id: string;
    name: string;
  };
  attendance?: number;
  grossRevenue?: number;
  ticketUrl?: string;
  ticketPrice?: any;
  notes?: string;
};

function CalendarPageContent() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, removeToast, success, error } = useToast();

  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tourFilter, setTourFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadShows();
    }
  }, [user, statusFilter, tourFilter]);

  const loadShows = async () => {
    setLoadingShows(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (tourFilter !== 'all') {
        params.set('tourId', tourFilter);
      }
      params.set('includeSetlist', 'true');

      const response = await fetch(`/api/shows?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setShows(data.shows || data);
      } else if (response.status === 401) {
        error('Please sign in to view calendar');
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

  const handleShowClick = (show: Show) => {
    setSelectedShow(show);
    setShowModal(true);
  };

  const handleDateSelect = (date: Date) => {
    // TODO: Navigate to new show form with pre-filled date
  };

  const handleReschedule = async (showId: string, newDate: Date) => {
    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate.toISOString() }),
      });

      if (response.ok) {
        success('Show rescheduled successfully');
        loadShows();
      } else {
        error('Failed to reschedule show');
      }
    } catch (err) {
      error('Error rescheduling show');
      console.error('Error rescheduling:', err);
    }
  };

  const handleCreateShow = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    router.push(`/shows/new?date=${dateStr}`);
  };

  const handleDeleteShow = async (showId: string) => {
    if (!confirm('Delete this show? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Show deleted successfully');
        setShowModal(false);
        setSelectedShow(null);
        loadShows();
      } else {
        error('Failed to delete show');
      }
    } catch (err) {
      error('Error deleting show');
      console.error('Error deleting:', err);
    }
  };

  const handleExportCalendar = () => {
    // Generate iCal format
    const icsData = generateICalData(shows);
    const blob = new Blob([icsData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tour-calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success('Calendar exported successfully');
  };

  // Get unique tours for filter
  const tours = useMemo(() => {
    const tourMap = new Map();
    shows.forEach((show) => {
      if (show.tour) {
        tourMap.set(show.tour.id, show.tour);
      }
    });
    return Array.from(tourMap.values());
  }, [shows]);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg) p-6">
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Hero Section */}
      <div className="relative z-10 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-[1800px] px-4 py-8">
          {/* Toast Notifications */}
          <ToastNotification toasts={toasts} onRemove={removeToast} />

          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={56}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Calendar className="h-7 w-7" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold lg:text-4xl" style={{ color: 'var(--text)' }}>
                  Gig Calendar
                </h1>
                <p className="mt-1 text-base lg:text-lg" style={{ color: 'var(--muted)' }}>
                  Manage your tour schedule with world-class tools
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setShowStatsPanel(!showStatsPanel)}
                variant="outline"
                className="flex items-center gap-2 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
              >
                <TrendingUp className="h-4 w-4" />
                {showStatsPanel ? 'Hide' : 'Show'} Stats
              </Button>

              <Button
                onClick={handleExportCalendar}
                variant="outline"
                className="flex items-center gap-2 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Link href="/shows/new">
                <Button className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-purple-600">
                  <Plus className="h-5 w-5" />
                  New Show
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="rnrb-container relative z-10 mx-auto max-w-[1800px] px-4 py-8">
        {/* Filters */}
        <Card className="rnrb-card mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-(--muted)" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-(--muted)">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rnrb-input rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">All Shows</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Tour Filter */}
            {tours.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-(--muted)">Tour:</span>
                <select
                  value={tourFilter}
                  onChange={(e) => setTourFilter(e.target.value)}
                  className="rnrb-input rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="all">All Tours</option>
                  {tours.map((tour: any) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(statusFilter !== 'all' || tourFilter !== 'all') && (
              <Button
                onClick={() => {
                  setStatusFilter('all');
                  setTourFilter('all');
                }}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Statistics Panel */}
        {showStatsPanel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <StatsDashboard shows={shows} />
            <ConflictDetector shows={shows} bandMembers={4} perDiemRate={50} />
          </motion.div>
        )}

        {/* Calendar */}
        <Card className="rnrb-card p-6">
          {loadingShows ? (
            <CalendarSkeleton />
          ) : shows.length === 0 ? (
            <EmptyState
              type="shows"
              title="No shows on your calendar"
              description="Start booking gigs and tracking your performances"
              actionLabel="Create Your First Show"
              actionHref="/shows/new"
            />
          ) : (
            <CalendarView
              shows={shows}
              onShowClick={handleShowClick}
              onDateSelect={handleDateSelect}
              onReschedule={handleReschedule}
              onCreateShow={handleCreateShow}
              loading={loadingShows}
            />
          )}
        </Card>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/venues">
            <Card className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Manage Venues</div>
                  <div className="text-xs text-gray-400">Add and edit venues</div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/tours">
            <Card className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Manage Tours</div>
                  <div className="text-xs text-gray-400">Plan multi-show tours</div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/setlists">
            <Card className="rnrb-card group cursor-pointer border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                  <Music className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Manage Setlists</div>
                  <div className="text-xs text-gray-400">Build show setlists</div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Show Detail Modal */}
      <AnimatePresence>
        {showModal && selectedShow && (
          <ShowDetailModal
            show={selectedShow}
            onClose={() => {
              setShowModal(false);
              setSelectedShow(null);
            }}
            onDelete={() => handleDeleteShow(selectedShow.id)}
            onEdit={() => router.push(`/shows/${selectedShow.id}/edit`)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-(--bg) p-6">
          <CalendarSkeleton />
        </div>
      }
    >
      <CalendarPageContent />
    </Suspense>
  );
}

// Statistics Dashboard Component
function StatsDashboard({ shows }: { shows: Show[] }) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisYearShows = shows.filter((show) => new Date(show.date).getFullYear() === thisYear);
    const lastMonthShows = shows.filter((show) => {
      const showDate = new Date(show.date);
      return showDate >= lastMonth && showDate < now;
    });

    const upcoming = shows.filter((show) => new Date(show.date) >= now);
    const confirmed = upcoming.filter((show) => show.status === 'confirmed').length;

    const totalRevenue = thisYearShows.reduce(
      (sum, show) => sum + (show.grossRevenue ? Number(show.grossRevenue) : 0),
      0
    );

    const totalAttendance = thisYearShows.reduce((sum, show) => sum + (show.attendance || 0), 0);

    const avgAttendance = totalAttendance / (thisYearShows.filter((s) => s.attendance).length || 1);

    // Most popular cities
    const cityMap = new Map<string, number>();
    thisYearShows.forEach((show) => {
      if (show.venue?.city) {
        cityMap.set(show.venue.city, (cityMap.get(show.venue.city) || 0) + 1);
      }
    });
    const topCities = Array.from(cityMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      thisYear: thisYearShows.length,
      lastMonth: lastMonthShows.length,
      upcoming: upcoming.length,
      confirmed,
      totalRevenue,
      totalAttendance,
      avgAttendance,
      topCities,
    };
  }, [shows]);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* This Year */}
      <Card className="rnrb-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-xs font-medium uppercase text-(--muted)">
              Shows This Year
            </div>
            <div className="text-3xl font-bold">{stats.thisYear}</div>
            <div className="mt-1 text-xs text-(--muted)">
              {stats.lastMonth} last month
            </div>
          </div>
          <div className="rounded-lg bg-brand-primary/10 p-2 text-(--accent)">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </Card>

      {/* Upcoming & Confirmed */}
      <Card className="rnrb-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-xs font-medium uppercase text-(--muted)">
              Upcoming Shows
            </div>
            <div className="text-3xl font-bold">{stats.upcoming}</div>
            <div className="mt-1 text-xs text-green-500">{stats.confirmed} confirmed</div>
          </div>
          <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </Card>

      {/* Revenue */}
      <Card className="rnrb-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-xs font-medium uppercase text-(--muted)">
              Total Revenue
            </div>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.totalRevenue)}
            </div>
            <div className="mt-1 text-xs text-(--muted)">{stats.thisYear} shows</div>
          </div>
          <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-500">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </Card>

      {/* Attendance */}
      <Card className="rnrb-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-xs font-medium uppercase text-(--muted)">
              Total Attendance
            </div>
            <div className="text-3xl font-bold">{stats.totalAttendance.toLocaleString()}</div>
            <div className="mt-1 text-xs text-(--muted)">
              Avg: {Math.round(stats.avgAttendance)} per show
            </div>
          </div>
          <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </Card>

      {/* Top Cities */}
      {stats.topCities.length > 0 && (
        <Card className="rnrb-card p-4 sm:col-span-2 lg:col-span-4">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-(--accent)" />
            <span className="font-semibold">Top Cities This Year</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.topCities.map(([city, count]) => (
              <div key={city} className="flex items-center gap-2 rounded-lg bg-muted/30 px-4 py-2">
                <span className="font-medium">{city}</span>
                <span className="text-sm font-semibold text-(--accent)">
                  {count} {count === 1 ? 'show' : 'shows'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Show Detail Modal Component
function ShowDetailModal({ show, onClose, onDelete, onEdit }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-(--bg) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="rnrb-card border-0 shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-(--border) p-6">
            <div className="min-w-0 flex-1">
              <h2 className="font-display mb-2 text-2xl font-bold">{show.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColorClass(
                    show.status
                  )}`}
                >
                  {show.status}
                </span>
                {show.tour && (
                  <Link
                    href={`/tours/${show.tour.slug}`}
                    className="text-xs text-(--accent) hover:underline"
                  >
                    {show.tour.name}
                  </Link>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Date & Time */}
              <div>
                <div className="mb-2 text-xs font-medium uppercase text-(--muted)">
                  Date & Time
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-(--muted)" />
                  <span className="font-medium">{formatDateWithDay(show.date)}</span>
                </div>
                {(show.soundcheckTime || show.doorsTime) && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-(--muted)">
                    <Clock className="h-4 w-4" />
                    <span>
                      {show.soundcheckTime && `Soundcheck: ${formatTime(show.soundcheckTime)}`}
                      {show.soundcheckTime && show.doorsTime && ' • '}
                      {show.doorsTime && `Doors: ${formatTime(show.doorsTime)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Venue */}
              {show.venue && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-(--muted)">
                    Venue
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--muted)" />
                    <div>
                      <div className="font-medium">{show.venue.name}</div>
                      {(show.venue.city || show.venue.state) && (
                        <div className="text-(--muted)">
                          {show.venue.city}
                          {show.venue.city && show.venue.state && ', '}
                          {show.venue.state}
                        </div>
                      )}
                      {show.venue.capacity && (
                        <div className="text-xs text-(--muted)">
                          Capacity: {show.venue.capacity.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Setlist */}
              {show.setlist && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-(--muted)">
                    Setlist
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Music className="h-4 w-4 text-(--muted)" />
                    <Link
                      href={`/setlists/${show.setlist.id}`}
                      className="font-medium text-(--accent) hover:underline"
                    >
                      {show.setlist.name || 'View Setlist'}
                    </Link>
                  </div>
                </div>
              )}

              {/* Stats */}
              {(show.attendance || show.grossRevenue) && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-(--muted)">
                    Statistics
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {show.attendance && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-(--muted)" />
                        <span className="text-sm">
                          <span className="font-semibold">{show.attendance.toLocaleString()}</span>{' '}
                          <span className="text-(--muted)">attendees</span>
                        </span>
                      </div>
                    )}
                    {show.grossRevenue && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          <span className="font-semibold text-green-500">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0,
                            }).format(Number(show.grossRevenue))}
                          </span>{' '}
                          <span className="text-(--muted)">revenue</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {show.description && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-(--muted)">
                    Description
                  </div>
                  <p className="text-sm">{show.description}</p>
                </div>
              )}

              {/* Notes */}
              {show.notes && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-(--muted)">
                    Notes
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3 text-sm">{show.notes}</div>
                </div>
              )}

              {/* Tickets */}
              {show.ticketUrl && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-(--muted)">
                    Tickets
                  </div>
                  <a
                    href={show.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-(--accent) hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Tickets
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-(--border) p-6">
            <Button
              onClick={onDelete}
              variant="ghost"
              className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Show
            </Button>

            <div className="flex items-center gap-3">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
              <Button onClick={onEdit} className="rnrb-button-primary">
                <Edit className="mr-2 h-4 w-4" />
                Edit Show
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Helper Functions

function getStatusColorClass(status: string) {
  const colors = {
    scheduled: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };
  return colors[status as keyof typeof colors] || colors.scheduled;
}

function generateICalData(shows: Show[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CronkWaters//Gig Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Tour Schedule',
    'X-WR-TIMEZONE:UTC',
  ];

  shows.forEach((show) => {
    const startDate = new Date(show.date);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 3); // Default 3-hour show

    const formatICalDate = (date: Date) => {
      return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
    };

    lines.push(
      'BEGIN:VEVENT',
      `UID:${show.id}@rnrb.app`,
      `DTSTAMP:${formatICalDate(new Date())}`,
      `DTSTART:${formatICalDate(startDate)}`,
      `DTEND:${formatICalDate(endDate)}`,
      `SUMMARY:${show.name}`,
      show.venue
        ? `LOCATION:${show.venue.name}${show.venue.city ? ', ' + show.venue.city : ''}`
        : '',
      show.description ? `DESCRIPTION:${show.description.replace(/\n/g, '\\n')}` : '',
      `STATUS:${show.status.toUpperCase()}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
