'use client';

import { motion } from 'framer-motion';
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
  Sparkles,
  Zap,
  Globe,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorBoundary } from '@/components/error-boundary';
import { getStoragePercentage, useDashboardData } from '@/hooks/use-dashboard-data';
import { useRequireAuth } from '@/hooks/use-require-auth';

// Project type for recent projects
type RecentProject = {
  id: string;
  name: string;
  slug: string;
  song_count: number;
};

// Animated background component
const AnimatedBackground = memo(() => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden">
    {/* Primary gradient orb */}
    <motion.div
      className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-3xl"
      style={{ background: 'rgba(255, 99, 71, 0.15)' }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.3, 0.2],
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Secondary gradient orb */}
    <motion.div
      className="absolute -right-40 top-1/3 h-[600px] w-[600px] rounded-full blur-3xl"
      style={{ background: 'rgba(255, 99, 71, 0.1)' }}
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.3, 0.1, 0.3],
        x: [0, -30, 0],
        y: [0, 50, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Accent orb */}
    <motion.div
      className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full blur-3xl"
      style={{ background: 'rgba(255, 99, 71, 0.08)' }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.1, 0.2, 0.1],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Grid pattern overlay */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 99, 71, 0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 99, 71, 0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
));
AnimatedBackground.displayName = 'AnimatedBackground';

// Premium stat card with glass morphism
const StatCard = memo(
  ({
    label,
    value,
    icon: Icon,
    href,
    delay = 0,
  }: {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    href?: string;
    delay?: number;
  }) => {
    const router = useRouter();

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (href) {
          e.preventDefault();
          router.push(href);
        }
      },
      [href, router]
    );

    const content = (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="card group relative cursor-pointer overflow-hidden p-5 transition-all duration-300"
      >
        {/* Top shine */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
          }}
        />

        <div className="relative flex items-center gap-4">
          <motion.div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg"
            style={{ background: 'var(--accent)' }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              {label}
            </p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        </div>
      </motion.div>
    );

    if (href) {
      return (
        <Link href={href} onClick={handleClick}>
          {content}
        </Link>
      );
    }
    return content;
  }
);
StatCard.displayName = 'StatCard';

// Premium primary action card
const PrimaryActionCard = memo(
  ({
    title,
    description,
    icon: Icon,
    href,
    badge,
    delay = 0,
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    href: string;
    badge?: string;
    delay?: number;
  }) => {
    const router = useRouter();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.push(href);
      },
      [href, router]
    );

    return (
      <Link href={href} onClick={handleClick}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay }}
          whileHover={{ scale: 1.02, y: -6 }}
          className="card group relative h-full cursor-pointer overflow-hidden p-6 transition-all duration-300"
        >
          {/* Shimmer effect on hover */}
          <div
            className="absolute inset-0 translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[100%]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,99,71,0.1), transparent)',
            }}
          />

          {/* Top shine */}
          <div
            className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
            }}
          />

          {badge && (
            <motion.span
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.3, type: 'spring' }}
              className="absolute right-4 top-4 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
              style={{ background: 'var(--accent)' }}
            >
              <Sparkles className="h-3 w-3" />
              {badge}
            </motion.span>
          )}

          <div className="relative">
            <motion.div
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: 'var(--accent)' }}
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Icon className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
            <p className="mb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
              {description}
            </p>
            <div
              className="flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-3"
              style={{ color: 'var(--accent)' }}
            >
              <span>Get Started</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }
);
PrimaryActionCard.displayName = 'PrimaryActionCard';

// Premium feature tile
const FeatureTile = memo(
  ({
    title,
    icon: Icon,
    href,
    description,
    delay = 0,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    href: string;
    description?: string;
    delay?: number;
  }) => {
    const router = useRouter();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.push(href);
      },
      [href, router]
    );

    return (
      <Link href={href} onClick={handleClick}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="card group flex h-full cursor-pointer flex-col items-center p-5 text-center transition-all duration-300"
        >
          <motion.div
            className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg"
            style={{ background: 'var(--accent)' }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>
          <h4 className="mb-1 font-semibold text-white">{title}</h4>
          {description && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {description}
            </p>
          )}
        </motion.div>
      </Link>
    );
  }
);
FeatureTile.displayName = 'FeatureTile';

// Recent project card with premium styling
const RecentProjectCard = memo(
  ({ project, delay = 0 }: { project: RecentProject; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link href={`/projects/${project.slug}`}>
        <motion.div
          whileHover={{ x: 8, scale: 1.01 }}
          className="card group flex cursor-pointer items-center gap-4 p-4 transition-all duration-200"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110"
            style={{ background: 'var(--accent)' }}
          >
            <Folder className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4
              className="truncate font-medium text-white transition-colors"
              style={{ color: 'var(--text)' }}
            >
              {project.name}
            </h4>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {project.song_count} {project.song_count === 1 ? 'song' : 'songs'}
            </p>
          </div>
          <ChevronRight
            className="h-5 w-5 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
            style={{ color: 'var(--accent)' }}
          />
        </motion.div>
      </Link>
    </motion.div>
  )
);
RecentProjectCard.displayName = 'RecentProjectCard';

// Loading skeleton with shimmer
const StatsSkeleton = memo(() => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card relative overflow-hidden p-5">
        <div className="animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl" style={{ background: 'var(--panel)' }} />
            <div>
              <div className="mb-2 h-4 w-16 rounded" style={{ background: 'var(--panel)' }} />
              <div className="h-8 w-12 rounded" style={{ background: 'var(--panel)' }} />
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,99,71,0.1), transparent)',
          }}
        />
      </div>
    ))}
  </div>
));
StatsSkeleton.displayName = 'StatsSkeleton';

const ActionsSkeleton = memo(() => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="card relative h-64 overflow-hidden">
        <div className="animate-pulse p-6">
          <div className="mb-5 h-16 w-16 rounded-2xl" style={{ background: 'var(--panel)' }} />
          <div className="mb-3 h-6 w-40 rounded" style={{ background: 'var(--panel)' }} />
          <div className="mb-2 h-4 w-full rounded" style={{ background: 'var(--panel)' }} />
          <div className="h-4 w-3/4 rounded" style={{ background: 'var(--panel)' }} />
        </div>
        <div
          className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,99,71,0.1), transparent)',
          }}
        />
      </div>
    ))}
  </div>
));
ActionsSkeleton.displayName = 'ActionsSkeleton';

const ProjectsSkeleton = memo(() => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card relative overflow-hidden p-4">
        <div className="flex animate-pulse items-center gap-4">
          <div className="h-12 w-12 rounded-xl" style={{ background: 'var(--panel)' }} />
          <div className="flex-1">
            <div className="mb-2 h-4 w-32 rounded" style={{ background: 'var(--panel)' }} />
            <div className="h-3 w-20 rounded" style={{ background: 'var(--panel)' }} />
          </div>
        </div>
      </div>
    ))}
  </div>
));
ProjectsSkeleton.displayName = 'ProjectsSkeleton';

// Full page skeleton
const DashboardSkeleton = () => (
  <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
    <AnimatedBackground />
    <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 animate-pulse">
        <div className="mb-3 h-14 w-96 rounded-lg" style={{ background: 'var(--panel)' }} />
        <div className="h-6 w-48 rounded-lg" style={{ background: 'var(--panel)' }} />
      </div>
      <div className="mb-10">
        <StatsSkeleton />
      </div>
      <div className="mb-6 h-5 w-32 rounded" style={{ background: 'var(--panel)' }} />
      <ActionsSkeleton />
    </div>
  </div>
);

function DashboardContent() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user && !loading) {
      const profileCompleted = (session.user as { profileCompleted?: boolean }).profileCompleted;
      if (profileCompleted === false) {
        router.push('/settings/profile?setup=true');
      }
    }
  }, [session, loading, router]);

  const { data: dashboardStats, loading: statsLoading } = useDashboardData({
    refreshInterval: 60000,
    enabled: isMounted && !!user && !loading && status === 'authenticated',
  });

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setRecentProjects(data.slice(0, 4));
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    if (user && !loading && status === 'authenticated') {
      loadProjects();
    }
  }, [user, loading, status, loadProjects]);

  const userName = useMemo(() => {
    if (loading || !user) return 'Artist';
    return user.user_metadata?.name || user.email?.split('@')[0] || 'Artist';
  }, [user, loading]);

  useEffect(() => {
    const criticalRoutes = ['/songwriting', '/create', '/projects'];
    criticalRoutes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  useEffect(() => {
    if (user && isMounted && typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('dashboard_viewed', {
        user_id: user.id,
        timestamp: Date.now(),
      });
    }
  }, [user, isMounted]);

  if (!isMounted || loading || status === 'loading' || !user) {
    return <DashboardSkeleton />;
  }

  const storagePercent = dashboardStats
    ? getStoragePercentage(dashboardStats.storageUsed, dashboardStats.storageTotal)
    : 0;

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {/* Loading indicator */}
        {(loading || statsLoading) && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}
          >
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              Syncing
            </span>
          </motion.div>
        )}

        {/* ==================== HERO HEADER ==================== */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="card relative mb-12 overflow-hidden p-8 md:p-10"
        >
          {/* Background gradient accent */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 99, 71, 0.05), transparent, rgba(255, 99, 71, 0.05))',
            }}
          />

          {/* Animated accent line */}
          <motion.div
            className="absolute bottom-0 left-0 h-1"
            style={{ background: 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-2 flex items-center gap-2"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--accent)' }}
                >
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span
                  className="text-sm font-medium uppercase tracking-widest"
                  style={{ color: 'var(--accent)' }}
                >
                  Your Creative Hub
                </span>
              </motion.div>
              <h1 className="mb-2 text-4xl font-bold lg:text-5xl" style={{ color: 'var(--text)' }}>
                Welcome back, {userName}
              </h1>
              <p className="text-lg" style={{ color: 'var(--muted)' }}>
                Ready to create something amazing today?
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="button group relative overflow-hidden px-6 py-3 font-bold shadow-lg"
                >
                  <div
                    className="absolute inset-0 translate-x-[-100%] transition-transform duration-500 group-hover:translate-x-[100%]"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                  />
                  <span className="relative flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Quick Create
                    <Sparkles className="h-4 w-4" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.header>

        {/* ==================== QUICK STATS ==================== */}
        <section className="mb-12">
          {statsLoading && !dashboardStats ? (
            <StatsSkeleton />
          ) : dashboardStats ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={Folder}
                label="Projects"
                value={dashboardStats.projectCount}
                href="/projects"
                delay={0.1}
              />
              <StatCard icon={Music2} label="Songs" value={dashboardStats.songCount} delay={0.2} />
              <StatCard
                icon={HardDrive}
                label="Storage"
                value={`${storagePercent}%`}
                href="/settings/usage"
                delay={0.3}
              />
              <StatCard
                icon={Activity}
                label="This Week"
                value={dashboardStats.recentActivity}
                delay={0.4}
              />
            </div>
          ) : null}
        </section>

        {/* ==================== PRIMARY ACTIONS ==================== */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="h-1 w-8 rounded-full" style={{ background: 'var(--accent)' }} />
            <h2
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'var(--muted)' }}
            >
              Start Creating
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PrimaryActionCard
              title="Songwriting Studio"
              description="Write lyrics, build chord progressions, and collaborate with AI-powered tools"
              icon={Music2}
              href="/songwriting"
              badge="AI"
              delay={0.6}
            />
            <PrimaryActionCard
              title="Create Track"
              description="Generate full AI-powered tracks instantly. Describe your sound and get music in seconds"
              icon={FileMusic}
              href="/create"
              delay={0.7}
            />
            <PrimaryActionCard
              title="New Project"
              description="Start an album, EP, or single. Collaborate with your band and track milestones"
              icon={Folder}
              href="/projects/new"
              delay={0.8}
            />
          </div>
        </section>

        {/* ==================== RECENT + ACTIVITY ==================== */}
        <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-1 w-6 rounded-full" style={{ background: 'var(--accent)' }} />
                <h2
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Recent Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-sm font-medium transition-colors"
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
                recentProjects.map((project, i) => (
                  <RecentProjectCard key={project.id} project={project} delay={0.9 + i * 0.1} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card flex flex-col items-center justify-center py-12 text-center"
                >
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: 'rgba(255, 99, 71, 0.1)' }}
                  >
                    <Folder className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                  </div>
                  <p className="mb-4" style={{ color: 'var(--muted)' }}>
                    No projects yet
                  </p>
                  <Link href="/projects/new" className="button flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Project
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-1 w-6 rounded-full" style={{ background: 'var(--accent)' }} />
              <h2
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: 'var(--muted)' }}
              >
                Recent Activity
              </h2>
            </div>
            <div className="card p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: 'rgba(255, 99, 71, 0.1)' }}
                >
                  <Activity className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                </motion.div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Activity feed syncing...
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)', opacity: 0.6 }}>
                  Real-time updates coming soon
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ==================== FEATURE TILES ==================== */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="h-1 w-8 rounded-full" style={{ background: 'var(--accent)' }} />
            <h2
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'var(--muted)' }}
            >
              Explore Features
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <FeatureTile
              title="Shows"
              icon={Calendar}
              href="/shows"
              description="Gig calendar"
              delay={1.2}
            />
            <FeatureTile
              title="Setlists"
              icon={ListMusic}
              href="/setlists"
              description="Smart builder"
              delay={1.25}
            />
            <FeatureTile
              title="Studio"
              icon={Mic2}
              href="/studio"
              description="Record & mix"
              delay={1.3}
            />
            <FeatureTile
              title="Library"
              icon={Library}
              href="/library"
              description="Your assets"
              delay={1.35}
            />
            <FeatureTile
              title="Explore"
              icon={Compass}
              href="/explore"
              description="Community"
              delay={1.4}
            />
            <FeatureTile
              title="Tours"
              icon={Globe}
              href="/tours"
              description="Management"
              delay={1.45}
            />
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
