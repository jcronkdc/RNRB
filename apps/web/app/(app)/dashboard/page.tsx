'use client';

import { motion } from 'framer-motion';
import {
  Plus,
  Loader2,
  Bell,
  TrendingUp,
  Users,
  Music,
  Globe,
  Sparkles,
  Hash,
  ChevronRight,
  Flame,
  Zap,
  UserSearch,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, Suspense } from 'react';

import { PeopleSidebar } from '@/components/dashboard/people-sidebar';
import { QuickTools } from '@/components/dashboard/quick-tools';
import { ErrorBoundary } from '@/components/error-boundary';
import { FeedPost } from '@/components/social-feed/FeedPost';
import { PostComposer } from '@/components/social-feed/PostComposer';
import { useRequireAuth } from '@/hooks/use-require-auth';

// Feed type tabs
const feedTabs = [
  { id: 'following', label: 'Following', icon: Users },
  { id: 'public', label: 'Discover', icon: Globe },
  { id: 'algorithm', label: 'For You', icon: Sparkles },
  { id: 'audio', label: 'Music', icon: Music },
];

function DashboardContent() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userName = user?.name?.split(' ')[0] || 'Artist';

  const [feedType, setFeedType] = useState<'following' | 'public' | 'algorithm' | 'audio'>(
    'following'
  );
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);

  // Require authentication
  useRequireAuth();

  // Load posts
  const loadPosts = useCallback(
    async (nextCursor?: string) => {
      try {
        if (!nextCursor) setLoading(true);

        const endpoint = feedType === 'algorithm' ? '/api/feed/algorithm' : '/api/feed/posts';
        const params = new URLSearchParams({
          ...(feedType !== 'algorithm' && { type: feedType }),
          limit: '10',
          ...(nextCursor && { cursor: nextCursor }),
        });

        const response = await fetch(`${endpoint}?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (nextCursor) {
            setPosts((prev) => [...prev, ...data.posts]);
          } else {
            setPosts(data.posts || []);
          }
          setCursor(data.nextCursor || null);
          setHasMore(!!data.nextCursor);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [feedType]
  );

  // Load trending tags
  const loadTrending = useCallback(async () => {
    try {
      const response = await fetch('/api/feed/trending?limit=5');
      if (response.ok) {
        const data = await response.json();
        setTrendingTags(data.hashtags || []);
      }
    } catch (error) {
      console.error('Error loading trending:', error);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadTrending();
  }, [feedType, loadPosts, loadTrending]);

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost: any) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[100px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={120}
                height={48}
                className="transition-transform hover:scale-105"
              />
            </Link>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-white">Hey {userName}! 👋</h1>
              <p className="text-sm text-gray-400">What's on your mind today?</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/discover"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <UserSearch className="h-4 w-4" />
              <span className="hidden sm:inline">Find Musicians</span>
            </Link>
            <Link
              href="/songwriting"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-red-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Song</span>
            </Link>
          </div>
        </motion.header>

        {/* Main Grid Layout - Social First! */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Sidebar - Quick Tools (Desktop) */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-20 space-y-4">
              <QuickTools />

              {/* Trending Tags */}
              {trendingTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-white">Trending Now</h3>
                  </div>
                  <div className="space-y-2">
                    {trendingTags.map((tag, i) => (
                      <Link
                        key={tag.tag}
                        href={`/feed?tag=${encodeURIComponent(tag.tag)}`}
                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-purple-400" />
                          <span className="text-sm font-medium text-white">{tag.tag}</span>
                        </div>
                        <span className="text-xs text-gray-500">{tag.count} posts</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </aside>

          {/* Main Feed - Center Stage! */}
          <main className="lg:col-span-6">
            {/* Feed Type Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl"
            >
              {feedTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFeedType(tab.id as any)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    feedType === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Post Composer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <PostComposer onPostCreated={handlePostCreated} />
            </motion.div>

            {/* Feed */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="text-sm text-gray-400">Loading your feed...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-white/10 bg-black/40 p-12 text-center backdrop-blur-xl"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20">
                  <Music className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feedType === 'following' ? 'Your feed is empty' : 'No posts yet'}
                </h3>
                <p className="mb-4 text-sm text-gray-400">
                  {feedType === 'following'
                    ? 'Follow some musicians to see their posts here!'
                    : 'Be the first to share something amazing!'}
                </p>
                {feedType === 'following' && (
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 font-medium text-white transition-all hover:from-orange-600 hover:to-red-700"
                  >
                    <Users className="h-4 w-4" />
                    Find Musicians to Follow
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="space-y-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FeedPost
                      post={post}
                      onDeleted={handlePostDeleted}
                      onUpdated={handlePostUpdated}
                    />
                  </motion.div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={() => cursor && loadPosts(cursor)}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10"
                    >
                      Load More
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <p className="py-4 text-center text-sm text-gray-500">
                    You've reached the end! 🎸
                  </p>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar - People Suggestions */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-20 space-y-4">
              <Suspense
                fallback={
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  </div>
                }
              >
                <PeopleSidebar />
              </Suspense>

              {/* Your Activity Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-white">Your Activity</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-lg font-bold text-white">0</p>
                    <p className="text-xs text-gray-400">Posts</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-lg font-bold text-white">0</p>
                    <p className="text-xs text-gray-400">Followers</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-lg font-bold text-white">0</p>
                    <p className="text-xs text-gray-400">Following</p>
                  </div>
                </div>
                <Link
                  href="/settings/profile"
                  className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-white/10 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Complete Your Profile
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </aside>
        </div>

        {/* Mobile Quick Tools (Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/90 p-2 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-md justify-around">
            <Link
              href="/songwriting"
              className="flex flex-col items-center gap-1 p-2 text-gray-400"
            >
              <Music className="h-5 w-5" />
              <span className="text-xs">Write</span>
            </Link>
            <Link href="/create" className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs">AI</span>
            </Link>
            <Link
              href="/discover"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600"
            >
              <UserSearch className="h-6 w-6 text-white" />
            </Link>
            <Link href="/studio" className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <Music className="h-5 w-5" />
              <span className="text-xs">Studio</span>
            </Link>
            <Link href="/feed" className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Feed</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
}
