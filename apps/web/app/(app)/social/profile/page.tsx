'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Music,
  MapPin,
  Calendar,
  LinkIcon,
  Edit3,
  Camera,
  Loader2,
  Heart,
  MessageCircle,
  Play,
  Eye,
  Settings,
  Share2,
  CheckCircle,
  Guitar,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  createdAt: string;
  musicianProfile: {
    instruments: string[];
    genres: string[];
    availableForCollaboration: boolean;
    availableForGigs: boolean;
  } | null;
  stats: {
    followers: number;
    following: number;
    friends: number;
    posts: number;
    tracks: number;
  };
  recentPosts: any[];
  recentTracks: any[];
}

export default function MyProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'tracks' | 'about'>('posts');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/social/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg)' }}
      >
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--muted)' }}>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <p style={{ color: 'var(--muted)' }}>Could not load profile</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Cover Photo Area */}
      <div
        style={{
          height: '200px',
          background: 'linear-gradient(135deg, var(--accent) 0%, #ff6b6b 50%, #8b5cf6 100%)',
          position: 'relative',
        }}
      >
        <button
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Camera className="h-4 w-4" />
          Edit Cover
        </button>
      </div>

      {/* Profile Header */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            {/* Profile Picture */}
            <div className="relative">
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  border: '4px solid var(--bg)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--panel)',
                }}
              >
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name || 'Profile'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Users style={{ height: '64px', width: '64px', color: 'var(--muted)' }} />
                  </div>
                )}
              </div>
              <button
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                  {profile.name || 'Anonymous Musician'}
                </h1>
                {profile.musicianProfile?.availableForCollaboration && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle className="h-3 w-3" />
                    Open to Collaborate
                  </span>
                )}
              </div>
              {profile.bio && (
                <p style={{ color: 'var(--muted)', marginBottom: '12px' }}>{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--muted)' }}>
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[var(--accent)]"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Website
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined{' '}
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/settings/profile">
                <button
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              </Link>
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div
            className="mt-6 flex gap-8 rounded-xl p-4"
            style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <Link href="/social/friends" className="text-center hover:opacity-80">
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                {profile.stats.friends}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Friends</div>
            </Link>
            <Link href="/social/network?tab=followers" className="text-center hover:opacity-80">
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                {profile.stats.followers}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Followers</div>
            </Link>
            <Link href="/social/network?tab=following" className="text-center hover:opacity-80">
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                {profile.stats.following}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Following</div>
            </Link>
            <div className="text-center">
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                {profile.stats.posts}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Posts</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                {profile.stats.tracks}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Tracks</div>
            </div>
          </div>

          {/* Instruments & Genres */}
          {profile.musicianProfile && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.musicianProfile.instruments.map((instrument) => (
                <span
                  key={instrument}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Guitar className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                  {instrument}
                </span>
              ))}
              {profile.musicianProfile.genres.map((genre) => (
                <span
                  key={genre}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--accent-dim)',
                    color: 'var(--accent)',
                    fontSize: '0.875rem',
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('posts')}
              style={{
                padding: '16px 0',
                fontWeight: '600',
                color: activeTab === 'posts' ? 'var(--accent)' : 'var(--muted)',
                borderBottom:
                  activeTab === 'posts' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('tracks')}
              style={{
                padding: '16px 0',
                fontWeight: '600',
                color: activeTab === 'tracks' ? 'var(--accent)' : 'var(--muted)',
                borderBottom:
                  activeTab === 'tracks' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              Tracks
            </button>
            <button
              onClick={() => setActiveTab('about')}
              style={{
                padding: '16px 0',
                fontWeight: '600',
                color: activeTab === 'about' ? 'var(--accent)' : 'var(--muted)',
                borderBottom:
                  activeTab === 'about' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              About
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === 'posts' && (
            <div>
              {profile.recentPosts.length === 0 ? (
                <div
                  style={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--panel)',
                    padding: '48px',
                    textAlign: 'center',
                  }}
                >
                  <MessageCircle
                    style={{
                      margin: '0 auto 16px',
                      height: '48px',
                      width: '48px',
                      color: 'var(--muted)',
                    }}
                  />
                  <h3 style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                    No posts yet
                  </h3>
                  <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                    Share your music journey with the community
                  </p>
                  <Link href="/social">
                    <button
                      style={{
                        padding: '10px 24px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        fontWeight: '500',
                      }}
                    >
                      Create Post
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.recentPosts.map((post: any) => (
                    <div
                      key={post.id}
                      style={{
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--panel)',
                        padding: '20px',
                      }}
                    >
                      <p style={{ color: 'var(--text)' }}>{post.content}</p>
                      <div className="mt-4 flex gap-4 text-sm" style={{ color: 'var(--muted)' }}>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likeCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.commentCount || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tracks' && (
            <div>
              {profile.recentTracks.length === 0 ? (
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
                  <h3 style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                    No tracks yet
                  </h3>
                  <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                    Upload your music to share with the world
                  </p>
                  <Link href="/library">
                    <button
                      style={{
                        padding: '10px 24px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        fontWeight: '500',
                      }}
                    >
                      Upload Track
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {profile.recentTracks.map((track: any) => (
                    <div
                      key={track.id}
                      style={{
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--panel)',
                        padding: '16px',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--accent-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Music
                            style={{ height: '24px', width: '24px', color: 'var(--accent)' }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 style={{ fontWeight: '600', color: 'var(--text)' }}>{track.title}</h4>
                          <div className="flex gap-3 text-sm" style={{ color: 'var(--muted)' }}>
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {track.playCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {track.likeCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div
              style={{
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--panel)',
                padding: '24px',
              }}
            >
              <h3 style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                About {profile.name || 'This Musician'}
              </h3>
              {profile.bio ? (
                <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>{profile.bio}</p>
              ) : (
                <p style={{ color: 'var(--muted)', marginBottom: '24px', fontStyle: 'italic' }}>
                  No bio yet.{' '}
                  <Link href="/settings/profile" style={{ color: 'var(--accent)' }}>
                    Add one
                  </Link>
                </p>
              )}

              {profile.musicianProfile && (
                <>
                  {profile.musicianProfile.instruments.length > 0 && (
                    <div className="mb-4">
                      <h4 style={{ fontWeight: '500', color: 'var(--text)', marginBottom: '8px' }}>
                        Instruments
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.musicianProfile.instruments.map((instrument) => (
                          <span
                            key={instrument}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--bg)',
                              color: 'var(--text)',
                              fontSize: '0.875rem',
                            }}
                          >
                            {instrument}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.musicianProfile.genres.length > 0 && (
                    <div>
                      <h4 style={{ fontWeight: '500', color: 'var(--text)', marginBottom: '8px' }}>
                        Genres
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.musicianProfile.genres.map((genre) => (
                          <span
                            key={genre}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--accent-dim)',
                              color: 'var(--accent)',
                              fontSize: '0.875rem',
                            }}
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
