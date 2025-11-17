'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, FileText, Music, Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface ParsedSong {
  title: string;
  lyrics: string;
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
    // Parse pasted text - expects format: "TITLE\n\nLyrics..."
    // Or simple line-by-line with blank lines separating songs
    const songs: ParsedSong[] = [];
    const sections = textInput.split('\n\n\n'); // Triple newline separates songs

    sections.forEach((section) => {
      const lines = section.trim().split('\n');
      if (lines.length === 0) return;

      const title = lines[0].replace(/^#\s*/, '').trim(); // Remove markdown if present
      const lyrics = lines.slice(1).join('\n').trim();

      if (title && lyrics) {
        songs.push({ title, lyrics });
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
      // Auto-parse after file upload
      setTimeout(() => parseTextInput(), 100);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedSongs.length === 0) return;

    setImporting(true);
    setImportStatus({ total: parsedSongs.length, imported: 0, failed: [] });

    try {
      // Get existing songs
      const existingSongs = user?.user_metadata?.songs || [];
      const newSongs = parsedSongs.map((song, index) => ({
        id: `song_${Date.now()}_${index}`,
        ...song,
        visibility: 'private', // PRIVATE BY DEFAULT
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: null, // Can be assigned to project later
        collaborators: [], // Empty until invites sent
      }));

      // Save to Supabase user metadata (will migrate to Neon database later)
      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user?.user_metadata,
          songs: [...existingSongs, ...newSongs],
        },
      });

      if (error) throw error;

      setImportStatus({ total: parsedSongs.length, imported: parsedSongs.length, failed: [] });
      
      // Redirect to songs library after success
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-zinc-400 font-mono text-sm uppercase tracking-widest"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <Link 
            href="/dashboard" 
            className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-colors inline-block mb-8"
          >
            ← BACK TO DASHBOARD
          </Link>
          
          <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 mb-2">
            IMPORT YOUR CATALOG
          </h1>
          <p className="font-[family-name:var(--rnrb-font-marker)] text-4xl text-white mb-4">
            Bring Your Songs Here
          </p>
          <p className="text-zinc-400 max-w-2xl">
            Import all your existing songs at once. They'll be stored privately and securely. 
            You can edit them, invite collaborators, or keep them completely private.
          </p>
        </motion.div>

        {/* Import Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-4">
            <button
              onClick={() => setImportMode('paste')}
              className={`flex-1 p-6 border transition-all ${
                importMode === 'paste'
                  ? 'border-white bg-zinc-900'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <FileText className="w-8 h-8 mb-3 mx-auto" />
              <p className="font-mono text-sm uppercase tracking-widest">
                PASTE TEXT
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Copy & paste your lyrics
              </p>
            </button>

            <button
              onClick={() => setImportMode('file')}
              className={`flex-1 p-6 border transition-all ${
                importMode === 'file'
                  ? 'border-white bg-zinc-900'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Upload className="w-8 h-8 mb-3 mx-auto" />
              <p className="font-mono text-sm uppercase tracking-widest">
                UPLOAD FILE
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Upload .txt file
              </p>
            </button>
          </div>
        </motion.div>

        {/* Import Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-zinc-800 bg-zinc-900/50 p-8 mb-8"
        >
          {importMode === 'paste' ? (
            <div>
              <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-zinc-400 mb-4">
                PASTE YOUR SONGS
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                Format: Separate each song with 3 blank lines. First line = title, rest = lyrics.
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Song Title 1\n\nVerse 1 lyrics...\nChorus lyrics...\n\n\nSong Title 2\n\nVerse 1 lyrics...\nChorus lyrics...`}
                rows={20}
                className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-zinc-500">
                  {textInput.split('\n\n\n').length} song(s) detected
                </p>
                <button
                  onClick={parseTextInput}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  PARSE SONGS
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-zinc-400 mb-4">
                UPLOAD TEXT FILE
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                Upload a .txt file containing all your songs (same format as paste method)
              </p>
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center hover:border-zinc-600 transition-colors">
                <Upload className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-wider inline-block">
                    SELECT FILE
                  </span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-zinc-600 mt-4">
                  Maximum file size: 5MB
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Parsed Songs Preview */}
        {parsedSongs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-800 bg-zinc-900/50 p-8 mb-8"
          >
            <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-zinc-400 mb-6">
              READY TO IMPORT ({parsedSongs.length} SONGS)
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {parsedSongs.map((song, index) => (
                <div key={index} className="border border-zinc-800 p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-900/30 border border-green-800/50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {song.lyrics.split('\n').length} lines • Private by default
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {importing ? (
              <div className="mt-6 p-4 border border-green-800/50 bg-green-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-mono text-xs uppercase tracking-wider text-green-400">
                    IMPORTING {importStatus.imported}/{importStatus.total}
                  </p>
                </div>
              </div>
            ) : importStatus.imported === importStatus.total && importStatus.total > 0 ? (
              <div className="mt-6 p-4 border border-green-800/50 bg-green-900/20">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="font-mono text-xs uppercase tracking-wider text-green-400">
                    {importStatus.imported} SONGS IMPORTED SUCCESSFULLY
                  </p>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Redirecting to your song library...
                </p>
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>All songs will be private and secure</span>
                </div>
                <button
                  onClick={handleImport}
                  className="px-8 py-3 bg-white text-black font-mono text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 transition-colors"
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
          className="border border-zinc-800 bg-black/30 p-8"
        >
          <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-zinc-400 mb-4">
            FORMAT GUIDE
          </h3>
          <pre className="text-xs text-zinc-500 font-mono overflow-x-auto">
{`Song Title Here

Verse 1
First line of verse
Second line of verse

Chorus
Chorus line one
Chorus line two


Another Song Title

Verse 1
Different song lyrics
More lyrics here`}
          </pre>
          <p className="text-xs text-zinc-600 mt-4">
            💡 TIP: Separate songs with 3 blank lines (press Enter 3 times)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
