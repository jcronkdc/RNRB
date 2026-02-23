'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  User,
  Users,
  Music,
  MapPin,
  CheckCircle,
  Loader2,
  UserPlus,
  Clock,
  Sparkles,
  TrendingUp,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isFollowing?: boolean;
  mutualConnections?: number;
  instruments?: string[];
  genres?: string[];
  location?: string;
  isAvailable?: boolean;
  followerCount?: number;
}

interface SuggestedUser extends SearchUser {
  reason: string;
}

interface GlobalUserSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalUserSearch({ isOpen, onClose }: GlobalUserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      loadSuggestions();
      loadRecentSearches();
    } else {
      setQuery('');
      setResults([]);
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

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/users/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentUserSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = (user: SearchUser) => {
    try {
      const saved = localStorage.getItem('recentUserSearches');
      let recent: SearchUser[] = saved ? JSON.parse(saved) : [];
      // Remove if already exists, add to front
      recent = recent.filter((u) => u.id !== user.id);
      recent.unshift(user);
      // Keep only last 5
      recent = recent.slice(0, 5);
      localStorage.setItem('recentUserSearches', JSON.stringify(recent));
      setRecentSearches(recent);
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentUserSearches');
    setRecentSearches([]);
  };

  // Debounced search
  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        // Track which users we're following
        const following = new Set<string>();
        data.forEach((u: SearchUser) => {
          if (u.isFollowing) following.add(u.id);
        });
        setFollowingIds(following);
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
      if (query) searchUsers(query);
    }, 200); // Fast debounce for instant feel

    return () => clearTimeout(timeout);
  }, [query, searchUsers]);

  const handleFollow = async (userId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyFollowing = followingIds.has(userId);

    // Optimistic update
    setFollowingIds((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyFollowing) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });

    try {
      await fetch('/api/users/follow', {
        method: isCurrentlyFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      // Revert on error
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyFollowing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    }
  };

  const handleUserClick = (user: SearchUser) => {
    saveRecentSearch(user);
    onClose();
    router.push(`/community/users/${user.id}`);
  };

  if (!isOpen) return null;

  const UserCard = ({
    user,
    showReason,
    reason,
  }: {
    user: SearchUser;
    showReason?: boolean;
    reason?: string;
  }) => {
    const isFollowing = followingIds.has(user.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative"
      >
        <div
          onClick={() => handleUserClick(user)}
          className="flex cursor-pointer items-center gap-4 rounded-xl p-3 transition-all hover:bg-white/5"
        >
          {/* Avatar */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 transition-all group-hover:ring-orange-500/50">
            {user.image ? (
              <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-orange-500 to-red-600">
                <span className="text-lg font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            {/* Online indicator or available badge */}
            {user.isAvailable && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-gray-900 bg-green-500" />
            )}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold text-white">
                {user.name || user.email?.split('@')[0]}
              </span>
              {user.isAvailable && <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {user.instruments?.length ? (
                <span className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  {user.instruments.slice(0, 2).join(', ')}
                </span>
              ) : null}
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.location}
                </span>
              )}
            </div>
            {showReason && reason && <p className="mt-1 text-xs text-purple-400">{reason}</p>}
            {user.mutualConnections && user.mutualConnections > 0 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                {user.mutualConnections} mutual connection{user.mutualConnections > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Follow Button */}
          <button
            onClick={(e) => handleFollow(user.id, e)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              isFollowing
                ? 'border border-white/20 bg-white/5 text-white hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400'
                : 'bg-linear-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
            }`}
          >
            {isFollowing ? (
              'Following'
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Follow
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(30, 30, 30, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-red-600">
            <Search className="h-5 w-5 text-white" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for musicians, collaborators, friends..."
            className="flex-1 bg-transparent text-lg text-white placeholder:text-gray-500 focus:outline-hidden"
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-orange-500" />}
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Search Results */}
          {query && results.length > 0 && (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-medium text-gray-400">Search Results</h3>
              </div>
              <div className="space-y-1">
                {results.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
              {results.length >= 10 && (
                <Link
                  href={`/discover?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  See all results for "{query}"
                </Link>
              )}
            </div>
          )}

          {/* No Results */}
          {query && query.length >= 2 && !loading && results.length === 0 && (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-white">No musicians found</h3>
              <p className="text-sm text-gray-400">
                Try a different search term or{' '}
                <Link
                  href="/discover"
                  onClick={onClose}
                  className="text-orange-500 hover:underline"
                >
                  browse all musicians
                </Link>
              </p>
            </div>
          )}

          {/* Empty State - Suggestions & Recent */}
          {!query && (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <h3 className="text-sm font-medium text-gray-400">Recent</h3>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 transition-colors hover:text-white"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}

              {/* People You May Know */}
              {suggestions.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-medium text-gray-400">People You May Know</h3>
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((user) => (
                      <UserCard key={user.id} user={user} showReason reason={user.reason} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {recentSearches.length === 0 && suggestions.length === 0 && (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-orange-500/20 to-red-600/20">
                    <Users className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-white">Find Your People</h3>
                  <p className="mb-4 text-sm text-gray-400">
                    Search by name, email, or instrument to discover collaborators
                  </p>
                  <Link
                    href="/discover"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-red-600 px-6 py-3 font-medium text-white transition-all hover:from-orange-600 hover:to-red-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Browse Musicians
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
