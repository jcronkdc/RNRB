'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, FileText, Music, Check, AlertCircle, ArrowLeft, Scissors, Merge as MergeIcon, Edit2, Sparkles } from 'lucide-react';

interface ParsedSong {
  tempId: string;
  title: string;
  lyrics: string;
  writer?: string;
  dateWritten?: string;
  status: 'draft' | 'in-progress' | 'needs-review' | 'complete';
  album?: string;
  startLine: number;
  endLine: number;
}

export default function ImportSongsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [parsedSongs, setParsedSongs] = useState<ParsedSong[]>([]);
  const [importStatus, setImportStatus] = useState<{
    total: number;
    imported: number;
  }>({ total: 0, imported: 0 });

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  const intelligentParse = () => {
    if (!textInput.trim()) return;

    const songs: ParsedSong[] = [];
    const lines = textInput.split('\n');
    
    // Smart detection: Look for song boundaries
    const songBoundaries: number[] = [0]; // Start with first line
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = i < lines.length - 1 ? lines[i + 1]?.trim() : '';
      const prevLine = i > 0 ? lines[i - 1]?.trim() : '';
      
      // Detect song boundaries:
      // 1. Two or more consecutive blank lines
      // 2. Line that looks like a title (short, followed by blank line then content)
      // 3. Common section markers (Verse 1, Chorus, etc.) after blank line
      
      const isBlank = line === '';
      const prevBlank = prevLine === '';
      const nextHasContent = nextLine !== '' && nextLine.length > 0;
      const looksLikeTitle = line.length > 0 && line.length < 60 && !line.match(/^(Verse|Chorus|Bridge|Intro|Outro)/i);
      const isStartOfNewSong = (isBlank && prevBlank && nextHasContent) ||
                               (looksLikeTitle && prevBlank && nextBlank);
      
      if (isStartOfNewSong && i > 5) { // Don't split too early
        songBoundaries.push(i);
      }
    }
    
    songBoundaries.push(lines.length); // End boundary
    
    // Create songs from boundaries
    for (let i = 0; i < songBoundaries.length - 1; i++) {
      const startIdx = songBoundaries[i];
      const endIdx = songBoundaries[i + 1];
      const songLines = lines.slice(startIdx, endIdx).map(l => l.trim()).filter(l => l);
      
      if (songLines.length < 2) continue; // Skip if too short
      
      // First non-empty line is title
      const title = songLines[0] || `Untitled Song ${i + 1}`;
      const lyrics = songLines.slice(1).join('\n').trim();
      
      if (lyrics) {
        songs.push({
          tempId: `temp_${Date.now()}_${i}`,
          title,
          lyrics,
          status: 'draft',
          writer: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
          startLine: startIdx,
          endLine: endIdx,
        });
      }
    }
    
    setParsedSongs(songs);
  };

  const mergeSongs = (index1: number, index2: number) => {
    if (index2 !== index1 + 1) return; // Only merge adjacent songs
    
    const updated = [...parsedSongs];
    const merged = {
      ...updated[index1],
      lyrics: updated[index1].lyrics + '\n\n' + updated[index2].lyrics,
      endLine: updated[index2].endLine,
    };
    
    updated.splice(index1, 2, merged);
    setParsedSongs(updated);
  };

  const splitSong = (index: number, splitText: string) => {
    const song = parsedSongs[index];
    const splitIndex = song.lyrics.indexOf(splitText);
    if (splitIndex === -1) return;
    
    const updated = [...parsedSongs];
    const firstHalf = {
      ...song,
      lyrics: song.lyrics.substring(0, splitIndex).trim(),
      tempId: `temp_${Date.now()}_${index}_a`,
    };
    const secondHalf = {
      ...song,
      tempId: `temp_${Date.now()}_${index}_b`,
      title: `${song.title} (Part 2)`,
      lyrics: song.lyrics.substring(splitIndex).trim(),
    };
    
    updated.splice(index, 1, firstHalf, secondHalf);
    setParsedSongs(updated);
  };

  const updateSong = (index: number, updates: Partial<ParsedSong>) => {
    const updated = [...parsedSongs];
    updated[index] = { ...updated[index], ...updates };
    setParsedSongs(updated);
  };

  const removeSong = (index: number) => {
    setParsedSongs(parsedSongs.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextInput(content);
      setTimeout(() => intelligentParse(), 100);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedSongs.length === 0) return;

    setImporting(true);
    setImportStatus({ total: parsedSongs.length, imported: 0 });

    try {
      const existingSongs = user?.user_metadata?.songs || [];
      const newSongs = parsedSongs.map((song) => ({
        id: `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: song.title,
        lyrics: song.lyrics,
        writer: song.writer || user?.user_metadata?.name || '',
        dateWritten: song.dateWritten || null,
        status: song.status,
        album: song.album || null,
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

      setImportStatus({ total: parsedSongs.length, imported: parsedSongs.length });
      
      setTimeout(() => {
        router.push('/songs');
      }, 1500);

    } catch (error: any) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
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
            <strong className="text-brand-primary">Just paste everything</strong> - our smart system automatically detects each song. 
            Private and secure by default.
          </p>
        </motion.div>

        {parsedSongs.length === 0 ? (
          // Step 1: Initial Paste/Upload
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Paste Area */}
            <div className="rnrb-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Step 1: Paste Your Document</h2>
                  <p className="text-sm text-muted-foreground">
                    Paste your entire 30-page document - no formatting required
                  </p>
                </div>
              </div>
              
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste all your songs here - any format works. We'll automatically detect each song..."
                rows={15}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-mono text-sm"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div>
                  <label className="rnrb-button-secondary px-6 py-3 rounded-lg cursor-pointer inline-block">
                    <Upload className="w-4 h-4 inline mr-2" />
                    OR UPLOAD FILE
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  onClick={intelligentParse}
                  disabled={!textInput.trim()}
                  className="rnrb-button-primary px-8 py-3 rounded-lg disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  AUTO-DETECT SONGS
                </button>
              </div>
            </div>

            {/* How It Works */}
            <div className="rnrb-card p-6 bg-muted/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Music className="w-5 h-5 text-brand-primary" />
                How It Works
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">1.</strong> Paste your entire document (any format)
                </p>
                <p>
                  <strong className="text-foreground">2.</strong> Click "Auto-Detect" - we find each song automatically
                </p>
                <p>
                  <strong className="text-foreground">3.</strong> Review the splits - merge or adjust if needed (rare)
                </p>
                <p>
                  <strong className="text-foreground">4.</strong> Click "Import" - done! All songs saved privately
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          // Step 2: Review & Adjust Detected Songs
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between p-6 rnrb-card bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Detected {parsedSongs.length} Songs</p>
                  <p className="text-sm text-muted-foreground">
                    Review below - merge or split if needed
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setParsedSongs([]);
                  setTextInput('');
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Start over
              </button>
            </div>

            {/* Songs List with Actions */}
            <div className="space-y-4">
              {parsedSongs.map((song, index) => (
                <div key={song.tempId} className="rnrb-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center font-mono text-sm font-semibold text-brand-primary">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <input
                        type="text"
                        value={song.title}
                        onChange={(e) => updateSong(index, { title: e.target.value })}
                        className="w-full text-xl font-semibold mb-3 bg-transparent border-0 border-b border-transparent hover:border-border focus:border-brand-primary focus:outline-none px-0 py-1"
                      />
                      
                      {/* Quick Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <input
                          type="text"
                          value={song.writer || ''}
                          onChange={(e) => updateSong(index, { writer: e.target.value })}
                          placeholder="Writer"
                          className="px-2 py-1 text-xs bg-surface border border-border rounded focus:border-brand-primary focus:outline-none"
                        />
                        <input
                          type="text"
                          value={song.dateWritten || ''}
                          onChange={(e) => updateSong(index, { dateWritten: e.target.value })}
                          placeholder="Date (2024)"
                          className="px-2 py-1 text-xs bg-surface border border-border rounded focus:border-brand-primary focus:outline-none"
                        />
                        <select
                          value={song.status}
                          onChange={(e) => updateSong(index, { status: e.target.value as any })}
                          className="px-2 py-1 text-xs bg-surface border border-border rounded focus:border-brand-primary focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="in-progress">In Progress</option>
                          <option value="needs-review">Needs Review</option>
                          <option value="complete">Complete</option>
                        </select>
                        <input
                          type="text"
                          value={song.album || ''}
                          onChange={(e) => updateSong(index, { album: e.target.value })}
                          placeholder="Album (optional)"
                          className="px-2 py-1 text-xs bg-surface border border-border rounded focus:border-brand-primary focus:outline-none"
                        />
                      </div>
                      
                      {/* Lyrics Preview */}
                      <div className="bg-surface/50 rounded p-3 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1 font-mono">
                          {song.lyrics.split('\n').length} lines
                        </p>
                        <p className="text-sm font-mono text-foreground/70 line-clamp-2">
                          {song.lyrics.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {index < parsedSongs.length - 1 && (
                        <button
                          onClick={() => mergeSongs(index, index + 1)}
                          className="p-2 text-xs text-muted-foreground hover:text-foreground hover:bg-surface rounded transition-colors"
                          title="Merge with next song"
                        >
                          <MergeIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeSong(index)}
                        className="p-2 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove this song"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Button */}
            {importing ? (
              <div className="p-6 rnrb-card border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-semibold text-green-500">
                    Importing {importStatus.imported}/{importStatus.total}...
                  </p>
                </div>
              </div>
            ) : importStatus.imported === importStatus.total && importStatus.total > 0 ? (
              <div className="p-6 rnrb-card border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-500">
                      {importStatus.imported} songs imported successfully!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Redirecting to your library...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 rnrb-card">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-brand-primary" />
                  <div>
                    <p className="font-semibold">Ready to import {parsedSongs.length} songs</p>
                    <p className="text-sm text-muted-foreground">
                      All songs will be PRIVATE and secure
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleImport}
                  className="rnrb-button-primary px-8 py-4 rounded-xl font-semibold text-lg"
                >
                  IMPORT {parsedSongs.length} SONGS
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}