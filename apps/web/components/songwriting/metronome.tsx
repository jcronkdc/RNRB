'use client';

import { Card } from '@cronkwaters/ui';
import { Play, Pause, Volume2, VolumeX, Activity, Timer } from '@/components/ui/custom-icons';
import { useState, useEffect, useRef } from 'react';

type MetronomeProps = {
  initialBpm?: number;
  initialTimeSignature?: string;
  onBpmChange?: (bpm: number) => void;
  onTimeSignatureChange?: (signature: string) => void;
};

const TIME_SIGNATURES = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'];

export function Metronome({
  initialBpm = 120,
  initialTimeSignature = '4/4',
  onBpmChange,
  onTimeSignatureChange,
}: MetronomeProps) {
  const [bpm, setBpm] = useState(initialBpm);
  const [timeSignature, setTimeSignature] = useState(initialTimeSignature);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [showTapDetected, setShowTapDetected] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const scheduleAheadTime = 0.1; // Schedule 100ms ahead
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to avoid stale closures in scheduler
  const bpmRef = useRef(bpm);
  const timeSignatureRef = useRef(timeSignature);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);
  const currentBeatRef = useRef(currentBeat);

  // Keep refs in sync with state
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    timeSignatureRef.current = timeSignature;
  }, [timeSignature]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  useEffect(() => {
    currentBeatRef.current = currentBeat;
  }, [currentBeat]);

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play click sound - uses refs to avoid stale closures
  const playClick = (time: number, isAccent: boolean) => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Accent first beat (higher pitch and volume)
    oscillator.frequency.value = isAccent ? 1200 : 800;
    gainNode.gain.setValueAtTime(volumeRef.current * (isAccent ? 1.5 : 1), time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    oscillator.start(time);
    oscillator.stop(time + 0.05);
  };

  // Scheduler - uses refs to avoid stale closures in setInterval callback
  const scheduler = () => {
    if (!audioContextRef.current) return;

    const beatsPerMeasure = parseInt(timeSignatureRef.current.split('/')[0]);
    const interval = 60.0 / bpmRef.current;

    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      const isAccent = currentBeatRef.current % beatsPerMeasure === 0;
      playClick(nextNoteTimeRef.current, isAccent);
      nextNoteTimeRef.current += interval;
      setCurrentBeat((prev) => (prev + 1) % beatsPerMeasure);
    }
  };

  // Start/Stop metronome - only depends on isPlaying
  // Other values are read from refs to avoid unnecessary restarts
  // Note: scheduler uses refs for all values, so it's intentionally excluded from deps
  useEffect(() => {
    if (isPlaying && audioContextRef.current) {
      // Resume audio context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      nextNoteTimeRef.current = audioContextRef.current.currentTime;
      intervalRef.current = setInterval(scheduler, 25); // Check every 25ms
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentBeat(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]); // Only restart when play state changes - scheduler uses refs

  const handleBpmChange = (newBpm: number) => {
    const clampedBpm = Math.max(40, Math.min(300, newBpm));
    setBpm(clampedBpm);
    if (onBpmChange) onBpmChange(clampedBpm);
  };

  const handleTimeSignatureChange = (newSignature: string) => {
    setTimeSignature(newSignature);
    setCurrentBeat(0);
    if (onTimeSignatureChange) onTimeSignatureChange(newSignature);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // BPM Tap Tool
  const handleTap = () => {
    const now = Date.now();
    const newTapTimes = [...tapTimes, now].slice(-8); // Keep last 8 taps
    setTapTimes(newTapTimes);

    // Clear tap timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Reset after 3 seconds of no taps
    tapTimeoutRef.current = setTimeout(() => {
      setTapTimes([]);
    }, 3000);

    // Calculate BPM if we have at least 2 taps
    if (newTapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < newTapTimes.length; i++) {
        intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);

      if (calculatedBpm >= 40 && calculatedBpm <= 300) {
        handleBpmChange(calculatedBpm);
        setShowTapDetected(true);
        setTimeout(() => setShowTapDetected(false), 1000);
      }
    }
  };

  const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);

  return (
    <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
            <Activity className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Metronome</h3>
            <p className="text-sm text-gray-400">Keep perfect time while writing</p>
          </div>
        </div>
      </div>

      {/* BPM Display and Controls */}
      <div className="mb-6 space-y-4">
        <div className="text-center">
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Tempo (BPM)</div>
          <div className="mb-4 flex items-center justify-center gap-4">
            <button
              onClick={() => handleBpmChange(bpm - 5)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white transition hover:bg-gray-700"
            >
              -5
            </button>
            <button
              onClick={() => handleBpmChange(bpm - 1)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white transition hover:bg-gray-700"
            >
              -1
            </button>
            <input
              type="number"
              min="40"
              max="300"
              value={bpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value) || 120)}
              className="w-24 rounded-lg border-2 border-purple-500/50 bg-purple-500/10 px-4 py-3 text-center font-mono text-4xl font-bold text-white"
            />
            <button
              onClick={() => handleBpmChange(bpm + 1)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white transition hover:bg-gray-700"
            >
              +1
            </button>
            <button
              onClick={() => handleBpmChange(bpm + 5)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white transition hover:bg-gray-700"
            >
              +5
            </button>
          </div>

          {/* BPM Slider */}
          <input
            type="range"
            min="40"
            max="300"
            value={bpm}
            onChange={(e) => handleBpmChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>40</span>
            <span>120</span>
            <span>300</span>
          </div>
        </div>

        {/* Time Signature */}
        <div className="text-center">
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Time Signature</div>
          <div className="flex flex-wrap justify-center gap-2">
            {TIME_SIGNATURES.map((sig) => (
              <button
                key={sig}
                onClick={() => handleTimeSignatureChange(sig)}
                className={`rounded-lg border-2 px-4 py-2 font-mono font-bold transition ${
                  timeSignature === sig
                    ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {sig}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Beat Indicator */}
      <div className="mb-6 flex justify-center gap-2">
        {Array.from({ length: beatsPerMeasure }).map((_, index) => (
          <div
            key={index}
            className={`h-16 w-16 rounded-full border-4 transition-all duration-75 ${
              isPlaying && currentBeat === index
                ? index === 0
                  ? 'border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/50'
                  : 'border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/50'
                : 'border-gray-700 bg-gray-800'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={togglePlay}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 px-6 py-4 font-semibold transition ${
            isPlaying
              ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
              : 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5" />
              Stop Metronome
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start Metronome
            </>
          )}
        </button>

        <button
          onClick={toggleMute}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 px-6 py-4 font-semibold transition ${
            isMuted
              ? 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
              : 'border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
          }`}
        >
          {isMuted ? (
            <>
              <VolumeX className="h-5 w-5" />
              Unmute
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              Mute
            </>
          )}
        </button>
      </div>

      {/* Volume Control */}
      {!isMuted && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Volume</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* BPM Tap Tool */}
      <div className="mt-6 rounded-lg border-2 border-blue-500/30 bg-blue-500/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-400" />
            <h4 className="font-semibold text-white">Tap Tempo</h4>
          </div>
          {showTapDetected && (
            <span className="animate-pulse text-xs font-bold text-green-400">BPM Detected!</span>
          )}
        </div>
        <p className="mb-3 text-xs text-gray-400">
          Tap the button below in rhythm to detect BPM (requires 2+ taps)
        </p>
        <button
          onClick={handleTap}
          className="w-full rounded-lg border-2 border-blue-500 bg-blue-500/20 py-8 font-bold text-blue-400 transition hover:bg-blue-500/30 active:scale-95"
        >
          TAP HERE
          {tapTimes.length > 0 && (
            <span className="ml-2 text-xs">
              ({tapTimes.length} tap{tapTimes.length === 1 ? '' : 's'})
            </span>
          )}
        </button>
      </div>

      {/* Tempo Presets */}
      <div className="mt-6">
        <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Common Tempos</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Largo', bpm: 60 },
            { label: 'Andante', bpm: 88 },
            { label: 'Moderato', bpm: 108 },
            { label: 'Allegro', bpm: 140 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleBpmChange(preset.bpm)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                Math.abs(bpm - preset.bpm) < 5
                  ? 'border-purple-500/50 bg-purple-500/20 text-purple-400'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-xs">{preset.bpm} BPM</div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
