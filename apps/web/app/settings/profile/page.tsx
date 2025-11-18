'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Globe, 
  Music, 
  Upload, 
  Save, 
  Eye, 
  EyeOff,
  Link as LinkIcon,
  Instagram,
  Youtube,
  Twitter,
  Settings as SettingsIcon
} from 'lucide-react';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
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
    genres: []
  });

  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        // Load existing profile from user_metadata
        if (user.user_metadata) {
          setProfile({
            username: user.user_metadata.username || '',
            display_name: user.user_metadata.display_name || user.email?.split('@')[0] || '',
            bio: user.user_metadata.bio || '',
            profile_picture_url: user.user_metadata.profile_picture_url || '',
            is_public: user.user_metadata.is_public !== false,
            website: user.user_metadata.website || '',
            instagram: user.user_metadata.instagram || '',
            youtube: user.user_metadata.youtube || '',
            twitter: user.user_metadata.twitter || '',
            phone: user.user_metadata.phone || '',
            phone_public: user.user_metadata.phone_public || false,
            email_public: user.user_metadata.email_public !== false,
            instruments: user.user_metadata.instruments || [],
            genres: user.user_metadata.genres || []
          });
        }
        setLoading(false);
      }
    });
  }, [router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase!.auth.updateUser({
        data: profile
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update profile'
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase!.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase!.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile
      setProfile({ ...profile, profile_picture_url: publicUrl });
      setMessage({ type: 'success', text: 'Profile picture uploaded!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Upload failed' });
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="rnrb-container max-w-4xl">

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Picture */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-foreground text-3xl font-bold overflow-hidden">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-foreground rounded-lg hover:bg-purple-700 transition">
                  <Upload className="w-4 h-4" />
                  {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                </div>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username (Alias) *
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="rockstar123"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your unique handle. Others can find you by this username.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell the world about your music..."
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-purple-500 focus:outline-none resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe your music style, experience, what you're working on, etc.
              </p>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            {profile.is_public ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            Privacy Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Public Profile</p>
                <p className="text-sm text-muted-foreground">
                  Allow others to find and view your profile
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, is_public: !profile.is_public })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  profile.is_public ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  profile.is_public ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Email Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Show email on public profile (searchable)
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, email_public: !profile.email_public })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  profile.email_public ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  profile.email_public ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Phone Number Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Show phone on public profile (searchable)
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, phone_public: !profile.phone_public })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  profile.phone_public ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  profile.phone_public ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Contact & Links */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Contact & Links</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <input
                type="text"
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                placeholder="@yourhandle"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube Channel
              </label>
              <input
                type="text"
                value={profile.youtube}
                onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                placeholder="@yourchannel or channel URL"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                X (Twitter)
              </label>
              <input
                type="text"
                value={profile.twitter}
                onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                placeholder="@yourhandle"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Music Samples (SoundCloud-style) */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Music Samples (Coming Soon)
          </h2>
          <p className="text-muted-foreground mb-4">
            Upload your music to showcase your work. Others can listen directly on your profile (like SoundCloud).
          </p>
          
          <div className="p-6 border-2 border-dashed border-white/20 rounded-lg text-center bg-white/5">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">Music upload feature coming soon</p>
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
            className="rnrb-button-primary px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Profile Preview Link */}
        {profile.username && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              Your public profile will be at: 
              <a href={`/u/${profile.username}`} className="font-mono ml-2 underline">
                www.cronkwaters.com/u/{profile.username}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

