'use client';

import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Music,
  User,
  UserPlus,
  UserCheck,
  MapPin,
  Calendar,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Camera,
  Guitar,
  Mic,
  Clock,
  Trophy,
  Heart,
  Play,
  ChevronDown,
  ChevronRight,
  Users,
  Star,
  Briefcase,
  CheckCircle,
  X,
  Flame,
  Sparkles,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

import { FeedPost } from '@/components/social-feed/FeedPost';
import { TrackCard } from '@/components/track-card';

interface MusicianProfile {
  instruments: string[];
  genres: string[];
  skills: string[];
  experience: string | null;
  availableForCollaboration: boolean;
  availableForGigs: boolean;
  hourlyRate: number | null;
  location: string | null;
  currentStatus: string | null;
  statusMessage: string | null;
  lookingFor: string[];
  openToOpportunities: boolean;
  socialLinks: any;
  totalPracticeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  completedSongs: number;
  completedProjects: number;
  collaborationsCount: number;
  showsPlayed: number;
}

interface UserProfile {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  createdAt: string;
  pro: string | null;
  subscriptionTier: string;
  musicianProfile: MusicianProfile | null;
  tracks: any[];
  posts: any[];
  songs: any[];
  projects: any[];
  followers: { id: string; name: string | null; image: string | null }[];
  following: { id: string; name: string | null; image: string | null }[];
  followerCount: number;
  followingCount: number;
  trackCount: number;
  songCount: number;
  postCount: number;
  projectCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
  mutualConnections: { id: string; name: string | null; image: string | null }[];
}

type TabType = 'timeline' | 'about' | 'music' | 'friends';

export default function CommunityUserPage({ params }: { params: Promise<{ id: string }> }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const resolvedParams = await params;
        setUserId(resolvedParams.id);
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

  const handleFollowToggle = useCallback(async () => {
    if (!userId || !profile || isFollowLoading || profile.isOwnProfile) return;

    setIsFollowLoading(true);
    setFollowError(null);
    
    try {
      const response = await fetch(`/api/community/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: data.isFollowing,
                followerCount: data.followerCount,
              }
            : null
        );
      } else {
        const errorData = await response.json();
        setFollowError(errorData.error || 'Failed to follow');
        // Clear error after 3 seconds
        setTimeout(() => setFollowError(null), 3000);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      setFollowError('Network error. Please try again.');
      setTimeout(() => setFollowError(null), 3000);
    } finally {
      setIsFollowLoading(false);
    }
  }, [userId, profile, isFollowLoading]);

  const handlePostDeleted = useCallback((postId: string) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            posts: prev.posts.filter((p: any) => p.id !== postId),
          }
        : null
    );
  }, []);

  const handlePostUpdated = useCallback((updatedPost: any) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            posts: prev.posts.map((p: any) => (p.id === updatedPost.id ? updatedPost : p)),
          }
        : null
    );
  }, []);

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
          Loading profile...
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
          <Link href="/community" className="mt-4 inline-block text-sm" style={{ color: 'var(--accent)' }}>
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const mp = profile.musicianProfile;
  const statusColors: Record<string, string> = {
    writing: '#10B981',
    recording: '#F59E0B',
    touring: '#8B5CF6',
    available: '#22C55E',
    taking_break: '#6B7280',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Logo Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 flex justify-center py-4"
        style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/" className="group inline-block">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            width={120}
            height={48}
            priority
            className="transition-opacity duration-200 group-hover:opacity-80"
          />
        </Link>
      </motion.div>

      {/* Cover Photo Banner */}
      <div className="relative h-[200px] sm:h-[280px] md:h-[350px]">
        {/* Gradient Cover Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
        />
        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Sound Wave Animation */}
        <div className="absolute bottom-4 left-4 flex items-end gap-1 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-white"
              initial={{ height: 8 }}
              animate={{ height: [8, 20 + Math.random() * 30, 8] }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Edit Cover Button (own profile only) */}
        {profile.isOwnProfile && (
          <button
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <Camera className="h-4 w-4" />
            Edit Cover
          </button>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="mx-auto max-w-5xl px-4">
        {/* Profile Header */}
        <div className="relative -mt-20 pb-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div
                className="h-40 w-40 overflow-hidden rounded-full border-4"
                style={{
                  borderColor: 'var(--bg)',
                  backgroundColor: 'var(--panel)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User style={{ height: '64px', width: '64px', color: 'var(--accent)' }} />
                  </div>
                )}
              </div>
              {/* Online Status / Current Activity */}
              {mp?.currentStatus && (
                <div
                  className="absolute -bottom-1 right-2 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: statusColors[mp.currentStatus] || '#6B7280' }}
                >
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  {mp.currentStatus.replace('_', ' ')}
                </div>
              )}
              {profile.isOwnProfile && (
                <button
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Camera className="h-5 w-5 text-white" />
                </button>
              )}
            </div>

            {/* Name & Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h1
                  className="text-3xl font-bold"
                  style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
                >
                  {profile.name || 'Unknown Artist'}
                </h1>
                {/* Pro Badge */}
                {profile.pro && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: '#000',
                    }}
                  >
                    <Star className="h-3 w-3" />
                    PRO
                  </span>
                )}
                {mp?.availableForCollaboration && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22C55E' }}
                  >
                    <CheckCircle className="h-3 w-3" />
                    Open to Collaborate
                  </span>
                )}
              </div>

              {/* Location & Status Message */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                {mp?.location && (
                  <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
                    <MapPin className="h-4 w-4" />
                    {mp.location}
                  </span>
                )}
                {mp?.statusMessage && (
                  <span className="text-sm italic" style={{ color: 'var(--muted)' }}>
                    "{mp.statusMessage}"
                  </span>
                )}
              </div>

              {/* Mutual Friends */}
              {profile.mutualConnections.length > 0 && !profile.isOwnProfile && (
                <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                  <div className="flex -space-x-2">
                    {profile.mutualConnections.slice(0, 3).map((mutual) => (
                      <div
                        key={mutual.id}
                        className="h-6 w-6 overflow-hidden rounded-full border-2"
                        style={{ borderColor: 'var(--bg)', backgroundColor: 'var(--panel)' }}
                      >
                        {mutual.image ? (
                          <Image src={mutual.image} alt={mutual.name || ''} width={24} height={24} />
                        ) : (
                          <User className="h-full w-full p-1" />
                        )}
                      </div>
                    ))}
                  </div>
                  <span>
                    {profile.mutualConnections.length} mutual{' '}
                    {profile.mutualConnections.length === 1 ? 'connection' : 'connections'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!profile.isOwnProfile ? (
                <>
                  {/* Follow Button */}
                  <button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    className="relative flex items-center gap-2 rounded-lg px-6 py-2.5 font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
                    style={{
                      backgroundColor: profile.isFollowing ? 'var(--panel)' : 'var(--accent)',
                      color: profile.isFollowing ? 'var(--text)' : '#fff',
                      border: profile.isFollowing ? '1px solid var(--border)' : 'none',
                      opacity: isFollowLoading ? 0.7 : 1,
                    }}
                  >
                    {isFollowLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : profile.isFollowing ? (
                      <UserCheck className="h-5 w-5" />
                    ) : (
                      <UserPlus className="h-5 w-5" />
                    )}
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </button>

                  {/* Message Button */}
                  <Link
                    href={`/mail/compose?to=${profile.id}`}
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <MessageCircle className="h-5 w-5" style={{ color: 'var(--text)' }} />
                    <span style={{ color: 'var(--text)' }}>Message</span>
                  </Link>

                  {/* More Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:scale-105"
                      style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                    >
                      <MoreHorizontal className="h-5 w-5" style={{ color: 'var(--text)' }} />
                    </button>
                    {showMoreMenu && (
                      <div
                        className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-lg py-2 shadow-xl"
                        style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                      >
                        <button className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-white/5">
                          <Users className="h-4 w-4" />
                          See Connections
                        </button>
                        <button className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-white/5">
                          <Mail className="h-4 w-4" />
                          Copy Profile Link
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/settings/profile"
                  className="flex items-center gap-2 rounded-lg px-6 py-2.5 font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  <span style={{ color: 'var(--text)' }}>Edit Profile</span>
                </Link>
              )}
            </div>
          </div>

          {/* Follow Error Toast */}
          <AnimatePresence>
            {followError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-1/2 top-full z-50 mt-4 flex -translate-x-1/2 items-center gap-2 rounded-lg px-4 py-2 text-sm"
                style={{ backgroundColor: '#EF4444', color: '#fff' }}
              >
                <X className="h-4 w-4" />
                {followError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Bar */}
        <div
          className="mt-4 flex flex-wrap items-center justify-center gap-6 rounded-xl p-4 sm:justify-start"
          style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {profile.followerCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              Followers
            </div>
          </div>
          <div className="h-8 w-px" style={{ backgroundColor: 'var(--border)' }} />
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {profile.followingCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              Following
            </div>
          </div>
          <div className="h-8 w-px" style={{ backgroundColor: 'var(--border)' }} />
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {profile.trackCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              Tracks
            </div>
          </div>
          <div className="h-8 w-px" style={{ backgroundColor: 'var(--border)' }} />
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {profile.songCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              Songs
            </div>
          </div>
          {mp && (
            <>
              <div className="h-8 w-px" style={{ backgroundColor: 'var(--border)' }} />
              <div className="text-center">
                <div className="flex items-center gap-1 text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  <Flame className="h-5 w-5" />
                  {mp.currentStreak}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  Day Streak
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {[
              { key: 'timeline', label: 'Timeline', icon: Clock },
              { key: 'about', label: 'About', icon: User },
              { key: 'music', label: 'Music', icon: Music },
              { key: 'friends', label: 'Friends', icon: Users },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className="flex items-center gap-2 whitespace-nowrap px-6 py-4 text-sm font-semibold transition-all"
                style={{
                  color: activeTab === tab.key ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: activeTab === tab.key ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="mt-6 grid grid-cols-1 gap-6 pb-12 lg:grid-cols-3">
          {/* Left Sidebar - Intro */}
          <div className="space-y-6 lg:col-span-1">
            {/* Intro Card */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--text)' }}>
                Intro
              </h3>
              <div className="space-y-3">
                {mp?.experience && (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {mp.experience}
                  </p>
                )}
                {mp?.location && (
                  <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text)' }}>
                    <MapPin className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                    Lives in <span className="font-medium">{mp.location}</span>
                  </div>
                )}
                {mp?.instruments && mp.instruments.length > 0 && (
                  <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text)' }}>
                    <Guitar className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                    Plays{' '}
                    <span className="font-medium">{mp.instruments.slice(0, 3).join(', ')}</span>
                  </div>
                )}
                {mp?.genres && mp.genres.length > 0 && (
                  <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text)' }}>
                    <Mic className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                    <span className="font-medium">{mp.genres.slice(0, 3).join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text)' }}>
                  <Calendar className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                  Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
                </div>
              </div>

              {/* Looking For Section */}
              {mp?.lookingFor && mp.lookingFor.length > 0 && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    Looking for:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mp.lookingFor.map((item: string) => (
                      <span
                        key={item}
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Achievements / Stats Card */}
            {mp && (
              <div
                className="rounded-xl p-6"
                style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--text)' }}>
                  <Trophy className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  Achievements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg)' }}>
                    <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                      {Math.floor(mp.totalPracticeMinutes / 60)}h
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      Practice Time
                    </div>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg)' }}>
                    <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                      {mp.completedSongs}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      Songs Created
                    </div>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg)' }}>
                    <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                      {mp.collaborationsCount}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      Collaborations
                    </div>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg)' }}>
                    <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                      {mp.showsPlayed}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      Shows Played
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Friends Preview Card */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                  Friends
                </h3>
                <button
                  onClick={() => setActiveTab('friends')}
                  className="text-sm font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  See All
                </button>
              </div>
              <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                {profile.followerCount} followers · {profile.followingCount} following
              </p>
              <div className="grid grid-cols-3 gap-2">
                {profile.followers.slice(0, 9).map((friend) => (
                  <Link
                    key={friend.id}
                    href={`/community/users/${friend.id}`}
                    className="group text-center"
                  >
                    <div
                      className="mx-auto mb-1 h-16 w-16 overflow-hidden rounded-lg transition-transform group-hover:scale-105"
                      style={{ backgroundColor: 'var(--bg)' }}
                    >
                      {friend.image ? (
                        <Image
                          src={friend.image}
                          alt={friend.name || ''}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-8 w-8" style={{ color: 'var(--muted)' }} />
                        </div>
                      )}
                    </div>
                    <p className="truncate text-xs font-medium" style={{ color: 'var(--text)' }}>
                      {friend.name || 'User'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Timeline/About/Music/Friends */}
          <div className="space-y-6 lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {profile.posts.length === 0 ? (
                    <div
                      className="rounded-xl p-12 text-center"
                      style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                    >
                      <Sparkles
                        className="mx-auto mb-4 h-12 w-12"
                        style={{ color: 'var(--muted)', opacity: 0.5 }}
                      />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                        No posts yet
                      </h3>
                      <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                        {profile.isOwnProfile
                          ? 'Share your first update with the community!'
                          : `${profile.name || 'This user'} hasn't posted anything yet.`}
                      </p>
                    </div>
                  ) : (
                    profile.posts.map((post: any) => (
                      <FeedPost
                        key={post.id}
                        post={{
                          ...post,
                          author: {
                            id: profile.id,
                            name: profile.name,
                            image: profile.image,
                          },
                        }}
                        onDeleted={handlePostDeleted}
                        onUpdated={handlePostUpdated}
                      />
                    ))
                  )}
                </motion.div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Overview */}
                  <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--text)' }}>
                      Overview
                    </h3>
                    {mp?.experience ? (
                      <p style={{ color: 'var(--text)' }}>{mp.experience}</p>
                    ) : (
                      <p style={{ color: 'var(--muted)' }}>No bio yet.</p>
                    )}
                  </div>

                  {/* Skills & Genres */}
                  {mp && (mp.skills?.length > 0 || mp.genres?.length > 0 || mp.instruments?.length > 0) && (
                    <div
                      className="rounded-xl p-6"
                      style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                    >
                      <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--text)' }}>
                        Skills & Expertise
                      </h3>
                      <div className="space-y-4">
                        {mp.instruments?.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                              Instruments
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {mp.instruments.map((item: string) => (
                                <span
                                  key={item}
                                  className="rounded-lg px-3 py-1.5 text-sm font-medium"
                                  style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {mp.genres?.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                              Genres
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {mp.genres.map((item: string) => (
                                <span
                                  key={item}
                                  className="rounded-lg px-3 py-1.5 text-sm font-medium"
                                  style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {mp.skills?.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                              Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {mp.skills.map((item: string) => (
                                <span
                                  key={item}
                                  className="rounded-lg px-3 py-1.5 text-sm font-medium"
                                  style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {mp && (
                    <div
                      className="rounded-xl p-6"
                      style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                    >
                      <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--text)' }}>
                        Availability
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'var(--text)' }}>Open to Collaboration</span>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: mp.availableForCollaboration
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(107, 114, 128, 0.2)',
                              color: mp.availableForCollaboration ? '#22C55E' : '#6B7280',
                            }}
                          >
                            {mp.availableForCollaboration ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'var(--text)' }}>Available for Gigs</span>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: mp.availableForGigs
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(107, 114, 128, 0.2)',
                              color: mp.availableForGigs ? '#22C55E' : '#6B7280',
                            }}
                          >
                            {mp.availableForGigs ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'var(--text)' }}>Open to Opportunities</span>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: mp.openToOpportunities
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(107, 114, 128, 0.2)',
                              color: mp.openToOpportunities ? '#22C55E' : '#6B7280',
                            }}
                          >
                            {mp.openToOpportunities ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--text)' }}>
                      Contact
                    </h3>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                      <span style={{ color: 'var(--text)' }}>{profile.email}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Music Tab */}
              {activeTab === 'music' && (
                <motion.div
                  key="music"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Published Tracks */}
                  <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--text)' }}>
                      <Play className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      Published Tracks ({profile.trackCount})
                    </h3>
                    {profile.tracks.length === 0 ? (
                      <div className="py-8 text-center">
                        <Music className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                        <p style={{ color: 'var(--muted)' }}>No tracks published yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                  {/* Songs */}
                  <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--text)' }}>
                      <Music className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      Songs ({profile.songCount})
                    </h3>
                    {profile.songs.length === 0 ? (
                      <div className="py-8 text-center">
                        <Music className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                        <p style={{ color: 'var(--muted)' }}>No public songs yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profile.songs.map((song: any) => (
                          <Link
                            key={song.id}
                            href={`/songwriting/${song.id}`}
                            className="flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-white/5"
                          >
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: song.coverArt ? 'transparent' : 'var(--accent-dim)',
                              }}
                            >
                              {song.coverArt ? (
                                <Image
                                  src={song.coverArt}
                                  alt={song.title}
                                  width={48}
                                  height={48}
                                  className="rounded-lg object-cover"
                                />
                              ) : (
                                <Music className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                                {song.title}
                              </h4>
                              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                {song.genre || 'No genre'} · {format(new Date(song.createdAt), 'MMM yyyy')}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Projects */}
                  {profile.projects.length > 0 && (
                    <div
                      className="rounded-xl p-6"
                      style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--text)' }}>
                        <Briefcase className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                        Projects ({profile.projectCount})
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {profile.projects.map((project: any) => (
                          <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="group overflow-hidden rounded-lg transition-all hover:scale-[1.02]"
                            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                          >
                            <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                              {project.coverImage && (
                                <Image
                                  src={project.coverImage}
                                  alt={project.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold" style={{ color: 'var(--text)' }}>
                                {project.name}
                              </h4>
                              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                {project.role} · {project.genre || 'Project'}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Followers */}
                  <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--text)' }}>
                      Followers ({profile.followerCount})
                    </h3>
                    {profile.followers.length === 0 ? (
                      <p className="py-8 text-center" style={{ color: 'var(--muted)' }}>
                        No followers yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {profile.followers.map((user) => (
                          <Link
                            key={user.id}
                            href={`/community/users/${user.id}`}
                            className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-white/5"
                          >
                            <div
                              className="h-12 w-12 overflow-hidden rounded-full"
                              style={{ backgroundColor: 'var(--bg)' }}
                            >
                              {user.image ? (
                                <Image src={user.image} alt={user.name || ''} width={48} height={48} />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <User className="h-6 w-6" style={{ color: 'var(--muted)' }} />
                                </div>
                              )}
                            </div>
                            <span className="truncate font-medium" style={{ color: 'var(--text)' }}>
                              {user.name || 'User'}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Following */}
                  <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--text)' }}>
                      Following ({profile.followingCount})
                    </h3>
                    {profile.following.length === 0 ? (
                      <p className="py-8 text-center" style={{ color: 'var(--muted)' }}>
                        Not following anyone yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {profile.following.map((user) => (
                          <Link
                            key={user.id}
                            href={`/community/users/${user.id}`}
                            className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-white/5"
                          >
                            <div
                              className="h-12 w-12 overflow-hidden rounded-full"
                              style={{ backgroundColor: 'var(--bg)' }}
                            >
                              {user.image ? (
                                <Image src={user.image} alt={user.name || ''} width={48} height={48} />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <User className="h-6 w-6" style={{ color: 'var(--muted)' }} />
                                </div>
                              )}
                            </div>
                            <span className="truncate font-medium" style={{ color: 'var(--text)' }}>
                              {user.name || 'User'}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
