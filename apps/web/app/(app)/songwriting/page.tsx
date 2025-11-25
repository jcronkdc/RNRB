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

  // Save Status Indicator with animation
  const SaveStatusIndicator = () => {
    if (!user || !songData.id) return null;

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1.5 text-sm"
      >
        {isSaving && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-gray-300">Saving...</span>
          </>
        )}
        {isSaved && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.2, 1] }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Check className="h-4 w-4 text-green-400" />
            </motion.div>
            <span className="text-gray-300">Saved</span>
          </motion.div>
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
      </motion.div>
    );
  };

  // Show onboarding tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('songwriting-tour-completed');
    if (!hasSeenTour && user) {
      setShowOnboarding(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900/50 to-black">
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          steps={[
            {
              id: 'welcome',
              title: 'Welcome to World-Class Songwriting!',
              description: 'We\'ve transformed the songwriting tool with 7 powerful new features. Let me show you what\'s new!',
            },
            {
              id: 'rhyme-dictionary',
              title: 'Rhyme Dictionary',
              description: 'Find perfect rhymes, near rhymes, and sounds-like words instantly. Grouped by syllable count for perfect flow.',
            },
            {
              id: 'syllable-counter',
              title: 'Syllable Counter',
              description: 'Automatic meter analysis detects flow issues in your lyrics. Get word-by-word syllable breakdowns.',
            },
            {
              id: 'chord-analyzer',
              title: 'Smart Chord Analyzer',
              description: 'Automatic key detection, Roman numeral analysis, and AI-powered next chord suggestions.',
            },
            {
              id: 'templates',
              title: 'Song Templates',
              description: 'Start with proven structures: Pop, Rock, Country, R&B. One-click apply to save 15 minutes of setup.',
            },
            {
              id: 'voice-memos',
              title: 'Voice Memos',
              description: 'Record melody ideas directly in your browser. Save, play, and download for later reference.',
            },
            {
              id: 'undo-redo',
              title: 'Undo/Redo',
              description: 'Full history stack lets you experiment fearlessly. Use Cmd+Z to undo, Cmd+Shift+Z to redo.',
            },
          ]}
        />
      )}
      
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Improved Header with Better Visual Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-red-600/10 p-6 shadow-xl lg:mb-8 lg:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/50 lg:h-16 lg:w-16">
                <Music2 className="h-7 w-7 text-white lg:h-8 lg:w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 lg:gap-3">
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="min-w-0 flex-1 border-none bg-transparent px-0 text-2xl font-bold text-white outline-none placeholder:text-gray-500 focus:ring-0 sm:text-3xl lg:text-4xl"
                    placeholder="Untitled Song"
                    disabled={!user}
                  />
                  <SaveStatusIndicator />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <p className="flex items-center gap-2 text-gray-300">
                    <Sparkles className="h-4 w-4 shrink-0 text-orange-500" />
                    <span>World-class songwriting tools</span>
                  </p>
                  
                  {/* Enhanced Action Buttons */}
                  {user && (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Undo/Redo Buttons - More Prominent */}
                      <div className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800/50 p-1">
                        <button
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                            historyIndex > 0
                              ? 'bg-gray-700 text-white hover:bg-gray-600'
                              : 'text-gray-600 cursor-not-allowed'
                          }`}
                          title="Undo (Cmd+Z)"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Undo</span>
                        </button>
                        <button
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                          className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                            historyIndex < history.length - 1
                              ? 'bg-gray-700 text-white hover:bg-gray-600'
                              : 'text-gray-600 cursor-not-allowed'
                          }`}
                          title="Redo (Cmd+Shift+Z)"
                        >
                          <Redo2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Redo</span>
                        </button>
                      </div>
                      
                      {/* Template Picker Button - More Prominent with Tooltip */}
                      {activeView === 'structure' && (
                        <FeatureTooltip
                          id="song-templates"
                          title="Song Templates"
                          description="Quick-start with proven song structures! Try Pop, Rock, Country, or R&B templates."
                          position="bottom"
                        >
                          <button
                            onClick={() => setShowTemplatePicker(true)}
                            className="group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-blue-600/20 px-3 py-1.5 text-xs font-bold text-blue-300 transition hover:border-blue-500 hover:from-blue-500/30 hover:to-blue-600/30 hover:shadow-lg hover:shadow-blue-500/20"
                          >
                            <LayoutTemplate className="h-3.5 w-3.5" />
                            <span>Templates</span>
                            <span className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] text-white">NEW</span>
                          </button>
                        </FeatureTooltip>
                      )}
                      
                      {/* Voice Memo Quick Access - When on any tab with Tooltip */}
                      <FeatureTooltip
                        id="voice-memos"
                        title="Voice Memos"
                        description="Capture melody ideas instantly! Record directly in your browser, no external tools needed."
                        position="bottom"
                      >
                        <button
                          onClick={() => setActiveView('lyrics')} // Switch to lyrics tab where voice memos are
                          className="group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-red-500/50 bg-gradient-to-r from-red-500/20 to-red-600/20 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:border-red-500 hover:from-red-500/30 hover:to-red-600/30 hover:shadow-lg hover:shadow-red-500/20"
                          title="Record voice memos"
                        >
                          <Mic className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Record</span>
                          <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">NEW</span>
                        </button>
                      </FeatureTooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {user && (
              <div className="shrink-0 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2">
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

        {/* Improved Collaboration Features Banner - More Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 lg:mb-8 lg:p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:gap-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 shrink-0 text-purple-400 lg:h-5 lg:w-5" />
                <span className="text-sm font-medium text-white">Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 shrink-0 text-purple-400 lg:h-5 lg:w-5" />
                <span className="text-sm font-medium text-white">Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0 text-purple-400 lg:h-5 lg:w-5" />
                <span className="text-sm font-medium text-white">Live Cursors</span>
              </div>
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 shrink-0 text-purple-400 lg:h-5 lg:w-5" />
                <span className="text-sm font-medium text-white">Auto-Save</span>
              </div>
            </div>
            <div className="text-xs text-purple-300 sm:text-sm">✨ All features active</div>
          </div>
        </motion.div>

        {/* Improved View Tabs - Better Mobile UX */}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-800 lg:mb-8 lg:gap-2">
          <button
            onClick={() => setActiveView('structure')}
            className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-all sm:px-6 lg:text-base ${
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
            className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-all sm:px-6 lg:text-base ${
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
            className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-all sm:px-6 lg:text-base ${
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
          <button
            onClick={() => setActiveView('copyright')}
            className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-all sm:px-6 lg:text-base ${
              activeView === 'copyright' ? 'text-orange-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            Copyright & Publishing
            {activeView === 'copyright' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </button>
        </div>

        {/* Content - Improved Loading and Empty States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="min-h-[500px]"
        >
          {activeView === 'structure' && loading && (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black">
              <div className="text-center">
                <Music2 className="mx-auto mb-4 h-12 w-12 animate-pulse text-orange-500" />
                <p className="text-lg font-medium text-white">Loading songwriting studio...</p>
                <p className="mt-2 text-sm text-gray-400">Preparing your collaborative workspace</p>
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
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-red-600/10 p-8 shadow-xl lg:p-12">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/50">
                  <Music2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white lg:text-3xl">
                  Sign In to Start Writing
                </h3>
                <p className="mb-6 text-base text-gray-300">
                  The collaborative song builder requires authentication to save your work and
                  enable real-time collaboration with other musicians.
                </p>
                <div className="space-y-4">
                  <a
                    href="/auth"
                    className="inline-block w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-orange-500/50 sm:w-auto"
                  >
                    Sign In to Continue
                  </a>
                  <p className="text-sm text-gray-400">
                    or <a href="/auth" className="text-orange-400 hover:underline">create a free account</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'chords' && (
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6 lg:p-8">
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
            <div className="space-y-6">
              {/* Voice Memo Recorder - Integrated at Top */}
              <div className="rounded-2xl border-2 border-red-500/30 bg-gradient-to-b from-gray-900 to-black p-6 lg:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
                    <Mic className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Voice Memos</h3>
                    <p className="text-sm text-gray-400">Capture melody ideas & vocal demos</p>
                  </div>
                </div>
                <VoiceMemoRecorder songId={songData.id} />
              </div>
              
              {/* Lyrics Assistant - Below Voice Memos */}
              <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6 lg:p-8">
                <LyricsAssistant
                  currentLyrics={lyrics}
                  onInsert={(text) => setLyrics(lyrics ? lyrics + '\n' + text : text)}
                />
              </div>
            </div>
          )}

          {activeView === 'copyright' && (
            <CopyrightManager
              songId={songData.id}
              songTitle={songTitle}
              initialData={songData.copyrightInfo ? JSON.parse(songData.copyrightInfo as any) : undefined}
              onUpdate={(info) => {
                if (songData.id) {
                  updateSong({
                    copyrightInfo: JSON.stringify(info) as any,
                    isrc: info.isrc,
                    iswc: info.iswc,
                  });
                }
              }}
            />
          )}
        </motion.div>

        {/* Improved Collaboration Info - Better Mobile Layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-5 lg:mt-8 lg:p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white lg:text-lg">
            <Users className="h-5 w-5 text-orange-500" />
            Collaborative Features
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3 rounded-lg border border-gray-800/50 bg-gray-900/50 p-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
              <div>
                <p className="font-medium text-white">Real-time Chat</p>
                <p className="mt-1 text-xs text-gray-400">
                  Message collaborators while writing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-800/50 bg-gray-900/50 p-3">
              <Video className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
              <div>
                <p className="font-medium text-white">Video Sessions</p>
                <p className="mt-1 text-xs text-gray-400">
                  Face-to-face with screen share
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-800/50 bg-gray-900/50 p-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
              <div>
                <p className="font-medium text-white">Live Cursors</p>
                <p className="mt-1 text-xs text-gray-400">
                  See everyone's cursor in real-time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-800/50 bg-gray-900/50 p-3">
              <Save className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
              <div>
                <p className="font-medium text-white">Auto-Save</p>
                <p className="mt-1 text-xs text-gray-400">
                  Work saved every 2 seconds
                </p>
              </div>
            </div>
          </div>
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

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
