'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Users,
  Award,
  Calendar,
  Flame,
  Target,
  Heart,
  MessageCircle,
  Play,
  Share2,
  MoreHorizontal,
  ChevronRight,
  Loader2,
  Zap,
  Star,
  TrendingUp,
  Globe,
  Mic2,
  Guitar,
  Radio,
  Sparkles,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { microCopy } from '@/lib/workshop-voice';

// Activity type icons
const activityIcons: Record<string, any> = {
  song_created: Music,
  song_completed: Award,
  song_version: Music,
  project_started: Sparkles,
  project_milestone: Target,
  project_completed: Award,
  collaboration_started: Users,
  collaboration_need_posted: Users,
  practice_streak: Flame,
  show_announced: Calendar,
  show_completed: Mic2,
  tour_announced: Globe,
  gear_acquired: Guitar,
  recording_completed: Radio,
  follow: Heart,
  opportunity_posted: Star,
  default: Zap,
};

// Activity type colors
const activityColors: Record<string, string> = {
  song_created: 'from-pink-500 to-rose-600',
  song_completed: 'from-emerald-500 to-green-600',
  song_version: 'from-purple-500 to-violet-600',
  project_started: 'from-blue-500 to-indigo-600',
  project_milestone: 'from-orange-500 to-amber-600',
  project_completed: 'from-emerald-500 to-green-600',
  collaboration_started: 'from-cyan-500 to-blue-600',
  collaboration_need_posted: 'from-blue-500 to-indigo-600',
  practice_streak: 'from-orange-500 to-red-600',
  show_announced: 'from-violet-500 to-purple-600',
  show_completed: 'from-pink-500 to-rose-600',
  tour_announced: 'from-indigo-500 to-blue-600',
  gear_acquired: 'from-yellow-500 to-amber-600',
  recording_completed: 'from-red-500 to-rose-600',
  follow: 'from-pink-500 to-rose-600',
  opportunity_posted: 'from-green-500 to-emerald-600',
  default: 'from-orange-500 to-red-600',
};

function ActivityCard({ activity, onCelebrate }: { activity: any; onCelebrate: () => void }) {
  const Icon = activityIcons[activity.type] || activityIcons.default;
  const color = activityColors[activity.type] || activityColors.default;
  const [showReactions, setShowReactions] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const handleCelebrate = async () => {
    if (hasCelebrated) return;
    setHasCelebrated(true);
    onCelebrate();

    try {
      await fetch(`/api/ecosystem/activities/${activity.id}/celebrate`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error celebrating:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 backdrop-blur-sm transition-all"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        {/* User Avatar */}
        <Link href={`/u/${activity.user?.id}`} className="shrink-0">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-pink-600">
            {activity.user?.image ? (
              <Image
                src={activity.user.image}
                alt={activity.user.name || ''}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {(activity.user?.name || 'U')[0]}
              </div>
            )}
            {/* Activity type badge */}
            <div
              className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${color} ring-2 ring-zinc-900`}
            >
              <Icon className="h-3 w-3 text-white" />
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link href={`/u/${activity.user?.id}`}>
                <span className="font-semibold text-white hover:text-orange-400">
                  {activity.user?.name || 'Anonymous'}
                </span>
              </Link>
              <p className="mt-0.5 text-sm text-white/70">{activity.title}</p>
            </div>
            <span className="shrink-0 text-xs text-white/40">{activity.timeAgo}</span>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="mt-2 text-sm text-white/60">{activity.description}</p>
          )}

          {/* Related content preview */}
          {(activity.song || activity.project || activity.show) && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              {activity.song && (
                <Link
                  href={`/songs/${activity.song.id}`}
                  className="flex items-center gap-2 text-sm text-white hover:text-orange-400"
                >
                  <Music className="h-4 w-4" />
                  {activity.song.title}
                  <ChevronRight className="ml-auto h-3 w-3" />
                </Link>
              )}
              {activity.project && (
                <Link
                  href={`/projects/${activity.project.slug}`}
                  className="flex items-center gap-2 text-sm text-white hover:text-orange-400"
                >
                  <Sparkles className="h-4 w-4" />
                  {activity.project.name}
                  <ChevronRight className="ml-auto h-3 w-3" />
                </Link>
              )}
              {activity.show && (
                <Link
                  href={`/shows/${activity.show.slug}`}
                  className="flex items-center gap-2 text-sm text-white hover:text-orange-400"
                >
                  <Calendar className="h-4 w-4" />
                  {activity.show.name}
                  <ChevronRight className="ml-auto h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCelebrate}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${
              hasCelebrated || activity.celebrationCount > 0
                ? 'bg-orange-500/20 text-orange-400'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            style={{
              color: hasCelebrated || activity.celebrationCount > 0 ? undefined : 'var(--muted)',
            }}
          >
            <Sparkles className="h-4 w-4" />
            <span>{activity.celebrationCount + (hasCelebrated ? 1 : 0)}</span>
          </motion.button>

          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <MessageCircle className="h-4 w-4" />
          </button>

          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <button className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Trending sidebar component
function TrendingSidebar({ trending }: { trending: any }) {
  return (
    <div className="space-y-4">
      {/* Trending Tags */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          Trending
        </h3>
        <div className="space-y-3">
          {trending.tags?.length > 0 ? (
            trending.tags.map((tag: string, i: number) => (
              <Link
                key={tag}
                href={`/explore?tag=${tag}`}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <span className="text-sm text-white">#{tag}</span>
                <span className="text-xs text-white/40">{trending.counts?.[i] || 0}</span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-white/40">No trending tags yet</p>
          )}
        </div>
      </div>

      {/* Suggested Musicians */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <Users className="h-5 w-5 text-purple-400" />
          Connect
        </h3>
        <div className="space-y-3">
          {trending.musicians?.length > 0 ? (
            trending.musicians.slice(0, 3).map((musician: any) => (
              <Link
                key={musician.id}
                href={`/u/${musician.id}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  {musician.image ? (
                    <Image
                      src={musician.image}
                      alt={musician.name || ''}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {(musician.name || 'U')[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{musician.name}</p>
                  <p className="truncate text-xs text-white/50">
                    {musician.instruments?.slice(0, 2).join(', ') || 'Musician'}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-white/40">No suggestions yet</p>
          )}
        </div>
        <Link
          href="/discover"
          className="mt-3 block text-center text-sm text-orange-400 hover:text-orange-300"
        >
          Find more musicians →
        </Link>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [trending, setTrending] = useState<any>({ tags: [], musicians: [], counts: [] });
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadActivities = useCallback(async (offset = 0) => {
    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/ecosystem/activities?limit=10&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        if (offset === 0) {
          setActivities(data.activities || []);
        } else {
          setActivities((prev) => [...prev, ...(data.activities || [])]);
        }
        setHasMore((data.activities || []).length === 10);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadTrending = useCallback(async () => {
    try {
      const [tagsRes, musiciansRes] = await Promise.all([
        fetch('/api/ecosystem/trending-tags').catch(() => null),
        fetch('/api/ecosystem/suggested-musicians?limit=5').catch(() => null),
      ]);

      const tags = tagsRes?.ok ? await tagsRes.json() : { tags: [] };
      const musicians = musiciansRes?.ok ? await musiciansRes.json() : { musicians: [] };

      setTrending({
        tags: tags.tags || [],
        counts: tags.counts || [],
        musicians: musicians.musicians || [],
      });
    } catch (error) {
      console.error('Error loading trending:', error);
    }
  }, []);

  useEffect(() => {
    loadActivities();
    loadTrending();
  }, [loadActivities, loadTrending]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadActivities(activities.length);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [activities.length, hasMore, loadingMore, loading, loadActivities]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-64 top-0 h-[600px] w-[600px] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute -right-64 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="mb-6 inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={56}
              className="transition-transform hover:scale-105"
              priority
            />
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-white">Activity Feed</h1>
          <p className="text-white/60">See what musicians in your network are creating</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-sm text-white/50">{microCopy.loading.feed}</p>
              </div>
            ) : activities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-12 text-center"
              >
                <Zap className="mx-auto mb-4 h-12 w-12 text-white/30" />
                <h3 className="mb-2 text-lg font-semibold text-white">Your network awaits</h3>
                <p className="mb-4 text-sm text-white/50">
                  Connect with musicians, share your work, and see what the community is creating.
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 font-medium text-white"
                >
                  <Users className="h-4 w-4" />
                  Find Musicians
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <ActivityCard
                    key={activity.id || i}
                    activity={activity}
                    onCelebrate={() => {
                      // Optimistically update
                      setActivities((prev) =>
                        prev.map((a) =>
                          a.id === activity.id
                            ? { ...a, celebrationCount: (a.celebrationCount || 0) + 1 }
                            : a
                        )
                      );
                    }}
                  />
                ))}

                {/* Load more trigger */}
                <div ref={observerTarget} className="py-4">
                  {loadingMore && (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <TrendingSidebar trending={trending} />
          </div>
        </div>
      </div>
    </div>
  );
}
