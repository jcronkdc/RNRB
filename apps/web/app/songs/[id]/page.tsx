'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Save, Users, Mail, Lock, Globe, Trash2, Download, Cloud, CloudOff, Tag, Plus, X, Archive } from 'lucide-react';
import dynamic from 'next/dynamic';

const SongVideoSession = dynamic(() => import('@/components/song/song-video-session'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-[600px] rounded-lg bg-white/5" />
});

interface Song {
  id: string;
  title: string;
  lyrics: string;
  writer?: string;
  coWriters?: string[];
  dateWritten?: string;
  status: 'draft' | 'in-progress' | 'needs-review' | 'complete';
  tags: string[]; // Flexible tags: "Summer Album", "Setlist", "Open Mic", "Future Album", etc.
  album?: string; // Legacy support
  archived: boolean;
  key?: string;
  tempo?: number;
  visibility: 'private' | 'org' | 'public';
  createdAt: string;
  updatedAt: string;
  lastSavedAt?: string;
  projectId?: string | null;
  collaborators: string[];
}

export default function SongEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [song, setSong] = useState<Song | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [cloudSynced, setCloudSynced] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        const songs = user.user_metadata?.songs || [];
        const foundSong = songs.find((s: Song) => s.id === params.id);
        if (foundSong) {
          // Ensure tags array exists
          setSong({
            ...foundSong,
            tags: foundSong.tags || (foundSong.album ? [foundSong.album] : []),
            archived: foundSong.archived || false,
          });
          setLastSaved(new Date(foundSong.updatedAt));
        } else {
          router.push('/songs');
        }
        setLoading(false);
      }
    });
  }, [router, params.id]);

  // Auto-save every 3 seconds
  const autoSave = useCallback(async () => {
    if (!song || !user || autoSaving) return;

    setAutoSaving(true);
    setCloudSynced(false);

    try {
      const songs = user.user_metadata?.songs || [];
      const updatedSongs = songs.map((s: Song) =>
        s.id === song.id ? { ...song, updatedAt: new Date().toISOString(), lastSavedAt: new Date().toISOString() } : s
      );

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          songs: updatedSongs,
        },
      });

      if (error) throw error;

      setLastSaved(new Date());
      setCloudSynced(true);
    } catch (error) {
      console.error('Auto-save error:', error);
      setCloudSynced(false);
    } finally {
      setAutoSaving(false);
    }
  }, [song, user, autoSaving]);

  // Auto-save on changes
  useEffect(() => {
    if (!song) return;

    const timeout = setTimeout(() => {
      autoSave();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [song?.lyrics, song?.title, song?.key, song?.tempo, song?.status, song?.tags, autoSave]);

  const handleManualSave = () => {
    autoSave();
  };

  const addTag = () => {
    if (!newTag.trim() || !song) return;
    
    const tag = newTag.trim();
    if (!song.tags.includes(tag)) {
      setSong({ ...song, tags: [...song.tags, tag] });
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    if (!song) return;
    setSong({ ...song, tags: song.tags.filter(t => t !== tag) });
  };

  const toggleArchive = () => {
    if (!song) return;
    setSong({ ...song, archived: !song.archived });
  };

  const handleInviteCollaborator = () => {
    if (!inviteEmail.trim() || !song) return;

    const updatedSong = {
      ...song,
      collaborators: [...song.collaborators, inviteEmail],
    };
    setSong(updatedSong);
    setInviteEmail('');
    autoSave();
  };

  const exportLyrics = () => {
    if (!song) return;
    
    const content = `${song.title}\n` +
                   (song.writer ? `Writer: ${song.writer}\n` : '') +
                   (song.coWriters?.length ? `Co-Writers: ${song.coWriters.join(', ')}\n` : '') +
                   (song.dateWritten ? `Date: ${song.dateWritten}\n` : '') +
                   (song.key ? `Key: ${song.key}\n` : '') +
                   (song.tempo ? `Tempo: ${song.tempo} BPM\n` : '') +
                   `\n${song.lyrics}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground font-mono text-sm"
        >
          Loading Song...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header with Auto-Save Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link 
            href="/songs" 
            className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-block mb-6"
          >
            ← LIBRARY
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {song.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                {/* Cloud Sync Status */}
                <div className="flex items-center gap-2">
                  {cloudSynced ? (
                    <><Cloud className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-mono text-xs">
                      SAVED TO CLOUD
                    </span></>
                  ) : autoSaving ? (
                    <><div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-brand-primary font-mono text-xs">
                      SAVING...
                    </span></>
                  ) : (
                    <><CloudOff className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-500 font-mono text-xs">
                      NOT SYNCED
                    </span></>
                  )}
                </div>
                {lastSaved && (
                  <span className="text-muted-foreground text-xs font-mono">
                    Last saved {Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportLyrics}
                title="Download backup to your computer"
                className="p-2 border border-border hover:border-brand-primary hover:bg-brand-primary/5 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleManualSave}
                disabled={cloudSynced}
                title="Save now"
                className="px-4 py-2 border border-border hover:border-brand-primary hover:bg-brand-primary/5 rounded transition-colors disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4 inline mr-2" />
                SAVE
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
              className="rnrb-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Lyrics</h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Auto-saves every 3 seconds
                </p>
              </div>
              
              <textarea
                value={song.lyrics}
                onChange={(e) => setSong({ ...song, lyrics: e.target.value })}
                className="w-full h-[600px] px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-mono text-sm resize-none"
                placeholder="Write your lyrics here..."
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Folders/Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rnrb-card p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-primary" />
                Folders & Tags
              </h3>
              
              {/* Existing Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {song.tags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tags yet</p>
                ) : (
                  song.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Setlist, Open Mic, Album..."
                  className="flex-1 px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                />
                <button
                  onClick={addTag}
                  className="p-2 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-brand-primary" />
                </button>
              </div>

              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p><strong>Examples:</strong></p>
                <div className="flex flex-wrap gap-1">
                  {['Setlist', 'Open Mic', 'Future Album', 'Work in Progress', 'Archive', 'Demos'].map((example) => (
                    <button
                      key={example}
                      onClick={() => setNewTag(example)}
                      className="px-2 py-0.5 bg-surface hover:bg-muted rounded text-xs"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Song Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rnrb-card p-6"
            >
              <h3 className="font-semibold mb-4">Song Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    WRITER
                  </label>
                  <input
                    type="text"
                    value={song.writer || ''}
                    onChange={(e) => setSong({ ...song, writer: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    CO-WRITERS
                  </label>
                  <input
                    type="text"
                    value={song.coWriters?.join(', ') || ''}
                    onChange={(e) => setSong({ ...song, coWriters: e.target.value.split(',').map(w => w.trim()).filter(Boolean) })}
                    placeholder="Sarah, John (comma separated)"
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    DATE WRITTEN
                  </label>
                  <input
                    type="text"
                    value={song.dateWritten || ''}
                    onChange={(e) => setSong({ ...song, dateWritten: e.target.value })}
                    placeholder="2024, Spring 2023"
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    STATUS
                  </label>
                  <select
                    value={song.status}
                    onChange={(e) => setSong({ ...song, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="in-progress">In Progress</option>
                    <option value="needs-review">Needs Review</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="mb-4">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                      KEY
                    </label>
                    <input
                      type="text"
                      value={song.key || ''}
                      onChange={(e) => setSong({ ...song, key: e.target.value })}
                      placeholder="C, Am, G"
                      className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                      TEMPO
                    </label>
                    <input
                      type="number"
                      value={song.tempo || ''}
                      onChange={(e) => setSong({ ...song, tempo: parseInt(e.target.value) || undefined })}
                      placeholder="120"
                      className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    VISIBILITY
                  </label>
                  <select
                    value={song.visibility}
                    onChange={(e) => setSong({ ...song, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
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
              className="rnrb-card p-6"
            >
              <h3 className="font-semibold mb-4">Collaborators</h3>
              
              {song.collaborators.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {song.collaborators.map((collab, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-surface rounded">
                      <span className="text-sm">{collab}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mb-4">
                  No collaborators yet
                </p>
              )}

              <div className="space-y-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                />
                <button
                  onClick={handleInviteCollaborator}
                  disabled={!inviteEmail.trim()}
                  className="w-full px-4 py-2 rnrb-button-secondary rounded font-mono text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  <Mail className="w-3 h-3 inline mr-2" />
                  INVITE
                </button>
              </div>
            </motion.div>

            {/* Archive & Backup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rnrb-card p-6"
            >
              <h3 className="font-semibold mb-4">Backup & Archive</h3>
              
              <div className="space-y-2">
                <button
                  onClick={exportLyrics}
                  className="w-full px-4 py-2 rnrb-button-secondary rounded text-xs font-mono uppercase tracking-wider"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  DOWNLOAD BACKUP
                </button>
                
                <button
                  onClick={toggleArchive}
                  className={`w-full px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
                    song.archived
                      ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
                      : 'border border-border hover:border-brand-primary hover:bg-brand-primary/5'
                  }`}
                >
                  <Archive className="w-4 h-4 inline mr-2" />
                  {song.archived ? 'UNARCHIVE' : 'ARCHIVE'}
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Cloud backup is automatic. Download creates local backup on your computer.
              </p>
            </motion.div>

            {/* Video Session */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rnrb-card p-6"
            >
              <h3 className="font-semibold mb-4">Co-Write Session</h3>
              
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="w-full rnrb-button-primary px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider"
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