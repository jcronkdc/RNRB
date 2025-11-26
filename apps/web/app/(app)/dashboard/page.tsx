'use client';

import {
  Calendar,
  ChevronRight,
  Compass,
  FileMusic,
  Folder,
  HardDrive,
  Library,
  ListMusic,
  Loader2,
  Mic2,
  Music2,
  Plus,
  TrendingUp,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorBoundary, SilentErrorBoundary } from '@/components/error-boundary';
import { getStoragePercentage, useDashboardData } from '@/hooks/use-dashboard-data';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { useRequireAuth } from '@/hooks/use-require-auth';

// Project type for recent projects
type RecentProject = {
  id: string;
  name: string;
  slug: string;
  song_count: number;
};

// Dynamically import activity feed with loading fallback
const CompactActivityFeed = dynamic(
  () => import('@/components/activity-feed').then((m) => m.CompactActivityFeed),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--muted)' }} />
      </div>
    ),
  }
);

// Stat card component using CSS variables
const StatCard = memo(
  ({
    label,
    value,
    icon: Icon,
    href,
  }: {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    href?: string;
  }) => {
    const content = (
      <div
        className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 hover:translate-y-[-2px]"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(255, 99, 71, 0.1)' }}
        >
          <Icon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {value}
          </p>
        </div>
      </div>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }
    return content;
  }
);
StatCard.displayName = 'StatCard';

// Primary action card (large, prominent)
const PrimaryActionCard = memo(
  ({
    title,
    description,
    icon: Icon,
    href,
    badge,
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    href: string;
    badge?: string;
  }) => (
    <Link
      href={href}
      className="group relative block h-full cursor-pointer overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px]"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Accent glow on hover - pointer-events-none to not block clicks */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(255, 99, 71, 0.15), transparent 70%)',
        }}
      />

      {badge && (
        <span
          className="pointer-events-none absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            background: 'var(--accent)',
            color: 'white',
          }}
        >
          {badge}
        </span>
      )}

      <div className="relative">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 99, 71, 0.1))',
            border: '1px solid rgba(255, 99, 71, 0.2)',
          }}
        >
          <Icon className="h-8 w-8" style={{ color: 'var(--accent)' }} />
        </div>
        <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
          {title}
        </h3>
        <p className="mb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
          {description}
        </p>
        <div
          className="flex items-center gap-2 text-sm font-medium transition-all duration-200 group-hover:gap-3"
          style={{ color: 'var(--accent)' }}
        >
          <span>Get Started</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
);
PrimaryActionCard.displayName = 'PrimaryActionCard';

// Feature tile (smaller, grid item)
const FeatureTile = memo(
  ({
    title,
    icon: Icon,
    href,
    description,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    href: string;
    description?: string;
  }) => {
    return (
      <Link
        href={href}
        className="group flex h-full cursor-pointer flex-col items-center rounded-2xl p-5 text-center transition-all duration-200 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110"
          style={{
            background: 'rgba(255, 99, 71, 0.1)',
            border: '1px solid rgba(255, 99, 71, 0.15)',
          }}
        >
          <Icon className="h-7 w-7" style={{ color: 'var(--accent)' }} />
        </div>
        <h4 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
          {title}
        </h4>
        {description && (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {description}
          </p>
        )}
      </Link>
    );
  }
);
FeatureTile.displayName = 'FeatureTile';

// Recent project card
const RecentProjectCard = memo(({ project }: { project: RecentProject }) => (
  <Link href={`/projects/${project.slug}`}>
    <div
      className="group flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:translate-x-1"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'rgba(255, 99, 71, 0.1)' }}
      >
        <Folder className="h-6 w-6" style={{ color: 'var(--accent)' }} />
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="truncate font-medium" style={{ color: 'var(--text)' }}>
          {project.name}
        </h4>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {project.song_count} {project.song_count === 1 ? 'song' : 'songs'}
        </p>
      </div>
      <ChevronRight
        className="h-5 w-5 opacity-0 transition-all duration-200 group-hover:opacity-100"
        style={{ color: 'var(--muted)' }}
      />
    </div>
  </Link>
));
RecentProjectCard.displayName = 'RecentProjectCard';

// Skeleton components for progressive loading
const StatsSkeleton = memo(() => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="flex animate-pulse items-center gap-4 rounded-2xl p-4"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="h-12 w-12 rounded-xl" style={{ background: 'rgba(255, 99, 71, 0.1)' }} />
        <div className="flex-1">
          <div className="mb-2 h-4 w-16 rounded" style={{ background: 'var(--border)' }} />
          <div className="h-6 w-10 rounded" style={{ background: 'var(--border)' }} />
        </div>
      </div>
    ))}
  </div>
));
StatsSkeleton.displayName = 'StatsSkeleton';

const ActionsSkeleton = memo(() => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="h-56 animate-pulse rounded-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="p-6">
          <div
            className="mb-4 h-16 w-16 rounded-2xl"
            style={{ background: 'rgba(255, 99, 71, 0.1)' }}
          />
          <div className="mb-2 h-6 w-32 rounded" style={{ background: 'var(--border)' }} />
          <div className="mb-2 h-4 w-full rounded" style={{ background: 'var(--border)' }} />
          <div className="h-4 w-2/3 rounded" style={{ background: 'var(--border)' }} />
        </div>
      </div>
    ))}
  </div>
));
ActionsSkeleton.displayName = 'ActionsSkeleton';

const ProjectsSkeleton = memo(() => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="flex animate-pulse items-center gap-4 rounded-xl p-4"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="h-12 w-12 rounded-xl" style={{ background: 'rgba(255, 99, 71, 0.1)' }} />
        <div className="flex-1">
          <div className="mb-2 h-4 w-32 rounded" style={{ background: 'var(--border)' }} />
          <div className="h-3 w-20 rounded" style={{ background: 'var(--border)' }} />
        </div>
      </div>
    ))}
  </div>
));
ProjectsSkeleton.displayName = 'ProjectsSkeleton';

// Full page skeleton for initial load
const DashboardSkeleton = () => (
  <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header skeleton */}
      <div className="mb-10 animate-pulse">
        <div className="mb-3 h-12 w-80 rounded-lg" style={{ background: 'var(--panel)' }} />
        <div className="h-5 w-48 rounded-lg" style={{ background: 'var(--panel)' }} />
      </div>

      {/* Stats skeleton */}
      <div className="mb-10">
        <StatsSkeleton />
      </div>

      {/* Actions skeleton */}
      <div className="mb-10">
        <div className="mb-6 h-4 w-32 rounded" style={{ background: 'var(--panel)' }} />
        <ActionsSkeleton />
      </div>

      {/* Two column skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 h-4 w-36 rounded" style={{ background: 'var(--panel)' }} />
          <ProjectsSkeleton />
        </div>
        <div>
          <div className="mb-4 h-4 w-32 rounded" style={{ background: 'var(--panel)' }} />
          <div
            className="h-80 animate-pulse rounded-2xl"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          />
        </div>
      </div>
    </div>
  </div>
);

function DashboardContent() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Performance monitoring
  usePerformanceMonitor('dashboard');

  // Dashboard data with caching
  const { data: dashboardStats, loading: statsLoading } = useDashboardData({
    refreshInterval: 60000,
    enabled: !!user && !loading,
  });

  // Fetch recent projects
  const loadProjects = useCallback(async () => {
    if (!user) return;
    setLoadingProjects(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setRecentProjects(data.slice(0, 4)); // Only need 4 for dashboard
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !loading) {
      loadProjects();
    }
  }, [user, loading, loadProjects]);

  // Stable user name
  const userName = useMemo(() => {
    if (loading || !user) return 'Artist';
    return user.user_metadata?.name || user.email?.split('@')[0] || 'Artist';
  }, [user, loading]);

  // Prefetch critical routes on mount
  useEffect(() => {
    const criticalRoutes = ['/songwriting', '/create', '/projects'];
    criticalRoutes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  // Track dashboard view
  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('dashboard_viewed', {
        user_id: user.id,
        timestamp: Date.now(),
      });
    }
  }, [user]);

  if (loading && !user) {
    return <DashboardSkeleton />;
  }

  const storagePercent = dashboardStats
    ? getStoragePercentage(dashboardStats.storageUsed, dashboardStats.storageTotal)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Loading indicator for data refresh */}
        {(loading || statsLoading) && user && (
          <div
            className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-xl px-4 py-2"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Syncing
            </span>
          </div>
        )}

        {/* ==================== HEADER ==================== */}
        <header className="mb-10">
          <h1
            className="mb-2 text-4xl font-bold lg:text-5xl"
            style={{
              color: 'var(--text)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            Welcome back, {userName}
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted)' }}>
            Your creative workspace
          </p>
        </header>

        {/* ==================== QUICK STATS ==================== */}
        <section className="mb-10">
          {statsLoading && !dashboardStats ? (
            <StatsSkeleton />
          ) : dashboardStats ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={Folder}
                label="Projects"
                value={dashboardStats.projectCount}
                href="/projects"
              />
              <StatCard icon={Music2} label="Songs" value={dashboardStats.songCount} />
              <StatCard
                icon={HardDrive}
                label="Storage"
                value={`${storagePercent}%`}
                href="/settings/usage"
              />
              <StatCard icon={TrendingUp} label="This Week" value={dashboardStats.recentActivity} />
            </div>
          ) : null}
        </section>

        {/* ==================== PRIMARY ACTIONS ==================== */}
        <section className="mb-10">
          <h2
            className="mb-6 text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--muted)' }}
          >
            Start Creating
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PrimaryActionCard
              title="Songwriting Studio"
              description="Write lyrics, build chord progressions, and collaborate with AI-powered tools"
              icon={Music2}
              href="/songwriting"
              badge="AI"
            />
            <PrimaryActionCard
              title="Create Track"
              description="Generate full AI-powered tracks instantly. Describe your sound and get music in seconds"
              icon={FileMusic}
              href="/create"
            />
            <PrimaryActionCard
              title="New Project"
              description="Start an album, EP, or single. Collaborate with your band and track milestones"
              icon={Folder}
              href="/projects/new"
            />
          </div>
        </section>

        {/* ==================== RECENT + ACTIVITY (2 columns) ==================== */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: 'var(--muted)' }}
              >
                Recent Projects
              </h2>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {loadingProjects ? (
                <ProjectsSkeleton />
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <RecentProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl py-12 text-center"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Folder className="mb-4 h-12 w-12" style={{ color: 'var(--muted)' }} />
                  <p className="mb-4" style={{ color: 'var(--muted)' }}>
                    No projects yet
                  </p>
                  <Link
                    href="/projects/new"
                    className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'var(--muted)' }}
            >
              Recent Activity
            </h2>
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--muted)' }} />
                  </div>
                }
              >
                <SilentErrorBoundary
                  fallback={
                    <div className="py-8 text-center" style={{ color: 'var(--muted)' }}>
                      Activity feed temporarily unavailable
                    </div>
                  }
                >
                  <CompactActivityFeed
                    channelName="activity:global"
                    limit={8}
                    enabled={!!user && !loading}
                  />
                </SilentErrorBoundary>
              </Suspense>
            </div>
          </div>
        </section>

        {/* ==================== FEATURE TILES ==================== */}
        <section>
          <h2
            className="mb-6 text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--muted)' }}
          >
            Explore Features
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <FeatureTile title="Shows" icon={Calendar} href="/shows" description="Gig calendar" />
            <FeatureTile
              title="Setlists"
              icon={ListMusic}
              href="/setlists"
              description="Smart builder"
            />
            <FeatureTile title="Studio" icon={Mic2} href="/studio" description="Record & mix" />
            <FeatureTile title="Library" icon={Library} href="/library" description="Your assets" />
            <FeatureTile title="Explore" icon={Compass} href="/explore" description="Community" />
            <FeatureTile title="Tours" icon={TrendingUp} href="/tours" description="Management" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
