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
  Undo2,
  Redo2,
  LayoutTemplate,
  Mic,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';

import { ToastNotification, useToast } from '@/components/toast-notification';
import { FeatureTooltip, OnboardingTour } from '@/components/feature-tooltip';
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

const BatchSuggestionReview = dynamic(
  () => import('@/components/songwriting/batch-suggestion-review').then((m) => m.BatchSuggestionReview),
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
  const [activeView, setActiveView] = useState<'structure' | 'chords' | 'lyrics' | 'copyright'>('structure');
  const [songBlocks, setSongBlocks] = useState<SongBlock[]>([]);
  const [chordProgression, setChordProgression] = useState<ChordBlock[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('Untitled Song');
  const [isFirstSave, setIsFirstSave] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
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
  
  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setSongBlocks(state.blocks);
      setLyrics(state.lyrics);
    }
  };
  
  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setSongBlocks(state.blocks);
      setLyrics(state.lyrics);
    }
  };
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);
  
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
      const blocksAsLyrics = songBlocks.map((b) => `[${b.type.toUpperCase()}]\n${b.content}`).join('\n\n');
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
      <div className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs">
        {isSaving && (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-white" />
            <span className="font-mono uppercase tracking-wider text-zinc-400">Saving</span>
          </>
        )}
        {isSaved && !isSaving && (
          <>
            <Check className="h-3 w-3 text-green-500" />
            <span className="font-mono uppercase tracking-wider text-zinc-400">Saved</span>
          </>
        )}
        {hasError && !isSaving && (
          <>
            <AlertCircle className="h-3 w-3 text-red-500" />
            <span className="font-mono uppercase tracking-wider text-zinc-400">Error</span>
          </>
        )}
        {!isSaving && !isSaved && !hasError && (
          <span className="font-mono uppercase tracking-wider text-zinc-500">Auto-Save On</span>
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

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Clean Professional Header */}
        <div className="mb-8 border-b border-zinc-800 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full border-none bg-transparent px-0 text-3xl font-bold text-white outline-none placeholder:text-zinc-600 focus:ring-0 lg:text-4xl"
                placeholder="Untitled Song"
                disabled={!user}
              />
              <div className="mt-2 flex items-center gap-4">
                <SaveStatusIndicator />
                {user && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className={`rounded px-3 py-1 text-xs font-mono uppercase tracking-wider transition ${
                        historyIndex > 0
                          ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                          : 'text-zinc-600 cursor-not-allowed'
                      }`}
                      title="Undo (⌘Z)"
                    >
                      Undo
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className={`rounded px-3 py-1 text-xs font-mono uppercase tracking-wider transition ${
                        historyIndex < history.length - 1
                          ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                          : 'text-zinc-600 cursor-not-allowed'
                      }`}
                      title="Redo (⌘⇧Z)"
                    >
                      Redo
                    </button>
                  </div>
                )}
              </div>
            </div>
            {user && (
              <div className="ml-4 flex items-center gap-2">
                {activeView === 'structure' && (
                  <button
                    onClick={() => setShowTemplatePicker(true)}
                    className="rounded bg-zinc-800 px-4 py-2 text-xs font-mono uppercase tracking-wider text-white transition hover:bg-zinc-700"
                  >
                    Templates
                  </button>
                )}
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
                  maxVisible={3}
                />
              </div>
            )}
          </div>
        </div>

        {/* Clean Tab Navigation */}
        <div className="mb-8 flex gap-1 border-b border-zinc-800">
          <button
            onClick={() => setActiveView('structure')}
            className={`px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${
              activeView === 'structure' 
                ? 'border-b-2 border-white text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Structure
          </button>
          <button
            onClick={() => setActiveView('chords')}
            className={`px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${
              activeView === 'chords' 
                ? 'border-b-2 border-white text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Chords
          </button>
          <button
            onClick={() => setActiveView('lyrics')}
            className={`px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${
              activeView === 'lyrics' 
                ? 'border-b-2 border-white text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lyrics
          </button>
          <button
            onClick={() => setActiveView('copyright')}
            className={`px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${
              activeView === 'copyright' 
                ? 'border-b-2 border-white text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Copyright
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[600px]">
          {activeView === 'structure' && loading && (
            <div className="flex min-h-[600px] items-center justify-center rounded border border-zinc-800 bg-zinc-900/50">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-white" />
                <p className="font-mono text-sm uppercase tracking-wider text-zinc-400">Loading Studio</p>
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
            <div className="flex min-h-[600px] items-center justify-center rounded border border-zinc-800 bg-zinc-900/50 p-12">
              <div className="max-w-md text-center">
                <h3 className="mb-4 font-mono text-2xl uppercase tracking-wider text-white">
                  Sign In Required
                </h3>
                <p className="mb-8 text-zinc-400">
                  Authentication required to access collaborative songwriting features.
                </p>
                <a
                  href="/auth"
                  className="inline-block rounded bg-white px-8 py-3 font-mono text-sm uppercase tracking-wider text-black transition hover:bg-zinc-100"
                >
                  Sign In
                </a>
              </div>
            </div>
          )}

          {activeView === 'chords' && (
            <div className="space-y-6">
              <div className="rounded border border-zinc-800 bg-zinc-900/50 p-6">
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
          )}

          {activeView === 'lyrics' && (
            <div className="space-y-6">
              <div className="rounded border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="mb-6 border-b border-zinc-800 pb-4">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-zinc-400">Voice Memos</h3>
                </div>
                <VoiceMemoRecorder songId={songData.id} />
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-900/50 p-6">
                <LyricsAssistant
                  currentLyrics={lyrics}
                  onInsert={(text) => setLyrics(lyrics ? lyrics + '\n' + text : text)}
                />
              </div>
            </div>
          )}

          {activeView === 'copyright' && (
            <div className="rounded border border-zinc-800 bg-zinc-900/50 p-6">
              <CopyrightManager
                songId={songData.id}
                songTitle={songTitle}
                audioUrl={songData.audioUrl}
                audioPath={songData.audioPath}
                initialData={safeParse(songData.copyrightInfo as any, undefined)}
                onUpdate={(info) => {
                  if (songData.id) {
                    updateSong({
                      copyrightInfo: JSON.stringify(info) as any,
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
        </div>
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

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          steps={[
            {
              target: '[data-tour="structure"]',
              title: 'Song Structure',
              content: 'Drag and drop blocks to build your song structure. Try verse, chorus, bridge!',
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
              content: 'See who\'s online and collaborate in real-time with your bandmates.',
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
