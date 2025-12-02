'use client';

import {
  Phone,
  Globe,
  Music,
  Upload,
  Save,
  Eye,
  EyeOff,
  Instagram,
  Youtube,
  Twitter,
  User,
  Link as LinkIcon,
  Shield,
  CheckCircle2,
  ArrowRight,
  Camera,
  Plus,
  Trash2,
  MapPin,
  Facebook,
  Linkedin,
  Music2,
  Headphones,
  Radio,
  Disc3,
  Video,
  MessageCircle,
  AtSign,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef, Suspense } from 'react';

import { createBrowserClient } from '@/lib/supabase';

// All social media platforms a musician might use
type SocialLinks = {
  // Music Platforms
  spotify: string;
  appleMusic: string;
  soundcloud: string;
  bandcamp: string;
  audiomack: string;
  tidal: string;
  deezer: string;
  amazonMusic: string;
  pandora: string;
  // Video Platforms
  youtube: string;
  vimeo: string;
  twitch: string;
  // Social Networks
  instagram: string;
  twitter: string;
  facebook: string;
  tiktok: string;
  threads: string;
  bluesky: string;
  mastodon: string;
  // Professional
  linkedin: string;
  // Messaging/Community
  discord: string;
  telegram: string;
  // Other Music Industry
  songkick: string;
  bandsintown: string;
  genius: string;
  allMusic: string;
  // Crowdfunding/Support
  patreon: string;
  kofi: string;
  buyMeACoffee: string;
  // Link Aggregators (in case they want to link to their own)
  linktree: string;
  linkInBio: string;
};

type Website = {
  id: string;
  label: string;
  url: string;
};

type ProfileData = {
  username: string;
  display_name: string;
  bio: string;
  profile_picture_url: string;
  is_public: boolean;
  websites: Website[];
  socialLinks: Partial<SocialLinks>;
  phone: string;
  phone_public: boolean;
  email_public: boolean;
  // Musical Identity
  instruments: string[];
  genres: string[];
  location: string;
  yearsExperience: string;
  availableForCollaboration: boolean;
  availableForGigs: boolean;
  // Professional Info
  stageName: string;
  recordLabel: string;
  management: string;
  bookingEmail: string;
  pressEmail: string;
};

function ProfileSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({ checking: false, available: null, error: null });
  const usernameCheckTimeout = useRef<NodeJS.Timeout>();

  // Check if this is first-time setup
  const isSetup = searchParams.get('setup') === 'true';

  // Get the redirect destination for after setup (e.g., invite link)
  const redirectAfterSetup = searchParams.get('redirect');

  // Track timeout for cleanup on unmount
  const redirectTimeoutRef = useRef<NodeJS.Timeout>();

  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    display_name: '',
    bio: '',
    profile_picture_url: '',
    is_public: true,
    websites: [{ id: '1', label: 'Main Website', url: '' }],
    socialLinks: {},
    phone: '',
    phone_public: false,
    email_public: true,
    instruments: [],
    genres: [],
    location: '',
    yearsExperience: '',
    availableForCollaboration: true,
    availableForGigs: false,
    stageName: '',
    recordLabel: '',
    management: '',
    bookingEmail: '',
    pressEmail: '',
  });

  // Social platform configuration for the UI
  const socialPlatforms = [
    // Music Streaming
    {
      key: 'spotify',
      label: 'Spotify',
      icon: Music2,
      color: '#1DB954',
      placeholder: 'spotify.com/artist/...',
    },
    {
      key: 'appleMusic',
      label: 'Apple Music',
      icon: Music,
      color: '#FA243C',
      placeholder: 'music.apple.com/...',
    },
    {
      key: 'soundcloud',
      label: 'SoundCloud',
      icon: Headphones,
      color: '#FF5500',
      placeholder: 'soundcloud.com/...',
    },
    {
      key: 'bandcamp',
      label: 'Bandcamp',
      icon: Disc3,
      color: '#1DA0C3',
      placeholder: 'yourband.bandcamp.com',
    },
    {
      key: 'audiomack',
      label: 'Audiomack',
      icon: Headphones,
      color: '#FFA200',
      placeholder: 'audiomack.com/...',
    },
    { key: 'tidal', label: 'Tidal', icon: Music2, color: '#000000', placeholder: 'tidal.com/...' },
    {
      key: 'deezer',
      label: 'Deezer',
      icon: Music2,
      color: '#FF0092',
      placeholder: 'deezer.com/...',
    },
    {
      key: 'amazonMusic',
      label: 'Amazon Music',
      icon: Music2,
      color: '#FF9900',
      placeholder: 'music.amazon.com/...',
    },
    // Video
    {
      key: 'youtube',
      label: 'YouTube',
      icon: Youtube,
      color: '#FF0000',
      placeholder: '@yourchannel',
    },
    { key: 'vimeo', label: 'Vimeo', icon: Video, color: '#1AB7EA', placeholder: 'vimeo.com/...' },
    { key: 'twitch', label: 'Twitch', icon: Video, color: '#9146FF', placeholder: 'twitch.tv/...' },
    // Social
    {
      key: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      color: '#E4405F',
      placeholder: '@yourhandle',
    },
    {
      key: 'twitter',
      label: 'X (Twitter)',
      icon: Twitter,
      color: '#1DA1F2',
      placeholder: '@yourhandle',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      placeholder: 'facebook.com/...',
    },
    { key: 'tiktok', label: 'TikTok', icon: Music, color: '#000000', placeholder: '@yourhandle' },
    {
      key: 'threads',
      label: 'Threads',
      icon: AtSign,
      color: '#000000',
      placeholder: '@yourhandle',
    },
    {
      key: 'bluesky',
      label: 'Bluesky',
      icon: MessageCircle,
      color: '#0085FF',
      placeholder: '@handle.bsky.social',
    },
    {
      key: 'mastodon',
      label: 'Mastodon',
      icon: MessageCircle,
      color: '#6364FF',
      placeholder: '@handle@instance',
    },
    // Professional
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: '#0A66C2',
      placeholder: 'linkedin.com/in/...',
    },
    // Community
    {
      key: 'discord',
      label: 'Discord',
      icon: MessageCircle,
      color: '#5865F2',
      placeholder: 'discord.gg/...',
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: MessageCircle,
      color: '#26A5E4',
      placeholder: 't.me/...',
    },
    // Music Industry
    {
      key: 'songkick',
      label: 'Songkick',
      icon: Radio,
      color: '#F80046',
      placeholder: 'songkick.com/...',
    },
    {
      key: 'bandsintown',
      label: 'Bandsintown',
      icon: Radio,
      color: '#00CEC8',
      placeholder: 'bandsintown.com/...',
    },
    {
      key: 'genius',
      label: 'Genius',
      icon: Music,
      color: '#FFFF64',
      placeholder: 'genius.com/artists/...',
    },
    // Support
    {
      key: 'patreon',
      label: 'Patreon',
      icon: Globe,
      color: '#FF424D',
      placeholder: 'patreon.com/...',
    },
    { key: 'kofi', label: 'Ko-fi', icon: Globe, color: '#FF5E5B', placeholder: 'ko-fi.com/...' },
    {
      key: 'buyMeACoffee',
      label: 'Buy Me a Coffee',
      icon: Globe,
      color: '#FFDD00',
      placeholder: 'buymeacoffee.com/...',
    },
    // Link Aggregators
    {
      key: 'linktree',
      label: 'Linktree',
      icon: LinkIcon,
      color: '#43E660',
      placeholder: 'linktr.ee/...',
    },
  ];

  // Helper to add a new website
  const addWebsite = () => {
    setProfile((prev) => ({
      ...prev,
      websites: [...prev.websites, { id: Date.now().toString(), label: '', url: '' }],
    }));
  };

  // Helper to remove a website
  const removeWebsite = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      websites: prev.websites.filter((w) => w.id !== id),
    }));
  };

  // Helper to update a website
  const updateWebsite = (id: string, field: 'label' | 'url', value: string) => {
    setProfile((prev) => ({
      ...prev,
      websites: prev.websites.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    }));
  };

  // Helper to update social link
  const updateSocialLink = (key: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Track completion of different sections for progress indicator
  const [sectionCompletion, setSectionCompletion] = useState({
    picture: false,
    basic: false,
    privacy: true,
    contact: false,
  });

  // Calculate overall progress
  const progressPercentage = (() => {
    const sections = Object.values(sectionCompletion);
    const completed = sections.filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  })();

  // Redirect to auth if not logged in, and fetch stored profile data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (user) {
      // Fetch stored profile data from API
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const data = await response.json();
            setProfile((prev) => ({
              ...prev,
              display_name: data.display_name || user.name || user.email?.split('@')[0] || '',
              profile_picture_url: data.profile_picture_url || user.image || '',
              username: data.username || '',
              bio: data.bio || '',
              websites:
                data.websites?.length > 0
                  ? data.websites
                  : [{ id: '1', label: 'Main Website', url: '' }],
              socialLinks: data.socialLinks || {},
              phone: data.phone || '',
              location: data.location || '',
              yearsExperience: data.yearsExperience || '',
              availableForCollaboration: data.availableForCollaboration ?? true,
              availableForGigs: data.availableForGigs ?? false,
              stageName: data.stageName || '',
              recordLabel: data.recordLabel || '',
              management: data.management || '',
              bookingEmail: data.bookingEmail || '',
              pressEmail: data.pressEmail || '',
              instruments: data.instruments || [],
              genres: data.genres || [],
            }));
          } else {
            // Fallback to session data if API fails
            setProfile((prev) => ({
              ...prev,
              display_name: user.name || user.email?.split('@')[0] || '',
              profile_picture_url: user.image || '',
            }));
          }
        } catch (error) {
          console.error('[PROFILE] Failed to fetch profile:', error);
          // Fallback to session data
          setProfile((prev) => ({
            ...prev,
            display_name: user.name || user.email?.split('@')[0] || '',
            profile_picture_url: user.image || '',
          }));
        }
      };

      fetchProfile();
    }
  }, [status, router, user]);

  // Update section completion based on profile data
  useEffect(() => {
    const hasWebsite = profile.websites.some((w) => w.url);
    const hasSocialLink = Object.values(profile.socialLinks).some((v) => v);
    setSectionCompletion({
      picture: !!profile.profile_picture_url,
      basic: !!(profile.username && profile.display_name),
      privacy: true,
      contact: !!(hasWebsite || hasSocialLink),
    });
  }, [profile]);

  // Cleanup timeout on unmount to prevent memory leaks and state updates on unmounted component
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, []);

  // Check username availability with debounce
  useEffect(() => {
    if (!profile.username) {
      setUsernameStatus({ checking: false, available: null, error: null });
      return;
    }

    // Clear previous timeout
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }

    // Set checking state immediately
    setUsernameStatus((prev) => ({ ...prev, checking: true }));

    // Debounce the API call
    usernameCheckTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(profile.username)}`
        );
        const data = await response.json();

        if (data.available) {
          setUsernameStatus({ checking: false, available: true, error: null });
        } else {
          setUsernameStatus({
            checking: false,
            available: false,
            error: data.error || 'Username unavailable',
          });
        }
      } catch {
        setUsernameStatus({ checking: false, available: null, error: 'Failed to check username' });
      }
    }, 500);
  }, [profile.username]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Save profile to database via API
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, profileCompleted: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update session to mark profile as completed
      await update({ profileCompleted: true });

      setMessage({
        type: 'success',
        text: isSetup
          ? "🎸 Profile complete! Welcome to Rock N' Roll Basement!"
          : 'Profile updated successfully!',
      });

      // Redirect after setup
      if (isSetup) {
        // Clear any existing timeout before setting a new one
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }

        redirectTimeoutRef.current = setTimeout(() => {
          // If we have a custom redirect destination (e.g., from invite link), go there
          // Otherwise, default to dashboard
          const destination = redirectAfterSetup || '/dashboard';

          // Security: Validate redirect URL to prevent open redirect attacks
          // Only allow relative paths starting with /
          if (destination.startsWith('/') && !destination.startsWith('//')) {
            try {
              const url = new URL(destination, 'http://placeholder.com');
              const reEncodedPath = url.pathname + url.search + url.hash;
              router.push(reEncodedPath);
            } catch (error) {
              console.warn('[PROFILE] Failed to parse redirect URL:', error);
              router.push('/dashboard');
            }
          } else {
            router.push('/dashboard');
          }
        }, 2000);
      }
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPicture(true);

    try {
      // Upload to Supabase Storage
      const supabase = createBrowserClient();
      if (!supabase) throw new Error('Storage not available');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from('profile-pictures').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('profile-pictures').getPublicUrl(fileName);

      // Update profile
      setProfile({ ...profile, profile_picture_url: publicUrl });
      setMessage({ type: 'success', text: '🎸 Profile picture uploaded!' });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
          <p style={{ color: 'var(--muted)' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="relative z-10 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Logo at the top - ALWAYS shown per HARD RULE */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                className="mx-auto"
                width={isSetup ? 200 : 160}
                height={isSetup ? 80 : 64}
                priority
              />
            </Link>
          </div>

          {/* Hero header for new users - Matching Landing Page Style */}
          {isSetup && (
            <div className="mb-10 text-center">
              {/* Animated Title - Using hero-text-gradient from landing page */}
              <h1 className="hero-title relative mb-4">
                <span className="hero-text-gradient text-3xl sm:text-4xl md:text-5xl">
                  Welcome to the Basement
                </span>
              </h1>

              <p
                className="mx-auto mb-6 max-w-xl text-lg"
                style={{ color: 'var(--text-secondary)' }}
              >
                Let's set up your artist profile. This helps other musicians discover and
                collaborate with you.
              </p>

              {/* Progress bar - Matching landing page stat style */}
              <div className="mx-auto max-w-md">
                <div className="stat-item rounded-xl p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--muted)' }}>Profile Completion</span>
                    <span className="stat-number text-xl">{progressPercentage}%</span>
                  </div>
                  <div
                    className="h-3 overflow-hidden rounded-full"
                    style={{ background: 'var(--panel)' }}
                  >
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${progressPercentage}%`,
                        background: 'linear-gradient(90deg, var(--accent), #ffd700)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status message */}
          {message && (
            <div
              className="mb-6 rounded-xl p-4"
              style={{
                background:
                  message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${message.type === 'success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
              }}
            >
              <div className="flex items-center gap-3">
                {message.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="tile mb-6 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Camera className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Profile Picture
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Make a great first impression
                </p>
              </div>
              {sectionCompletion.picture && (
                <CheckCircle2 className="ml-auto h-6 w-6" style={{ color: 'var(--success)' }} />
              )}
            </div>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative">
                <div
                  className="relative h-28 w-28 overflow-hidden rounded-xl sm:h-32 sm:w-32"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), #ffd700)',
                    boxShadow: '0 8px 32px rgba(255, 99, 71, 0.3)',
                  }}
                >
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                  <div className="button inline-flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                  </div>
                </label>
                <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
                  JPG, PNG or GIF • Max 5MB
                  <br />
                  <span className="text-xs">Square images work best</span>
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="tile mb-6 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <User className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Basic Information
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Tell us about yourself
                </p>
              </div>
              {sectionCompletion.basic && (
                <CheckCircle2 className="ml-auto h-6 w-6" style={{ color: 'var(--success)' }} />
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="profile-username"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Username (Alias)
                  <span className="text-xs" style={{ color: 'var(--accent)' }}>
                    *Required
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="profile-username"
                    type="text"
                    value={profile.username}
                    onChange={(e) => {
                      // Only allow valid username characters
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                      setProfile({ ...profile, username: value });
                    }}
                    placeholder="rockstar123"
                    className="w-full rounded-lg px-4 py-3 pr-10 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: `1px solid ${
                        usernameStatus.available === true
                          ? 'var(--success)'
                          : usernameStatus.available === false
                            ? 'var(--error)'
                            : 'var(--border)'
                      }`,
                      color: 'var(--text)',
                    }}
                  />
                  {/* Username status indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus.checking && (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--muted)] border-t-transparent" />
                    )}
                    {!usernameStatus.checking && usernameStatus.available === true && (
                      <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--success)' }} />
                    )}
                    {!usernameStatus.checking && usernameStatus.available === false && (
                      <span className="text-sm" style={{ color: 'var(--error)' }}>
                        ✕
                      </span>
                    )}
                  </div>
                </div>
                {usernameStatus.error && (
                  <p className="mt-2 text-xs" style={{ color: 'var(--error)' }}>
                    {usernameStatus.error}
                  </p>
                )}
                {!usernameStatus.error && (
                  <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                    Your unique handle. Others can find you by this username.
                  </p>
                )}
                {profile.username && (
                  <div
                    className="mt-3 flex items-center gap-2 rounded-lg p-3"
                    style={{
                      background: 'rgba(255, 99, 71, 0.1)',
                      border: '1px solid rgba(255, 99, 71, 0.2)',
                    }}
                  >
                    <Globe className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>
                      Your public profile:
                    </span>
                    <Link
                      href={`/u/${profile.username}`}
                      target="_blank"
                      className="text-sm font-medium underline underline-offset-2 transition-colors hover:opacity-80"
                      style={{ color: 'var(--accent)' }}
                    >
                      cronkwaters.com/u/{profile.username}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://cronkwaters.com/u/${profile.username}`
                        );
                        setMessage({ type: 'success', text: 'Profile link copied!' });
                        setTimeout(() => setMessage(null), 2000);
                      }}
                      className="ml-auto rounded-md p-1.5 transition-colors hover:bg-white/10"
                      title="Copy link"
                    >
                      <LinkIcon className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="profile-display-name"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Display Name
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="profile-bio"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell the world about your music... What instruments do you play? What's your style?"
                  rows={4}
                  className="w-full resize-none rounded-lg px-4 py-3 transition-all duration-200"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="tile mb-6 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Shield className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Privacy Settings
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Control who can see your information
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Public Profile Toggle */}
              <div
                className="flex items-center justify-between rounded-lg p-4 transition-colors"
                style={{ background: 'var(--panel)' }}
              >
                <div className="flex items-center gap-3">
                  {profile.is_public ? (
                    <Eye className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  ) : (
                    <EyeOff className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                  )}
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      Public Profile
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {profile.is_public
                        ? 'Others can find and view your profile'
                        : 'Only you can see your profile'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, is_public: !profile.is_public })}
                  className="relative h-8 w-14 rounded-full transition-all duration-300"
                  style={{
                    background: profile.is_public
                      ? 'linear-gradient(90deg, var(--accent), #ffd700)'
                      : 'var(--border)',
                    boxShadow: profile.is_public ? '0 4px 12px rgba(255, 99, 71, 0.3)' : 'none',
                  }}
                >
                  <div
                    className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300"
                    style={{ left: profile.is_public ? 'calc(100% - 28px)' : '4px' }}
                  />
                </button>
              </div>

              {/* Email Visibility Toggle */}
              <div
                className="flex items-center justify-between rounded-lg p-4 transition-colors"
                style={{ background: 'var(--panel)' }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>
                    Email Visibility
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Show email on public profile
                  </p>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, email_public: !profile.email_public })}
                  className="relative h-8 w-14 rounded-full transition-all duration-300"
                  style={{
                    background: profile.email_public
                      ? 'linear-gradient(90deg, var(--accent), #ffd700)'
                      : 'var(--border)',
                    boxShadow: profile.email_public ? '0 4px 12px rgba(255, 99, 71, 0.3)' : 'none',
                  }}
                >
                  <div
                    className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300"
                    style={{ left: profile.email_public ? 'calc(100% - 28px)' : '4px' }}
                  />
                </button>
              </div>

              {/* Phone Visibility Toggle */}
              <div
                className="flex items-center justify-between rounded-lg p-4 transition-colors"
                style={{ background: 'var(--panel)' }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>
                    Phone Number Visibility
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Show phone on public profile
                  </p>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, phone_public: !profile.phone_public })}
                  className="relative h-8 w-14 rounded-full transition-all duration-300"
                  style={{
                    background: profile.phone_public
                      ? 'linear-gradient(90deg, var(--accent), #ffd700)'
                      : 'var(--border)',
                    boxShadow: profile.phone_public ? '0 4px 12px rgba(255, 99, 71, 0.3)' : 'none',
                  }}
                >
                  <div
                    className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300"
                    style={{ left: profile.phone_public ? 'calc(100% - 28px)' : '4px' }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Musical Identity */}
          <div className="tile mb-6 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Music className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Musical Identity
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Tell us about your music
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-stage-name"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Music className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    Stage Name / Artist Name
                  </label>
                  <input
                    id="profile-stage-name"
                    type="text"
                    value={profile.stageName}
                    onChange={(e) => setProfile({ ...profile, stageName: e.target.value })}
                    placeholder="Your stage name"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-location"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    Location
                  </label>
                  <input
                    id="profile-location"
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, State/Country"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-record-label"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Disc3 className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    Record Label
                  </label>
                  <input
                    id="profile-record-label"
                    type="text"
                    value={profile.recordLabel}
                    onChange={(e) => setProfile({ ...profile, recordLabel: e.target.value })}
                    placeholder="Independent or label name"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-years-experience"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Years of Experience
                  </label>
                  <input
                    id="profile-years-experience"
                    type="text"
                    value={profile.yearsExperience}
                    onChange={(e) => setProfile({ ...profile, yearsExperience: e.target.value })}
                    placeholder="e.g., 5+ years"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>

              {/* Availability toggles */}
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between rounded-lg p-4 transition-colors"
                  style={{ background: 'var(--panel)' }}
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      Available for Collaboration
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Open to working with other musicians
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setProfile({
                        ...profile,
                        availableForCollaboration: !profile.availableForCollaboration,
                      })
                    }
                    className="relative h-8 w-14 rounded-full transition-all duration-300"
                    style={{
                      background: profile.availableForCollaboration
                        ? 'linear-gradient(90deg, var(--accent), #ffd700)'
                        : 'var(--border)',
                      boxShadow: profile.availableForCollaboration
                        ? '0 4px 12px rgba(255, 99, 71, 0.3)'
                        : 'none',
                    }}
                  >
                    <div
                      className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300"
                      style={{
                        left: profile.availableForCollaboration ? 'calc(100% - 28px)' : '4px',
                      }}
                    />
                  </button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg p-4 transition-colors"
                  style={{ background: 'var(--panel)' }}
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      Available for Gigs
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Open to booking inquiries
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setProfile({ ...profile, availableForGigs: !profile.availableForGigs })
                    }
                    className="relative h-8 w-14 rounded-full transition-all duration-300"
                    style={{
                      background: profile.availableForGigs
                        ? 'linear-gradient(90deg, var(--accent), #ffd700)'
                        : 'var(--border)',
                      boxShadow: profile.availableForGigs
                        ? '0 4px 12px rgba(255, 99, 71, 0.3)'
                        : 'none',
                    }}
                  >
                    <div
                      className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300"
                      style={{ left: profile.availableForGigs ? 'calc(100% - 28px)' : '4px' }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="tile mb-6 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Phone className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Contact Information
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  How people can reach you
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Phone className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-management"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Management
                  </label>
                  <input
                    id="profile-management"
                    type="text"
                    value={profile.management}
                    onChange={(e) => setProfile({ ...profile, management: e.target.value })}
                    placeholder="Manager name or company"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-booking-email"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Booking Email
                  </label>
                  <input
                    id="profile-booking-email"
                    type="email"
                    value={profile.bookingEmail}
                    onChange={(e) => setProfile({ ...profile, bookingEmail: e.target.value })}
                    placeholder="booking@yourband.com"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-press-email"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Press / Media Email
                  </label>
                  <input
                    id="profile-press-email"
                    type="email"
                    value={profile.pressEmail}
                    onChange={(e) => setProfile({ ...profile, pressEmail: e.target.value })}
                    placeholder="press@yourband.com"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Websites - Multiple */}
          <div className="tile mb-6 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Globe className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Websites
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Add multiple websites (band site, merch store, etc.)
                </p>
              </div>
              {sectionCompletion.contact && (
                <CheckCircle2 className="ml-auto h-6 w-6" style={{ color: 'var(--success)' }} />
              )}
            </div>

            <div className="space-y-4">
              {profile.websites.map((website, index) => (
                <div key={website.id} className="flex gap-3">
                  <input
                    type="text"
                    value={website.label}
                    onChange={(e) => updateWebsite(website.id, 'label', e.target.value)}
                    placeholder="Label (e.g., Official Site)"
                    className="w-1/3 rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                  <input
                    type="url"
                    value={website.url}
                    onChange={(e) => updateWebsite(website.id, 'url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="flex-1 rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                  {profile.websites.length > 1 && (
                    <button
                      onClick={() => removeWebsite(website.id)}
                      className="flex h-12 w-12 items-center justify-center rounded-lg transition-colors hover:bg-red-500/20"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addWebsite}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--muted)',
                }}
              >
                <Plus className="h-5 w-5" />
                Add Another Website
              </button>
            </div>
          </div>

          {/* Social Media Links - Comprehensive */}
          <div className="tile mb-6 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <LinkIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Social & Music Platforms
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Connect all your platforms in one place
                </p>
              </div>
            </div>

            {/* Music Streaming Platforms */}
            <div className="mb-6">
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-medium"
                style={{ color: 'var(--text)' }}
              >
                <Music2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Music Streaming
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {socialPlatforms
                  .filter((p) =>
                    [
                      'spotify',
                      'appleMusic',
                      'soundcloud',
                      'bandcamp',
                      'audiomack',
                      'tidal',
                      'deezer',
                      'amazonMusic',
                    ].includes(p.key)
                  )
                  .map((platform) => (
                    <div key={platform.key}>
                      <label
                        htmlFor={`social-${platform.key}`}
                        className="mb-2 flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                        {platform.label}
                      </label>
                      <input
                        id={`social-${platform.key}`}
                        type="text"
                        value={profile.socialLinks[platform.key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Video Platforms */}
            <div className="mb-6">
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-medium"
                style={{ color: 'var(--text)' }}
              >
                <Video className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Video Platforms
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {socialPlatforms
                  .filter((p) => ['youtube', 'vimeo', 'twitch'].includes(p.key))
                  .map((platform) => (
                    <div key={platform.key}>
                      <label
                        htmlFor={`social-${platform.key}`}
                        className="mb-2 flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                        {platform.label}
                      </label>
                      <input
                        id={`social-${platform.key}`}
                        type="text"
                        value={profile.socialLinks[platform.key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Social Networks */}
            <div className="mb-6">
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-medium"
                style={{ color: 'var(--text)' }}
              >
                <Instagram className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Social Networks
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {socialPlatforms
                  .filter((p) =>
                    [
                      'instagram',
                      'twitter',
                      'facebook',
                      'tiktok',
                      'threads',
                      'bluesky',
                      'mastodon',
                      'linkedin',
                    ].includes(p.key)
                  )
                  .map((platform) => (
                    <div key={platform.key}>
                      <label
                        htmlFor={`social-${platform.key}`}
                        className="mb-2 flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                        {platform.label}
                      </label>
                      <input
                        id={`social-${platform.key}`}
                        type="text"
                        value={profile.socialLinks[platform.key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Community & Messaging */}
            <div className="mb-6">
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-medium"
                style={{ color: 'var(--text)' }}
              >
                <MessageCircle className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Community & Messaging
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {socialPlatforms
                  .filter((p) => ['discord', 'telegram'].includes(p.key))
                  .map((platform) => (
                    <div key={platform.key}>
                      <label
                        htmlFor={`social-${platform.key}`}
                        className="mb-2 flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                        {platform.label}
                      </label>
                      <input
                        id={`social-${platform.key}`}
                        type="text"
                        value={profile.socialLinks[platform.key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Live Music & Tours */}
            <div className="mb-6">
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-medium"
                style={{ color: 'var(--text)' }}
              >
                <Radio className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Live Music & Tours
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {socialPlatforms
                  .filter((p) => ['songkick', 'bandsintown', 'genius'].includes(p.key))
                  .map((platform) => (
                    <div key={platform.key}>
                      <label
                        htmlFor={`social-${platform.key}`}
                        className="mb-2 flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                        {platform.label}
                      </label>
                      <input
                        id={`social-${platform.key}`}
                        type="text"
                        value={profile.socialLinks[platform.key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Support & Crowdfunding */}
            <div className="mb-6">
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-medium"
                style={{ color: 'var(--text)' }}
              >
                <Globe className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Support & Crowdfunding
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {socialPlatforms
                  .filter((p) => ['patreon', 'kofi', 'buyMeACoffee'].includes(p.key))
                  .map((platform) => (
                    <div key={platform.key}>
                      <label
                        htmlFor={`social-${platform.key}`}
                        className="mb-2 flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                        {platform.label}
                      </label>
                      <input
                        id={`social-${platform.key}`}
                        type="text"
                        value={profile.socialLinks[platform.key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Link Aggregators */}
            <div>
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-medium"
                style={{ color: 'var(--text)' }}
              >
                <LinkIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Link Aggregators
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {socialPlatforms
                  .filter((p) => ['linktree'].includes(p.key))
                  .map((platform) => (
                    <div key={platform.key}>
                      <label
                        htmlFor={`social-${platform.key}`}
                        className="mb-2 flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                        {platform.label}
                      </label>
                      <input
                        id={`social-${platform.key}`}
                        type="text"
                        value={profile.socialLinks[platform.key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Music Samples */}
          <div className="tile mb-8 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Music className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Music Samples
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Coming soon
                </p>
              </div>
            </div>

            <div
              className="rounded-xl border-2 border-dashed p-8 text-center transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
            >
              <Upload className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--muted)' }} />
              <p className="mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Music upload feature coming soon
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Showcase your work with audio samples • MP3, WAV, FLAC • Up to 50MB per track
              </p>
            </div>
          </div>

          {/* Action Button - Sticky Footer */}
          <div className="sticky bottom-4 z-10">
            <div
              className="rounded-xl p-5"
              style={{
                background: 'rgba(42, 42, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="font-medium" style={{ color: 'var(--text)' }}>
                    {profile.is_public ? '🎸 Your profile is public' : '🔒 Your profile is private'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {isSetup
                      ? 'Complete your profile to get started'
                      : 'Changes will be saved to your profile'}
                  </p>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={
                    saving ||
                    !profile.username ||
                    usernameStatus.available === false ||
                    usernameStatus.checking
                  }
                  className="button hero-button-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {isSetup ? 'Complete Setup' : 'Save Profile'}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                  <div className="button-shine"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Preview Link */}
          {profile.username && (
            <div
              className="mt-6 rounded-xl p-4 text-center"
              style={{
                background: 'rgba(255, 99, 71, 0.1)',
                border: '1px solid rgba(255, 99, 71, 0.3)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--accent)' }}>
                🎸 Your public profile will be at:{' '}
                <a
                  href={`/u/${profile.username}`}
                  className="font-mono font-semibold underline underline-offset-4 transition-colors"
                  style={{ color: '#ffd700' }}
                >
                  cronkwaters.com/u/{profile.username}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileSettingsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
        </div>
      }
    >
      <ProfileSettingsContent />
    </Suspense>
  );
}
