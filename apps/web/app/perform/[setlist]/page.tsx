'use client';

/**
 * MOBILE PERFORMER MODE
 *
 * Full-screen mobile view optimized for performers on stage
 * - Large fonts, high contrast
 * - Swipe navigation between songs
 * - Tap song → view lyrics + chords
 * - No-distraction UI (hides toolbars)
 * - Works offline (PWA-ready)
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Music,
  Clock,
  Key as KeyIcon,
  Activity,
  Check,
  X,
  Home,
  Maximize2,
  Minimize2,
} from '@/components/ui/custom-icons';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

type SetlistSong = {
  id: string;
  position: number;
  song: {
    id: string;
    title: string;
    key?: string;
    tempo?: number;
    duration?: number;
    lyrics?: string;
    chords?: string;
  };
  notes?: string;
  isEncore: boolean;
};

type Setlist = {
  id: string;
  name: string;
  songs: SetlistSong[];
};

export default function PerformerModePage() {
  const params = useParams();
  const router = useRouter();
  const setlistId = params.setlist as string;

  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedSongs, setCompletedSongs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSetlist();
  }, [setlistId]);

  const loadSetlist = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/setlists/${setlistId}`);

      if (!response.ok) {
        throw new Error('Failed to load setlist');
      }

      const data = await response.json();
      setSetlist(data.setlist);
    } catch (err) {
      setError('Failed to load setlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentSong = setlist?.songs[currentIndex];
  const progress = setlist ? ((currentIndex + 1) / setlist.songs.length) * 100 : 0;

  const goNext = useCallback(() => {
    if (setlist && currentIndex < setlist.songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDetails(false);
    }
  }, [setlist, currentIndex]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowDetails(false);
    }
  }, [currentIndex]);

  const toggleCompleted = () => {
    if (!currentSong) return;
    const newCompleted = new Set(completedSongs);
    if (newCompleted.has(currentSong.song.id)) {
      newCompleted.delete(currentSong.song.id);
    } else {
      newCompleted.add(currentSong.song.id);
    }
    setCompletedSongs(newCompleted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrevious();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setShowDetails(!showDetails);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goNext, goPrevious, showDetails]);

  // Touch gestures
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left
      goNext();
    }

    if (touchStart - touchEnd < -75) {
      // Swiped right
      goPrevious();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <Music className="mx-auto mb-4 h-16 w-16 animate-pulse" />
          <p className="text-2xl font-semibold">Loading setlist...</p>
        </div>
      </div>
    );
  }

  if (error || !setlist || !currentSong) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <X className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <p className="mb-4 text-2xl font-semibold">{error || 'Setlist not found'}</p>
          <Button onClick={() => router.push('/shows')} className="mt-4">
            <Home className="mr-2 h-5 w-5" />
            Back to Shows
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-black text-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/shows')}
            className="text-white hover:bg-white/10"
          >
            <Home className="h-5 w-5" />
          </Button>

          <div className="flex-1 text-center">
            <h1 className="truncate text-sm font-semibold sm:text-lg">{setlist.name}</h1>
            <p className="text-xs text-white/60 sm:text-sm">
              Song {currentIndex + 1} of {setlist.songs.length}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/10">
          <motion.div
            className="h-full bg-brand-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col pb-20 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8"
          >
            {/* Song Header */}
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-4xl font-bold sm:text-5xl lg:text-6xl">
                {currentSong.song.title}
              </h2>

              {/* Song Meta */}
              <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-4 text-sm text-white/70 sm:gap-6 sm:text-base">
                {currentSong.song.key && (
                  <div className="flex items-center gap-2">
                    <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Key of {currentSong.song.key}</span>
                  </div>
                )}
                {currentSong.song.tempo && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{currentSong.song.tempo} BPM</span>
                  </div>
                )}
                {currentSong.song.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>
                      {Math.floor(currentSong.song.duration / 60)}:
                      {(currentSong.song.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {currentSong.notes && (
                <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-200">
                  <p className="text-sm sm:text-base">{currentSong.notes}</p>
                </div>
              )}

              {/* Encore Badge */}
              {currentSong.isEncore && (
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-1 text-sm font-semibold text-purple-200">
                    ENCORE
                  </span>
                </div>
              )}
            </div>

            {/* Lyrics/Chords Toggle */}
            <div className="mb-4 flex justify-center gap-3">
              <Button
                onClick={() => setShowDetails(false)}
                variant={!showDetails ? 'default' : 'outline'}
                className="px-6 py-3 text-base"
              >
                Lyrics
              </Button>
              <Button
                onClick={() => setShowDetails(true)}
                variant={showDetails ? 'default' : 'outline'}
                className="px-6 py-3 text-base"
              >
                Chords
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-3xl">
                {!showDetails ? (
                  // Lyrics
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:p-10">
                    <pre className="whitespace-pre-wrap font-mono text-lg leading-relaxed sm:text-xl lg:text-2xl">
                      {currentSong.song.lyrics || 'No lyrics available'}
                    </pre>
                  </div>
                ) : (
                  // Chords
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:p-10">
                    <pre className="whitespace-pre-wrap font-mono text-lg font-semibold leading-relaxed text-[color:var(--accent)] sm:text-xl lg:text-2xl">
                      {currentSong.song.chords || 'No chords available'}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Mark Complete */}
            <div className="mt-6 text-center">
              <Button
                onClick={toggleCompleted}
                variant={completedSongs.has(currentSong.song.id) ? 'default' : 'outline'}
                className="px-8 py-4 text-lg"
              >
                {completedSongs.has(currentSong.song.id) ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Completed
                  </>
                ) : (
                  'Mark as Played'
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Button
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-4 text-base disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex gap-2">
            {setlist.songs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-2 rounded-full transition ${
                  idx === currentIndex
                    ? 'w-6 bg-brand-primary'
                    : completedSongs.has(setlist.songs[idx].song.id)
                      ? 'bg-green-500'
                      : 'bg-white/30'
                }`}
                aria-label={`Go to song ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={goNext}
            disabled={currentIndex === setlist.songs.length - 1}
            className="flex items-center gap-2 px-6 py-4 text-base disabled:opacity-30"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
