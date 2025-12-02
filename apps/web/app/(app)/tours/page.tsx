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
import Daily, { DailyCall } from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';
import { motion } from 'framer-motion';
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
  Search,
  Navigation,
  ArrowUpRight,
  Sparkles,
  Crown,
  LayoutGrid,
  Ticket,
  Clock,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, memo, useCallback, useMemo, useRef } from 'react';

import { LivePerformance } from '@/components/daily/live-performance';
import { ToastNotification, useToast } from '@/components/toast-notification';
import { ToursListSkeleton } from '@/components/tours/loading-skeletons';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTours } from '@/hooks/use-tours';

// Singleton to prevent duplicate Daily instances (Daily SDK only allows one)
let toursPageDailyInstance: DailyCall | null = null;

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
      // Use singleton to prevent duplicate Daily instances
      if (!toursPageDailyInstance) {
        toursPageDailyInstance = Daily.createCallObject({
          subscribeToTracksAutomatically: true,
        });
      }
      setCallObject(toursPageDailyInstance);

      return () => {
        // Leave call but don't destroy singleton
        if (toursPageDailyInstance && toursPageDailyInstance.meetingState() !== 'left-meeting') {
          toursPageDailyInstance.leave().catch(console.warn);
        }
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
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg)]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[color:var(--accent)]" />
          <p className="text-lg text-[color:var(--muted)]">Loading...</p>
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
              to access professional tour management with scheduling, routing optimization, and show
              tracking.
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
                    icon: Calendar,
                    title: 'Show Scheduling',
                    desc: 'Manage dates, venues & ticket links',
                    color: '#22c55e',
                    gradient: 'rgba(34, 197, 94, 0.15)',
                  },
                  {
                    icon: Navigation,
                    title: 'Smart Routing',
                    desc: 'Optimize travel between shows',
                    color: '#3b82f6',
                    gradient: 'rgba(59, 130, 246, 0.15)',
                  },
                  {
                    icon: Ticket,
                    title: 'Ticket Links',
                    desc: 'Direct links to purchase tickets',
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

      {/* Hero Section */}
      <div
        className="relative z-10 overflow-hidden border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="px-4 py-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex justify-center"
          >
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
          </motion.div>

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
                Tour scheduling with ticket links, routing optimization, and show management
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
                  icon: Calendar,
                  color: 'var(--accent)',
                  gradient: 'rgba(255, 99, 71, 0.1)',
                },
                {
                  label: 'Active Tours',
                  value: stats.active,
                  icon: Radio,
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
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search & Filter */}
              <div className="flex flex-1 gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: 'var(--muted)' }}
                  />
                  <input
                    type="text"
                    placeholder="Search tours..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 w-full rounded-xl border pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 rounded-xl border px-4 text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text)',
                  }}
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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLiveStream(true)}
                  className="flex h-12 items-center gap-2 rounded-xl border px-5 text-sm font-medium transition-all"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <Radio className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Start Virtual Show
                </motion.button>
                <Link href="/tours/new">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255, 99, 71, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), #ff7f50)',
                      boxShadow: '0 4px 20px rgba(255, 99, 71, 0.25)',
                    }}
                  >
                    <Plus className="h-5 w-5" />
                    New Tour
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Loading State */}
            {toursLoading && tours.length === 0 && <ToursListSkeleton count={6} />}

            {/* Empty State */}
            {!toursLoading && tours.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border p-12 text-center backdrop-blur-sm"
                style={{
                  borderColor: 'var(--border)',
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.05), rgba(255, 215, 0, 0.03))',
                }}
              >
                <div
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 99, 71, 0.15), rgba(255, 215, 0, 0.1))',
                  }}
                >
                  <Calendar className="h-12 w-12" style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  World-Class Tour Management
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-lg" style={{ color: 'var(--muted)' }}>
                  Schedule shows, add ticket links, optimize routing, and manage your tour. Create
                  your first tour to get started.
                </p>
                <Link href="/tours/new">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 99, 71, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), #ff7f50)',
                      boxShadow: '0 4px 30px rgba(255, 99, 71, 0.3)',
                    }}
                  >
                    <Plus className="h-6 w-6" />
                    Create Your First Tour
                  </motion.button>
                </Link>
              </motion.div>
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
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={loadMore}
                      disabled={toursLoading}
                      className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-medium transition-all disabled:opacity-50"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                        background: 'rgba(255, 255, 255, 0.03)',
                      }}
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
                    </motion.button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!toursLoading && tours.length > 0 && filteredTours.length === 0 && (
              <div
                className="rounded-2xl border p-12 text-center backdrop-blur-sm"
                style={{
                  borderColor: 'var(--border)',
                  background: 'rgba(42, 42, 42, 0.3)',
                }}
              >
                <Search
                  className="mx-auto mb-4 h-16 w-16 opacity-30"
                  style={{ color: 'var(--muted)' }}
                />
                <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  No tours found
                </h3>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>
                  Try adjusting your search or filters
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="rounded-xl border px-6 py-3 font-medium transition-all"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  Clear Filters
                </motion.button>
              </div>
            )}

            {/* Features Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <div
                className="rounded-2xl border p-8 backdrop-blur-sm"
                style={{
                  borderColor: 'var(--border)',
                  background:
                    'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(255, 215, 0, 0.03))',
                }}
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {[
                    {
                      icon: Calendar,
                      title: 'Show Scheduling',
                      desc: 'Manage dates, times, venues, and ticket links for every show on your tour.',
                      color: '#22c55e',
                    },
                    {
                      icon: Navigation,
                      title: 'Smart Routing',
                      desc: 'Optimize tour routing to minimize travel distance and identify scheduling conflicts.',
                      color: '#3b82f6',
                    },
                    {
                      icon: Ticket,
                      title: 'Ticket Links',
                      desc: 'Add direct ticket purchase links that fans can access from your tour page.',
                      color: '#a855f7',
                    },
                  ].map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${feature.color}15` }}
                      >
                        <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                      </div>
                      <div>
                        <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                          {feature.title}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
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
  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    planning: {
      bg: 'rgba(156, 163, 175, 0.1)',
      text: '#9ca3af',
      border: 'rgba(156, 163, 175, 0.2)',
    },
    announced: {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: '#3b82f6',
      border: 'rgba(59, 130, 246, 0.2)',
    },
    ongoing: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
    completed: {
      bg: 'rgba(168, 85, 247, 0.1)',
      text: '#a855f7',
      border: 'rgba(168, 85, 247, 0.2)',
    },
    cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const status = statusStyles[tour.status] || statusStyles.planning;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div
        className="group h-full rounded-xl border p-6 backdrop-blur-sm transition-all"
        style={{
          borderColor: 'var(--border)',
          background: 'rgba(42, 42, 42, 0.4)',
        }}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <Link
              href={`/tours/${tour.slug}`}
              className="mb-2 block truncate text-xl font-bold transition-colors"
              style={{ color: 'var(--text)' }}
            >
              {tour.name}
            </Link>
            <span
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize"
              style={{
                background: status.bg,
                color: status.text,
                borderColor: status.border,
              }}
            >
              {tour.status}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/tools?tool=stageplot" title="Create Stage Plot">
              <motion.button
                whileHover={{ scale: 1.1, color: '#f59e0b' }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg p-2 opacity-0 transition-all group-hover:opacity-100"
                style={{ color: 'var(--muted)' }}
              >
                <LayoutGrid className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link href={`/tours/${tour.slug}/edit`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg p-2 opacity-0 transition-all group-hover:opacity-100"
                style={{ color: 'var(--muted)' }}
              >
                <Edit className="h-4 w-4" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.1, color: '#ef4444' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(tour.id, tour.name)}
              className="rounded-lg p-2 opacity-0 transition-all group-hover:opacity-100"
              style={{ color: 'var(--muted)' }}
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Description */}
        {tour.description && (
          <p className="mb-4 line-clamp-2 text-sm" style={{ color: 'var(--muted)' }}>
            {tour.description}
          </p>
        )}

        {/* Dates */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
            <Calendar className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
            <span>
              {formatDate(tour.startDate)}
              {tour.endDate && ` - ${formatDate(tour.endDate)}`}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex items-center justify-between border-t pt-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
            <MapPin className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            <span>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {tour._count?.shows || 0}
              </span>{' '}
              shows
            </span>
          </div>
          <Link href={`/tours/${tour.slug}`}>
            <motion.button
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
              style={{ color: 'var(--accent)' }}
            >
              View Details
              <ExternalLink className="h-3.5 w-3.5" />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
});
