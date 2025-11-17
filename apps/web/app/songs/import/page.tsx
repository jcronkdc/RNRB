'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, Music, Check, AlertTriangle, ArrowLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import dynamic from 'next/dynamic';

const VisualSongSplitter = dynamic(() => import('@/components/song/visual-song-splitter'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 rnrb-card" />
});

interface ParsedSong {
  tempId: string;
  title: string;
  lyrics: string;
  writer?: string;
  coWriters?: string[];
  dateWritten?: string;
  status: 'draft' | 'in-progress' | 'needs-review' | 'complete';
  album?: string;
  key?: string;
  tempo?: number;
}

export default function ImportSongsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<'paste' | 'split' | 'metadata' | 'confirm'>('paste');
  const [textInput, setTextInput] = useState('');
  const [parsedSongs, setParsedSongs] = useState<ParsedSong[]>([]);
  const [bulkMetadata, setBulkMetadata] = useState({
    album: '',
    status: 'draft' as const,
    writer: '',
  });
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [expandedSong, setExpandedSong] = useState<string | null>(null);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        setBulkMetadata(prev => ({
          ...prev,
          writer: user.user_metadata?.name || user.email?.split('@')[0] || '',
        }));
        setLoading(false);
      }
    });
  }, [router]);

  const handleSongsDetected = (songs: Array<{ title: string; lyrics: string; startLine: number; endLine: number }>) => {
    setParsedSongs(songs.map((s, i) => ({
      tempId: `song_${i}`,
      ...s,
      writer: bulkMetadata.writer,
      status: 'draft',
    })));
    setStep('metadata');
  };

  const applyBulkMetadata = () => {
    const updated = parsedSongs.map(song => {
      if (!selectedSongs.has(song.tempId)) return song;
      
      return {
        ...song,
        ...(bulkMetadata.album && { album: bulkMetadata.album }),
        ...(bulkMetadata.status && { status: bulkMetadata.status }),
        ...(bulkMetadata.writer && { writer: bulkMetadata.writer }),
      };
    });
    
    setParsedSongs(updated);
    setSelectedSongs(new Set());
    setBulkMetadata({ album: '', status: 'draft', writer: bulkMetadata.writer });
  };

  const toggleSelectSong = (tempId: string) => {
    const updated = new Set(selectedSongs);
    if (updated.has(tempId)) {
      updated.delete(tempId);
    } else {
      updated.add(tempId);
    }
    setSelectedSongs(updated);
  };

  const selectAll = () => {
    setSelectedSongs(new Set(parsedSongs.map(s => s.tempId)));
  };

  const deselectAll = () => {
    setSelectedSongs(new Set());
  };

  const updateSong = (tempId: string, updates: Partial<ParsedSong>) => {
    setParsedSongs(parsedSongs.map(s => s.tempId === tempId ? { ...s, ...updates } : s));
  };

  const removeSong = (tempId: string) => {
    setParsedSongs(parsedSongs.filter(s => s.tempId !== tempId));
  };

  const validateSongs = (): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    parsedSongs.forEach((song, index) => {
      if (!song.title || song.title.trim() === '') {
        errors.push(`Song ${index + 1}: Missing title`);
      }
      if (!song.lyrics || song.lyrics.trim().length < 10) {
        errors.push(`Song ${index + 1} (${song.title}): Lyrics too short (might be incomplete)`);
      }
      if (song.lyrics.length > 10000) {
        warnings.push(`Song ${index + 1} (${song.title}): Very long (${song.lyrics.length} chars) - might be multiple songs`);
      }
      if (!song.writer) {
        warnings.push(`Song ${index + 1} (${song.title}): No writer specified`);
      }
    });
    
    return { errors, warnings };
  };

  const handleImport = async () => {
    const validation = validateSongs();
    if (validation.errors.length > 0) {
      alert(`Please fix these issues:\n${validation.errors.join('\n')}`);
      return;
    }

    setImporting(true);

    try {
      const existingSongs = user?.user_metadata?.songs || [];
      const newSongs = parsedSongs.map((song) => ({
        id: `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: song.title,
        lyrics: song.lyrics,
        writer: song.writer || '',
        coWriters: song.coWriters || [],
        dateWritten: song.dateWritten || null,
        status: song.status,
        album: song.album || null,
        key: song.key || null,
        tempo: song.tempo || null,
        visibility: 'private' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: null,
        collaborators: [],
      }));

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user?.user_metadata,
          songs: [...existingSongs, ...newSongs],
        },
      });

      if (error) throw error;

      setTimeout(() => {
        router.push('/songs');
      }, 1500);

    } catch (error: any) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextInput(content);
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground font-mono text-sm"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  const validation = validateSongs();

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="rnrb-container max-w-6xl py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard" 
            className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-block mb-4"
          >
            ← DASHBOARD
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            Import Your Songs
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            <strong className="text-brand-primary">Paste everything at once</strong> - we'll handle the separation automatically. 
            Adjust if needed, then import. Private & secure.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { key: 'paste', label: 'Paste' },
            { key: 'split', label: 'Auto-Detect' },
            { key: 'metadata', label: 'Review' },
            { key: 'confirm', label: 'Import' },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                step === s.key ? 'bg-brand-primary text-brand-primary-foreground' :
                ['paste', 'split', 'metadata'].indexOf(step) > ['paste', 'split', 'metadata'].indexOf(s.key) ? 'bg-green-500/20 text-green-500' :
                'bg-muted text-muted-foreground'
              }`}>
                {['paste', 'split', 'metadata'].indexOf(step) > ['paste', 'split', 'metadata'].indexOf(s.key) ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-mono uppercase tracking-wider ${
                step === s.key ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Paste */}
        {step === 'paste' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="rnrb-card p-8">
              <h2 className="text-xl font-semibold mb-4">Paste Your Document</h2>
              
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your entire 30-page document here - any format works. We'll automatically separate each song..."
                rows={20}
                autoFocus
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-mono text-sm"
              />
              
              <div className="flex items-center justify-between mt-4">
                <label className="rnrb-button-secondary px-6 py-2 rounded-lg cursor-pointer">
                  <Upload className="w-4 h-4 inline mr-2" />
                  UPLOAD .TXT FILE
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setStep('split')}
                  disabled={!textInput.trim()}
                  className="rnrb-button-primary px-8 py-3 rounded-lg disabled:opacity-50"
                >
                  NEXT: AUTO-DETECT
                  <ArrowLeft className="w-4 h-4 inline ml-2 rotate-180" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Visual Split */}
        {step === 'split' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <VisualSongSplitter
              fullText={textInput}
              onSongsDetected={handleSongsDetected}
            />
          </motion.div>
        )}

        {/* Step 3: Metadata & Review */}
        {step === 'metadata' && parsedSongs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Validation Messages */}
            {validation.errors.length > 0 && (
              <div className="p-4 rnrb-card bg-red-500/10 border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-500 mb-2">Issues Found:</p>
                    <ul className="text-sm space-y-1">
                      {validation.errors.map((err, i) => (
                        <li key={i} className="text-red-400">{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="p-4 rnrb-card bg-yellow-500/10 border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-500 mb-2">Warnings:</p>
                    <ul className="text-sm space-y-1">
                      {validation.warnings.map((warn, i) => (
                        <li key={i} className="text-yellow-400">{warn}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Edit */}
            <div className="rnrb-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Bulk Edit ({selectedSongs.size} selected)</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-brand-primary hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    SET ALBUM FOR SELECTED
                  </label>
                  <input
                    type="text"
                    value={bulkMetadata.album}
                    onChange={(e) => setBulkMetadata({ ...bulkMetadata, album: e.target.value })}
                    placeholder="Summer Sessions"
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    SET STATUS FOR SELECTED
                  </label>
                  <select
                    value={bulkMetadata.status}
                    onChange={(e) => setBulkMetadata({ ...bulkMetadata, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="in-progress">In Progress</option>
                    <option value="needs-review">Needs Review</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    SET WRITER FOR SELECTED
                  </label>
                  <input
                    type="text"
                    value={bulkMetadata.writer}
                    onChange={(e) => setBulkMetadata({ ...bulkMetadata, writer: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>
              
              <button
                onClick={applyBulkMetadata}
                disabled={selectedSongs.size === 0}
                className="mt-4 rnrb-button-secondary px-6 py-2 rounded-lg disabled:opacity-50"
              >
                APPLY TO {selectedSongs.size} SONGS
              </button>
            </div>

            {/* Songs List */}
            <div className="space-y-3">
              {parsedSongs.map((song, index) => (
                <div key={song.tempId} className="rnrb-card p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedSongs.has(song.tempId)}
                      onChange={() => toggleSelectSong(song.tempId)}
                      className="mt-1 w-4 h-4 rounded border-border"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={song.title}
                            onChange={(e) => updateSong(song.tempId, { title: e.target.value })}
                            className="text-lg font-semibold bg-transparent border-0 border-b border-transparent hover:border-border focus:border-brand-primary focus:outline-none w-full px-0 py-1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedSong(expandedSong === song.tempId ? null : song.tempId)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {expandedSong === song.tempId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => removeSong(song.tempId)}
                            className="text-red-500 hover:text-red-400 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className={song.writer ? '' : 'opacity-50'}>
                          Writer: {song.writer || 'Not set'}
                        </div>
                        <div className={song.dateWritten ? '' : 'opacity-50'}>
                          Date: {song.dateWritten || 'Not set'}
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 rounded ${
                            song.status === 'complete' ? 'bg-green-500/20 text-green-500' :
                            song.status === 'in-progress' ? 'bg-blue-500/20 text-blue-500' :
                            song.status === 'needs-review' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {song.status}
                          </span>
                        </div>
                        <div className={song.album ? '' : 'opacity-50'}>
                          Album: {song.album || 'None'}
                        </div>
                      </div>

                      {/* Expanded View */}
                      {expandedSong === song.tempId && (
                        <div className="mt-4 space-y-3 border-t border-border pt-4">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={song.writer || ''}
                              onChange={(e) => updateSong(song.tempId, { writer: e.target.value })}
                              placeholder="Writer"
                              className="px-3 py-2 bg-surface border border-border rounded text-sm"
                            />
                            <input
                              type="text"
                              value={song.dateWritten || ''}
                              onChange={(e) => updateSong(song.tempId, { dateWritten: e.target.value })}
                              placeholder="Date (e.g. 2024, Spring 2023)"
                              className="px-3 py-2 bg-surface border border-border rounded text-sm"
                            />
                            <input
                              type="text"
                              value={song.album || ''}
                              onChange={(e) => updateSong(song.tempId, { album: e.target.value })}
                              placeholder="Album/Collection"
                              className="px-3 py-2 bg-surface border border-border rounded text-sm"
                            />
                            <select
                              value={song.status}
                              onChange={(e) => updateSong(song.tempId, { status: e.target.value as any })}
                              className="px-3 py-2 bg-surface border border-border rounded text-sm"
                            >
                              <option value="draft">Draft</option>
                              <option value="in-progress">In Progress</option>
                              <option value="needs-review">Needs Review</option>
                              <option value="complete">Complete</option>
                            </select>
                          </div>
                          <textarea
                            value={song.lyrics}
                            onChange={(e) => updateSong(song.tempId, { lyrics: e.target.value })}
                            rows={6}
                            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Actions */}
            <div className="flex items-center justify-between p-6 rnrb-card">
              <button
                onClick={() => setStep('split')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to split
              </button>
              
              {importing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <span className="font-semibold">Importing...</span>
                </div>
              ) : (
                <button
                  onClick={handleImport}
                  disabled={validation.errors.length > 0}
                  className="rnrb-button-primary px-8 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  <Music className="w-5 h-5 inline mr-2" />
                  IMPORT {parsedSongs.length} SONGS (PRIVATE)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}