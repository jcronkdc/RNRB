'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FeedPost } from './FeedPost';
import { PostComposer } from './PostComposer';
import { Loader2, Music, Globe, Users, TrendingUp } from 'lucide-react';

interface FeedProps {
  initialType?: 'following' | 'public' | 'discover' | 'audio';
}

export function SocialFeed({ initialType = 'following' }: FeedProps) {
  const { data: session } = useSession();
  const [feedType, setFeedType] = useState(initialType);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load posts
  const loadPosts = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        type: feedType,
        limit: '20',
        ...(cursor && { cursor }),
      });

      const response = await fetch(`/api/feed/posts?${params}`);
      if (!response.ok) throw new Error('Failed to load posts');

      const data = await response.json();

      if (cursor) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load and when feed type changes
  useEffect(() => {
    loadPosts();
  }, [feedType]);

  // Handle new post created
  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Handle post deleted
  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Handle post updated
  const handlePostUpdated = (updatedPost: any) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
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
          active={feedType === 'discover'}
          icon={<TrendingUp className="h-4 w-4" />}
          label="Discover"
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

          {/* Load More Button */}
          {nextCursor && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => loadPosts(nextCursor)}
                disabled={loadingMore}
                className="rounded-full border border-white/10 bg-black/40 px-6 py-3 font-medium text-white backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-purple-500/10 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      )}
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
