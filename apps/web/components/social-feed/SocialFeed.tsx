'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FeedPost } from './FeedPost';
import { PostComposer } from './PostComposer';
import { TrendingSidebar } from './TrendingSidebar';
import { SearchModal } from './SearchModal';
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
} from 'lucide-react';

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
                <p className="text-sm text-white/40">You've reached the end 🎸</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trending Sidebar - Desktop Only */}
      <div className="hidden w-80 lg:block">
        <TrendingSidebar />
      </div>
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
