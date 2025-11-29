'use client';

import { Button } from '@cronkwaters/ui';
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
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';

import { createBrowserClient } from '@/lib/supabase';

type ProfileData = {
  username: string;
  display_name: string;
  bio: string;
  profile_picture_url: string;
  is_public: boolean;
  website: string;
  instagram: string;
  youtube: string;
  twitter: string;
  phone: string;
  phone_public: boolean;
  email_public: boolean;
  instruments: string[];
  genres: string[];
};

function ProfileSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    website: '',
    instagram: '',
    youtube: '',
    twitter: '',
    phone: '',
    phone_public: false,
    email_public: true,
    instruments: [],
    genres: [],
  });

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

  // Redirect to auth if not logged in, and set initial profile
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (user) {
      // Set display name from session
      setProfile((prev) => ({
        ...prev,
        display_name: user.name || user.email?.split('@')[0] || '',
        profile_picture_url: user.image || '',
      }));
    }
  }, [status, router, user]);

  // Update section completion based on profile data
  useEffect(() => {
    setSectionCompletion({
      picture: !!profile.profile_picture_url,
      basic: !!(profile.username && profile.display_name),
      privacy: true,
      contact: !!(profile.website || profile.instagram || profile.youtube || profile.twitter),
    });
  }, [profile]);

  // Cleanup timeout on unmount to prevent memory leaks and state updates on unmounted component
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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
          let destination = redirectAfterSetup || '/dashboard';

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
      {/* Animated Background - Matching Landing Page */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Floating music notes */}
        <div className="music-notes-container">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="music-note"
              style={{
                left: `${10 + i * 12}%`,
                animationDelay: `${i * 1.2}s`,
                fontSize: `${16 + (i % 3) * 6}px`,
              }}
            >
              {['♪', '♫', '♬', '♩'][i % 4]}
            </div>
          ))}
        </div>

        {/* Gradient orbs - same as landing page */}
        <div className="gradient-orb gradient-orb-1" style={{ opacity: 0.4 }}></div>
        <div className="gradient-orb gradient-orb-2" style={{ opacity: 0.3 }}></div>
        <div className="gradient-orb gradient-orb-3" style={{ opacity: 0.2 }}></div>

        {/* Subtle grid pattern */}
        <div className="hero-grid-pattern" style={{ opacity: 0.5 }}></div>
      </div>

      <div className="relative z-10 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Hero header for new users - Matching Landing Page Style */}
          {isSetup && (
            <div className="mb-10 text-center">
              {/* Logo */}
              <div className="logo-hero-wrapper mb-6">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  className="logo-hero mx-auto"
                  width={200}
                  height={80}
                  priority
                />
                <div className="logo-hero-glow"></div>
              </div>

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
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Username (Alias)
                  <span className="text-xs" style={{ color: 'var(--accent)' }}>
                    *Required
                  </span>
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="rockstar123"
                  className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                  Your unique handle. Others can find you by this username.
                </p>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Display Name
                </label>
                <input
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
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Bio
                </label>
                <textarea
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

          {/* Contact & Links */}
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
                  Connect & Links
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Share your social presence
                </p>
              </div>
              {sectionCompletion.contact && (
                <CheckCircle2 className="ml-auto h-6 w-6" style={{ color: 'var(--success)' }} />
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Phone className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Phone Number
                </label>
                <input
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
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Globe className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Instagram className="h-4 w-4" style={{ color: '#E4405F' }} />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="@yourhandle"
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
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Youtube className="h-4 w-4" style={{ color: '#FF0000' }} />
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={profile.youtube}
                    onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                    placeholder="@yourchannel"
                    className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Twitter className="h-4 w-4" style={{ color: '#1DA1F2' }} />X (Twitter)
                </label>
                <input
                  type="text"
                  value={profile.twitter}
                  onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                  placeholder="@yourhandle"
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
                  disabled={saving || !profile.username}
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
