'use client';

import { Card } from '@cronkwaters/ui';
import {
  Users,
  Music,
  MapPin,
  CheckCircle,
  UserPlus,
  UserCheck,
  Loader2,
  MessageCircle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ROUTES } from '@/lib/routes';

interface MusicianProfile {
  instruments: string[];
  genres: string[];
  availableForCollaboration: boolean;
  availableForGigs: boolean;
  location?: string | null;
}

interface UserStats {
  followers: number;
  following: number;
  tracks: number;
}

export interface UserProfileCardProps {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  createdAt: string;
  profile: MusicianProfile | null;
  stats: UserStats;
  isFollowing?: boolean;
  onFollowChange?: (userId: string, isFollowing: boolean, newFollowerCount: number) => void;
}

export function UserProfileCard({
  id,
  name,
  image,
  email,
  profile,
  stats,
  isFollowing: initialIsFollowing = false,
  onFollowChange,
}: UserProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(stats.followers);
  const router = useRouter();

  const handleFollowClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLoading) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/community/users/${id}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
          setFollowerCount(data.followerCount);
          onFollowChange?.(id, data.isFollowing, data.followerCount);
        }
      } catch (error) {
        console.error('Error toggling follow:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [id, isLoading, onFollowChange]
  );

  const handleMessageClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push('/messages');
    },
    [id, router]
  );

  return (
    <Link href={ROUTES.profile.view(id)}>
      <Card className="rnrb-card group relative overflow-hidden p-6 transition-all hover:shadow-xl">
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-4 flex items-start gap-4">
            {/* Avatar */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl ring-2 ring-border transition-all group-hover:ring-brand-primary">
              {image ? (
                <Image src={image} alt={name || 'User'} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-muted">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display truncate text-lg font-semibold">
                  {name || 'Anonymous User'}
                </h3>
                {profile?.availableForCollaboration && (
                  <CheckCircle
                    className="h-4 w-4 flex-shrink-0 text-brand-primary"
                    aria-label="Available for collaboration"
                  />
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          {/* Profile Details */}
          {profile && (
            <div className="mb-4 space-y-2">
              {/* Genres */}
              {profile.genres && profile.genres.length > 0 && (
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {profile.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="inline-block rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                    {profile.genres.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{profile.genres.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Instruments */}
              {profile.instruments && profile.instruments.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Plays: </span>
                  <span className="font-medium">{profile.instruments.slice(0, 3).join(', ')}</span>
                  {profile.instruments.length > 3 && (
                    <span className="text-muted-foreground">
                      {' '}
                      +{profile.instruments.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Location */}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 border-t border-border/50 pt-4">
            <div className="text-center">
              <div className="font-display text-lg font-bold">{followerCount}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-display text-lg font-bold">{stats.following}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="font-display text-lg font-bold">{stats.tracks}</div>
              <div className="text-xs text-muted-foreground">Tracks</div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="mt-3 flex items-center gap-2">
            {/* Follow Button */}
            <button
              onClick={handleFollowClick}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              style={{
                backgroundColor: isFollowing ? 'var(--bg)' : 'var(--accent)',
                color: isFollowing ? 'var(--text)' : '#fff',
                border: isFollowing ? '1px solid var(--border)' : 'none',
              }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Follow
                </>
              )}
            </button>

            {/* Message Button */}
            <button
              onClick={handleMessageClick}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--panel)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </button>
          </div>

          {/* Availability Badge */}
          {profile && (profile.availableForCollaboration || profile.availableForGigs) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.availableForCollaboration && (
                <div className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                  <CheckCircle className="h-3 w-3" />
                  Open to collaborate
                </div>
              )}
              {profile.availableForGigs && (
                <div className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <CheckCircle className="h-3 w-3" />
                  Available for gigs
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
