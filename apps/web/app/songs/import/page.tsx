'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, FileText, Music, Check, AlertCircle, ArrowLeft, Edit2, Calendar } from 'lucide-react';

interface ParsedSong {
  tempId: string;
  title: string;
  lyrics: string;
  writer?: string;
  dateWritten?: string;
  status: 'in-progress' | 'complete' | 'needs-review' | 'draft';
  album?: string;
  key?: string;
  tempo?: number;
}

export default function ImportSongsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste');
  const [textInput, setTextInput] = useState('');
  const [parsedSongs, setParsedSongs] = useState<ParsedSong[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [importStatus, setImportStatus] = useState<{
    total: number;
    imported: number;
    failed: string[];
  }>({ total: 0, imported: 0, failed: [] });

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

  const parseTextInput = () => {
    const songs: ParsedSong[] = [];
    
    // Split by 3+ blank lines to separate songs
    const sections = textInput.split(/\n\s*\n\s*\n+/);

    sections.forEach((section, index) => {
      const trimmed = section.trim();
      if (!trimmed) return;

      const lines = trimmed.split('\n');
      if (lines.length === 0) return;

      // First line is title (remove any # markdown)
      const title = lines[0].replace(/^#\s*/, '').trim() || `Untitled Song ${index + 1}`;
      
      // Rest is lyrics (skip empty first lines)
      const lyricsLines = lines.slice(1).filter(l => l.trim() !== '');
      const lyrics = lyricsLines.join('\n').trim();

      if (lyrics) {
        songs.push({
          tempId: `temp_${Date.now()}_${index}`,
          title,
          lyrics,
          status: 'draft', // Default to draft
          writer: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
        });
      }
    });

    setParsedSongs(songs);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextInput(content);
      setTimeout(() => parseTextInput(), 100);
    };
    reader.readAsText(file);
  };

  const updateSong = (index: number, updates: Partial<ParsedSong>) => {
    const updated = [...parsedSongs];
    updated[index] = { ...updated[index], ...updates };
    setParsedSongs(updated);
  };

  const removeSong = (index: number) => {
    setParsedSongs(parsedSongs.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (parsedSongs.length === 0) return;

    setImporting(true);
    setImportStatus({ total: parsedSongs.length, imported: 0, failed: [] });

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
        key: song.key || null,
        tempo: song.tempo || null,
        visibility: 'private' as const, // ALWAYS PRIVATE ON IMPORT
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: null, // Can be assigned later
        collaborators: [],
      }));

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user?.user_metadata,
          songs: [...existingSongs, ...newSongs],
        },
      });

      if (error) throw error;

      setImportStatus({ total: parsedSongs.length, imported: parsedSongs.length, failed: [] });
      
      setTimeout(() => {
        router.push('/songs');
      }, 2000);

    } catch (error: any) {
      console.error('Import error:', error);
      setImportStatus(prev => ({
        ...prev,
        failed: [error.message || 'Unknown error'],
      }));
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
      <div className="rnrb-container max-w-5xl py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <Link 
            href="/dashboard" 
            className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-block mb-6"
          >
            ← BACK TO DASHBOARD
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Import Your Songs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Upload all your existing songs at once. They'll be stored privately and securely. 
            Each song gets its own space where you can edit, organize, and invite collaborators.
          </p>
        </motion.div>

        {/* Import Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <button
            onClick={() => setImportMode('paste')}
            className={`rnrb-card p-6 text-center transition-all ${
              importMode === 'paste'
                ? 'border-brand-primary/50 bg-brand-primary/5'
                : 'hover:border-brand-primary/30'
            }`}
          >
            <FileText className="w-8 h-8 mb-3 mx-auto text-brand-primary" />
            <p className="font-semibold mb-1">Paste Text</p>
            <p className="text-xs text-muted-foreground">
              Copy & paste all your lyrics
            </p>
          </button>

          <button
            onClick={() => setImportMode('file')}
            className={`rnrb-card p-6 text-center transition-all ${
              importMode === 'file'
                ? 'border-brand-primary/50 bg-brand-primary/5'
                : 'hover:border-brand-primary/30'
            }`}
          >
            <Upload className="w-8 h-8 mb-3 mx-auto text-brand-primary" />
            <p className="font-semibold mb-1">Upload File</p>
            <p className="text-xs text-muted-foreground">
              Upload .txt file
            </p>
          </button>
        </motion.div>

        {/* Import Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rnrb-card p-8 mb-8"
        >
          {importMode === 'paste' ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">Paste Your Songs</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Separate each song with 3 blank lines. First line = title, rest = lyrics.
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Song Title 1\n\nVerse 1 lyrics here...\nChorus lyrics here...\n\n\nSong Title 2\n\nVerse 1 different song...\nChorus different song...\n\n\nSong Title 3\n\n...and so on`}
                rows={20}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {textInput.split(/\n\s*\n\s*\n+/).filter(s => s.trim()).length} song(s) detected
                </p>
                <button
                  onClick={parseTextInput}
                  disabled={!textInput.trim()}
                  className="rnrb-button-primary px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  PARSE SONGS
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-2">Upload Text File</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a .txt file with all your songs (same format as paste method)
              </p>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-brand-primary/50 transition-colors">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <label className="cursor-pointer">
                  <span className="rnrb-button-primary px-8 py-3 rounded-lg inline-block">
                    SELECT FILE
                  </span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-4">
                  Maximum file size: 5MB
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Parsed Songs - Editable Preview */}
        {parsedSongs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rnrb-card p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Review & Edit ({parsedSongs.length} Songs)
              </h2>
              <p className="text-sm text-muted-foreground">
                All songs will be imported as PRIVATE
              </p>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {parsedSongs.map((song, index) => (
                <div key={song.tempId} className="border border-border rounded-lg p-6 bg-surface/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Title */}
                      <div className="mb-3">
                        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                          TITLE
                        </label>
                        <input
                          type="text"
                          value={song.title}
                          onChange={(e) => updateSong(index, { title: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground font-semibold focus:border-brand-primary focus:outline-none"
                        />
                      </div>

                      {/* Metadata Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                            WRITER
                          </label>
                          <input
                            type="text"
                            value={song.writer || ''}
                            onChange={(e) => updateSong(index, { writer: e.target.value })}
                            placeholder="Your name"
                            className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                            DATE (APPROX)
                          </label>
                          <input
                            type="text"
                            value={song.dateWritten || ''}
                            onChange={(e) => updateSong(index, { dateWritten: e.target.value })}
                            placeholder="2024, Spring 2023"
                            className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                            STATUS
                          </label>
                          <select
                            value={song.status}
                            onChange={(e) => updateSong(index, { status: e.target.value as any })}
                            className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                          >
                            <option value="draft">Draft</option>
                            <option value="in-progress">In Progress</option>
                            <option value="needs-review">Needs Review</option>
                            <option value="complete">Complete</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                            ALBUM/GROUP
                          </label>
                          <input
                            type="text"
                            value={song.album || ''}
                            onChange={(e) => updateSong(index, { album: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm focus:border-brand-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Lyrics Preview */}
                      {editingIndex === index ? (
                        <div>
                          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                            LYRICS
                          </label>
                          <textarea
                            value={song.lyrics}
                            onChange={(e) => updateSong(index, { lyrics: e.target.value })}
                            rows={10}
                            className="w-full px-3 py-2 bg-background border border-border rounded text-sm font-mono focus:border-brand-primary focus:outline-none"
                          />
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="mt-2 text-xs text-brand-primary hover:underline"
                          >
                            Done editing
                          </button>
                        </div>
                      ) : (
                        <div className="bg-background/50 rounded p-3 border border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">
                            {song.lyrics.split('\n').length} lines
                          </p>
                          <p className="text-sm font-mono text-foreground/70 line-clamp-3">
                            {song.lyrics.substring(0, 120)}...
                          </p>
                          <button
                            onClick={() => setEditingIndex(index)}
                            className="mt-2 text-xs text-brand-primary hover:underline flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit lyrics
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeSong(index)}
                      className="ml-4 text-red-500 hover:text-red-400 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {importing ? (
              <div className="mt-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-mono text-sm text-green-500">
                    IMPORTING {importStatus.imported}/{importStatus.total}
                  </p>
                </div>
              </div>
            ) : importStatus.imported === importStatus.total && importStatus.total > 0 ? (
              <div className="mt-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-500">
                      {importStatus.imported} songs imported successfully
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Redirecting to your library...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>All songs will be PRIVATE and secure</span>
                </div>
                <button
                  onClick={handleImport}
                  className="rnrb-button-primary px-8 py-3 rounded-lg font-semibold"
                >
                  IMPORT {parsedSongs.length} SONGS
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Format Guide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rnrb-card p-8"
        >
          <h3 className="font-semibold mb-4">Import Format Guide</h3>
          <div className="bg-surface/50 rounded-lg p-4 font-mono text-xs border border-border">
            <pre className="text-muted-foreground overflow-x-auto">
{`Midnight Blues

Verse 1
Walking down that lonesome road
Carrying this heavy load

Chorus
Got those midnight blues again
Can't escape this pouring rain


Summer Anthem

Verse 1
Sunshine on my face today
All my worries fade away

Chorus
This is our summer anthem
Living life just how we planned it`}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <strong>KEY:</strong> Separate songs with 3 blank lines (press Enter 3 times between songs)
          </p>
          
          <div className="mt-6 space-y-2 text-sm">
            <p className="font-semibold">After import, you can:</p>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• Edit lyrics, key, tempo</li>
              <li>• Organize into albums/collections</li>
              <li>• Add to projects or keep standalone</li>
              <li>• Invite collaborators to specific songs</li>
              <li>• Change status (draft → in progress → complete)</li>
              <li>• Make public when ready</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}