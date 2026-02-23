'use client';

import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Music,
  MapPin,
  CheckCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  RefreshCw,
  MessageCircle,
} from '@/components/ui/custom-icons';
import { UserListSkeleton } from '@/components/loading-skeletons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SuggestedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  reason?: string;
  instruments?: string[];
  genres?: string[];
  isAvailable?: boolean;
  mutualConnections?: number;
}

export function PeopleSidebar() {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleMessage = (userId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/messages`);
  };

  const loadSuggestions = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/users/suggestions?limit=5');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

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

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
        <UserListSkeleton count={5} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-black/40"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-white">Who to Follow</h3>
        </div>
        <button
          onClick={() => loadSuggestions()}
          disabled={refreshing}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Suggestions List */}
      <div className="divide-y divide-white/5">
        {suggestions.length > 0 ? (
          suggestions.map((user, index) => (
            <Link
              key={user.id}
              href={`/community/users/${user.id}`}
              className="group block p-4 transition-colors hover:bg-white/5"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 transition-all group-hover:ring-orange-500/50">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-orange-500 to-red-600">
                      <span className="text-lg font-bold text-white">
                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  {user.isAvailable && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-gray-900 bg-green-500" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium text-white">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                    {user.isAvailable && <CheckCircle className="h-3.5 w-3.5 text-green-400" />}
                  </div>
                  {user.instruments?.length ? (
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <Music className="h-3 w-3" />
                      {user.instruments.slice(0, 2).join(', ')}
                    </p>
                  ) : user.reason ? (
                    <p className="text-xs text-purple-400">{user.reason}</p>
                  ) : null}
                  {user.mutualConnections ? (
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      {user.mutualConnections} mutual
                    </p>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={(e) => handleFollow(user.id, e)}
                    className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-all ${
                      followingIds.has(user.id)
                        ? 'border border-white/20 bg-white/5 text-white hover:border-red-500/50 hover:text-red-400'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {followingIds.has(user.id) ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={(e) => handleMessage(user.id, e)}
                    className="rounded-full border border-white/20 bg-white/5 p-1.5 text-gray-400 transition-all hover:border-purple-500/50 hover:text-purple-400"
                    title="Send message"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-6 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-gray-600" />
            <p className="text-sm text-gray-400">Complete your profile to get suggestions</p>
          </div>
        )}
      </div>

      {/* See More Link */}
      <Link
        href="/discover"
        className="flex items-center justify-center gap-1 border-t border-white/10 p-3 text-sm font-medium text-orange-500 transition-colors hover:bg-white/5 hover:text-orange-400"
      >
        Find More Musicians
        <ChevronRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
