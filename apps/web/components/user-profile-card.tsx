'use client';

import { Card } from '@cronkwaters/ui';
import { Users, Music, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
}

export function UserProfileCard({ id, name, image, email, profile, stats }: UserProfileCardProps) {
  return (
    <Link href={`/community/users/${id}`}>
      <Card className="rnrb-card group relative overflow-hidden p-6 transition-all hover:shadow-xl">
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-4 flex items-start gap-4">
            {/* Avatar */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl ring-2 ring-border group-hover:ring-brand-primary transition-all">
              {image ? (
                <Image src={image} alt={name || 'User'} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-muted">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold truncate">{name || 'Anonymous User'}</h3>
                {profile?.availableForCollaboration && (
                  <CheckCircle className="h-4 w-4 text-brand-primary flex-shrink-0" title="Available for collaboration" />
                )}
              </div>
              <p className="text-muted-foreground text-sm truncate">{email}</p>
            </div>
          </div>

          {/* Profile Details */}
          {profile && (
            <div className="mb-4 space-y-2">
              {/* Genres */}
              {profile.genres && profile.genres.length > 0 && (
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                      <span className="text-muted-foreground text-xs">+{profile.genres.length - 3} more</span>
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
                    <span className="text-muted-foreground"> +{profile.instruments.length - 3} more</span>
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

          {/* Stats */}
          <div className="flex items-center gap-4 border-t border-border/50 pt-4">
            <div className="text-center">
              <div className="font-display text-lg font-bold">{stats.followers}</div>
              <div className="text-muted-foreground text-xs">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-display text-lg font-bold">{stats.following}</div>
              <div className="text-muted-foreground text-xs">Following</div>
            </div>
            <div className="text-center">
              <div className="font-display text-lg font-bold">{stats.tracks}</div>
              <div className="text-muted-foreground text-xs">Tracks</div>
            </div>
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

