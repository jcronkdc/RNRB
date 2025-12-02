'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Repeat,
  Volume2,
  VolumeX,
  Gauge,
  Scissors,
  ZoomIn,
  ZoomOut,
  SkipBack,
  SkipForward,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';

interface LoopRegion {
  start: number;
  end: number;
}

export function LoopPlayer() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [loopRegion, setLoopRegion] = useState<LoopRegion | null>(null);
  const [preservePitch, setPreservePitch] = useState(true);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<'start' | 'end' | 'region' | null>(null);
  const dragStartRef = useRef<{ x: number; startTime: number; endTime: number }>({
    x: 0,
    startTime: 0,
    endTime: 0,
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setLoopRegion(null);
      setCurrentTime(0);

      // Generate waveform data
      generateWaveform(file);
    }
  };

  // Generate simple waveform visualization
  const generateWaveform = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const samples = 200;
      const blockSize = Math.floor(channelData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        filteredData.push(sum / blockSize);
      }

      // Normalize
      const max = Math.max(...filteredData);
      setWaveformData(filteredData.map((d) => d / max));

      audioContext.close();
    } catch (err) {
      console.error('Error generating waveform:', err);
      // Fallback: generate random waveform for demo
      setWaveformData(Array.from({ length: 200 }, () => Math.random()));
    }
  };

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Handle loop region
      if (isLooping && loopRegion) {
        if (audio.currentTime >= loopRegion.end) {
          audio.currentTime = loopRegion.start;
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (isLooping && loopRegion) {
        audio.currentTime = loopRegion.start;
        audio.play();
      } else if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLooping, loopRegion]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      // Note: preservePitch is not supported in all browsers
      (audioRef.current as any).preservesPitch = preservePitch;
    }
  }, [playbackRate, preservePitch]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play/Pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (loopRegion && currentTime < loopRegion.start) {
        audioRef.current.currentTime = loopRegion.start;
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, loopRegion, currentTime]);

  // Seek to position
  const seekTo = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, Math.min(duration, time));
      }
    },
    [duration]
  );

  // Handle waveform click to seek or set loop
  const handleWaveformClick = useCallback(
    (e: React.MouseEvent) => {
      if (!waveformRef.current || !duration) return;

      const rect = waveformRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const progress = x / rect.width;
      const time = progress * duration;

      if (e.shiftKey) {
        // Set loop start
        setLoopRegion((prev) => ({
          start: time,
          end: prev?.end ?? duration,
        }));
      } else if (e.altKey) {
        // Set loop end
        setLoopRegion((prev) => ({
          start: prev?.start ?? 0,
          end: time,
        }));
      } else {
        // Just seek
        seekTo(time);
      }
    },
    [duration, seekTo]
  );

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Speed presets
  const speedPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-green-600">
            <Repeat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Loop/Slow-Down Player</h3>
            <p className="text-sm text-muted-foreground">Learn parts at any tempo</p>
          </div>
        </div>
      </div>

      {/* Audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* File Upload */}
      {!audioFile && (
        <div className="mb-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12 transition-colors hover:border-brand-primary">
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <span className="font-medium">Drop audio file or click to upload</span>
            <span className="mt-1 text-sm text-muted-foreground">MP3, WAV, M4A supported</span>
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {audioFile && (
        <>
          {/* File info */}
          <div className="mb-4 flex items-center justify-between rounded-lg bg-white/5 px-4 py-2">
            <span className="font-medium">{audioFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAudioFile(null);
                setAudioUrl(null);
                setWaveformData([]);
                setLoopRegion(null);
                setIsPlaying(false);
              }}
            >
              Change File
            </Button>
          </div>

          {/* Waveform Visualization */}
          <div className="mb-6">
            <div
              ref={waveformRef}
              className="relative h-24 cursor-pointer rounded-lg bg-white/5"
              onClick={handleWaveformClick}
            >
              {/* Waveform bars */}
              <div className="flex h-full items-center gap-px px-1">
                {waveformData.map((amplitude, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full bg-brand-primary/50 transition-colors hover:bg-brand-primary"
                    style={{ height: `${amplitude * 100}%` }}
                  />
                ))}
              </div>

              {/* Loop region overlay */}
              {loopRegion && duration > 0 && (
                <div
                  className="absolute top-0 h-full bg-lime-500/20"
                  style={{
                    left: `${(loopRegion.start / duration) * 100}%`,
                    width: `${((loopRegion.end - loopRegion.start) / duration) * 100}%`,
                  }}
                >
                  <div className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-lime-500" />
                  <div className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-lime-500" />
                </div>
              )}

              {/* Playhead */}
              {duration > 0 && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-white shadow-lg"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              )}
            </div>

            {/* Time display */}
            <div className="mt-2 flex justify-between font-mono text-sm">
              <span>{formatTime(currentTime)}</span>
              <span className="text-muted-foreground">
                {loopRegion
                  ? `Loop: ${formatTime(loopRegion.start)} - ${formatTime(loopRegion.end)}`
                  : 'Shift+click: set loop start | Alt+click: set loop end'}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <Button variant="ghost" size="lg" onClick={() => seekTo(loopRegion?.start ?? 0)}>
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              onClick={togglePlay}
              className={`h-16 w-16 rounded-full ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700'
              }`}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>

            <Button variant="ghost" size="lg" onClick={() => seekTo(loopRegion?.end ?? duration)}>
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="mb-6 rounded-xl bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                <span className="font-medium">Playback Speed</span>
              </div>
              <span className="font-mono text-xl font-bold">{playbackRate}x</span>
            </div>

            <input
              type="range"
              min="0.25"
              max="2"
              step="0.05"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="mb-3 w-full"
            />

            <div className="flex flex-wrap justify-center gap-2">
              {speedPresets.map((speed) => (
                <Button
                  key={speed}
                  variant={playbackRate === speed ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlaybackRate(speed)}
                  className="rounded-full px-4"
                >
                  {speed}x
                </Button>
              ))}
            </div>

            {/* Preserve Pitch Toggle */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm">Preserve Pitch (keeps key when slowing down)</span>
              <button
                onClick={() => setPreservePitch(!preservePitch)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  preservePitch ? 'bg-brand-primary' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    preservePitch ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Loop Controls */}
          <div className="mb-6 rounded-xl bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                <span className="font-medium">Loop Settings</span>
              </div>
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isLooping ? 'bg-lime-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    isLooping ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {loopRegion && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Loop Start</label>
                  <input
                    type="number"
                    value={loopRegion.start.toFixed(2)}
                    onChange={(e) =>
                      setLoopRegion((prev) => ({
                        ...prev!,
                        start: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    step="0.1"
                    className="w-full rounded-lg bg-white/10 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Loop End</label>
                  <input
                    type="number"
                    value={loopRegion.end.toFixed(2)}
                    onChange={(e) =>
                      setLoopRegion((prev) => ({
                        ...prev!,
                        end: Math.min(duration, Number(e.target.value)),
                      }))
                    }
                    step="0.1"
                    className="w-full rounded-lg bg-white/10 px-3 py-2 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLoopRegion({ start: 0, end: duration })}
                className="flex-1"
              >
                Loop All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLoopRegion(null)}
                className="flex-1"
              >
                Clear Loop
              </Button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
            <button onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right font-mono text-sm">{Math.round(volume * 100)}%</span>
          </div>
        </>
      )}

      {/* Tips */}
      <div className="mt-6 rounded-xl bg-white/5 p-4">
        <h4 className="mb-2 text-sm font-semibold">Practice Tips</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Start at 50% speed, gradually increase as you master the part</li>
          <li>• Use loop to isolate difficult sections</li>
          <li>• Keep "Preserve Pitch" on to maintain the original key</li>
          <li>• Shift+click on waveform to set loop start, Alt+click for end</li>
        </ul>
      </div>
    </div>
  );
}
