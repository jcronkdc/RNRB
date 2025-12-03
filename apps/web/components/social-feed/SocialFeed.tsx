'use client';

import {
  Loader2,
  Music,
  Globe,
  Users,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Search,
  X,
  Hash,
} from '@/components/ui/custom-icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';

import { FeedPost } from './FeedPost';
import { PostComposer } from './PostComposer';
import { SearchModal } from './SearchModal';
import { TrendingSidebar } from './TrendingSidebar';

interface FeedProps {
  initialType?: 'following' | 'public' | 'discover' | 'audio' | 'algorithm';
}

export function SocialFeed({ initialType = 'following' }: FeedProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filters from URL
  const tagFilter = searchParams.get('tag');
  const genreFilter = searchParams.get('genre');

  const [feedType, setFeedType] = useState(initialType);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Infinite scroll refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const lastCheckRef = useRef<Date>(new Date());

  // Load posts with caching
  const loadPosts = useCallback(
    async (cursor?: string) => {
      try {
        if (cursor) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const endpoint = feedType === 'algorithm' ? '/api/feed/algorithm' : '/api/feed/posts';
        const params = new URLSearchParams({
          ...(feedType !== 'algorithm' && { type: feedType }),
          limit: '20',
          ...(cursor && { cursor }),
          ...(tagFilter && { tag: tagFilter }),
          ...(genreFilter && { genre: genreFilter }),
        });

        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) throw new Error('Failed to load posts');

        const data = await response.json();

        if (cursor) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }

        setNextCursor(data.nextCursor);
        lastCheckRef.current = new Date();
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [feedType, tagFilter, genreFilter]
  );

  // Initial load and when feed type or filters change
  useEffect(() => {
    loadPosts();
  }, [feedType, tagFilter, genreFilter, loadPosts]);

  // Clear filter function
  const clearFilter = () => {
    router.push('/feed');
  };

  // Keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          loadPosts(nextCursor);
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [nextCursor, loadingMore, loadPosts]);

  // Check for new posts periodically (polling for real-time feel)
  useEffect(() => {
    if (!session) return;

    const checkNewPosts = async () => {
      try {
        const response = await fetch(
          `/api/feed/posts?type=${feedType}&limit=1&since=${lastCheckRef.current.toISOString()}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.posts?.length > 0 && data.posts[0].id !== posts[0]?.id) {
            setHasNewPosts(true);
          }
        }
      } catch {
        // Silent fail for background check
      }
    };

    const interval = setInterval(checkNewPosts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [session, feedType, posts]);

  // Handle new post created (optimistic)
  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
    setHasNewPosts(false);
  };

  // Handle post deleted (optimistic)
  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Handle post updated (optimistic)
  const handlePostUpdated = (updatedPost: any) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  // Load new posts
  const handleLoadNewPosts = () => {
    setHasNewPosts(false);
    loadPosts();
  };

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      {/* Main Feed */}
      <div className="max-w-2xl flex-1">
        {/* Search Bar */}
        <div className="mb-4">
          <button
            onClick={() => setShowSearch(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white/50 backdrop-blur-xl transition-all hover:border-purple-500/30 hover:bg-black/60"
          >
            <Search className="h-5 w-5" />
            <span>Search posts, music, artists, #hashtags...</span>
            <kbd className="ml-auto hidden rounded bg-white/10 px-2 py-1 text-xs text-white/40 sm:inline">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Active Filter Display */}
        {(tagFilter || genreFilter) && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 backdrop-blur-xl">
            <Hash className="h-5 w-5 text-purple-400" />
            <span className="font-medium text-white">
              {tagFilter ? `#${tagFilter}` : genreFilter}
            </span>
            <span className="text-white/60">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
            <button
              onClick={clearFilter}
              className="ml-auto flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1 text-sm font-medium text-white/70 transition-all hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        )}

        {/* Feed Type Selector */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2 backdrop-blur-xl">
          <FeedTypeButton
            active={feedType === 'following'}
            icon={<Users className="h-4 w-4" />}
            label="Following"
            onClick={() => setFeedType('following')}
          />
          <FeedTypeButton
            active={feedType === 'public'}
            icon={<Globe className="h-4 w-4" />}
            label="Public"
            onClick={() => setFeedType('public')}
          />
          <FeedTypeButton
            active={feedType === 'algorithm'}
            icon={<Sparkles className="h-4 w-4" />}
            label="For You"
            onClick={() => setFeedType('algorithm')}
          />
          <FeedTypeButton
            active={feedType === 'discover'}
            icon={<TrendingUp className="h-4 w-4" />}
            label="Trending"
            onClick={() => setFeedType('discover')}
          />
          <FeedTypeButton
            active={feedType === 'audio'}
            icon={<Music className="h-4 w-4" />}
            label="Audio"
            onClick={() => setFeedType('audio')}
          />
        </div>

        {/* Post Composer */}
        {session && (
          <div className="mb-6">
            <PostComposer onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* New Posts Banner */}
        {hasNewPosts && (
          <button
            onClick={handleLoadNewPosts}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/50 bg-purple-500/10 py-3 font-medium text-purple-300 transition-all hover:bg-purple-500/20"
          >
            <RefreshCw className="h-4 w-4" />
            New posts available - Click to refresh
          </button>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-12 text-center backdrop-blur-xl">
            <Music className="mx-auto mb-4 h-12 w-12 text-white/20" />
            <h3 className="mb-2 text-lg font-semibold text-white">No posts yet</h3>
            <p className="text-sm text-white/60">Be the first to share something amazing!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                onDeleted={handlePostDeleted}
                onUpdated={handlePostUpdated}
              />
            ))}

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-purple-500" />}
              {!nextCursor && posts.length > 0 && (
                <p className="text-sm text-white/40">You've reached the end</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trending Sidebar - Desktop Only */}
      <div className="hidden w-80 lg:block">
        <TrendingSidebar />
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
}

// Feed Type Button Component
function FeedTypeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
          : 'text-white/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
