'use client';

import { useEffect, useState } from 'react';
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
  Instagram,
  Youtube,
  Twitter,
  Music2,
  Disc,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

type ProfileData = {
  username: string;
  display_name: string;
  bio: string;
  profile_picture_url: string;
  is_public: boolean;
  
  // Contact
  website: string;
  phone: string;
  phone_public: boolean;
  email_public: boolean;
  
  // Social Media
  instagram: string;
  youtube: string;
  twitter: string;
  tiktok: string;
  spotify_artist: string;
  apple_music: string;
  soundcloud: string;
  bandcamp: string;
  
  // Musical Identity
  instruments: string[];
  genres: string[];
  bands_current: string[]; // Bands currently in
  bands_past: string[]; // Bands previously played with
  collaborators: string[]; // Notable collaborators
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
    phone: '',
    phone_public: false,
    email_public: true,
    instagram: '',
    youtube: '',
    twitter: '',
    tiktok: '',
    spotify_artist: '',
    apple_music: '',
    soundcloud: '',
    bandcamp: '',
    instruments: [],
    genres: [],
    bands_current: [],
    bands_past: [],
    collaborators: []
  });

  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [newBand, setNewBand] = useState('');
  const [newPastBand, setNewPastBand] = useState('');

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
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
            tiktok: user.user_metadata.tiktok || '',
            spotify_artist: user.user_metadata.spotify_artist || '',
            apple_music: user.user_metadata.apple_music || '',
            soundcloud: user.user_metadata.soundcloud || '',
            bandcamp: user.user_metadata.bandcamp || '',
            phone: user.user_metadata.phone || '',
            phone_public: user.user_metadata.phone_public || false,
            email_public: user.user_metadata.email_public !== false,
            instruments: user.user_metadata.instruments || [],
            genres: user.user_metadata.genres || [],
            bands_current: user.user_metadata.bands_current || [],
            bands_past: user.user_metadata.bands_past || [],
            collaborators: user.user_metadata.collaborators || []
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
        text: 'Profile updated successfully'
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase!.storage
        .from('profile-pictures')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase!.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfile({ ...profile, profile_picture_url: publicUrl });
      setMessage({ type: 'success', text: 'Profile picture uploaded' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Upload failed' });
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0f1e] to-[#0f172a]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] via-[#0f172a] to-[#050816] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-serif font-bold text-white mb-3">Profile</h1>
          <p className="text-xl text-gray-400 mb-8">
            Build your musical identity
          </p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Profile Picture */}
        <Card className="p-8 mb-6 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-2xl font-serif font-semibold text-white mb-6">Profile Picture</h2>
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#c9a961]/30 to-[#c9a961]/10 border-2 border-[#c9a961]/20 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#c9a961]">{user?.email?.[0].toUpperCase()}</span>
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
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a961] text-black rounded-lg hover:bg-[#c9a961]/90 transition-all font-medium">
                  <Upload className="w-4 h-4" />
                  {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                </div>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                JPG or PNG. Maximum 5MB.
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="p-8 mb-6 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-2xl font-serif font-semibold text-white mb-6">Basic Information</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="your-unique-handle"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none focus:ring-1 focus:ring-[#c9a961]"
              />
              <p className="text-xs text-gray-600 mt-1.5">
                Your unique handle. URL: /u/{profile.username || 'username'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="Your Name or Stage Name"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none focus:ring-1 focus:ring-[#c9a961]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell your story..."
                rows={4}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none focus:ring-1 focus:ring-[#c9a961] resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Musical Identity */}
        <Card className="p-8 mb-6 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-2xl font-serif font-semibold text-white mb-6">Musical Identity</h2>
          
          <div className="space-y-6">
            {/* Current Bands */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Current Bands / Projects
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newBand}
                  onChange={(e) => setNewBand(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newBand.trim()) {
                      setProfile({ ...profile, bands_current: [...profile.bands_current, newBand.trim()] });
                      setNewBand('');
                    }
                  }}
                  placeholder="Band name (press Enter to add)"
                  className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.bands_current.map((band, index) => (
                  <span
                    key={index}
                    onClick={() => setProfile({ ...profile, bands_current: profile.bands_current.filter((_, i) => i !== index) })}
                    className="px-3 py-1.5 bg-[#c9a961]/20 border border-[#c9a961]/30 rounded-lg text-[#c9a961] text-sm cursor-pointer hover:bg-[#c9a961]/30 transition-colors"
                  >
                    {band} ×
                  </span>
                ))}
              </div>
            </div>

            {/* Past Bands */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Past Bands / Collaborations
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPastBand}
                  onChange={(e) => setNewPastBand(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newPastBand.trim()) {
                      setProfile({ ...profile, bands_past: [...profile.bands_past, newPastBand.trim()] });
                      setNewPastBand('');
                    }
                  }}
                  placeholder="Previous band (press Enter to add)"
                  className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.bands_past.map((band, index) => (
                  <span
                    key={index}
                    onClick={() => setProfile({ ...profile, bands_past: profile.bands_past.filter((_, i) => i !== index) })}
                    className="px-3 py-1.5 bg-gray-700/30 border border-gray-600/30 rounded-lg text-gray-400 text-sm cursor-pointer hover:bg-gray-700/50 transition-colors"
                  >
                    {band} ×
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Streaming Platforms */}
        <Card className="p-8 mb-6 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-2xl font-serif font-semibold text-white mb-6">Streaming & Social</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Music className="w-4 h-4" />
                Spotify Artist URL
              </label>
              <input
                type="url"
                value={profile.spotify_artist}
                onChange={(e) => setProfile({ ...profile, spotify_artist: e.target.value })}
                placeholder="https://open.spotify.com/artist/..."
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Music2 className="w-4 h-4" />
                Apple Music
              </label>
              <input
                type="url"
                value={profile.apple_music}
                onChange={(e) => setProfile({ ...profile, apple_music: e.target.value })}
                placeholder="https://music.apple.com/artist/..."
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Disc className="w-4 h-4" />
                SoundCloud
              </label>
              <input
                type="text"
                value={profile.soundcloud}
                onChange={(e) => setProfile({ ...profile, soundcloud: e.target.value })}
                placeholder="soundcloud.com/yourprofile"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Music className="w-4 h-4" />
                Bandcamp
              </label>
              <input
                type="text"
                value={profile.bandcamp}
                onChange={(e) => setProfile({ ...profile, bandcamp: e.target.value })}
                placeholder="yourband.bandcamp.com"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <input
                type="text"
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                placeholder="@yourhandle"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </label>
              <input
                type="text"
                value={profile.youtube}
                onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                placeholder="@yourchannel"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                X (Twitter)
              </label>
              <input
                type="text"
                value={profile.twitter}
                onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                placeholder="@yourhandle"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Music2 className="w-4 h-4" />
                TikTok
              </label>
              <input
                type="text"
                value={profile.tiktok}
                onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                placeholder="@yourhandle"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Contact & Website */}
        <Card className="p-8 mb-6 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-2xl font-serif font-semibold text-white mb-6">Contact</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Website
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#c9a961] focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-8 mb-6 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-2xl font-serif font-semibold text-white mb-6 flex items-center gap-2">
            {profile.is_public ? <Eye className="w-5 h-5 text-[#c9a961]" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
            Privacy
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-lg">
              <div>
                <p className="font-medium text-white mb-1">Public Profile</p>
                <p className="text-sm text-gray-500">
                  Allow others to discover and view your profile
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, is_public: !profile.is_public })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  profile.is_public ? 'bg-[#c9a961]' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  profile.is_public ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-lg">
              <div>
                <p className="font-medium text-white mb-1">Email Searchable</p>
                <p className="text-sm text-gray-500">
                  Allow people to find you by email address
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, email_public: !profile.email_public })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  profile.email_public ? 'bg-[#c9a961]' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  profile.email_public ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-lg">
              <div>
                <p className="font-medium text-white mb-1">Phone Searchable</p>
                <p className="text-sm text-gray-500">
                  Allow people to find you by phone number
                </p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, phone_public: !profile.phone_public })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  profile.phone_public ? 'bg-[#c9a961]' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  profile.phone_public ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {profile.is_public ? 'Profile is public' : 'Profile is private'}
          </p>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-[#c9a961] hover:bg-[#c9a961]/90 text-black px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Profile Preview Link */}
        {profile.username && (
          <div className="mt-8 p-5 bg-blue-500/5 border border-blue-500/10 rounded-lg">
            <p className="text-sm text-gray-400">
              Your public profile: 
              <a href={`/u/${profile.username}`} className="font-mono ml-2 text-[#c9a961] hover:underline">
                cronkwaters.com/u/{profile.username}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
