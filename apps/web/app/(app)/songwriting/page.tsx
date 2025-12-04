'use client';

import { motion } from 'framer-motion';
import {
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  GitBranch,
  Save,
  Download,
  Disc3,
  // Custom musician icons
  SongManuscript,
  VinylRecord,
} from '@/components/ui/custom-icons';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

import { OnboardingTour } from '@/components/feature-tooltip';
import { LibraryImportModal } from '@/components/library-import-modal';
import { ProjectSelector } from '@/components/project-selector';
import { ToastNotification, useToast } from '@/components/toast-notification';
import type { LibraryFile } from '@/hooks/use-library';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useSongAutoSave, type SongData } from '@/hooks/use-song-auto-save';

// Import the streamlined song builder (cleaner single-flow UX)
const StreamlinedSongBuilder = dynamic(
  () =>
    import('@/components/songwriting/streamlined-song-builder').then(
      (m) => m.StreamlinedSongBuilder
    ),
  { ssr: false }
);

const QuickLibraryImport = dynamic(
  () => import('@/components/songwriting/quick-library-import').then((m) => m.QuickLibraryImport),
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

const VersionHistoryPanel = dynamic(
  () => import('@/components/songwriting/version-history-panel').then((m) => m.VersionHistoryPanel),
  { ssr: false }
);

const SaveVersionModal = dynamic(
  () => import('@/components/songwriting/save-version-modal').then((m) => m.SaveVersionModal),
  { ssr: false }
);

const SongExport = dynamic(
  () => import('@/components/songwriting/song-export').then((m) => m.SongExport),
  { ssr: false }
);

const KeyTransposer = dynamic(
  () => import('@/components/songwriting/key-transposer').then((m) => m.KeyTransposer),
  { ssr: false }
);

const ChordDiagramStrip = dynamic(
  () => import('@/components/songwriting/chord-diagrams').then((m) => m.ChordDiagramStrip),
  { ssr: false }
);

const BpmTapper = dynamic(
  () => import('@/components/songwriting/bpm-tapper').then((m) => m.BpmTapper),
  { ssr: false }
);

const NashvilleNumbers = dynamic(
  () => import('@/components/songwriting/nashville-numbers').then((m) => m.NashvilleNumbers),
  { ssr: false }
);

const ReferenceTracks = dynamic(
  () => import('@/components/songwriting/reference-tracks').then((m) => m.ReferenceTracks),
  { ssr: false }
);

const PasteLyricsModal = dynamic(
  () => import('@/components/songwriting/paste-lyrics-modal').then((m) => m.PasteLyricsModal),
  { ssr: false }
);

const CleanPreview = dynamic(
  () => import('@/components/songwriting/clean-preview').then((m) => m.CleanPreview),
  { ssr: false }
);

type ChordPlacement = {
  wordIndex: number;
  lineIndex: number;
  chord: string;
};

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro' | 'chord';
  content: string;
  chord?: string; // Legacy field for backward compatibility
  chordPlacements?: ChordPlacement[]; // New granular chord placement
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
  const [activeView, setActiveView] = useState<
    'structure' | 'preview' | 'chords' | 'lyrics' | 'copyright'
  >('structure');
  const [songBlocks, setSongBlocks] = useState<SongBlock[]>([]);
  const [_chordProgression, setChordProgression] = useState<ChordBlock[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('Untitled Song');
  const [isFirstSave, setIsFirstSave] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLibraryImport, setShowLibraryImport] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSaveVersion, setShowSaveVersion] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPasteLyrics, setShowPasteLyrics] = useState(false);
  const [referenceTracks, setReferenceTracks] = useState<
    Array<{
      id: string;
      title: string;
      artist: string;
      url?: string;
      notes?: string;
    }>
  >([]);

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

  // Check for imported file from library on mount
  useEffect(() => {
    try {
      const importedData = sessionStorage.getItem('songwritingImport');
      if (importedData) {
        const data = JSON.parse(importedData);
        if (data.importedFile) {
          const { name, lyrics: importedLyrics, type } = data.importedFile;

          // Set song title from file name
          if (name) {
            const cleanName = name.replace(/\.[^/.]+$/, ''); // Remove extension
            setSongTitle(cleanName);
          }

          // Import lyrics content
          if (importedLyrics) {
            setLyrics(importedLyrics);
            success(`Imported "${name}" from library!`, 3000);
          } else {
            success(`Opened "${name}" - add lyrics in the Lyrics tab`, 3000);
          }

          // Switch to lyrics view if it's a lyrics/chords file
          if (['lyrics', 'chords'].includes(type)) {
            setActiveView('lyrics');
          }
        }

        // Clear the import data
        sessionStorage.removeItem('songwritingImport');
      }
    } catch (err) {
      console.error('Failed to load imported file:', err);
    }
  }, [success]);

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
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {isSaving && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="font-medium" style={{ color: 'var(--muted)' }}>
              Saving...
            </span>
          </>
        )}
        {isSaved && !isSaving && (
          <>
            <Check className="h-3.5 w-3.5" style={{ color: 'var(--success)' }} />
            <span className="font-medium" style={{ color: 'var(--muted)' }}>
              Saved
            </span>
          </>
        )}
        {hasError && !isSaving && (
          <>
            <AlertCircle className="h-3.5 w-3.5" style={{ color: 'var(--error)' }} />
            <span className="font-medium" style={{ color: 'var(--muted)' }}>
              Error
            </span>
          </>
        )}
        {!isSaving && !isSaved && !hasError && (
          <span className="font-medium" style={{ color: 'var(--muted)' }}>
            Auto-Save On
          </span>
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

  // Handle library import with smart lyrics parsing
  const handleLibraryImport = async (file: LibraryFile) => {
    // Dynamic import of lyrics parser to keep bundle small
    const { parseLyricsToBlocks, getSectionSummary, smartParseLyrics } =
      await import('@/lib/lyrics-parser');

    // Helper to process lyrics content
    const processLyrics = (lyricsText: string, source: string) => {
      const sections = smartParseLyrics(lyricsText);
      const blocks = parseLyricsToBlocks(lyricsText);

      if (blocks.length > 0) {
        // Smart import: convert to song blocks
        setSongBlocks(blocks);
        setLyrics(lyricsText);
        const summary = getSectionSummary(sections);
        success(`Imported from ${source}: ${summary}`, 3000);
        setActiveView('structure'); // Switch to structure view to see the blocks
      } else {
        // Fallback: just set the lyrics
        setLyrics(lyricsText);
        success(`Imported lyrics from ${source}`, 2000);
        setActiveView('lyrics');
      }
    };

    // If the file has lyrics content, import it directly
    if (file.lyrics) {
      processLyrics(file.lyrics, file.name);
      return;
    }

    // For text-based files, try to fetch the content
    if (['lyrics', 'chords'].includes(file.type) || file.mimeType.startsWith('text/')) {
      try {
        const response = await fetch(file.url);
        const text = await response.text();
        if (text) {
          processLyrics(text, file.name);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch file content:', err);
      }
    }

    // Fallback: add a reference to the file
    const importText = `\n\n[Imported: ${file.name}]\nFile URL: ${file.url}\n`;
    setLyrics((prev) => prev + importText);
    success(`Added reference to ${file.name}`, 2000);
  };

  // Handle version restore - refetch the song data from the server
  const handleVersionRestore = async () => {
    if (!songData.id) return;

    try {
      const response = await fetch(`/api/songs/${songData.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.song) {
          // Update local state with restored version
          setSongTitle(data.song.title || 'Untitled Song');
          setLyrics(data.song.lyrics || '');

          // Parse blocks from lyrics if they exist
          if (data.song.lyrics) {
            const blockRegex = /\[([A-Z\s]+)\]\n([\s\S]*?)(?=\n\[|$)/gi;
            const blocks: SongBlock[] = [];
            let match;
            while ((match = blockRegex.exec(data.song.lyrics)) !== null) {
              const type = match[1].toLowerCase().replace(/\s+/g, '-') as SongBlock['type'];
              blocks.push({
                id: crypto.randomUUID(),
                type:
                  type === 'pre-chorus' ? 'pre-chorus' : (type.split('-')[0] as SongBlock['type']),
                content: match[2].trim(),
              });
            }
            if (blocks.length > 0) {
              setSongBlocks(blocks);
            }
          }

          success('Version restored successfully!', 3000);
        }
      }
    } catch (err) {
      showError('Failed to restore version', 3000);
      console.error('Version restore error:', err);
    }
  };

  // Handle version saved
  const handleVersionSaved = () => {
    success('Version saved!', 2000);
  };

  // Reference tracks handlers
  const addReferenceTrack = (track: Omit<(typeof referenceTracks)[0], 'id'>) => {
    setReferenceTracks((prev) => [...prev, { ...track, id: crypto.randomUUID() }]);
  };

  const removeReferenceTrack = (id: string) => {
    setReferenceTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateReferenceTrack = (id: string, updates: Partial<(typeof referenceTracks)[0]>) => {
    setReferenceTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Get unique chords from chord progression
  const uniqueChords = [...new Set(_chordProgression.map((c) => c.chord))];

  const tabs = [
    { id: 'structure', label: 'Structure' },
    { id: 'preview', label: 'Preview' },
    { id: 'chords', label: 'Chords' },
    { id: 'lyrics', label: 'Lyrics' },
    { id: 'copyright', label: 'Copyright' },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* RR Logo - white logo for dark bg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex flex-col items-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={57}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              {/* Accent bar */}
              <div className="mb-3 h-1 w-12 rounded-full" style={{ background: 'var(--accent)' }} />

              {/* Title with icon */}
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: 'var(--panel)' }}
                >
                  <Music4 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                    Songwriting Studio
                  </p>
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="w-full border-none bg-transparent text-2xl font-bold outline-none focus:ring-0"
                    style={{ color: 'var(--text)' }}
                    placeholder="Untitled Song"
                    disabled={!user}
                  />
                </div>
              </div>

              {/* Status row - horizontally scrollable on mobile */}
              <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
                <div
                  className="flex items-center gap-2 sm:flex-wrap sm:gap-3"
                  style={{ minWidth: 'max-content' }}
                >
                  <SaveStatusIndicator />
                  {user && (
                    <>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className="rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4"
                          style={{
                            background: historyIndex > 0 ? 'var(--panel)' : 'transparent',
                            border: historyIndex > 0 ? '1px solid var(--border)' : 'none',
                            color: historyIndex > 0 ? 'var(--text)' : 'var(--muted)',
                            cursor: historyIndex > 0 ? 'pointer' : 'not-allowed',
                          }}
                          title="Undo (⌘Z)"
                        >
                          Undo
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                          className="rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4"
                          style={{
                            background:
                              historyIndex < history.length - 1 ? 'var(--panel)' : 'transparent',
                            border:
                              historyIndex < history.length - 1
                                ? '1px solid var(--border)'
                                : 'none',
                            color:
                              historyIndex < history.length - 1 ? 'var(--text)' : 'var(--muted)',
                            cursor: historyIndex < history.length - 1 ? 'pointer' : 'not-allowed',
                          }}
                          title="Redo (⌘⇧Z)"
                        >
                          Redo
                        </motion.button>
                      </div>
                      <Link href="/tools?tool=circle-of-fifths" className="hidden sm:block">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            color: '#a855f7',
                          }}
                          title="Circle of Fifths Tool"
                        >
                          <Disc3 className="h-3.5 w-3.5" />
                          <span className="hidden md:inline">Circle of Fifths</span>
                          <span className="md:hidden">Chords</span>
                        </motion.button>
                      </Link>
                      <div className="hidden sm:block">
                        <ProjectSelector
                          songId={songData.id}
                          onProjectAdded={(_slug) => success(`Added to project`, 2000)}
                        />
                      </div>
                      {songData.id && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowSaveVersion(true)}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition sm:gap-1.5 sm:px-4"
                            style={{
                              background: 'var(--panel)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                            }}
                            title="Save Version"
                          >
                            <Save className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                            <span className="hidden sm:inline">Save</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowVersionHistory(true)}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition sm:gap-1.5 sm:px-4"
                            style={{
                              background: 'var(--panel)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                            }}
                            title="Version History"
                          >
                            <GitBranch className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                            <span className="hidden sm:inline">History</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowExport(true)}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition sm:gap-1.5 sm:px-4"
                            style={{
                              background: 'var(--accent)',
                              color: 'white',
                            }}
                            title="Export Song"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Export</span>
                          </motion.button>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
                      onClick={() => setShowPasteLyrics(true)}
                      className="button secondary rounded-xl px-4 py-2.5 text-sm font-medium"
                    >
                      Paste Lyrics
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowLibraryImport(true)}
                      className="button secondary rounded-xl px-4 py-2.5 text-sm font-medium"
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

        {/* Tab Navigation - scrollable on mobile */}
        <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              minWidth: 'max-content',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className="relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all sm:px-5 sm:py-2.5"
                style={{
                  background: activeView === tab.id ? 'var(--bg)' : 'transparent',
                  color: activeView === tab.id ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="min-h-[600px]"
        >
          {activeView === 'structure' && loading && (
            <div
              className="flex min-h-[500px] items-center justify-center rounded-xl"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="text-center">
                <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Loading Studio...
                </p>
              </div>
            </div>
          )}

          {activeView === 'structure' && !loading && user && (
            <div className="space-y-3 sm:space-y-4">
              {/* Quick Import Panel */}
              <QuickLibraryImport
                onImport={handleLibraryImport}
                onOpenFullLibrary={() => setShowLibraryImport(true)}
              />

              {/* Song Builder */}
              <div className="card overflow-hidden rounded-2xl p-3 sm:p-6">
                <StreamlinedSongBuilder
                  onSongChange={(blocks) => setSongBlocks(blocks)}
                  initialBlocks={songBlocks}
                />
              </div>
            </div>
          )}

          {activeView === 'structure' && !loading && !user && (
            <div
              className="flex min-h-[500px] items-center justify-center rounded-xl p-8"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="max-w-md text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: 'var(--bg)' }}
                >
                  <Sparkles className="h-7 w-7" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">Sign In Required</h3>
                <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                  Authentication required to access songwriting features.
                </p>
                <a
                  href="/auth"
                  className="inline-block rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  Sign In
                </a>
              </div>
            </div>
          )}

          {activeView === 'preview' && (
            <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
              <CleanPreview
                songTitle={songTitle}
                blocks={songBlocks}
                songKey={songData.key}
                tempo={songData.tempo}
                timeSignature={songData.timeSignature}
                copyrightInfo={safeParse(
                  songData.copyrightInfo as string | null | undefined,
                  undefined
                )}
              />
            </div>
          )}

          {activeView === 'chords' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Main Chord Builder */}
              <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
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

              {/* Two-column layout for tools - single column on mobile */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Left column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Key Transposer */}
                  {uniqueChords.length > 0 && (
                    <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
                      <KeyTransposer
                        chords={uniqueChords}
                        currentKey={songData.key || 'C'}
                        onTranspose={(transposedChords, newKey, semitones) => {
                          if (songData.id && semitones !== 0) {
                            updateSong({ key: newKey });
                            success(`Transposed to ${newKey}`, 2000);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Nashville Numbers */}
                  {uniqueChords.length > 0 && songData.key && (
                    <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
                      <NashvilleNumbers chords={uniqueChords} songKey={songData.key} />
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Metronome + BPM Tapper */}
                  <div className="card overflow-hidden rounded-2xl">
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

                  {/* BPM Tapper */}
                  <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
                    <BpmTapper
                      currentBpm={songData.tempo}
                      onBpmDetected={(bpm) => {
                        if (songData.id) {
                          updateSong({ tempo: bpm });
                          success(`Tempo set to ${bpm} BPM`, 2000);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Chord Diagrams - Full Width */}
              {uniqueChords.length > 0 && (
                <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
                  <ChordDiagramStrip chords={uniqueChords} />
                </div>
              )}
            </div>
          )}

          {activeView === 'lyrics' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Voice Memos */}
                <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
                  <div
                    className="mb-6 flex items-center gap-3 pb-4"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 69, 0, 0.1))',
                      }}
                    >
                      <Music4 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                      Voice Memos
                    </h3>
                  </div>
                  <VoiceMemoRecorder songId={songData.id} />
                </div>

                {/* Reference Tracks */}
                <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
                  <ReferenceTracks
                    tracks={referenceTracks}
                    onAddTrack={addReferenceTrack}
                    onRemoveTrack={removeReferenceTrack}
                    onUpdateTrack={updateReferenceTrack}
                  />
                </div>
              </div>

              {/* Lyrics Assistant - Full Width */}
              <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
                <LyricsAssistant
                  currentLyrics={lyrics}
                  onInsert={(text) => setLyrics(lyrics ? lyrics + '\n' + text : text)}
                />
              </div>
            </div>
          )}

          {activeView === 'copyright' && (
            <div className="card overflow-hidden rounded-2xl p-4 sm:p-6">
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

      {/* Library Import Modal */}
      {showLibraryImport && (
        <LibraryImportModal
          isOpen={showLibraryImport}
          onClose={() => setShowLibraryImport(false)}
          onImport={handleLibraryImport}
          acceptTypes={['demo', 'sample', 'loop', 'stem', 'lyrics', 'chords', 'sheet_music']}
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

      {/* Version History Panel */}
      <VersionHistoryPanel
        songId={songData.id}
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        onRestore={handleVersionRestore}
      />

      {/* Save Version Modal */}
      <SaveVersionModal
        songId={songData.id}
        isOpen={showSaveVersion}
        onClose={() => setShowSaveVersion(false)}
        onVersionSaved={handleVersionSaved}
      />

      {/* Song Export Modal */}
      <SongExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        songTitle={songTitle}
        key={songData.key}
        tempo={songData.tempo}
        timeSignature={songData.timeSignature}
        lyrics={lyrics}
        blocks={songBlocks}
        chords={uniqueChords}
      />

      {/* Paste Lyrics Modal */}
      <PasteLyricsModal
        isOpen={showPasteLyrics}
        onClose={() => setShowPasteLyrics(false)}
        onImport={(blocks, rawLyrics) => {
          setSongBlocks(blocks);
          setLyrics(rawLyrics);
          success(`Imported ${blocks.length} section${blocks.length !== 1 ? 's' : ''}!`, 2000);
        }}
      />

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
