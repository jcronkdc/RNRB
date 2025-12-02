'use client';

import { motion } from 'framer-motion';
import { Loader2, Music, User } from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
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

export default function CommunityUserPage({ params }: { params: Promise<{ id: string }> }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/community/users/${resolvedParams.id}`);
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
  }, [params]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg)' }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 animate-ping rounded-full"
            style={{ background: 'rgba(232, 93, 59, 0.2)' }}
          />
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Loading artist profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="text-center">
          <User
            style={{ margin: '0 auto 16px', height: '48px', width: '48px', color: 'var(--muted)' }}
          />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text)' }}>
            User not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={56}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '32px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--panel)',
            padding: '32px',
          }}
        >
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Avatar */}
            <div
              style={{
                display: 'flex',
                height: '96px',
                width: '96px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-dim)',
              }}
            >
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name || 'User'}
                  className="h-full w-full rounded-full"
                />
              ) : (
                <User style={{ height: '48px', width: '48px', color: 'var(--accent)' }} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1
                style={{
                  marginBottom: '8px',
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: 'var(--text)',
                }}
              >
                {profile.name || 'Unknown Artist'}
              </h1>
              <p style={{ color: 'var(--muted)' }}>{profile.email}</p>

              {/* Stats */}
              <div className="mt-4 flex justify-center gap-6 md:justify-start">
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                    {profile.tracks.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Tracks</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                    {profile.followerCount}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Followers</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                    {profile.followingCount}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Following</div>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <button
              style={{
                borderRadius: 'var(--radius-sm)',
                padding: '8px 24px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                backgroundColor: profile.isFollowing ? 'var(--bg)' : 'var(--accent)',
                color: 'var(--text)',
                border: profile.isFollowing ? '1px solid var(--border)' : 'none',
              }}
            >
              {profile.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </motion.div>

        {/* Tracks Grid */}
        <div>
          <h2
            style={{
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--text)',
            }}
          >
            <Music style={{ height: '24px', width: '24px', color: 'var(--accent)' }} />
            Published Tracks
          </h2>

          {profile.tracks.length === 0 ? (
            <div
              style={{
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--panel)',
                padding: '48px',
                textAlign: 'center',
              }}
            >
              <Music
                style={{
                  margin: '0 auto 16px',
                  height: '48px',
                  width: '48px',
                  color: 'var(--muted)',
                }}
              />
              <p style={{ color: 'var(--muted)' }}>No tracks published yet</p>
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
