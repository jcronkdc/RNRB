'use client';

/**
 * AUTOSCROLL LYRICS VIEWER
 *
 * Features:
 * - Variable speed auto-scroll
 * - BPM-synced scrolling option
 * - Touch/click to pause
 * - Speed presets (slow, medium, fast)
 * - Custom speed slider
 * - Keyboard controls
 * - Fullscreen mode
 * - Section markers
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Settings,
  Music,
  Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoscrollLyricsProps {
  lyrics: string;
  chords?: string | null;
  songTitle: string;
  songKey?: string | null;
  tempo?: number | null;
  className?: string;
  onClose?: () => void;
}

type SpeedPreset = 'slow' | 'medium' | 'fast' | 'custom';

const SPEED_PRESETS = {
  slow: 20, // pixels per second
  medium: 40,
  fast: 60,
};

export function AutoscrollLyrics({
  lyrics,
  chords,
  songTitle,
  songKey,
  tempo,
  className,
  onClose,
}: AutoscrollLyricsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedPreset, setSpeedPreset] = useState<SpeedPreset>('medium');
  const [customSpeed, setCustomSpeed] = useState(40);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [syncToBpm, setSyncToBpm] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Calculate effective speed
  const effectiveSpeed = useCallback(() => {
    if (syncToBpm && tempo) {
      // Sync scroll to BPM - roughly one line per beat at 4/4
      // Assuming ~40 chars per line, ~16px per line
      return (tempo / 60) * 16; // pixels per second based on BPM
    }
    return speedPreset === 'custom' ? customSpeed : SPEED_PRESETS[speedPreset];
  }, [speedPreset, customSpeed, syncToBpm, tempo]);

  // Scroll animation
  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (containerRef.current) {
        const pixelsToScroll = (effectiveSpeed() * delta) / 1000;
        containerRef.current.scrollTop += pixelsToScroll;

        // Check if we've reached the bottom
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setIsPlaying(false);
          return;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, effectiveSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (containerRef.current) {
            containerRef.current.scrollTop -= 100;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (containerRef.current) {
            containerRef.current.scrollTop += 100;
          }
          break;
        case 'Home':
          e.preventDefault();
          scrollToTop();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          setFontSize((s) => Math.min(s + 2, 48));
          break;
        case '-':
          e.preventDefault();
          setFontSize((s) => Math.max(s - 2, 14));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      lastTimeRef.current = 0;
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const startWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(interval);
          setIsPlaying(true);
          return null;
        }
        return c - 1;
      });
    }, 1000);
  };

  // Parse lyrics into sections
  const parsedLyrics = parseLyrics(lyrics);

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-lg bg-gray-950 text-white',
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[600px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <Music className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-semibold">{songTitle}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {songKey && <span>Key: {songKey}</span>}
              {tempo && <span>• {tempo} BPM</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed indicator */}
          <div className="flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-sm">
            <Gauge className="h-4 w-4" />
            <span>{Math.round(effectiveSpeed())} px/s</span>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              'rounded-lg p-2 transition-colors',
              showSettings ? 'bg-amber-600' : 'hover:bg-gray-800'
            )}
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-2 transition-colors hover:bg-gray-800"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="space-y-3 border-b border-gray-800 bg-gray-900/80 px-4 py-3">
          {/* Speed presets */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-sm text-gray-400">Speed:</span>
            <div className="flex gap-1">
              {(['slow', 'medium', 'fast'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSpeedPreset(preset)}
                  className={cn(
                    'rounded px-3 py-1 text-sm capitalize transition-colors',
                    speedPreset === preset
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700'
                  )}
                >
                  {preset}
                </button>
              ))}
              <button
                onClick={() => setSpeedPreset('custom')}
                className={cn(
                  'rounded px-3 py-1 text-sm transition-colors',
                  speedPreset === 'custom'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                )}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Custom speed slider */}
          {speedPreset === 'custom' && (
            <div className="flex items-center gap-2">
              <span className="w-20 text-sm text-gray-400">Custom:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={customSpeed}
                onChange={(e) => setCustomSpeed(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <span className="w-16 text-sm">{customSpeed} px/s</span>
            </div>
          )}

          {/* BPM sync */}
          {tempo && (
            <div className="flex items-center gap-2">
              <span className="w-20 text-sm text-gray-400">BPM Sync:</span>
              <button
                onClick={() => setSyncToBpm(!syncToBpm)}
                className={cn(
                  'rounded px-3 py-1 text-sm transition-colors',
                  syncToBpm ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
                )}
              >
                {syncToBpm ? `Synced to ${tempo} BPM` : 'Off'}
              </button>
            </div>
          )}

          {/* Font size */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-sm text-gray-400">Font Size:</span>
            <button
              onClick={() => setFontSize((s) => Math.max(s - 2, 14))}
              className="rounded bg-gray-800 p-1 hover:bg-gray-700"
            >
              A-
            </button>
            <span className="w-12 text-center text-sm">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(s + 2, 48))}
              className="rounded bg-gray-800 p-1 hover:bg-gray-700"
            >
              A+
            </button>
          </div>

          {/* Keyboard shortcuts */}
          <div className="border-t border-gray-800 pt-2 text-xs text-gray-500">
            <span className="font-medium">Shortcuts:</span> Space = Play/Pause • ↑↓ = Scroll • Home
            = Top • F = Fullscreen • +/- = Font Size
          </div>
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="animate-pulse text-8xl font-bold text-amber-500">{countdown}</div>
        </div>
      )}

      {/* Lyrics content */}
      <div
        ref={containerRef}
        onClick={() => setIsPlaying(false)}
        className="flex-1 overflow-y-auto scroll-smooth px-6 py-8"
        style={{ scrollBehavior: isPlaying ? 'auto' : 'smooth' }}
      >
        <div
          ref={contentRef}
          className="mx-auto max-w-2xl whitespace-pre-wrap font-mono leading-relaxed"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {parsedLyrics.map((section, idx) => (
            <div key={idx} className="mb-8">
              {section.type !== 'verse' && (
                <div className="mb-2 font-sans text-sm uppercase tracking-wider text-amber-500">
                  [{section.type}]
                </div>
              )}
              <div className={cn(section.type === 'chorus' && 'font-bold')}>{section.content}</div>
            </div>
          ))}

          {/* Extra padding at bottom for scroll */}
          <div className="h-96" />
        </div>
      </div>

      {/* Scroll progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-amber-500 transition-all duration-100"
          style={{
            width: containerRef.current
              ? `${(containerRef.current.scrollTop / (containerRef.current.scrollHeight - containerRef.current.clientHeight)) * 100}%`
              : '0%',
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 border-t border-gray-800 bg-gray-900 px-4 py-4">
        <button
          onClick={scrollToTop}
          className="rounded-full p-3 transition-colors hover:bg-gray-800"
          title="Back to top"
        >
          <SkipBack className="h-5 w-5" />
        </button>

        <button
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollTop -= 200;
            }
          }}
          className="rounded-full p-3 transition-colors hover:bg-gray-800"
          title="Scroll up"
        >
          <ChevronUp className="h-5 w-5" />
        </button>

        <button
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false);
            } else {
              startWithCountdown();
            }
          }}
          className={cn(
            'rounded-full p-4 transition-colors',
            isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
          )}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
        </button>

        <button
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollTop += 200;
            }
          }}
          className="rounded-full p-3 transition-colors hover:bg-gray-800"
          title="Scroll down"
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        {/* Speed quick adjust */}
        <div className="ml-4 flex items-center gap-1">
          <button
            onClick={() => {
              if (speedPreset === 'custom') {
                setCustomSpeed((s) => Math.max(s - 5, 10));
              } else {
                const presets: SpeedPreset[] = ['slow', 'medium', 'fast'];
                const idx = presets.indexOf(speedPreset);
                if (idx > 0) setSpeedPreset(presets[idx - 1]);
              }
            }}
            className="rounded p-2 text-sm hover:bg-gray-800"
          >
            Slower
          </button>
          <button
            onClick={() => {
              if (speedPreset === 'custom') {
                setCustomSpeed((s) => Math.min(s + 5, 100));
              } else {
                const presets: SpeedPreset[] = ['slow', 'medium', 'fast'];
                const idx = presets.indexOf(speedPreset);
                if (idx < presets.length - 1) setSpeedPreset(presets[idx + 1]);
              }
            }}
            className="rounded p-2 text-sm hover:bg-gray-800"
          >
            Faster
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to parse lyrics into sections
function parseLyrics(lyrics: string): { type: string; content: string }[] {
  const sections: { type: string; content: string }[] = [];
  const lines = lyrics.split('\n');

  let currentSection: { type: string; content: string } = { type: 'verse', content: '' };

  for (const line of lines) {
    const sectionMatch = line.match(/^\[(.*?)\]/i);
    if (sectionMatch) {
      // Save previous section
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }
      // Start new section
      const type = sectionMatch[1].toLowerCase();
      currentSection = { type, content: '' };
    } else {
      currentSection.content += line + '\n';
    }
  }

  // Save last section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{ type: 'verse', content: lyrics }];
}

export default AutoscrollLyrics;
