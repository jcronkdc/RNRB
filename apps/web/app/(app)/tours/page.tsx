'use client';

/**
 * WORLD-CLASS TOURS PAGE
 *
 * Features:
 * - Optimized data loading with pagination
 * - Real-time performance metrics
 * - Advanced filtering and search
 * - Mobile-responsive design
 * - Export capabilities
 */

import { Card, Button } from '@cronkwaters/ui';
import Daily from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Radio,
  Plus,
  TrendingUp,
  DollarSign,
  ChevronDown,
  Loader2,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  BarChart3,
  Lock,
  ArrowUpRight,
  Sparkles,
  Crown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, memo, useCallback, useMemo } from 'react';

import { LivePerformance } from '@/components/daily/live-performance';
import { ToastNotification, useToast } from '@/components/toast-notification';
import { ToursListSkeleton } from '@/components/tours/loading-skeletons';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTours } from '@/hooks/use-tours';

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

export default function ToursPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [callObject, setCallObject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Filter and search tours
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchesSearch =
        !searchQuery ||
        tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || tour.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tours, searchQuery, statusFilter]);

  // Calculate tour statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tours.length,
      active: tours.filter((t) => t.status === 'ongoing' || t.status === 'announced').length,
      upcoming: tours.filter((t) => new Date(t.startDate) > now && t.status !== 'completed').length,
      totalShows: tours.reduce((sum, t) => sum + (t._count?.shows || 0), 0),
    };
  }, [tours]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-brand-primary" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle subscription errors with upgrade prompt
  if (toursError?.isSubscriptionError) {
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Animated Background */}
        <div className="pointer-events-none absolute inset-0">
          {/* Floating music notes */}
          <div className="absolute inset-0 overflow-hidden">
            {['♪', '♫', '♬', '♩', '♪', '♫'].map((note, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl opacity-10"
                style={{
                  left: `${10 + i * 15}%`,
                  color: 'var(--accent)',
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0.05, 0.15, 0.05],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              >
                {note}
              </motion.div>
            ))}
          </div>
          {/* Gradient orbs */}
          <motion.div
            className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255, 99, 71, 0.12), transparent)' }}
            animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.08), transparent)' }}
            animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255, 69, 0, 0.06), transparent)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* White RR Logo Header */}
        <div className="relative z-20 flex justify-center pt-8">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/logo-light.png"
              alt="Rock N' Roll Basement"
              width={64}
              height={64}
              className="drop-shadow-[0_0_20px_rgba(255,99,71,0.4)]"
            />
          </Link>
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-100px)] flex-col items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-2xl text-center"
          >
            {/* Premium Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative mx-auto mb-8"
            >
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.15))',
                  boxShadow: '0 0 60px rgba(255, 99, 71, 0.2)',
                }}
              >
                <Crown className="h-12 w-12" style={{ color: 'var(--accent)' }} />
              </div>
              <motion.div
                className="absolute -right-2 -top-2"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <h1
              className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
              style={{ color: 'var(--text)' }}
            >
              Unlock{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #ffd700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Tour Management
              </span>
            </h1>

            <p className="mb-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
              {toursError.message}
            </p>

            <p className="mb-10 text-base" style={{ color: 'var(--muted)' }}>
              Upgrade to{' '}
              <span className="font-bold" style={{ color: 'var(--accent)' }}>
                {toursError.requiredTier}
              </span>{' '}
              to access professional tour management with analytics, routing optimization, and
              financial tracking.
            </p>

            {/* CTA Buttons */}
            <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href={toursError.upgradeUrl || '/settings/billing?upgrade=creator'}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 99, 71, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), #ff7f50)',
                    boxShadow: '0 4px 30px rgba(255, 99, 71, 0.3)',
                  }}
                >
                  <Crown className="h-5 w-5" />
                  Upgrade to Creator
                  <ArrowUpRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02, borderColor: 'var(--accent)' }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border px-8 py-4 text-lg font-medium transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  Back to Dashboard
                </motion.button>
              </Link>
            </div>

            {/* Feature Preview Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="rounded-2xl border p-8"
              style={{
                borderColor: 'var(--border)',
                background: 'rgba(42, 42, 42, 0.5)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <h3 className="mb-6 text-left text-lg font-bold" style={{ color: 'var(--text)' }}>
                What you&apos;ll unlock:
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: BarChart3,
                    title: 'Analytics Dashboard',
                    desc: 'Revenue tracking & attendance metrics',
                    color: '#22c55e',
                    gradient: 'rgba(34, 197, 94, 0.15)',
                  },
                  {
                    icon: MapPin,
                    title: 'Smart Routing',
                    desc: 'Optimize travel & reduce costs',
                    color: '#3b82f6',
                    gradient: 'rgba(59, 130, 246, 0.15)',
                  },
                  {
                    icon: DollarSign,
                    title: 'Financial Tracking',
                    desc: 'Profit/loss & expense breakdowns',
                    color: '#a855f7',
                    gradient: 'rgba(168, 85, 247, 0.15)',
                  },
                  {
                    icon: Radio,
                    title: 'Virtual Shows',
                    desc: 'Live streaming performances',
                    color: 'var(--accent)',
                    gradient: 'rgba(255, 99, 71, 0.15)',
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-3 rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
                    style={{ background: feature.gradient }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${feature.color}20` }}
                    >
                      <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text)' }}>
                        {feature.title}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show toast for non-subscription errors
  if (toursError && !toursError.isSubscriptionError) {
    error(toursError.message);
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255, 99, 71, 0.08), transparent)' }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.06), transparent)' }}
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="relative z-10 px-4 py-8">
          {/* White RR Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/logo-light.png"
                alt="Rock N' Roll Basement"
                width={56}
                height={56}
                className="drop-shadow-[0_0_15px_rgba(255,99,71,0.3)]"
              />
            </Link>
          </div>

          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="mb-4 flex items-center justify-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.15))',
                  }}
                >
                  <Radio className="h-7 w-7" style={{ color: 'var(--accent)' }} />
                </div>
              </div>
              <h1
                className="mb-3 text-4xl font-bold tracking-tight md:text-5xl"
                style={{ color: 'var(--text)' }}
              >
                Tours & Shows
              </h1>
              <p className="mx-auto max-w-xl text-lg" style={{ color: 'var(--muted)' }}>
                World-class tour management with analytics, routing optimization, and financial
                tracking
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        {showLiveStream && callObject ? (
          <DailyProvider callObject={callObject}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={() => setShowLiveStream(false)}>
                  Back to Tours
                </Button>
              </div>

              <LivePerformance
                performanceName="Virtual Concert"
                description="Live streaming performance"
                scheduledTime={new Date()}
                ticketUrl="#"
              />
            </div>
          </DailyProvider>
        ) : (
          <>
            {/* Tour Statistics */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                {
                  label: 'Total Tours',
                  value: stats.total,
                  icon: BarChart3,
                  color: 'var(--accent)',
                  gradient: 'rgba(255, 99, 71, 0.1)',
                },
                {
                  label: 'Active Tours',
                  value: stats.active,
                  icon: TrendingUp,
                  color: '#22c55e',
                  gradient: 'rgba(34, 197, 94, 0.1)',
                },
                {
                  label: 'Upcoming',
                  value: stats.upcoming,
                  icon: Calendar,
                  color: '#3b82f6',
                  gradient: 'rgba(59, 130, 246, 0.1)',
                },
                {
                  label: 'Total Shows',
                  value: stats.totalShows,
                  icon: MapPin,
                  color: '#a855f7',
                  gradient: 'rgba(168, 85, 247, 0.1)',
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="rounded-xl border p-6 backdrop-blur-sm transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: 'var(--border)',
                    background: `linear-gradient(135deg, ${stat.gradient}, transparent)`,
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {stat.label}
                    </p>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: stat.gradient }}
                    >
                      <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Filters & Actions */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search & Filter */}
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tours..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-input h-10 w-full rounded-md border bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-input h-10 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="announced">Announced</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Action Buttons */}
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
                <Calendar className="mx-auto mb-6 h-24 w-24 text-muted-foreground/50" />
                <h2 className="font-display mb-4 text-3xl font-bold">
                  World-Class Tour Management
                </h2>
                <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
                  Professional analytics, routing optimization, financial tracking, and real-time
                  collaboration. Create your first tour to get started.
                </p>
                <Link href="/tours/new">
                  <Button className="rnrb-button-primary inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold">
                    <Plus className="h-6 w-6" />
                    Create Your First Tour
                  </Button>
                </Link>
              </Card>
            )}

            {/* Tours Grid */}
            {filteredTours.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTours.map((tour) => (
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

            {/* No Results */}
            {!toursLoading && tours.length > 0 && filteredTours.length === 0 && (
              <Card className="p-12 text-center">
                <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-semibold">No tours found</h3>
                <p className="mb-6 text-muted-foreground">Try adjusting your search or filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            )}

            {/* Features Info */}
            <div className="mt-12">
              <Card className="rnrb-card border-green-500/20 bg-green-500/5 p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-green-500" />
                      <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Real-time revenue tracking, attendance metrics, geographic insights, and
                      AI-powered recommendations.
                    </p>
                  </div>
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-green-500" />
                      <h3 className="text-lg font-semibold">Smart Routing</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Optimize tour routing to minimize travel distance, save costs, and identify
                      scheduling conflicts.
                    </p>
                  </div>
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-green-500" />
                      <h3 className="text-lg font-semibold">Financial Tracking</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive profit/loss tracking, expense breakdowns, and professional
                      export capabilities.
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
              className="mb-2 block truncate text-xl font-bold transition hover:text-brand-primary"
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
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{tour.description}</p>
        )}

        {/* Dates */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {formatDate(tour.startDate)}
              {tour.endDate && ` - ${formatDate(tour.endDate)}`}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
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
