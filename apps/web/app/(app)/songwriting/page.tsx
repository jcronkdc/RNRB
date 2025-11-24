'use client';

import { motion } from 'framer-motion';
import {
  Music2,
  Sparkles,
  Users,
  MessageSquare,
  Video,
  Save,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { useSongAutoSave } from '@/hooks/use-song-auto-save';

// Import the drag-drop collaborative songwriting components
const CollaborativeVisualBuilder = dynamic(
  () =>
    import('@/components/songwriting/collaborative-visual-builder').then(
      (m) => m.CollaborativeVisualBuilder
    ),
  { ssr: false }
);

const ChordBuilder = dynamic(
  () => import('@/components/songwriting/chord-builder').then((m) => m.ChordBuilder),
  { ssr: false }
);

const LyricsAssistant = dynamic(
  () => import('@/components/songwriting/lyrics-assistant').then((m) => m.LyricsAssistant),
  { ssr: false }
);

const PresenceIndicator = dynamic(
  () => import('@/components/presence-indicator').then((m) => m.PresenceIndicator),
  { ssr: false }
);

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'chord';
  content: string;
  chord?: string;
};

type ChordBlock = {
  id: string;
  chord: string;
  duration?: string;
};

export default function SongwritingPage() {
  const [activeView, setActiveView] = useState<'structure' | 'chords' | 'lyrics'>('structure');
  const [songBlocks, setSongBlocks] = useState<SongBlock[]>([]);
  const [chordProgression, setChordProgression] = useState<ChordBlock[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('Untitled Song');
  const { user, loading } = useRequireAuth({ redirectIfNoUser: false });

  // Initialize auto-save
  const {
    songData,
    updateSong,
    createSong,
    saveStatus,
    error: saveError,
    isSaving,
    isSaved,
    hasError,
  } = useSongAutoSave();

  // Create song on first load if user is authenticated
  useEffect(() => {
    if (user && !songData.id) {
      createSong({
        title: songTitle,
        status: 'draft',
        visibility: 'private',
      }).catch(console.error);
    }
  }, [user, songData.id]);

  // Auto-save blocks when they change
  useEffect(() => {
    if (songData.id && songBlocks.length > 0) {
      updateSong({
        lyrics: songBlocks.map((b) => `[${b.type.toUpperCase()}]\n${b.content}`).join('\n\n'),
      });
    }
  }, [songBlocks, songData.id]);

  // Auto-save lyrics when they change
  useEffect(() => {
    if (songData.id && lyrics) {
      updateSong({ lyrics });
    }
  }, [lyrics, songData.id]);

  // Auto-save title when it changes
  useEffect(() => {
    if (songData.id && songTitle !== songData.title) {
      updateSong({ title: songTitle });
    }
  }, [songTitle, songData.id, songData.title]);

  // Save Status Indicator
  const SaveStatusIndicator = () => {
    if (!user || !songData.id) return null;

    return (
      <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1.5 text-sm">
        {isSaving && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-gray-300">Saving...</span>
          </>
        )}
        {isSaved && (
          <>
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-gray-300">Saved</span>
          </>
        )}
        {hasError && (
          <>
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-gray-300">Error saving</span>
          </>
        )}
        {!isSaving && !isSaved && !hasError && (
          <>
            <Save className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Auto-save active</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* BADASS Header with Orange Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-red-600/10 p-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/50">
                <Music2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="border-none bg-transparent px-0 text-4xl font-bold text-white outline-none focus:ring-0"
                    placeholder="Untitled Song"
                    disabled={!user}
                  />
                  <SaveStatusIndicator />
                </div>
                <p className="flex items-center gap-2 text-gray-300">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  Drag-and-drop builder with real-time collaboration & auto-save
                </p>
              </div>
            </div>
            {user && (
              <div className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2">
                <PresenceIndicator
                  channelName="songwriting:studio"
                  currentUser={{
                    userId: user.id,
                    userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    userEmail: user.email || '',
                    avatar: user.user_metadata?.avatar_url,
                  }}
                  location={`songwriting:${activeView}`}
                  showDetails={false}
                  maxVisible={5}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Collaboration Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">Multi-Cursor</span>
              </div>
              <div className="flex items-center gap-2">
                <Save className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">Auto-Save</span>
              </div>
            </div>
            <div className="text-sm text-purple-300">✨ All collaboration features active</div>
          </div>
        </motion.div>

        {/* View Tabs */}
        <div className="mb-8 flex gap-2 border-b border-gray-800">
          <button
            onClick={() => setActiveView('structure')}
            className={`relative px-6 py-3 font-semibold transition-all ${
              activeView === 'structure' ? 'text-orange-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            Song Structure
            {activeView === 'structure' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveView('chords')}
            className={`relative px-6 py-3 font-semibold transition-all ${
              activeView === 'chords' ? 'text-orange-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            Chord Progressions
            {activeView === 'chords' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveView('lyrics')}
            className={`relative px-6 py-3 font-semibold transition-all ${
              activeView === 'lyrics' ? 'text-orange-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            Lyrics Assistant
            {activeView === 'lyrics' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeView === 'structure' && loading && (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-gray-800 bg-gray-900">
              <div className="text-center">
                <Music2 className="mx-auto mb-4 h-12 w-12 animate-pulse text-orange-500" />
                <p className="text-gray-400">Loading authentication...</p>
              </div>
            </div>
          )}

          {activeView === 'structure' && !loading && user && (
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

          {activeView === 'structure' && !loading && !user && (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-red-600/10 p-12">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/50">
                  <Music2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">Sign In to Collaborate</h3>
                <p className="mb-6 text-gray-300">
                  The collaborative song structure builder requires authentication to track your
                  changes and enable real-time collaboration with other musicians.
                </p>
                <a
                  href="/auth"
                  className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Sign In to Continue
                </a>
              </div>
            </div>
          )}

          {activeView === 'chords' && (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
              <ChordBuilder
                onChange={(progression) => {
                  // progression is already ChordBlock[], just update it directly
                  setChordProgression(progression);
                  // Auto-save chord progression
                  if (songData.id) {
                    updateSong({
                      chords: progression,
                    });
                  }
                }}
              />
            </div>
          )}

          {activeView === 'lyrics' && (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
              <LyricsAssistant
                currentLyrics={lyrics}
                onInsert={(text) => setLyrics(lyrics ? lyrics + '\n' + text : text)}
              />
            </div>
          )}
        </motion.div>

        {/* Collaboration Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6"
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Users className="h-5 w-5 text-orange-500" />
            Collaborative Features Active
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
              <div>
                <p className="font-medium text-white">Real-time Chat</p>
                <p className="text-gray-400">Message your collaborators while writing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Video className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
              <div>
                <p className="font-medium text-white">Video Sessions</p>
                <p className="text-gray-400">Face-to-face collaboration with screen share</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
              <div>
                <p className="font-medium text-white">Multi-Cursor</p>
                <p className="text-gray-400">See everyone&apos;s cursor in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Save className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
              <div>
                <p className="font-medium text-white">Auto-Save</p>
                <p className="text-gray-400">Your work is saved automatically every 2 seconds</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
