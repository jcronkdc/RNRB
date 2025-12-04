'use client';

import { Search, X, Music, User, Hash, Loader2, TrendingUp } from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ROUTES } from '@/lib/routes';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'audio' | 'users' | 'hashtags'>(
    'all'
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  // Keyboard shortcut to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search
  const searchDebounced = useCallback(async (searchQuery: string, type: string) => {
    if (searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/feed/search?q=${encodeURIComponent(searchQuery)}&type=${type}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query) searchDebounced(query, activeTab);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, activeTab, searchDebounced]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-black via-purple-950/20 to-black shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <Search className="h-5 w-5 text-white/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, music, artists, hashtags..."
            className="flex-1 bg-transparent text-lg text-white placeholder:text-white/40 focus:outline-none"
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-purple-500" />}
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 px-4">
          {(['all', 'posts', 'audio', 'users', 'hashtags'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-purple-500 text-purple-400'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!query ? (
            <div className="py-8 text-center">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 text-white/20" />
              <p className="text-white/60">Start typing to search...</p>
              <p className="mt-2 text-sm text-white/40">Pro tip: Use # for hashtags, @ for users</p>
            </div>
          ) : !results ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Posts */}
              {results.posts?.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/60">
                    <TrendingUp className="h-4 w-4" />
                    Posts
                  </h3>
                  <div className="space-y-2">
                    {results.posts.map((post: any) => (
                      <Link
                        key={post.id}
                        href={`/feed/post/${post.id}`}
                        onClick={onClose}
                        className="block rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-purple-500/30 hover:bg-white/10"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                            {post.author.image ? (
                              <Image
                                src={post.author.image}
                                alt={post.author.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                                {post.author.name?.[0] || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white">{post.author.name}</p>
                            <p className="line-clamp-2 text-sm text-white/70">{post.content}</p>
                            <p className="mt-1 text-xs text-white/40">
                              {post._count.reactions} reactions · {post._count.comments} comments
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Posts */}
              {results.audioPosts?.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/60">
                    <Music className="h-4 w-4" />
                    Audio
                  </h3>
                  <div className="space-y-2">
                    {results.audioPosts.map((post: any) => (
                      <Link
                        key={post.id}
                        href={`/feed/post/${post.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-purple-500/30 hover:bg-white/10"
                      >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">
                            {post.content || 'Untitled Track'}
                          </p>
                          <p className="text-sm text-white/60">{post.author.name}</p>
                          <div className="mt-1 flex gap-2">
                            {post.genre && (
                              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                                {post.genre}
                              </span>
                            )}
                            <span className="text-xs text-white/40">{post._count.plays} plays</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users?.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/60">
                    <User className="h-4 w-4" />
                    People
                  </h3>
                  <div className="space-y-2">
                    {results.users.map((user: any) => (
                      <Link
                        key={user.id}
                        href={ROUTES.profile.view(user.id)}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-purple-500/30 hover:bg-white/10"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                          {user.image ? (
                            <Image src={user.image} alt={user.name} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                              {user.name?.[0] || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-white/60">
                            {user._count.authoredPosts} posts · {user._count.followers} followers
                          </p>
                        </div>
                        {user.isFollowing && (
                          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
                            Following
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {results.hashtags?.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/60">
                    <Hash className="h-4 w-4" />
                    Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.hashtags.map((hashtag: any) => (
                      <Link
                        key={hashtag.tag}
                        href={`/feed?tag=${encodeURIComponent(hashtag.tag)}`}
                        onClick={onClose}
                        className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-purple-300 transition-colors hover:bg-purple-500/20"
                      >
                        <Hash className="h-4 w-4" />
                        {hashtag.tag}
                        <span className="text-xs text-white/50">{hashtag.postCount}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!results.posts?.length &&
                !results.audioPosts?.length &&
                !results.users?.length &&
                !results.hashtags?.length && (
                  <div className="py-8 text-center">
                    <Search className="mx-auto mb-4 h-12 w-12 text-white/20" />
                    <p className="text-white/60">No results found for "{query}"</p>
                    <p className="mt-2 text-sm text-white/40">
                      Try different keywords or check the spelling
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
