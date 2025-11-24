'use client';

import { motion } from 'framer-motion';
import { User, Music, Heart, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TrackCard } from '@/components/track-card';

interface UserProfile {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  tracks: any[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export default function CommunityUserPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/community/users/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-gray-500" />
          <h2 className="text-xl font-semibold text-white">User not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-8"
        >
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-500/10">
              {profile.image ? (
                <img src={profile.image} alt={profile.name || 'User'} className="h-full w-full rounded-full" />
              ) : (
                <User className="h-12 w-12 text-orange-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="mb-2 text-3xl font-bold text-white">{profile.name || 'Unknown Artist'}</h1>
              <p className="text-gray-400">{profile.email}</p>

              {/* Stats */}
              <div className="mt-4 flex justify-center gap-6 md:justify-start">
                <div>
                  <div className="text-2xl font-bold text-white">{profile.tracks.length}</div>
                  <div className="text-sm text-gray-400">Tracks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{profile.followerCount}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{profile.followingCount}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <button
              className={`rounded-lg px-6 py-2 font-medium transition ${
                profile.isFollowing
                  ? 'border border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {profile.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </motion.div>

        {/* Tracks Grid */}
        <div>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-white">
            <Music className="h-6 w-6 text-orange-500" />
            Published Tracks
          </h2>

          {profile.tracks.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
              <Music className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">No tracks published yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profile.tracks.map((track: any) => (
                <TrackCard
                  key={track.id}
                  {...track}
                  onPlay={() => console.log('Play', track.id)}
                  onExtend={() => console.log('Extend', track.id)}
                  onRemix={() => console.log('Remix', track.id)}
                  onDownload={() => console.log('Download', track.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

