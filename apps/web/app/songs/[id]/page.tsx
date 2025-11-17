'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Save, Users, Mail, Lock, Globe, Trash2, Download } from 'lucide-react';
import dynamic from 'next/dynamic';

const SongVideoSession = dynamic(() => import('@/components/song/song-video-session'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-[600px] rounded-lg bg-white/5" />
});

interface Song {
  id: string;
  title: string;
  lyrics: string;
  key?: string;
  tempo?: number;
  visibility: 'private' | 'org' | 'public';
  createdAt: string;
  updatedAt: string;
  projectId?: string | null;
  collaborators: string[];
}

export default function SongEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [song, setSong] = useState<Song | null>(null);
  const [saving, setSaving] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        const songs = user.user_metadata?.songs || [];
        const foundSong = songs.find((s: Song) => s.id === params.id);
        if (foundSong) {
          setSong(foundSong);
        } else {
          router.push('/songs');
        }
        setLoading(false);
      }
    });
  }, [router, params.id]);

  const handleSave = async () => {
    if (!song || !user) return;

    setSaving(true);
    try {
      const songs = user.user_metadata?.songs || [];
      const updatedSongs = songs.map((s: Song) =>
        s.id === song.id ? { ...song, updatedAt: new Date().toISOString() } : s
      );

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          songs: updatedSongs,
        },
      });

      if (error) throw error;

      // Success feedback
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      console.error('Save error:', error);
      setSaving(false);
    }
  };

  const handleInviteCollaborator = () => {
    if (!inviteEmail.trim() || !song) return;

    // TODO: Send email invitation
    // For now, just add to collaborators list
    const updatedSong = {
      ...song,
      collaborators: [...song.collaborators, inviteEmail],
    };
    setSong(updatedSong);
    setInviteEmail('');
    handleSave();
  };

  const exportLyrics = () => {
    if (!song) return;
    
    const blob = new Blob([`${song.title}\n\n${song.lyrics}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-zinc-400 font-mono text-sm uppercase tracking-widest"
        >
          Loading Song...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link 
            href="/songs" 
            className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-colors inline-block mb-6"
          >
            ← BACK TO LIBRARY
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-[family-name:var(--rnrb-font-marker)] text-4xl text-white mb-4">
                {song.title}
              </h1>
              <div className="flex items-center gap-4 font-mono text-xs text-zinc-500">
                {song.key && <span>KEY: {song.key}</span>}
                {song.tempo && <span>{song.tempo} BPM</span>}
                <span className="flex items-center gap-1">
                  {song.visibility === 'private' && <Lock className="w-3 h-3" />}
                  {song.visibility === 'org' && <UsersIcon className="w-3 h-3 text-blue-500" />}
                  {song.visibility === 'public' && <Globe className="w-3 h-3 text-green-500" />}
                  {song.visibility.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportLyrics}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 font-mono text-xs uppercase tracking-wider transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                EXPORT
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-white text-black font-mono text-xs uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {saving ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-zinc-800 bg-zinc-900/50 p-8"
            >
              <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-zinc-400 mb-6">
                LYRICS
              </h2>
              
              <textarea
                value={song.lyrics}
                onChange={(e) => setSong({ ...song, lyrics: e.target.value })}
                className="w-full h-[600px] px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none font-mono text-sm resize-none"
                placeholder="Write your lyrics here..."
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Song Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-4">
                SONG DETAILS
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                    KEY
                  </label>
                  <input
                    type="text"
                    value={song.key || ''}
                    onChange={(e) => setSong({ ...song, key: e.target.value })}
                    placeholder="C, Am, G"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                    TEMPO
                  </label>
                  <input
                    type="number"
                    value={song.tempo || ''}
                    onChange={(e) => setSong({ ...song, tempo: parseInt(e.target.value) || undefined })}
                    placeholder="120"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                    VISIBILITY
                  </label>
                  <select
                    value={song.visibility}
                    onChange={(e) => setSong({ ...song, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:border-zinc-600 focus:outline-none font-mono text-sm"
                  >
                    <option value="private">PRIVATE</option>
                    <option value="org">TEAM</option>
                    <option value="public">PUBLIC</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Collaborators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-4">
                COLLABORATORS
              </h3>
              
              {song.collaborators.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {song.collaborators.map((collab, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-black/30 rounded">
                      <span className="text-sm text-zinc-400">{collab}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600 mb-4">
                  No collaborators yet
                </p>
              )}

              <div className="space-y-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none font-mono text-xs"
                />
                <button
                  onClick={handleInviteCollaborator}
                  disabled={!inviteEmail.trim()}
                  className="w-full px-4 py-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-3 h-3 inline mr-2" />
                  INVITE
                </button>
              </div>
            </motion.div>

            {/* Video Session */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-4">
                CO-WRITE SESSION
              </h3>
              
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="w-full px-4 py-3 bg-white text-black hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider transition-colors"
              >
                {showVideo ? 'HIDE VIDEO' : 'START VIDEO'}
              </button>
              
              {showVideo && (
                <div className="mt-4">
                  <SongVideoSession 
                    songId={song.id}
                    songTitle={song.title}
                    onClose={() => setShowVideo(false)}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
