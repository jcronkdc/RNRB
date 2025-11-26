'use client';

import { Card } from '@cronkwaters/ui';
import { Play, Pause, Loader2, Music, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

type LyricTimestamp = {
  blockId: string;
  lineIndex: number;
  wordIndex?: number;
  timestamp: number; // seconds
  text: string;
};

type WaveformPlayerProps = {
  audioUrl: string;
  lyrics?: LyricTimestamp[];
  onTimestampAdd?: (timestamp: number) => void;
  onHighlight?: (blockId: string, lineIndex: number, wordIndex?: number) => void;
};

export function WaveformPlayer({
  audioUrl,
  lyrics = [],
  onTimestampAdd,
  onHighlight,
}: WaveformPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentLyric, setCurrentLyric] = useState<LyricTimestamp | null>(null);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    setIsLoading(true);

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4b5563',
      progressColor: '#f97316',
      cursorColor: '#f97316',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 120,
      barGap: 2,
      normalize: true,
      fillParent: true,
      hideScrollbar: true,
    });

    wavesurfer.load(audioUrl);

    wavesurfer.on('ready', () => {
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('seeking', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  // Update volume
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume);
    }
  }, [volume]);

  // Sync lyrics with playback
  useEffect(() => {
    if (lyrics.length === 0) return;

    // Find the current lyric based on timestamp
    const sortedLyrics = [...lyrics].sort((a, b) => a.timestamp - b.timestamp);
    let current: LyricTimestamp | null = null;

    for (let i = 0; i < sortedLyrics.length; i++) {
      if (sortedLyrics[i].timestamp <= currentTime) {
        current = sortedLyrics[i];
      } else {
        break;
      }
    }

    if (current && current !== currentLyric) {
      setCurrentLyric(current);
      if (onHighlight) {
        onHighlight(current.blockId, current.lineIndex, current.wordIndex);
      }
    }
  }, [currentTime, lyrics]);

  const togglePlay = () => {
    if (!wavesurferRef.current) return;

    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds: number) => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.seekTo(seconds / duration);
  };

  const skipBackward = () => {
    handleSeek(Math.max(0, currentTime - 5));
  };

  const skipForward = () => {
    handleSeek(Math.min(duration, currentTime + 5));
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addTimestamp = () => {
    if (onTimestampAdd) {
      onTimestampAdd(currentTime);
    }
  };

  return (
    <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
            <Music className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Audio Track</h3>
            <p className="text-sm text-gray-400">Synced with lyrics & chords</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Waveform */}
      <div className="relative mb-6">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        )}
        <div
          ref={waveformRef}
          className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur"
        />
      </div>

      {/* Current Lyric Display */}
      {currentLyric && (
        <div className="mb-6 rounded-lg border-2 border-orange-500/30 bg-orange-500/10 p-4 text-center">
          <p className="text-lg font-medium text-white">{currentLyric.text}</p>
          <p className="mt-1 text-xs text-gray-400">
            {formatTime(currentLyric.timestamp)}
          </p>
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={skipBackward}
            className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white transition hover:bg-gray-700"
            title="Back 5s"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            onClick={togglePlay}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-8 py-3 font-semibold transition ${
              isPlaying
                ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                : 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
            }`}
            disabled={isLoading}
          >
            {isPlaying ? (
              <>
                <Pause className="h-6 w-6" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-6 w-6" />
                Play
              </>
            )}
          </button>

          <button
            onClick={skipForward}
            className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white transition hover:bg-gray-700"
            title="Forward 5s"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="min-w-[3rem] text-right font-mono text-sm text-gray-400">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Add Timestamp Button (for future lyric sync) */}
        {onTimestampAdd && (
          <button
            onClick={addTimestamp}
            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20"
          >
            Mark Lyric at {formatTime(currentTime)}
          </button>
        )}
      </div>
    </Card>
  );
}




