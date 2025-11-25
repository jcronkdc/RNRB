'use client';

import { motion } from 'framer-motion';
import { Music2, Save, Check, Loader2, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { useSongAutoSave } from '@/hooks/use-song-auto-save';

// Single unified builder - no tabs, no confusion
const CollaborativeVisualBuilder = dynamic(
  () =>
    import('@/components/songwriting/collaborative-visual-builder').then(
      (m) => m.CollaborativeVisualBuilder
    ),
  { ssr: false }
);

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge';
  content: string;
  chordPlacements?: Array<{
    wordIndex: number;
    lineIndex: number;
    chord: string;
  }>;
};

export default function SongwritingPage() {
  const [songBlocks, setSongBlocks] = useState<SongBlock[]>([]);
  const [songTitle, setSongTitle] = useState('Untitled Song');
  const [isFirstSave, setIsFirstSave] = useState(true);
  
  const { user, loading } = useRequireAuth();
  const previousSavedRef = useRef(false);

  // Auto-save hook
  const {
    songData,
    updateSong,
    createSong,
    isSaving,
    isSaved,
    hasError,
  } = useSongAutoSave();

  // Create song on first load
  useEffect(() => {
    if (user && !songData.id) {
      createSong({
        title: songTitle,
        status: 'draft',
        visibility: 'private',
      }).catch(console.error);
    }
  }, [user, songData.id]);

  // Auto-save when blocks change
  useEffect(() => {
    if (songData.id && songBlocks.length > 0) {
      updateSong({
        lyrics: songBlocks.map((b) => `[${b.type.toUpperCase()}]\n${b.content}`).join('\n\n'),
      });
    }
  }, [songBlocks, songData.id]);

  // Auto-save when title changes
  useEffect(() => {
    if (songData.id && songTitle !== songData.title) {
      updateSong({ title: songTitle });
    }
  }, [songTitle, songData.id, songData.title]);

  // Save status indicator
  const SaveStatusIndicator = () => {
    if (!user || !songData.id) return null;

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs uppercase tracking-wider"
      >
        {isSaving && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
            <span className="text-zinc-400">Saving</span>
          </>
        )}
        {isSaved && !isSaving && (
          <>
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span className="text-zinc-400">Saved</span>
          </>
        )}
        {hasError && (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-zinc-400">Error</span>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Clean Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-b border-zinc-800 pb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Music2 className="h-8 w-8 text-white" />
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="border-none bg-transparent text-3xl font-mono font-bold uppercase tracking-wider text-white outline-none placeholder:text-zinc-600 focus:ring-0"
                placeholder="UNTITLED SONG"
                disabled={!user}
              />
            </div>
            <SaveStatusIndicator />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading && (
            <div className="flex min-h-[600px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-white" />
                <p className="font-mono text-sm uppercase tracking-wider text-zinc-400">
                  Loading Studio
                </p>
              </div>
            </div>
          )}

          {!loading && user && (
            <CollaborativeVisualBuilder
              projectSlug="songwriting-studio"
              onSongChange={(blocks) => setSongBlocks(blocks)}
              currentUser={{
                userId: user.id,
                userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                userEmail: user.email || '',
                avatar: user.user_metadata?.avatar_url,
              }}
            />
          )}

          {!loading && !user && (
            <div className="flex min-h-[600px] items-center justify-center rounded border border-zinc-800 bg-zinc-900/50">
              <div className="max-w-md text-center">
                <Music2 className="mx-auto mb-6 h-16 w-16 text-white" />
                <h3 className="mb-3 font-mono text-2xl font-bold uppercase tracking-wider text-white">
                  Sign In Required
                </h3>
                <p className="mb-6 text-sm text-zinc-400">
                  Authentication required to save your work
                </p>
                <a
                  href="/auth"
                  className="inline-block rounded bg-white px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-black transition hover:bg-zinc-200"
                >
                  Sign In
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
