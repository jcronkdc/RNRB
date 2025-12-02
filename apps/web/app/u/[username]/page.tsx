'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Play,
  Pause,
  MapPin,
  Calendar,
  Users,
  Heart,
  Share2,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Clock,
  Loader2,
  User,
  Disc3,
  Sparkles,
  Flame,
  Trophy,
  Guitar,
  Mic,
  Music2,
  Headphones,
  Radio,
  Video,
  Globe,
  LinkIcon,
  ChevronRight,
  Copy,
  Check,
  ShoppingBag,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

// Types
interface Track {
  id: string;
  songId: string;
  title: string;
  description: string | null;
  artworkUrl: string | null;
  audioUrl: string;
  genre: string | null;
  mood: string | null;
  bpm: number | null;
  duration: number;
  allowDownload: boolean;
  allowRemix: boolean;
  publishedAt: string;
  likes: number;
  plays: number;
  comments: number;
}

interface Show {
  id: string;
  date: string;
  venue: string | null;
  city: string | null;
  state: string | null;
  ticketUrl: string | null;
}

interface Website {
  id: string;
  label: string;
  url: string;
}

interface MerchProduct {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  category: string;
  mockupUrl: string | null;
  thumbnailUrl: string | null;
}

interface SocialLinks {
  spotify: string | null;
  appleMusic: string | null;
  soundcloud: string | null;
  bandcamp: string | null;
  audiomack: string | null;
  tidal: string | null;
  deezer: string | null;
  amazonMusic: string | null;
  youtube: string | null;
  vimeo: string | null;
  twitch: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  tiktok: string | null;
  threads: string | null;
  bluesky: string | null;
  mastodon: string | null;
  linkedin: string | null;
  discord: string | null;
  telegram: string | null;
  songkick: string | null;
  bandsintown: string | null;
  genius: string | null;
  patreon: string | null;
  kofi: string | null;
  buyMeACoffee: string | null;
  linktree: string | null;
}

interface Profile {
  id: string;
  displayName: string;
  username: string;
  bio: string | null;
  profilePicture: string | null;
  stageName: string | null;
  location: string | null;
  recordLabel: string | null;
  yearsExperience: string | null;
  joinedAt: string;
  instruments: string[];
  genres: string[];
  skills: string[];
  currentStatus: string | null;
  statusMessage: string | null;
  lookingFor: string[];
  availableForCollaboration: boolean;
  availableForGigs: boolean;
  openToOpportunities: boolean;
  stats: {
    followers: number;
    following: number;
    tracks: number;
    totalPracticeMinutes: number;
    currentStreak: number;
    longestStreak: number;
    completedSongs: number;
    completedProjects: number;
    collaborationsCount: number;
    showsPlayed: number;
  };
  socialLinks: SocialLinks;
  websites: Website[];
  bookingEmail: string | null;
  pressEmail: string | null;
  management: string | null;
  featuredSong: {
    id: string;
    title: string;
    artworkUrl: string | null;
    audioUrl: string | null;
  } | null;
  featuredProject: {
    id: string;
    title: string;
    coverImage: string | null;
  } | null;
  tracks: Track[];
  upcomingShows: Show[];
  isFollowing: boolean;
  isOwnProfile: boolean;
}

// Social platform config with icons and colors
const socialPlatforms = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: Music2,
    color: '#1DB954',
    prefix: 'https://open.spotify.com/',
  },
  {
    key: 'appleMusic',
    label: 'Apple Music',
    icon: Music,
    color: '#FA243C',
    prefix: 'https://music.apple.com/',
  },
  {
    key: 'soundcloud',
    label: 'SoundCloud',
    icon: Headphones,
    color: '#FF5500',
    prefix: 'https://soundcloud.com/',
  },
  { key: 'bandcamp', label: 'Bandcamp', icon: Disc3, color: '#1DA0C3', prefix: '' },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: Video,
    color: '#FF0000',
    prefix: 'https://youtube.com/',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: Globe,
    color: '#E4405F',
    prefix: 'https://instagram.com/',
  },
  { key: 'twitter', label: 'X', icon: Globe, color: '#1DA1F2', prefix: 'https://x.com/' },
  { key: 'tiktok', label: 'TikTok', icon: Music, color: '#000000', prefix: 'https://tiktok.com/' },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: Globe,
    color: '#1877F2',
    prefix: 'https://facebook.com/',
  },
  { key: 'twitch', label: 'Twitch', icon: Video, color: '#9146FF', prefix: 'https://twitch.tv/' },
  { key: 'discord', label: 'Discord', icon: MessageCircle, color: '#5865F2', prefix: '' },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: Globe,
    color: '#0A66C2',
    prefix: 'https://linkedin.com/',
  },
  {
    key: 'patreon',
    label: 'Patreon',
    icon: Heart,
    color: '#FF424D',
    prefix: 'https://patreon.com/',
  },
  { key: 'kofi', label: 'Ko-fi', icon: Heart, color: '#FF5E5B', prefix: 'https://ko-fi.com/' },
  {
    key: 'songkick',
    label: 'Songkick',
    icon: Radio,
    color: '#F80046',
    prefix: 'https://songkick.com/',
  },
  {
    key: 'bandsintown',
    label: 'Bandsintown',
    icon: Radio,
    color: '#00CEC8',
    prefix: 'https://bandsintown.com/',
  },
  {
    key: 'linktree',
    label: 'Linktree',
    icon: LinkIcon,
    color: '#43E660',
    prefix: 'https://linktr.ee/',
  },
];

// Helper to format URL
const formatUrl = (url: string, prefix: string) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('@')) return prefix + url.slice(1);
  return prefix + url;
};

// Format duration MM:SS
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Status badge colors
const statusColors: Record<string, { bg: string; text: string; glow: string }> = {
  writing: { bg: 'rgba(147, 51, 234, 0.2)', text: '#a855f7', glow: 'rgba(147, 51, 234, 0.4)' },
  recording: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  touring: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
  available: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  taking_break: {
    bg: 'rgba(156, 163, 175, 0.2)',
    text: '#9ca3af',
    glow: 'rgba(156, 163, 175, 0.4)',
  },
};

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [merchProducts, setMerchProducts] = useState<MerchProduct[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/u/${username}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          setFollowing(data.profile.isFollowing);
        } else if (response.status === 404) {
          setError('Profile not found');
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  // Fetch merch products for this artist
  useEffect(() => {
    async function fetchMerch() {
      if (!username) return;
      try {
        const response = await fetch(`/api/artist-merch/store/${username}`);
        if (response.ok) {
          const data = await response.json();
          setMerchProducts(data.products || []);
        }
      } catch (err) {
        // Silently fail - merch is optional
        console.error('Error fetching merch:', err);
      }
    }
    fetchMerch();
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });
      if (response.ok) {
        setFollowing(!following);
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handlePlayTrack = async (track: Track) => {
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        try {
          await audioRef.current.play();
          setPlayingTrackId(track.id);
        } catch (err) {
          // Handle autoplay policy restrictions or other playback failures
          console.error('Playback failed:', err);
          setPlayingTrackId(null);
        }
      }
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate QR code URL using a free API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://cronkwaters.com/u/${username}`)}&bgcolor=1e1e1e&color=ff6347`;

  // Loading state
  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div
            className="absolute inset-0 animate-ping rounded-full"
            style={{ background: 'rgba(232, 93, 59, 0.2)' }}
          />
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--accent)' }} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm"
          style={{ color: 'var(--muted)' }}
        >
          Loading artist profile...
        </motion.p>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-6"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
            style={{ background: 'var(--panel)' }}
          >
            <User className="h-12 w-12" style={{ color: 'var(--muted)' }} />
          </div>
          <h1 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {error === 'Profile not found' ? 'Profile Not Found' : 'Oops!'}
          </h1>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            {error === 'Profile not found'
              ? `The user @${username} doesn't exist or hasn't set up their profile yet.`
              : 'Something went wrong loading this profile.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Go Home
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // Get active social links
  const activeSocialLinks = socialPlatforms.filter(
    (platform) => profile.socialLinks[platform.key as keyof SocialLinks]
  );

  // Get status styling
  const statusStyle = profile.currentStatus
    ? statusColors[profile.currentStatus] || statusColors.available
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />

      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent)' }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #ffd700, transparent)' }}
        />
      </div>

      <div className="relative z-10">
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center py-6"
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

        <div className="mx-auto max-w-6xl px-4 pb-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-8 overflow-hidden rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--panel) 0%, rgba(42, 42, 42, 0.8) 100%)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Cover gradient */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(135deg, var(--accent) 0%, #ffd700 50%, var(--accent) 100%)`,
                filter: 'blur(60px)',
              }}
            />

            <div className="relative px-6 py-8 sm:px-10 sm:py-12">
              <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                {/* Profile Picture */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative"
                >
                  <div
                    className="h-36 w-36 overflow-hidden rounded-2xl sm:h-44 sm:w-44"
                    style={{
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(232, 93, 59, 0.2)',
                      border: '3px solid var(--border)',
                    }}
                  >
                    {profile.profilePicture ? (
                      <Image
                        src={profile.profilePicture}
                        alt={profile.displayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-6xl font-bold"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent), #ffd700)',
                          color: 'white',
                        }}
                      >
                        {profile.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Availability indicator */}
                  {(profile.availableForCollaboration || profile.availableForGigs) && (
                    <div
                      className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                      }}
                    >
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  {/* Name & Username */}
                  <div className="mb-4">
                    <h1
                      className="mb-1 text-3xl font-bold sm:text-4xl"
                      style={{ color: 'var(--text)' }}
                    >
                      {profile.stageName || profile.displayName}
                    </h1>
                    <p className="text-lg" style={{ color: 'var(--muted)' }}>
                      @{profile.username}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {profile.currentStatus && statusStyle && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2"
                      style={{
                        background: statusStyle.bg,
                        boxShadow: `0 4px 20px ${statusStyle.glow}`,
                      }}
                    >
                      <Sparkles className="h-4 w-4" style={{ color: statusStyle.text }} />
                      <span
                        className="text-sm font-medium capitalize"
                        style={{ color: statusStyle.text }}
                      >
                        {profile.currentStatus.replace('_', ' ')}
                      </span>
                      {profile.statusMessage && (
                        <span className="text-sm" style={{ color: statusStyle.text, opacity: 0.8 }}>
                          • {profile.statusMessage}
                        </span>
                      )}
                    </motion.div>
                  )}

                  {/* Location & Label */}
                  <div className="mb-4 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                    {profile.location && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.recordLabel && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                        <Disc3 className="h-4 w-4" />
                        <span>{profile.recordLabel}</span>
                      </div>
                    )}
                    {profile.yearsExperience && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                        <Clock className="h-4 w-4" />
                        <span>{profile.yearsExperience} experience</span>
                      </div>
                    )}
                  </div>

                  {/* Genres & Instruments */}
                  <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
                    {profile.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full px-3 py-1 text-sm font-medium"
                        style={{
                          background: 'rgba(232, 93, 59, 0.15)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(232, 93, 59, 0.3)',
                        }}
                      >
                        {genre}
                      </span>
                    ))}
                    {profile.instruments.slice(0, 3).map((instrument) => (
                      <span
                        key={instrument}
                        className="rounded-full px-3 py-1 text-sm font-medium"
                        style={{
                          background: 'rgba(255, 215, 0, 0.15)',
                          color: '#ffd700',
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                        }}
                      >
                        🎸 {instrument}
                      </span>
                    ))}
                  </div>

                  {/* Stats Row */}
                  <div className="mb-6 flex flex-wrap justify-center gap-6 md:justify-start">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        {profile.stats.followers.toLocaleString()}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        Followers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        {profile.stats.tracks}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        Tracks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        {profile.stats.showsPlayed}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        Shows
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        {profile.stats.collaborationsCount}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        Collabs
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                    {!profile.isOwnProfile && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFollow}
                        className="flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all"
                        style={{
                          background: following
                            ? 'var(--panel)'
                            : 'linear-gradient(135deg, var(--accent), #ff6b4a)',
                          color: following ? 'var(--text)' : 'white',
                          border: following ? '1px solid var(--border)' : 'none',
                          boxShadow: following ? 'none' : '0 8px 24px rgba(232, 93, 59, 0.3)',
                        }}
                      >
                        {following ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Following
                          </>
                        ) : (
                          <>
                            <Users className="h-5 w-5" />
                            Follow
                          </>
                        )}
                      </motion.button>
                    )}

                    {profile.bookingEmail && (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={`mailto:${profile.bookingEmail}`}
                        className="flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all"
                        style={{
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <MessageCircle className="h-5 w-5" />
                        Book Now
                      </motion.a>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-all"
                      style={{
                        background: 'var(--panel)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Share2 className="h-5 w-5" />
                      Share
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Bio & Links */}
            <div className="space-y-6">
              {/* Bio */}
              {profile.bio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h2
                    className="mb-4 flex items-center gap-2 text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <User className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    About
                  </h2>
                  <p
                    className="whitespace-pre-wrap leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {profile.bio}
                  </p>
                </motion.div>
              )}

              {/* Looking For */}
              {profile.lookingFor.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h2
                    className="mb-4 flex items-center gap-2 text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Looking For
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.lookingFor.map((role) => (
                      <span
                        key={role}
                        className="rounded-full px-3 py-1.5 text-sm font-medium"
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Social Links */}
              {activeSocialLinks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h2
                    className="mb-4 flex items-center gap-2 text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <LinkIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Connect
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {activeSocialLinks.map((platform) => {
                      const url = formatUrl(
                        profile.socialLinks[platform.key as keyof SocialLinks] || '',
                        platform.prefix
                      );
                      if (!url) return null;

                      return (
                        <motion.a
                          key={platform.key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="flex items-center gap-3 rounded-xl p-3 transition-all"
                          style={{
                            background: `${platform.color}15`,
                            border: `1px solid ${platform.color}30`,
                          }}
                        >
                          <platform.icon className="h-5 w-5" style={{ color: platform.color }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                            {platform.label}
                          </span>
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Websites */}
              {profile.websites.length > 0 && profile.websites.some((w) => w.url) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h2
                    className="mb-4 flex items-center gap-2 text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <Globe className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Websites
                  </h2>
                  <div className="space-y-2">
                    {profile.websites
                      .filter((w) => w.url)
                      .map((website) => (
                        <a
                          key={website.id}
                          href={
                            website.url.startsWith('http') ? website.url : `https://${website.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl p-3 transition-all hover:bg-white/5"
                          style={{ border: '1px solid var(--border)' }}
                        >
                          <span className="font-medium" style={{ color: 'var(--text)' }}>
                            {website.label || 'Website'}
                          </span>
                          <ExternalLink className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                        </a>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Achievements */}
              {(profile.stats.currentStreak > 0 || profile.stats.completedSongs > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h2
                    className="mb-4 flex items-center gap-2 text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <Trophy className="h-5 w-5" style={{ color: '#ffd700' }} />
                    Achievements
                  </h2>
                  <div className="space-y-3">
                    {profile.stats.currentStreak > 0 && (
                      <div
                        className="flex items-center gap-3 rounded-xl p-3"
                        style={{ background: 'rgba(255, 215, 0, 0.1)' }}
                      >
                        <Flame className="h-6 w-6 text-orange-500" />
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text)' }}>
                            {profile.stats.currentStreak} Day Streak
                          </div>
                          <div className="text-sm" style={{ color: 'var(--muted)' }}>
                            Practice consistency
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.stats.completedSongs > 0 && (
                      <div
                        className="flex items-center gap-3 rounded-xl p-3"
                        style={{ background: 'rgba(147, 51, 234, 0.1)' }}
                      >
                        <Music className="h-6 w-6 text-purple-500" />
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text)' }}>
                            {profile.stats.completedSongs} Songs Completed
                          </div>
                          <div className="text-sm" style={{ color: 'var(--muted)' }}>
                            Original music created
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.stats.longestStreak > 7 && (
                      <div
                        className="flex items-center gap-3 rounded-xl p-3"
                        style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                      >
                        <Trophy className="h-6 w-6 text-green-500" />
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text)' }}>
                            {profile.stats.longestStreak} Day Record
                          </div>
                          <div className="text-sm" style={{ color: 'var(--muted)' }}>
                            Longest practice streak
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Tracks & Shows */}
            <div className="space-y-6 lg:col-span-2">
              {/* Tracks Section */}
              {profile.tracks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h2
                    className="mb-6 flex items-center gap-2 text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <Music className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Music ({profile.tracks.length})
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {profile.tracks.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="group relative overflow-hidden rounded-xl transition-all hover:shadow-lg"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {/* Cover Art */}
                        <div className="relative aspect-video overflow-hidden">
                          {track.artworkUrl ? (
                            <Image
                              src={track.artworkUrl}
                              alt={track.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, var(--accent), #ffd700)',
                              }}
                            >
                              <Music2 className="h-12 w-12 text-white opacity-50" />
                            </div>
                          )}

                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePlayTrack(track)}
                              className="flex h-14 w-14 items-center justify-center rounded-full shadow-xl"
                              style={{ background: 'var(--accent)' }}
                            >
                              {playingTrackId === track.id ? (
                                <Pause className="h-6 w-6 text-white" />
                              ) : (
                                <Play className="ml-1 h-6 w-6 text-white" />
                              )}
                            </motion.button>
                          </div>

                          {/* Duration badge */}
                          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
                            {formatDuration(track.duration)}
                          </div>
                        </div>

                        {/* Track info */}
                        <div className="p-4">
                          <h3
                            className="mb-1 truncate font-semibold"
                            style={{ color: 'var(--text)' }}
                          >
                            {track.title}
                          </h3>
                          <div
                            className="flex items-center gap-3 text-sm"
                            style={{ color: 'var(--muted)' }}
                          >
                            {track.genre && <span>{track.genre}</span>}
                            {track.bpm && <span>{track.bpm} BPM</span>}
                          </div>
                          <div
                            className="mt-3 flex items-center gap-4 text-sm"
                            style={{ color: 'var(--muted)' }}
                          >
                            <span className="flex items-center gap-1">
                              <Play className="h-3.5 w-3.5" />
                              {track.plays}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5" />
                              {track.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3.5 w-3.5" />
                              {track.comments}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Upcoming Shows */}
              {profile.upcomingShows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h2
                    className="mb-6 flex items-center gap-2 text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <Calendar className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Upcoming Shows
                  </h2>

                  <div className="space-y-3">
                    {profile.upcomingShows.map((show) => (
                      <motion.div
                        key={show.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between rounded-xl p-4 transition-all"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-14 w-14 flex-col items-center justify-center rounded-xl"
                            style={{ background: 'rgba(232, 93, 59, 0.15)' }}
                          >
                            <span
                              className="text-xs font-medium"
                              style={{ color: 'var(--accent)' }}
                            >
                              {new Date(show.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                              {new Date(show.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--text)' }}>
                              {show.venue || 'Venue TBA'}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--muted)' }}>
                              {show.city}
                              {show.state ? `, ${show.state}` : ''}
                            </div>
                          </div>
                        </div>
                        {show.ticketUrl && (
                          <a
                            href={show.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
                            style={{
                              background: 'var(--accent)',
                              color: 'white',
                            }}
                          >
                            Tickets
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Merch Store Section */}
              {merchProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2
                      className="flex items-center gap-2 text-lg font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      <ShoppingBag className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                      Official Merch
                    </h2>
                    <Link
                      href={`/u/${username}/merch`}
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--accent)' }}
                    >
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {merchProducts.slice(0, 4).map((product) => (
                      <Link
                        key={product.id}
                        href={`/u/${username}/merch`}
                        className="group overflow-hidden rounded-xl transition-all hover:scale-[1.02]"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="relative aspect-square overflow-hidden">
                          {product.mockupUrl || product.thumbnailUrl ? (
                            <Image
                              src={product.mockupUrl || product.thumbnailUrl || ''}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div
                              className="flex h-full items-center justify-center"
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                              <ShoppingBag
                                className="h-12 w-12 opacity-30"
                                style={{ color: 'var(--muted)' }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3
                            className="mb-1 truncate text-sm font-medium"
                            style={{ color: 'var(--text)' }}
                          >
                            {product.name}
                          </h3>
                          <span className="font-semibold" style={{ color: 'var(--gold)' }}>
                            ${(product.retailPrice / 100).toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {merchProducts.length > 4 && (
                    <div className="mt-4 text-center">
                      <Link
                        href={`/u/${username}/merch`}
                        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#000',
                        }}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Shop All {merchProducts.length} Products
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Empty State - No Tracks */}
              {profile.tracks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-12 text-center"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Music className="mx-auto mb-4 h-16 w-16" style={{ color: 'var(--muted)' }} />
                  <h3 className="mb-2 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    No Tracks Yet
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    {profile.displayName} hasn't published any music yet. Check back soon!
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(232, 93, 59, 0.1), rgba(255, 215, 0, 0.1))',
              border: '1px solid rgba(232, 93, 59, 0.2)',
            }}
          >
            <h2 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Create Your Own Profile
            </h2>
            <p className="mb-6" style={{ color: 'var(--muted)' }}>
              Join Rock N' Roll Basement and share your music with the world
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #ff6b4a)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(232, 93, 59, 0.3)',
              }}
            >
              Get Started Free
              <ChevronRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Share Modal with QR Code */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
                  Share Profile
                </h3>
                <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                  Scan the QR code or copy the link
                </p>

                {/* QR Code */}
                <div
                  className="mx-auto mb-6 inline-flex rounded-2xl p-4"
                  style={{ background: 'white' }}
                >
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code for ${profile?.displayName}'s profile`}
                    className="h-48 w-48"
                  />
                </div>

                {/* Profile URL */}
                <div
                  className="mb-4 flex items-center gap-2 rounded-xl p-3"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <Globe className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--muted)' }} />
                  <span className="flex-1 truncate text-sm" style={{ color: 'var(--text)' }}>
                    cronkwaters.com/u/{username}
                  </span>
                </div>

                {/* Copy Button */}
                <button
                  onClick={copyProfileLink}
                  className="w-full rounded-xl py-3 font-medium transition-all"
                  style={{
                    background: copied ? 'rgba(34, 197, 94, 0.2)' : 'var(--accent)',
                    color: copied ? '#22c55e' : 'white',
                  }}
                >
                  {copied ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5" />
                      Link Copied!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Copy className="h-5 w-5" />
                      Copy Link
                    </span>
                  )}
                </button>

                {/* Social Share Buttons */}
                <div className="mt-4 flex justify-center gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check out ${profile?.displayName}'s music!&url=https://cronkwaters.com/u/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-3 transition-all hover:bg-white/10"
                    style={{ background: 'rgba(29, 161, 242, 0.2)' }}
                  >
                    <Globe className="h-5 w-5" style={{ color: '#1DA1F2' }} />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=https://cronkwaters.com/u/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-3 transition-all hover:bg-white/10"
                    style={{ background: 'rgba(24, 119, 242, 0.2)' }}
                  >
                    <Globe className="h-5 w-5" style={{ color: '#1877F2' }} />
                  </a>
                  <a
                    href={`mailto:?subject=Check out ${profile?.displayName}'s music!&body=https://cronkwaters.com/u/${username}`}
                    className="rounded-lg p-3 transition-all hover:bg-white/10"
                    style={{ background: 'rgba(255, 99, 71, 0.2)' }}
                  >
                    <MessageCircle className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  </a>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowShareModal(false)}
                  className="mt-4 text-sm transition-all hover:opacity-80"
                  style={{ color: 'var(--muted)' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
