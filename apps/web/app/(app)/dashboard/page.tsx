'use client';

import { Music2, Folder, FileMusic, Compass, Play, Share2, ListMusic, Radio, Calendar, Lock, Loader2, TrendingUp, Clock, Zap, HardDrive, Users, FolderOpen } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, memo, Suspense, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { ErrorBoundary, SilentErrorBoundary } from '@/components/error-boundary';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { useDashboardData, formatStorageSize, getStoragePercentage } from '@/hooks/use-dashboard-data';
import { FeatureTooltip } from '@/components/feature-tooltip';

// Dynamically import activity feed with loading fallback
const CompactActivityFeed = dynamic(
  () => import('@/components/activity-feed').then((m) => m.CompactActivityFeed),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    )
  }
);

// Dynamically import upgrade modal
const UpgradeModal = dynamic(
  () => import('@/components/upgrade-modal').then((m) => m.UpgradeModal),
  { ssr: false }
);

import { useUpgradeModal } from '@/components/upgrade-modal';

// Quick action interface for type safety
interface QuickAction {
  title: string;
  description: string;
  tooltip?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  gradient?: string;
  prefetch?: boolean;
}

// Quick guide interface
interface QuickGuide {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  prefetch?: boolean;
}

// Premium tool interface
interface PremiumTool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  feature: string;
}

// Memoized action card component to prevent re-renders
const ActionCard = memo(({ action }: { action: QuickAction }) => (
  <FeatureTooltip
    title={action.title}
    description={action.tooltip || action.description}
    icon={<action.icon className="h-4 w-4 text-orange-500" />}
    placement="top"
  >
    <Link key={action.href} href={action.href} prefetch={action.prefetch !== false}>
      <div className={`group h-full rounded-xl border border-zinc-800/50 p-6 transition-all hover:scale-[1.02] hover:border-zinc-700 ${action.gradient || 'bg-gradient-to-br from-zinc-900/50 to-zinc-900/30'} backdrop-blur-sm`}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-lg">
          <action.icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">
          {action.title}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-400">
          {action.description}
        </p>
      </div>
    </Link>
  </FeatureTooltip>
));
ActionCard.displayName = 'ActionCard';

// Memoized guide card component
const GuideCard = memo(({ guide }: { guide: QuickGuide }) => (
  <Link key={guide.href} href={guide.href} prefetch={guide.prefetch !== false}>
    <div className="group flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/50">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900">
        <guide.icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white">{guide.title}</h3>
        <p className="text-sm text-zinc-400">{guide.description}</p>
      </div>
    </div>
  </Link>
));
GuideCard.displayName = 'GuideCard';

// Memoized premium tool card component
const PremiumToolCard = memo(({ 
  tool, 
  onUpgrade 
}: { 
  tool: PremiumTool;
  onUpgrade: (feature: string) => void;
}) => (
  <button
    onClick={() => onUpgrade(tool.feature)}
    className="group relative h-full rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6 text-left backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/50"
  >
    <div className="absolute right-3 top-3 rounded-lg bg-zinc-800/80 p-1.5 backdrop-blur-sm">
      <Lock className="h-3.5 w-3.5 text-zinc-400" />
    </div>

    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900">
      <tool.icon className="h-7 w-7 text-white" />
    </div>

    <h3 className="mb-2 text-lg font-semibold text-white">
      {tool.title}
    </h3>
    <p className="mb-4 text-sm text-zinc-400">
      {tool.description}
    </p>

    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
      <Zap className="h-3 w-3" />
      <span>Click to unlock</span>
    </div>
  </button>
));
PremiumToolCard.displayName = 'PremiumToolCard';

// Stats card component
const StatsCard = memo(({ 
  icon: Icon, 
  label, 
  value, 
  color = 'blue' 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) => {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3 backdrop-blur-sm">
      <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
      <div className="flex-1">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
});
StatsCard.displayName = 'StatsCard';

// Loading skeleton component
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-zinc-950">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 animate-pulse border-b border-zinc-800 pb-8">
        <div className="mb-2 h-12 w-2/3 rounded bg-zinc-800"></div>
        <div className="h-6 w-1/3 rounded bg-zinc-800"></div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-800"></div>
        ))}
      </div>
    </div>
  </div>
);

function DashboardContent() {
  const { user, loading } = useRequireAuth();
  const { isOpen, showUpgradeModal, hideUpgradeModal, modalProps } = useUpgradeModal();
  const router = useRouter();
  
  // Performance monitoring
  usePerformanceMonitor('dashboard');
  
  // Dashboard data with caching
  const { data: dashboardStats, loading: statsLoading } = useDashboardData({
    refreshInterval: 60000, // Refresh every minute
    enabled: !!user && !loading,
  });

  // Stable user name (no loading flicker)
  const userName = useMemo(() => {
    if (loading || !user) return 'Artist';
    return user.user_metadata?.name || user.email?.split('@')[0] || 'Artist';
  }, [user, loading]);

  // Memoized upgrade handler
  const handleUpgrade = useCallback((feature: string) => {
    showUpgradeModal({
      feature,
      requiredTier: 'creator',
    });
  }, [showUpgradeModal]);

  // Memoized action items with prefetch enabled for common paths
  const quickActions: QuickAction[] = useMemo(() => [
    {
      title: 'Songwriting Studio',
      description: 'AI-powered chord progressions & lyrics',
      tooltip: 'Write songs manually with AI assistance. Perfect for crafting lyrics, building chord progressions, and collaborating in real-time with your band.',
      icon: Music2,
      href: '/songwriting',
      gradient: 'bg-gradient-to-br from-purple-900/30 to-zinc-900/30',
      prefetch: true,
    },
    {
      title: 'Create Track',
      description: 'Generate full songs with AI',
      tooltip: 'Generate complete AI music tracks instantly. Just describe your sound (genre, mood, instruments) and get a finished audio file in 30 seconds.',
      icon: FileMusic,
      href: '/create',
      gradient: 'bg-gradient-to-br from-blue-900/30 to-zinc-900/30',
      prefetch: true,
    },
    {
      title: 'New Project',
      description: 'Start an album or EP',
      tooltip: 'Organize songs into albums, EPs, or collections. Collaborate with band members, track milestones, and manage your entire release from one place.',
      icon: Folder,
      href: '/projects/new',
      gradient: 'bg-gradient-to-br from-green-900/30 to-zinc-900/30',
      prefetch: true,
    },
    {
      title: 'My Library',
      description: 'View your music assets',
      tooltip: 'Store and manage audio files (stems, demos, samples, loops). Think of it as Dropbox for your music assets - upload once, use everywhere.',
      icon: Music2,
      href: '/library',
      gradient: 'bg-gradient-to-br from-orange-900/30 to-zinc-900/30',
      prefetch: false,
    },
    {
      title: 'Explore Community',
      description: 'Discover tracks & musicians',
      tooltip: 'Browse trending music from the community. Find inspiration, discover new artists, and engage with tracks through likes and comments.',
      icon: Compass,
      href: '/explore',
      gradient: 'bg-gradient-to-br from-pink-900/30 to-zinc-900/30',
      prefetch: false,
    },
  ], []);

  // Memoized guide items
  const quickGuides: QuickGuide[] = useMemo(() => [
    {
      title: 'Create Your First Track',
      description: 'Use AI to generate music',
      icon: Play,
      href: '/create',
      prefetch: true,
    },
    {
      title: 'Start Collaborating',
      description: 'Invite your band members',
      icon: Share2,
      href: '/projects',
      prefetch: true,
    },
    {
      title: 'Explore Features',
      description: 'Tour the platform',
      icon: Compass,
      href: '/explore',
      prefetch: false,
    },
  ], []);

  // Memoized premium tools
  const premiumTools: PremiumTool[] = useMemo(() => [
    {
      title: 'Smart Setlists',
      description: 'AI-powered setlist generation',
      icon: ListMusic,
      feature: 'setlistManagement',
    },
    {
      title: 'Tour Management',
      description: 'Track shows & venues',
      icon: Radio,
      feature: 'toursAndGigs',
    },
    {
      title: 'Gig Calendar',
      description: 'Schedule & logistics',
      icon: Calendar,
      feature: 'toursAndGigs',
    },
  ], []);

  // Prefetch critical routes on mount
  useEffect(() => {
    const criticalRoutes = ['/songwriting', '/create', '/projects'];
    criticalRoutes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  // Track dashboard view
  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('dashboard_viewed', {
        user_id: user.id,
        user_email: user.email,
        timestamp: Date.now(),
      });
    }
  }, [user]);

  // Show skeleton while loading
  if (loading && !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Loading indicator (for data refreshes) */}
        {(loading || statsLoading) && user && (
          <div className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/95 px-3 py-2 text-xs text-zinc-400 shadow-xl backdrop-blur-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="font-mono uppercase tracking-wider">Syncing</span>
          </div>
        )}

        {/* Enhanced Header with Stats */}
        <div className="mb-12 border-b border-zinc-800/50 pb-8">
          <div className="mb-6">
            <h1 className="mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
              Welcome back, {userName}
            </h1>
            <p className="text-lg text-zinc-400">Your creative workspace</p>
          </div>
          
          {/* Dashboard Stats Grid */}
          {dashboardStats && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              <StatsCard
                icon={FolderOpen}
                label="Projects"
                value={dashboardStats.projectCount}
                color="purple"
              />
              <StatsCard
                icon={Music2}
                label="Songs"
                value={dashboardStats.songCount}
                color="blue"
              />
              <StatsCard
                icon={Users}
                label="Collaborators"
                value={dashboardStats.collaboratorCount}
                color="green"
              />
              <StatsCard
                icon={TrendingUp}
                label="Activity"
                value={dashboardStats.recentActivity}
                color="orange"
              />
              <StatsCard
                icon={HardDrive}
                label="Storage"
                value={`${getStoragePercentage(dashboardStats.storageUsed, dashboardStats.storageTotal)}%`}
                color="blue"
              />
              <StatsCard
                icon={Clock}
                label="Status"
                value="Online"
                color="green"
              />
            </div>
          )}
        </div>

        {/* Quick Actions with improved design */}
        <div className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-zinc-400">
            <Zap className="h-4 w-4" />
            Start Creating
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <ActionCard key={action.href} action={action} />
            ))}
          </div>
        </div>

        {/* Getting Started Guides with improved design */}
        <div className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-zinc-400">
            <Play className="h-4 w-4" />
            Quick Start Guides
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {quickGuides.map((guide) => (
              <GuideCard key={guide.href} guide={guide} />
            ))}
          </div>
        </div>

        {/* Premium Tools with improved design */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-zinc-400">
              <Lock className="h-4 w-4" />
              Premium Tools
            </h2>
            <span className="rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1 font-mono text-xs uppercase tracking-wider text-orange-400 ring-1 ring-orange-500/30">
              Upgrade to Unlock
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {premiumTools.map((tool) => (
              <PremiumToolCard key={tool.title} tool={tool} onUpgrade={handleUpgrade} />
            ))}
          </div>
        </div>

        {/* Recent Activity with Suspense and Error Boundary */}
        {user && !loading && (
          <div>
            <h2 className="mb-6 flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-zinc-400">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </h2>
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur-sm">
              <SilentErrorBoundary 
                fallback={
                  <div className="py-8 text-center text-sm text-zinc-500">
                    Activity feed temporarily unavailable
                  </div>
                }
              >
                <Suspense 
                  fallback={
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                    </div>
                  }
                >
                  <CompactActivityFeed channelName="activity:global" limit={10} />
                </Suspense>
              </SilentErrorBoundary>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {isOpen && <UpgradeModal isOpen={isOpen} onClose={hideUpgradeModal} {...modalProps} />}
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
