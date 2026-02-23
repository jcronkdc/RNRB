'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle,
  Lock,
  Clock,
  BookOpen,
  Download,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Settings,
  List,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  isFreePreview: boolean;
  isLive: boolean;
  scheduledAt?: string;
  resources: Array<{
    id: string;
    title: string;
    description?: string;
    fileType: string;
    fileUrl: string;
    fileSize?: number;
  }>;
}

interface Progress {
  lessonId: string;
  isCompleted: boolean;
  watchedSeconds: number;
}

interface Masterclass {
  id: string;
  slug: string;
  title: string;
  instructor: {
    displayName: string;
    profileImage?: string;
  };
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function VideoPlayer({
  videoUrl,
  onProgress,
  onComplete,
  initialTime = 0,
}: {
  videoUrl: string;
  onProgress: (seconds: number) => void;
  onComplete: () => void;
  initialTime?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress(video.currentTime);

      // Check for completion (90% watched)
      if (video.currentTime / video.duration >= 0.9) {
        onComplete();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [initialTime, onProgress, onComplete]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration));
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeVolume = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, volume]);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video overflow-hidden rounded-xl bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video ref={videoRef} src={videoUrl} className="h-full w-full" onClick={togglePlay} />

      {/* Play/Pause overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
            onClick={togglePlay}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]"
            >
              <Play className="ml-1 h-10 w-10 text-[var(--text)]" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"
          >
            {/* Progress bar */}
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]"
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="text-[var(--text)] hover:text-[var(--accent)]"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                <button
                  onClick={() => skip(-10)}
                  className="text-[var(--text)] hover:text-[var(--accent)]"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                <button
                  onClick={() => skip(10)}
                  className="text-[var(--text)] hover:text-[var(--accent)]"
                >
                  <SkipForward className="h-5 w-5" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-[var(--text)] hover:text-[var(--accent)]"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>

                {/* Time */}
                <span className="text-sm text-[var(--text)]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                {/* Playback speed */}
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="rounded border border-white/30 bg-transparent px-2 py-1 text-sm text-[var(--text)]"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                <button
                  onClick={toggleFullscreen}
                  className="text-[var(--text)] hover:text-[var(--accent)]"
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [masterclass, setMasterclass] = useState<Masterclass | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch masterclass details
        const classRes = await fetch(`/api/masterclasses/${slug}`);
        if (!classRes.ok) {
          router.push('/masterclasses');
          return;
        }
        const classData = await classRes.json();
        setMasterclass(classData.masterclass);

        // Check enrollment
        if (!classData.enrollment || classData.enrollment.status !== 'active') {
          router.push(`/masterclasses/${slug}`);
          return;
        }

        setHasAccess(true);
        setProgress(classData.enrollment.progress || []);

        // Fetch lessons with full access
        const lessonsRes = await fetch(`/api/masterclasses/${classData.masterclass.id}/lessons`);
        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          setLessons(lessonsData.lessons);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug, router]);

  const currentLesson = lessons[currentLessonIndex];
  const lessonProgress = progress.find((p) => p.lessonId === currentLesson?.id);

  const handleProgress = useCallback(
    async (seconds: number) => {
      if (!currentLesson || !masterclass) return;

      // Debounce progress updates (every 10 seconds)
      if (Math.floor(seconds) % 10 !== 0) return;

      try {
        await fetch(`/api/masterclasses/${masterclass.id}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: currentLesson.id,
            watchedSeconds: Math.floor(seconds),
          }),
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    },
    [currentLesson, masterclass]
  );

  const handleComplete = useCallback(async () => {
    if (!currentLesson || !masterclass) return;

    try {
      await fetch(`/api/masterclasses/${masterclass.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          isCompleted: true,
        }),
      });

      // Update local progress
      setProgress((prev) => {
        const existing = prev.find((p) => p.lessonId === currentLesson.id);
        if (existing) {
          return prev.map((p) =>
            p.lessonId === currentLesson.id ? { ...p, isCompleted: true } : p
          );
        }
        return [...prev, { lessonId: currentLesson.id, isCompleted: true, watchedSeconds: 0 }];
      });
    } catch (error) {
      console.error('Failed to mark complete:', error);
    }
  }, [currentLesson, masterclass]);

  const goToLesson = (index: number) => {
    if (index >= 0 && index < lessons.length) {
      setCurrentLessonIndex(index);
    }
  };

  const saveNotes = async () => {
    if (!currentLesson || !masterclass) return;

    try {
      await fetch(`/api/masterclasses/${masterclass.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          notes,
        }),
      });
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!hasAccess || !masterclass || lessons.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-16 w-16 text-[var(--muted)]" />
          <h2 className="mb-2 text-2xl font-bold text-[var(--text)]">Access Required</h2>
          <p className="mb-6 text-[var(--muted)]">
            You need to enroll in this masterclass to watch lessons.
          </p>
          <Link href={`/masterclasses/${slug}`}>
            <button className="rounded-full bg-[var(--accent)] px-6 py-3 text-[var(--text)]">
              View Masterclass
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = progress.filter((p) => p.isCompleted).length;
  const progressPercent = (completedCount / lessons.length) * 100;

  return (
    <div className="flex min-h-screen bg-black">
      {/* Main content */}
      <div className={`flex-1 transition-all ${showSidebar ? 'mr-80' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/masterclasses/${slug}`}
              className="text-[var(--muted)] hover:text-[var(--text)]"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="font-bold text-[var(--text)]">{masterclass.title}</h1>
              <p className="text-sm text-[var(--muted)]">{currentLesson?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`rounded-lg p-2 ${showNotes ? 'bg-[var(--accent)] text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="rounded-lg p-2 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video player */}
        <div className="p-4">
          {currentLesson?.videoUrl ? (
            <VideoPlayer
              videoUrl={currentLesson.videoUrl}
              onProgress={handleProgress}
              onComplete={handleComplete}
              initialTime={lessonProgress?.watchedSeconds || 0}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-[var(--panel)]">
              <p className="text-[var(--muted)]">No video available for this lesson</p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => goToLesson(currentLessonIndex - 1)}
              disabled={currentLessonIndex === 0}
              className="flex items-center gap-2 rounded-lg bg-[var(--panel)] px-4 py-2 text-[var(--text)] disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="text-[var(--muted)]">
              Lesson {currentLessonIndex + 1} of {lessons.length}
            </div>

            <button
              onClick={() => goToLesson(currentLessonIndex + 1)}
              disabled={currentLessonIndex === lessons.length - 1}
              className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-[var(--text)] disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Lesson info */}
          <div className="mt-6">
            <h2 className="mb-2 text-xl font-bold text-[var(--text)]">{currentLesson?.title}</h2>
            {currentLesson?.description && (
              <p className="text-[var(--muted)]">{currentLesson.description}</p>
            )}
          </div>

          {/* Resources */}
          {currentLesson?.resources && currentLesson.resources.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-bold text-[var(--text)]">Lesson Resources</h3>
              <div className="space-y-2">
                {currentLesson.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg bg-[var(--panel)] p-3 transition-colors hover:bg-[var(--border)]"
                  >
                    <Download className="h-5 w-5 text-[var(--accent)]" />
                    <div className="flex-1">
                      <div className="font-medium text-[var(--text)]">{resource.title}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {resource.fileType.toUpperCase()}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes section */}
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <h3 className="mb-3 font-bold text-[var(--text)]">My Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={saveNotes}
                  placeholder="Take notes on this lesson..."
                  className="h-40 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="fixed bottom-0 right-0 top-0 w-80 overflow-y-auto border-l border-[var(--border)] bg-[var(--panel)]"
          >
            <div className="border-b border-[var(--border)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-[var(--text)]">Course Content</h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-2">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Progress</span>
                  <span className="text-[var(--text)]">
                    {completedCount}/{lessons.length}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg)]">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Lesson list */}
            <div className="p-2">
              {lessons.map((lesson, index) => {
                const isComplete = progress.some((p) => p.lessonId === lesson.id && p.isCompleted);
                const isCurrent = index === currentLessonIndex;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => goToLesson(index)}
                    className={`mb-1 w-full rounded-lg p-3 text-left transition-colors ${
                      isCurrent
                        ? 'border-[var(--accent)]/50 bg-[var(--accent)]/20 border'
                        : 'hover:bg-[var(--bg)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          isComplete
                            ? 'bg-[var(--sage)]'
                            : isCurrent
                              ? 'bg-[var(--accent)]'
                              : 'bg-[var(--bg)]'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4 text-[var(--text)]" />
                        ) : (
                          <span className="text-sm text-[var(--text)]">{index + 1}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate font-medium ${isCurrent ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}
                        >
                          {lesson.title}
                        </div>
                        {lesson.duration && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
                            <Clock className="h-3 w-3" />
                            {formatTime(lesson.duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
