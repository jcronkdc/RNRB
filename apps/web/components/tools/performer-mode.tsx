'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Type,
  ChevronUp,
  ChevronDown,
  Music,
  Clock,
  Eye,
  Loader2,
  Library,
  ListMusic,
  FolderOpen,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';

interface Song {
  id: string;
  title: string;
  artist?: string;
  key?: string | null;
  tempo?: number | null;
  lyrics?: string | null;
  notes?: string | null;
}

interface SourceOption {
  id: string;
  name: string;
  songCount: number;
  showName?: string;
  date?: string;
}

// Demo songs as fallback
const DEMO_SONGS: Song[] = [
  {
    id: 'demo-1',
    title: 'Demo Song',
    artist: 'Your Band',
    key: 'G Major',
    tempo: 120,
    lyrics: `[Verse 1]
This is the first verse
Of your amazing song
The words flow together
As we sing along

[Chorus]
This is the chorus
Where we all join in
Lift your voices high
Let the music begin

[Verse 2]
The second verse continues
With more to say
Building up the story
In every way

[Chorus]
This is the chorus
Where we all join in
Lift your voices high
Let the music begin

[Bridge]
And here comes the bridge
A moment to breathe
Before we hit the final chorus
And bring it to the peak

[Final Chorus]
This is the chorus
Where we all join in
Lift your voices high
Let the music begin
One more time now
Let the music begin`,
    notes: 'Watch for tempo change in bridge. Add your songs to see them here!',
  },
];

export function PerformerMode() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'library' | 'setlist' | 'project'>('library');
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [setlists, setSetlists] = useState<SourceOption[]>([]);
  const [projects, setProjects] = useState<SourceOption[]>([]);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(30); // pixels per second
  const [fontSize, setFontSize] = useState(32);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  const lyricsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentSong = songs[currentSongIndex] || DEMO_SONGS[0];

  // Fetch songs from API - Mycelial Integration
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ source });
      if (source === 'setlist' && sourceId) params.set('setlistId', sourceId);
      if (source === 'project' && sourceId) params.set('projectId', sourceId);

      const res = await fetch(`/api/tools/performer?${params}`);
      if (!res.ok) throw new Error('Failed to fetch songs');

      const data = await res.json();

      // Update available sources
      if (data.sources) {
        setSetlists(data.sources.setlists || []);
        setProjects(data.sources.projects || []);
      }

      // Update songs (use demo if none found)
      if (data.songs && data.songs.length > 0) {
        setSongs(data.songs);
        setCurrentSongIndex(0);
        setScrollPosition(0);
      } else {
        setSongs(DEMO_SONGS);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      setSongs(DEMO_SONGS);
    } finally {
      setLoading(false);
    }
  }, [source, sourceId]);

  // Load songs on mount and when source changes
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isPlaying && lyricsRef.current) {
      scrollIntervalRef.current = setInterval(() => {
        setScrollPosition((prev) => {
          const maxScroll =
            (lyricsRef.current?.scrollHeight || 0) - (lyricsRef.current?.clientHeight || 0);
          const newPos = prev + autoScrollSpeed / 60;

          if (newPos >= maxScroll) {
            setIsPlaying(false);
            return maxScroll;
          }
          return newPos;
        });
      }, 1000 / 60); // 60fps
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isPlaying, autoScrollSpeed]);

  // Apply scroll position
  useEffect(() => {
    if (lyricsRef.current) {
      lyricsRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSong();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousSong();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setScrollPosition((prev) => Math.max(0, prev - 100));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setScrollPosition((prev) => prev + 100);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setFontSize((prev) => Math.min(72, prev + 4));
          break;
        case '-':
          e.preventDefault();
          setFontSize((prev) => Math.max(16, prev - 4));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Next/Previous song
  const nextSong = useCallback(() => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setScrollPosition(0);
    setIsPlaying(false);
  }, [songs.length]);

  const previousSong = useCallback(() => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setScrollPosition(0);
    setIsPlaying(false);
  }, [songs.length]);

  // Start with countdown
  const startWithCountdown = useCallback(() => {
    setCountdownSeconds(4);
    const countdown = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdown);
          setIsPlaying(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Format lyrics with section highlighting
  const formatLyrics = (lyrics: string) => {
    return lyrics.split('\n').map((line, i) => {
      const isSection = line.startsWith('[') && line.endsWith(']');
      const isEmpty = line.trim() === '';

      return (
        <div
          key={i}
          className={`${isEmpty ? 'h-4' : ''} ${
            isSection ? 'mt-8 font-bold uppercase tracking-wider text-brand-primary' : ''
          }`}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl transition-colors ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
      } ${isFullscreen ? 'h-screen' : 'min-h-[600px]'}`}
    >
      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdownSeconds !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90"
          >
            <motion.div
              key={countdownSeconds}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-9xl font-black text-brand-primary"
            >
              {countdownSeconds}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`border-b p-4 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{currentSong?.title || 'No Song Selected'}</h2>
            <div className="flex items-center gap-4 text-sm opacity-70">
              <span>{currentSong?.artist}</span>
              <span className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                {currentSong?.key}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {currentSong?.tempo} BPM
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-50">
              {currentSongIndex + 1} / {songs.length}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-4 md:grid-cols-4">
                {/* Font Size */}
                <div>
                  <label className="mb-2 block text-xs opacity-70">Font Size</label>
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <input
                      type="range"
                      min="16"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-8 text-right text-sm">{fontSize}</span>
                  </div>
                </div>

                {/* Scroll Speed */}
                <div>
                  <label className="mb-2 block text-xs opacity-70">Scroll Speed</label>
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={autoScrollSpeed}
                      onChange={(e) => setAutoScrollSpeed(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-8 text-right text-sm">{autoScrollSpeed}</span>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div>
                  <label className="mb-2 block text-xs opacity-70">Theme</label>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2"
                  >
                    {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {isDarkMode ? 'Dark' : 'Light'}
                  </button>
                </div>

                {/* Show Notes */}
                <div>
                  <label className="mb-2 block text-xs opacity-70">Stage Notes</label>
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                      showNotes ? 'bg-brand-primary text-white' : 'bg-white/10'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    {showNotes ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage Notes */}
      {showNotes && currentSong?.notes && (
        <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
          <p className="text-sm text-yellow-400">
            <strong>Note:</strong> {currentSong.notes}
          </p>
        </div>
      )}

      {/* Lyrics Display */}
      <div
        ref={lyricsRef}
        className="overflow-y-auto px-8 py-6"
        style={{
          height: isFullscreen ? 'calc(100vh - 200px)' : '400px',
          fontSize: `${fontSize}px`,
          lineHeight: 1.6,
        }}
      >
        {currentSong?.lyrics ? (
          <div className="text-center">{formatLyrics(currentSong.lyrics)}</div>
        ) : (
          <div className="flex h-full items-center justify-center opacity-50">No lyrics loaded</div>
        )}
      </div>

      {/* Controls */}
      <div className={`border-t p-4 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="lg" onClick={previousSong} disabled={songs.length <= 1}>
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button variant="ghost" size="lg" onClick={() => setScrollPosition(0)}>
            <ChevronUp className="h-6 w-6" />
          </Button>

          <Button
            onClick={() => {
              if (!isPlaying && scrollPosition === 0) {
                startWithCountdown();
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            className={`h-16 w-16 rounded-full ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-brand-primary hover:bg-brand-primary/80'
            }`}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              if (lyricsRef.current) {
                setScrollPosition(lyricsRef.current.scrollHeight);
              }
            }}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>

          <Button variant="ghost" size="lg" onClick={nextSong} disabled={songs.length <= 1}>
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs opacity-50">
          <span>
            <kbd className="rounded bg-white/10 px-1">Space</kbd> Play/Pause
          </span>
          <span>
            <kbd className="rounded bg-white/10 px-1">←</kbd>
            <kbd className="rounded bg-white/10 px-1">→</kbd> Prev/Next
          </span>
          <span>
            <kbd className="rounded bg-white/10 px-1">↑</kbd>
            <kbd className="rounded bg-white/10 px-1">↓</kbd> Scroll
          </span>
          <span>
            <kbd className="rounded bg-white/10 px-1">F</kbd> Fullscreen
          </span>
          <span>
            <kbd className="rounded bg-white/10 px-1">+</kbd>
            <kbd className="rounded bg-white/10 px-1">-</kbd> Font Size
          </span>
        </div>
      </div>
    </div>
  );
}
