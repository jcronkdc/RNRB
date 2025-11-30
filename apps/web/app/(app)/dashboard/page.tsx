'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Compass,
  FlaskConical,
  Folder,
  FolderPlus,
  HardDrive,
  Library,
  ListMusic,
  Loader2,
  Mic2,
  Music,
  Music2,
  Plus,
  Sparkles,
  Zap,
  Globe,
  Activity,
} from 'lucide-react';
import Image from 'next/image';
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

// Song type for recent songs
type RecentSong = {
  id: string;
  title: string;
  status: 'draft' | 'in_progress' | 'needs_review' | 'complete';
  projectId?: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
  };
};

// Subtle ambient background - calmer than landing page, focused workspace
const AmbientBackground = memo(() => <div className="app-ambient" />);
AmbientBackground.displayName = 'AmbientBackground';

// Clean stat card - calmer than landing page
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
    const content = (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="app-stat-card group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--accent)' }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="app-stat-label">{label}</p>
            <p className="app-stat-value">{value}</p>
          </div>
        </div>
      </motion.div>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }
    return content;
  }
);
StatCard.displayName = 'StatCard';

// Clean primary action card - calmer workspace aesthetic
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
    return (
      <Link href={href} className="app-quick-action group relative h-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay }}
        >
          {badge && (
            <span
              className="absolute right-4 top-4 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
              style={{ background: 'var(--accent)' }}
            >
              <Sparkles className="h-3 w-3" />
              {badge}
            </span>
          )}

          <div className="app-icon">
            <Icon />
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
          <div
            className="mt-3 flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            <span>Get Started</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.div>
      </Link>
    );
  }
);
PrimaryActionCard.displayName = 'PrimaryActionCard';

// Clean feature tile - calm workspace navigation
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
    return (
      <Link href={href} className="app-feature-tile">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay }}
        >
          <div className="icon">
            <Icon />
          </div>
          <h4>{title}</h4>
          {description && <span>{description}</span>}
        </motion.div>
      </Link>
    );
  }
);
FeatureTile.displayName = 'FeatureTile';

// Clean recent project card
const RecentProjectCard = memo(
  ({ project, delay = 0 }: { project: RecentProject; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link href={`/projects/${project.slug}`} className="app-list-item group">
        <div className="app-list-icon">
          <Folder />
        </div>
        <div className="app-list-content">
          <div className="app-list-title">{project.name}</div>
          <div className="app-list-meta">
            {project.song_count} {project.song_count === 1 ? 'song' : 'songs'}
          </div>
        </div>
        <ChevronRight
          className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: 'var(--muted)' }}
        />
      </Link>
    </motion.div>
  )
);
RecentProjectCard.displayName = 'RecentProjectCard';

// Clean recent song card
const RecentSongCard = memo(({ song, delay = 0 }: { song: RecentSong; delay?: number }) => {
  const statusColors: Record<string, string> = {
    draft: '#9ca3af',
    in_progress: '#60a5fa',
    needs_review: '#fbbf24',
    complete: '#4ade80',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        href={
          song.project
            ? `/projects/${song.project.slug}/songs/${song.id}`
            : `/songwriting?song=${song.id}`
        }
        className="app-list-item group"
      >
        <div className="app-list-icon">
          <Music />
        </div>
        <div className="app-list-content">
          <div className="app-list-title">{song.title}</div>
          <div className="app-list-meta flex items-center gap-2">
            <span style={{ color: statusColors[song.status] }}>
              {song.status.replace('_', ' ')}
            </span>
            {song.project && (
              <>
                <span>•</span>
                <span className="truncate">{song.project.name}</span>
              </>
            )}
          </div>
        </div>
        {!song.project && (
          <Link
            href="/songs"
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
            style={{ background: 'rgba(255, 99, 71, 0.1)', color: 'var(--accent)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <FolderPlus className="h-3 w-3" />
            Add
          </Link>
        )}
        <ChevronRight
          className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: 'var(--muted)' }}
        />
      </Link>
    </motion.div>
  );
});
RecentSongCard.displayName = 'RecentSongCard';

// Loading skeleton for songs
const SongsSkeleton = memo(() => (
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
SongsSkeleton.displayName = 'SongsSkeleton';

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

// Full page skeleton - clean, minimal
const DashboardSkeleton = () => (
  <div className="app-workspace relative">
    <AmbientBackground />
    <div className="relative z-10 mx-auto max-w-7xl px-6 py-6">
      <div className="mb-8 animate-pulse">
        <div className="mb-3 h-10 w-64 rounded-lg" style={{ background: 'var(--panel)' }} />
        <div className="h-5 w-40 rounded-lg" style={{ background: 'var(--panel)' }} />
      </div>
      <div className="mb-8">
        <StatsSkeleton />
      </div>
      <div className="mb-5 h-4 w-28 rounded" style={{ background: 'var(--panel)' }} />
      <ActionsSkeleton />
    </div>
  </div>
);

function DashboardContent() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);
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

  const loadSongs = useCallback(async () => {
    setLoadingSongs(true);
    try {
      const response = await fetch('/api/songs/all?limit=5&sortBy=updatedAt&sortOrder=desc');
      if (response.ok) {
        const data = await response.json();
        setRecentSongs(data.songs || []);
      }
    } catch (err) {
      console.error('Error loading songs:', err);
    } finally {
      setLoadingSongs(false);
    }
  }, []);

  useEffect(() => {
    if (user && !loading && status === 'authenticated') {
      loadProjects();
      loadSongs();
    }
  }, [user, loading, status, loadProjects, loadSongs]);

  const userName = useMemo(() => {
    if (loading || !user) return 'Artist';
    return user.name || user.email?.split('@')[0] || 'Artist';
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
    <div className="app-workspace relative">
      {/* Subtle ambient background - calmer workspace */}
      <AmbientBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6">
        {/* Clean logo header - per memory [[memory:11700420]] */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-col items-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={57}
              priority
              className="transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </motion.div>
        {/* Loading indicator - subtle */}
        {(loading || statsLoading) && user && (
          <div
            className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}
          >
            <Loader2 className="h-3 w-3 animate-spin" style={{ color: 'var(--muted)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Syncing
            </span>
          </div>
        )}

        {/* ==================== WELCOME HEADER - Clean & Calm ==================== */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="app-welcome mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold md:text-3xl" style={{ color: 'var(--text)' }}>
                Welcome back, {userName}
              </h1>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Ready to create something amazing?</p>
            </div>
            <Link href="/songwriting">
              <button className="button flex items-center gap-2 px-5 py-2.5">
                <Plus className="h-4 w-4" />
                New Song
              </button>
            </Link>
          </div>
        </motion.header>

        {/* ==================== QUICK STATS - Clean Grid ==================== */}
        <section className="mb-8">
          {statsLoading && !dashboardStats ? (
            <StatsSkeleton />
          ) : dashboardStats ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                icon={Folder}
                label="Projects"
                value={dashboardStats.projectCount}
                href="/projects"
                delay={0.05}
              />
              <StatCard icon={Music2} label="Songs" value={dashboardStats.songCount} delay={0.1} />
              <StatCard
                icon={HardDrive}
                label="Storage"
                value={`${storagePercent}%`}
                href="/settings/usage"
                delay={0.15}
              />
              <StatCard
                icon={Activity}
                label="This Week"
                value={dashboardStats.recentActivity}
                delay={0.2}
              />
            </div>
          ) : null}
        </section>

        {/* ==================== PRIMARY ACTIONS - Clean Cards ==================== */}
        <section className="mb-8">
          <div className="app-section-header">
            <h2>Start Creating</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PrimaryActionCard
              title="Songwriting Studio"
              description="Write lyrics, build chord progressions, and collaborate with AI-powered tools"
              icon={Music2}
              href="/songwriting"
              badge="AI"
              delay={0.25}
            />
            <PrimaryActionCard
              title="AI Sketches"
              description="Generate 5-30 second clips for inspiration. Great for loops, ideas, and getting unstuck"
              icon={Sparkles}
              href="/create"
              badge="BETA"
              delay={0.3}
            />
            <PrimaryActionCard
              title="New Project"
              description="Start an album, EP, or single. Collaborate with your band and track milestones"
              icon={Folder}
              href="/projects/new"
              delay={0.35}
            />
          </div>
        </section>

        {/* ==================== FEATURE PROMOS - Clean Promo Cards ==================== */}
        <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* R&R Labs Promo */}
          <Link href="/labs" className="app-promo-card purple">
            <div className="app-promo-icon purple">
              <FlaskConical />
            </div>
            <div className="app-promo-content flex-1">
              <div className="flex items-center gap-2">
                <h3>R&R Labs</h3>
                <span className="app-promo-badge purple">NEW</span>
              </div>
              <p>Help build the future of AI music</p>
            </div>
            <ArrowRight className="h-5 w-5" style={{ color: 'var(--muted)' }} />
          </Link>

          {/* Musician's Toolbox Promo */}
          <Link href="/tools" className="app-promo-card emerald">
            <div className="app-promo-icon emerald">
              <Zap />
            </div>
            <div className="app-promo-content flex-1">
              <div className="flex items-center gap-2">
                <h3>Musician's Toolbox</h3>
                <span className="app-promo-badge emerald">12 TOOLS</span>
              </div>
              <p>Tuner, click track, performer mode & more</p>
            </div>
            <ArrowRight className="h-5 w-5" style={{ color: 'var(--muted)' }} />
          </Link>
        </div>

        {/* ==================== RECENT PROJECTS + SONGS - Clean Lists ==================== */}
        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="app-section-header" style={{ marginBottom: 0 }}>
                <h2 style={{ fontSize: '0.875rem' }}>Recent Projects</h2>
              </div>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--accent)' }}
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {loadingProjects ? (
                <ProjectsSkeleton />
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project, i) => (
                  <RecentProjectCard key={project.id} project={project} delay={0.4 + i * 0.05} />
                ))
              ) : (
                <div className="app-empty-state">
                  <div
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255, 99, 71, 0.1)' }}
                  >
                    <Folder className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <p>No projects yet</p>
                  <Link href="/projects/new" className="button flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Songs */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="app-section-header" style={{ marginBottom: 0 }}>
                <h2 style={{ fontSize: '0.875rem' }}>Recent Songs</h2>
              </div>
              <Link
                href="/songs"
                className="flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--accent)' }}
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {loadingSongs ? (
                <SongsSkeleton />
              ) : recentSongs.length > 0 ? (
                recentSongs.map((song, i) => (
                  <RecentSongCard key={song.id} song={song} delay={0.45 + i * 0.05} />
                ))
              ) : (
                <div className="app-empty-state">
                  <div
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255, 99, 71, 0.1)' }}
                  >
                    <Music className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <p>No songs yet</p>
                  <Link href="/songwriting" className="button flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Write a Song
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==================== FEATURE TILES - Clean Grid ==================== */}
        <section>
          <div className="app-section-header">
            <h2>Explore Features</h2>
          </div>
          <div className="app-feature-grid">
            <FeatureTile
              title="My Songs"
              icon={Music}
              href="/songs"
              description="All your songs"
              delay={0.5}
            />
            <FeatureTile
              title="Shows"
              icon={Calendar}
              href="/shows"
              description="Gig calendar"
              delay={0.52}
            />
            <FeatureTile
              title="Setlists"
              icon={ListMusic}
              href="/setlists"
              description="Smart builder"
              delay={0.54}
            />
            <FeatureTile
              title="Studio"
              icon={Mic2}
              href="/studio"
              description="Record & mix"
              delay={0.56}
            />
            <FeatureTile
              title="Library"
              icon={Library}
              href="/library"
              description="Your assets"
              delay={0.58}
            />
            <FeatureTile
              title="Explore"
              icon={Compass}
              href="/explore"
              description="Community"
              delay={0.6}
            />
            <FeatureTile
              title="Tours"
              icon={Globe}
              href="/tours"
              description="Management"
              delay={0.62}
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
