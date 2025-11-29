'use client';

import { motion } from 'framer-motion';
import { Check, Loader2, AlertCircle, Music4, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';

import { OnboardingTour } from '@/components/feature-tooltip';
import { LibraryImportModal } from '@/components/library-import-modal';
import { ProjectSelector } from '@/components/project-selector';
import { ToastNotification, useToast } from '@/components/toast-notification';
import type { LibraryFile } from '@/hooks/use-library';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useSongAutoSave, type SongData } from '@/hooks/use-song-auto-save';

// Import the drag-drop collaborative songwriting components
const CollaborativeVisualBuilder = dynamic(
  () =>
    import('@/components/songwriting/collaborative-visual-builder').then(
      (m) => m.CollaborativeVisualBuilder
    ),
  { ssr: false }
);

const SongTemplatePicker = dynamic(
  () => import('@/components/songwriting/song-template-picker').then((m) => m.SongTemplatePicker),
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

const VoiceMemoRecorder = dynamic(
  () => import('@/components/songwriting/voice-memo-recorder').then((m) => m.VoiceMemoRecorder),
  { ssr: false }
);

const PresenceIndicator = dynamic(
  () => import('@/components/presence-indicator').then((m) => m.PresenceIndicator),
  { ssr: false }
);

const CopyrightManager = dynamic(
  () => import('@/components/songwriting/copyright-manager').then((m) => m.CopyrightManager),
  { ssr: false }
);

const Metronome = dynamic(
  () => import('@/components/songwriting/metronome').then((m) => m.Metronome),
  { ssr: false }
);

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro' | 'chord';
  content: string;
  chord?: string;
};

type ChordBlock = {
  id: string;
  chord: string;
  duration?: string;
};

/**
 * Safely parse JSON string with fallback to default value
 * Prevents crashes from malformed or corrupted JSON data
 */
function safeParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

export default function SongwritingPage() {
  const [activeView, setActiveView] = useState<'structure' | 'chords' | 'lyrics' | 'copyright'>(
    'structure'
  );
  const [songBlocks, setSongBlocks] = useState<SongBlock[]>([]);
  const [_chordProgression, setChordProgression] = useState<ChordBlock[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('Untitled Song');
  const [isFirstSave, setIsFirstSave] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLibraryImport, setShowLibraryImport] = useState(false);

  // Undo/Redo state management
  const [history, setHistory] = useState<Array<{ blocks: SongBlock[]; lyrics: string }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Note: Route protection is handled by middleware.ts, not by this hook
  const { user, loading } = useRequireAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const previousSavedRef = useRef(false);

  // Save to history when blocks or lyrics change
  const saveToHistory = () => {
    const newState = { blocks: songBlocks, lyrics };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Refs for undo/redo to avoid stale closures
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);

  // Keep refs in sync with state
  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  // Undo function - uses refs to avoid stale closures
  const undo = () => {
    if (historyIndexRef.current > 0) {
      const newIndex = historyIndexRef.current - 1;
      setHistoryIndex(newIndex);
      const state = historyRef.current[newIndex];
      setSongBlocks(state.blocks);
      setLyrics(state.lyrics);
    }
  };

  // Redo function - uses refs to avoid stale closures
  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const newIndex = historyIndexRef.current + 1;
      setHistoryIndex(newIndex);
      const state = historyRef.current[newIndex];
      setSongBlocks(state.blocks);
      setLyrics(state.lyrics);
    }
  };

  // Stable refs for keyboard handler (avoids stale closure issue)
  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  useEffect(() => {
    undoRef.current = undo;
    redoRef.current = redo;
  });

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redoRef.current();
        } else {
          undoRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize auto-save
  const {
    songData,
    updateSong,
    createSong,
    saveStatus: _saveStatus,
    error: saveError,
    isSaving,
    isSaved,
    hasError,
  } = useSongAutoSave();

  // Show toast notifications for save events
  useEffect(() => {
    if (isSaved && !previousSavedRef.current && songData.id) {
      if (isFirstSave) {
        success('Song created and saved!', 3000);
        setIsFirstSave(false);
      } else {
        success('Changes saved', 2000);
      }
    }
    previousSavedRef.current = isSaved;
  }, [isSaved, songData.id, isFirstSave, success]);

  // Show error toast
  useEffect(() => {
    if (hasError && saveError) {
      showError(saveError, 3000);
    }
  }, [hasError, saveError, showError]);

  // Create song on first load if user is authenticated
  useEffect(() => {
    if (user?.id && !songData.id) {
      createSong({
        title: songTitle,
        status: 'draft',
        visibility: 'private',
      }).catch((err) => {
        console.error('Failed to create initial song:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only run when user ID changes

  // Consolidated auto-save effect - prevents race conditions
  useEffect(() => {
    if (!songData.id) return; // Don't save until song is created

    const updates: Partial<SongData> = {};
    let hasUpdates = false;

    // Title changed
    if (songTitle !== songData.title) {
      updates.title = songTitle;
      hasUpdates = true;
    }

    // Lyrics changed (from lyrics tab)
    if (lyrics && lyrics !== songData.lyrics) {
      updates.lyrics = lyrics;
      hasUpdates = true;
    }

    // Blocks changed (from structure tab)
    if (songBlocks.length > 0) {
      const blocksAsLyrics = songBlocks
        .map((b) => `[${b.type.toUpperCase()}]\n${b.content}`)
        .join('\n\n');
      if (blocksAsLyrics !== songData.lyrics) {
        updates.lyrics = blocksAsLyrics;
        hasUpdates = true;
      }
    }

    // Only update if there are actual changes
    if (hasUpdates) {
      updateSong(updates);
    }
  }, [songTitle, lyrics, songBlocks, songData.id, songData.title, songData.lyrics, updateSong]);

  // Save Status Indicator - memoized to prevent re-renders
  const SaveStatusIndicator = () => {
    if (!user || !songData.id) return null;

    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs backdrop-blur-sm">
        {isSaving && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
            <span className="font-medium text-gray-400">Saving...</span>
          </>
        )}
        {isSaved && !isSaving && (
          <>
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span className="font-medium text-gray-400">Saved</span>
          </>
        )}
        {hasError && !isSaving && (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="font-medium text-gray-400">Error</span>
          </>
        )}
        {!isSaving && !isSaved && !hasError && (
          <span className="font-medium text-gray-500">Auto-Save On</span>
        )}
      </div>
    );
  };

  // Show onboarding tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('onboarding-tour-completed');
    if (!hasSeenTour && user) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Handle library import
  const handleLibraryImport = (file: LibraryFile) => {
    // For now, add a link to the file in the lyrics
    const importText = `\n\n[Imported: ${file.name}]\nFile URL: ${file.url}\n`;
    setLyrics((prev) => prev + importText);
    success(`Imported ${file.name}`, 2000);
  };

  const tabs = [
    { id: 'structure', label: 'Structure' },
    { id: 'chords', label: 'Chords' },
    { id: 'lyrics', label: 'Lyrics' },
    { id: 'copyright', label: 'Copyright' },
  ] as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-600/20 to-transparent blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-pink-600/15 to-transparent blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-cyan-600/10 to-transparent blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              {/* Accent bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              />

              {/* Title with icon */}
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                  <Music4 className="h-7 w-7 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-400">Songwriting Studio</p>
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="w-full border-none bg-transparent text-3xl font-bold text-white outline-none placeholder:text-gray-600 focus:ring-0 lg:text-4xl"
                    placeholder="Untitled Song"
                    disabled={!user}
                  />
                </div>
              </div>

              {/* Status row */}
              <div className="flex flex-wrap items-center gap-3">
                <SaveStatusIndicator />
                {user && (
                  <>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                          historyIndex > 0
                            ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                            : 'cursor-not-allowed text-gray-600'
                        }`}
                        title="Undo (⌘Z)"
                      >
                        Undo
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                          historyIndex < history.length - 1
                            ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                            : 'cursor-not-allowed text-gray-600'
                        }`}
                        title="Redo (⌘⇧Z)"
                      >
                        Redo
                      </motion.button>
                    </div>
                    <ProjectSelector
                      songId={songData.id}
                      onProjectAdded={(_slug) => success(`Added to project`, 2000)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Right side actions */}
            {user && (
              <div className="flex items-center gap-3">
                {activeView === 'structure' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowTemplatePicker(true)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
                    >
                      Templates
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowLibraryImport(true)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
                    >
                      Import
                    </motion.button>
                  </>
                )}
                <PresenceIndicator
                  channelName="songwriting:studio"
                  currentUser={{
                    userId: user.id,
                    userName: user.name || user.email?.split('@')[0] || 'User',
                    userEmail: user.email || '',
                    avatar: user.image,
                  }}
                  location={`songwriting:${activeView}`}
                  showDetails={false}
                  maxVisible={3}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Premium Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative rounded-xl px-6 py-3 text-sm font-medium transition-all ${
                  activeView === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {activeView === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/50 to-pink-600/50"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="min-h-[600px]"
        >
          {activeView === 'structure' && loading && (
            <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="text-center">
                <div className="relative mx-auto mb-6 h-16 w-16">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
                </div>
                <p className="text-sm font-medium text-gray-400">Loading Studio...</p>
              </div>
            </div>
          )}

          {activeView === 'structure' && !loading && user && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <CollaborativeVisualBuilder
                projectSlug="songwriting-studio"
                onSongChange={(blocks) => setSongBlocks(blocks)}
                currentUser={{
                  userId: user.id,
                  userName: user.name || user.email?.split('@')[0] || 'User',
                  userEmail: user.email || '',
                  avatar: user.image,
                }}
              />
            </div>
          )}

          {activeView === 'structure' && !loading && !user && (
            <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Sparkles className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">Sign In Required</h3>
                <p className="mb-8 text-gray-400">
                  Authentication required to access collaborative songwriting features.
                </p>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/auth"
                  className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-500/25"
                >
                  Sign In
                </motion.a>
              </div>
            </div>
          )}

          {activeView === 'chords' && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <ChordBuilder
                  onChange={(progression) => {
                    setChordProgression(progression);
                    if (songData.id) {
                      updateSong({
                        chords: progression,
                      });
                    }
                  }}
                />
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <Metronome
                  initialBpm={songData.tempo || 120}
                  initialTimeSignature={songData.timeSignature || '4/4'}
                  onBpmChange={(bpm) => {
                    if (songData.id) {
                      updateSong({ tempo: bpm });
                    }
                  }}
                  onTimeSignatureChange={(sig) => {
                    if (songData.id) {
                      updateSong({ timeSignature: sig });
                    }
                  }}
                />
              </div>
            </div>
          )}

          {activeView === 'lyrics' && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <Music4 className="h-5 w-5 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-white">Voice Memos</h3>
                </div>
                <VoiceMemoRecorder songId={songData.id} />
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <LyricsAssistant
                  currentLyrics={lyrics}
                  onInsert={(text) => setLyrics(lyrics ? lyrics + '\n' + text : text)}
                />
              </div>
            </div>
          )}

          {activeView === 'copyright' && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <CopyrightManager
                songId={songData.id}
                songTitle={songTitle}
                audioUrl={songData.audioUrl ?? undefined}
                audioPath={songData.audioPath ?? undefined}
                initialData={safeParse(
                  songData.copyrightInfo as string | null | undefined,
                  undefined
                )}
                onUpdate={(info) => {
                  if (songData.id) {
                    updateSong({
                      copyrightInfo: JSON.stringify(info),
                      isrc: info.isrc,
                      iswc: info.iswc,
                    });
                  }
                }}
                onAudioUpdate={(url, path) => {
                  if (songData.id) {
                    updateSong({
                      audioUrl: url,
                      audioPath: path,
                    });
                  }
                }}
                onAudioRemove={() => {
                  if (songData.id) {
                    updateSong({
                      audioUrl: null,
                      audioPath: null,
                    });
                  }
                }}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Song Template Picker Modal */}
      {showTemplatePicker && (
        <SongTemplatePicker
          onSelectTemplate={(blocks) => {
            setSongBlocks(blocks);
            saveToHistory();
          }}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Library Import Modal */}
      {showLibraryImport && (
        <LibraryImportModal
          isOpen={showLibraryImport}
          onClose={() => setShowLibraryImport(false)}
          onImport={handleLibraryImport}
          acceptTypes={['demo', 'sample', 'loop', 'stem']}
        />
      )}

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          steps={[
            {
              target: '[data-tour="structure"]',
              title: 'Song Structure',
              content:
                'Drag and drop blocks to build your song structure. Try verse, chorus, bridge!',
            },
            {
              target: '[data-tour="chords"]',
              title: 'Chord Progression',
              content: 'Create chord progressions with AI assistance or build your own.',
            },
            {
              target: '[data-tour="lyrics"]',
              title: 'Lyrics Assistant',
              content: 'Get AI-powered suggestions for lyrics, rhymes, and songwriting ideas.',
            },
            {
              target: '[data-tour="collaboration"]',
              title: 'Real-time Collaboration',
              content: "See who's online and collaborate in real-time with your bandmates.",
            },
          ]}
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem('onboarding-tour-completed', 'true');
          }}
          onSkip={() => {
            setShowOnboarding(false);
            localStorage.setItem('onboarding-tour-completed', 'true');
          }}
        />
      )}

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
