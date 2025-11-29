'use client';

import { Card, Button } from '@cronkwaters/ui';
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
  Sparkles,
  User,
  Link as LinkIcon,
  Shield,
  CheckCircle2,
  ArrowRight,
  Camera,
} from 'lucide-react';
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
  const [uploadingMusic, setUploadingMusic] = useState(false);

  // Track completion of different sections for progress indicator
  const [sectionCompletion, setSectionCompletion] = useState({
    picture: false,
    basic: false,
    privacy: false,
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
      basic: !!(profile.username && profile.display_name && profile.bio),
      privacy: true, // Privacy defaults are set
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
          ? 'Profile setup complete! Welcome to Rock N Roll Basement!'
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
            // Fix: Use URL constructor to properly preserve query parameter encoding
            //
            // Problem: destination from searchParams.get() is already decoded once by Next.js.
            // Query params like email=user%2Btest%40example.com are still percent-encoded.
            // Manual re-encoding would double-encode (%2B → %252B), corrupting the URL.
            //
            // Solution: Use URL constructor which parses and preserves proper encoding
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
      setMessage({ type: 'success', text: 'Profile picture uploaded!' });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20">
      {/* Animated background effect */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="animation-delay-2000 absolute -right-40 top-1/2 h-80 w-80 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative px-4 py-8 sm:py-12">
        <div className="rnrb-container mx-auto max-w-4xl">
          {/* Hero header for new users */}
          {isSetup && (
            <div className="mb-8 text-center sm:mb-12">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-3 backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <h1 className="mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                Welcome to Rock N Roll Basement
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-400">
                Let's create your artist profile. This helps other musicians discover and connect
                with you.
              </p>

              {/* Progress bar */}
              <div className="mx-auto mt-6 max-w-md">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Profile Completion</span>
                  <span className="font-semibold text-purple-400">{progressPercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status message with animation */}
          {message && (
            <div
              className={`mb-6 rounded-xl border p-4 backdrop-blur-sm duration-500 animate-in fade-in slide-in-from-top-5 ${
                message.type === 'success'
                  ? 'border-green-500/30 bg-green-500/10 text-green-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              <div className="flex items-center gap-3">
                {message.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          )}

          {/* Profile Picture Section */}
          <Card className="group mb-6 overflow-hidden border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Camera className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                  Profile Picture
                </h2>
                <p className="text-sm text-gray-400">Make a great first impression</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative">
                <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-xl shadow-purple-500/20 transition-transform duration-300 hover:scale-105 sm:h-36 sm:w-36">
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-white">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {sectionCompletion.picture && (
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <label className="group/upload cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                  <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:from-purple-500 hover:to-purple-600 hover:shadow-xl hover:shadow-purple-500/40">
                    <Upload className="h-5 w-5" />
                    {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                  </div>
                </label>
                <p className="mt-3 text-sm text-gray-400">
                  JPG, PNG or GIF • Max 5MB
                  <br />
                  <span className="text-xs text-gray-500">Square images work best</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="group mb-6 overflow-hidden border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <User className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                    Basic Information
                  </h2>
                  <p className="text-sm text-gray-400">Tell us about yourself</p>
                </div>
              </div>
              {sectionCompletion.basic && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="group/input">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  Username (Alias)
                  <span className="text-xs text-purple-400">*Required</span>
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="rockstar123"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground transition-all duration-200 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Your unique handle. Others can find you by this username.
                </p>
              </div>

              <div className="group/input">
                <label className="mb-2 block text-sm font-medium text-gray-300">Display Name</label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground transition-all duration-200 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <p className="mt-2 text-xs text-gray-400">How your name appears to others</p>
              </div>

              <div className="group/input">
                <label className="mb-2 block text-sm font-medium text-gray-300">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell the world about your music... What instruments do you play? What's your style? What are you working on?"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground transition-all duration-200 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Share your musical journey, style, and what you're passionate about
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="group mb-6 overflow-hidden border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                    Privacy Settings
                  </h2>
                  <p className="text-sm text-gray-400">Control who can see your information</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div className="flex items-center gap-3">
                  {profile.is_public ? (
                    <Eye className="h-5 w-5 text-purple-400" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">Public Profile</p>
                    <p className="text-sm text-gray-400">
                      {profile.is_public
                        ? 'Others can find and view your profile'
                        : 'Only you can see your profile'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, is_public: !profile.is_public })}
                  className={`relative h-8 w-16 rounded-full transition-all duration-300 ${
                    profile.is_public
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30'
                      : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                      profile.is_public ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div>
                  <p className="font-medium text-foreground">Email Visibility</p>
                  <p className="text-sm text-gray-400">Show email on public profile</p>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, email_public: !profile.email_public })}
                  className={`relative h-8 w-16 rounded-full transition-all duration-300 ${
                    profile.email_public
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30'
                      : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                      profile.email_public ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div>
                  <p className="font-medium text-foreground">Phone Number Visibility</p>
                  <p className="text-sm text-gray-400">Show phone on public profile</p>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, phone_public: !profile.phone_public })}
                  className={`relative h-8 w-16 rounded-full transition-all duration-300 ${
                    profile.phone_public
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30'
                      : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                      profile.phone_public ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Contact & Links */}
          <Card className="group mb-6 overflow-hidden border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <LinkIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                    Connect & Links
                  </h2>
                  <p className="text-sm text-gray-400">Share your social presence</p>
                </div>
              </div>
              {sectionCompletion.contact && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="group/input">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Phone className="h-4 w-4 text-purple-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground transition-all duration-200 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="group/input">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Globe className="h-4 w-4 text-purple-400" />
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground transition-all duration-200 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="group/input">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Instagram className="h-4 w-4 text-pink-400" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="@yourhandle"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground transition-all duration-200 placeholder:text-gray-500 focus:border-pink-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>

                <div className="group/input">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Youtube className="h-4 w-4 text-red-400" />
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={profile.youtube}
                    onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                    placeholder="@yourchannel"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground transition-all duration-200 placeholder:text-gray-500 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="group/input">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Twitter className="h-4 w-4 text-blue-400" />X (Twitter)
                </label>
                <input
                  type="text"
                  value={profile.twitter}
                  onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                  placeholder="@yourhandle"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </Card>

          {/* Music Samples */}
          <Card className="group mb-8 overflow-hidden border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Music className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Music Samples</h2>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center transition-all hover:border-purple-500/30 hover:bg-white/10">
              <Upload className="mx-auto mb-4 h-16 w-16 text-gray-500" />
              <p className="mb-2 font-medium text-gray-300">Music upload feature coming soon</p>
              <p className="text-sm text-gray-500">
                Showcase your work with audio samples • MP3, WAV, FLAC • Up to 50MB per track
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="sticky bottom-4 z-10">
            <Card className="border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="font-medium text-foreground">
                    {profile.is_public ? '🌍 Your profile is public' : '🔒 Your profile is private'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {isSetup
                      ? 'Complete your profile to get started'
                      : 'Changes will be saved to your profile'}
                  </p>
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving || !profile.username}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {saving ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {isSetup ? 'Complete Setup' : 'Save Profile'}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Profile Preview Link */}
          {profile.username && (
            <div className="mt-6 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 backdrop-blur-sm">
              <p className="text-center text-sm text-blue-300">
                ✨ Your public profile will be at:{' '}
                <a
                  href={`/u/${profile.username}`}
                  className="font-mono font-semibold text-blue-400 underline decoration-blue-400/30 underline-offset-4 transition-colors hover:text-blue-300 hover:decoration-blue-300"
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
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      }
    >
      <ProfileSettingsContent />
    </Suspense>
  );
}
