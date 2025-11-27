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
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function ProfileSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if this is first-time setup
  const isSetup = searchParams.get('setup') === 'true';

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

      // Redirect to dashboard after setup
      if (isSetup) {
        setTimeout(() => {
          router.push('/dashboard');
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
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="rnrb-container max-w-4xl">
        {/* Welcome header for new users */}
        {isSetup && (
          <Card className="mb-6 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6">
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Welcome to Rock N Roll Basement!
            </h1>
            <p className="text-muted-foreground">
              Let's set up your profile so other musicians can find and collaborate with you. You
              can always update this information later in Settings.
            </p>
          </Card>
        )}

        {message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              message.type === 'success'
                ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                : 'border border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Picture */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-3xl font-bold text-foreground">
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.email?.[0].toUpperCase()
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
                <div className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-foreground transition hover:bg-purple-700">
                  <Upload className="h-4 w-4" />
                  {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                </div>
              </label>
              <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Username (Alias) *
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="rockstar123"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Your unique handle. Others can find you by this username.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Display Name</label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="John Doe"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell the world about your music..."
                rows={4}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Describe your music style, experience, what you're working on, etc.
              </p>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            {profile.is_public ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            Privacy Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <div>
                <p className="font-medium text-foreground">Public Profile</p>
                <p className="text-sm text-muted-foreground">
                  Allow others to find and view your profile
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, is_public: !profile.is_public })}
                className={`relative h-7 w-14 rounded-full transition-colors ${
                  profile.is_public ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    profile.is_public ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <div>
                <p className="font-medium text-foreground">Email Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Show email on public profile (searchable)
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, email_public: !profile.email_public })}
                className={`relative h-7 w-14 rounded-full transition-colors ${
                  profile.email_public ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    profile.email_public ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <div>
                <p className="font-medium text-foreground">Phone Number Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Show phone on public profile (searchable)
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, phone_public: !profile.phone_public })}
                className={`relative h-7 w-14 rounded-full transition-colors ${
                  profile.phone_public ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    profile.phone_public ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Contact & Links */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Contact & Links</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-300">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-300">
                <Globe className="h-4 w-4" />
                Website
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-300">
                <Instagram className="h-4 w-4" />
                Instagram
              </label>
              <input
                type="text"
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                placeholder="@yourhandle"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-300">
                <Youtube className="h-4 w-4" />
                YouTube Channel
              </label>
              <input
                type="text"
                value={profile.youtube}
                onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                placeholder="@yourchannel or channel URL"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-300">
                <Twitter className="h-4 w-4" />X (Twitter)
              </label>
              <input
                type="text"
                value={profile.twitter}
                onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                placeholder="@yourhandle"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Music Samples (SoundCloud-style) */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <Music className="h-5 w-5" />
            Music Samples (Coming Soon)
          </h2>
          <p className="mb-4 text-muted-foreground">
            Upload your music to showcase your work. Others can listen directly on your profile
            (like SoundCloud).
          </p>

          <div className="rounded-lg border-2 border-dashed border-white/20 bg-white/5 p-6 text-center">
            <Upload className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-muted-foreground">Music upload feature coming soon</p>
            <p className="text-xs text-muted-foreground">
              Will support: MP3, WAV, FLAC • Up to 50MB per track
            </p>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {profile.is_public ? 'Your profile is public' : 'Your profile is private'}
          </p>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="rnrb-button-primary flex items-center gap-2 rounded-lg px-8 py-3 font-semibold"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Profile Preview Link */}
        {profile.username && (
          <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-400">
              Your public profile will be at:
              <a href={`/u/${profile.username}`} className="ml-2 font-mono underline">
                www.cronkwaters.com/u/{profile.username}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
