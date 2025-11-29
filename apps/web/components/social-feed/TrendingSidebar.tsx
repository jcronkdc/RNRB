'use client';

import { TrendingUp, Hash, Music, Users, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TrendingItem {
  id: string;
  name: string;
  count: number;
  type: 'hashtag' | 'genre' | 'artist';
}

interface TrendingArtist {
  id: string;
  name: string;
  image: string | null;
  postCount: number;
  followerCount: number;
}

export function TrendingSidebar() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [artists, setArtists] = useState<TrendingArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const response = await fetch('/api/feed/trending');
      if (response.ok) {
        const data = await response.json();
        setTrending(data.trending || []);
        setArtists(data.artists || []);
      }
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sticky top-20 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-20 space-y-6">
      {/* Trending Section */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 via-purple-900/10 to-black/60 p-5 backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          Trending Now
        </h3>

        {trending.length === 0 ? (
          <p className="text-sm text-white/50">No trending topics yet</p>
        ) : (
          <div className="space-y-3">
            {trending.slice(0, 8).map((item, index) => (
              <Link
                key={item.id}
                href={`/feed?${item.type === 'hashtag' ? 'tag' : item.type}=${encodeURIComponent(item.name)}`}
                className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-white/5"
              >
                <span className="text-sm font-bold text-white/40">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'hashtag' && <Hash className="h-3.5 w-3.5 text-purple-400" />}
                    {item.type === 'genre' && <Music className="h-3.5 w-3.5 text-pink-400" />}
                    <span className="truncate font-medium text-white group-hover:text-purple-300">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    {item.count.toLocaleString()} {item.count === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Rising Artists */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 via-pink-900/10 to-black/60 p-5 backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Users className="h-5 w-5 text-pink-400" />
          Rising Artists
        </h3>

        {artists.length === 0 ? (
          <p className="text-sm text-white/50">No rising artists yet</p>
        ) : (
          <div className="space-y-3">
            {artists.slice(0, 5).map((artist) => (
              <Link
                key={artist.id}
                href={`/profile/${artist.id}`}
                className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-white/5"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  {artist.image ? (
                    <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {artist.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white group-hover:text-purple-300">
                    {artist.name}
                  </p>
                  <p className="text-xs text-white/50">
                    {artist.postCount} posts · {artist.followerCount} followers
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
        <div className="space-y-2 text-sm">
          <Link
            href="/feed/explore"
            className="flex items-center gap-2 font-medium text-purple-400 transition-colors hover:text-purple-300"
          >
            <TrendingUp className="h-4 w-4" />
            Explore All Trending
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            href="/feed?type=audio"
            className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
          >
            <Music className="h-4 w-4" />
            Audio-only Feed
          </Link>
          <Link
            href="/feed?type=discover"
            className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
          >
            <Users className="h-4 w-4" />
            Popular Posts
          </Link>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Rock N' Roll Basement
          </p>
        </div>
      </div>
    </div>
  );
}
