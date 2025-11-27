'use client';

/**
 * Voice Message Recorder Component
 *
 * WhatsApp-style voice message recorder for chat
 * Records, visualizes, and uploads voice messages
 *
 * Features:
 * - Press and hold to record (mobile-friendly)
 * - Real-time waveform visualization
 * - Duration counter
 * - Cancel by sliding left
 * - Auto-upload on release
 * - Playback preview before sending
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, X, Send, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { useVoiceRecorder } from '@/hooks/use-voice-recorder';

interface VoiceMessageRecorderProps {
  onSend: (audioBlob: Blob, duration: number, waveformData: number[]) => Promise<void>;
  maxDuration?: number;
  className?: string;
}

export function VoiceMessageRecorder({
  onSend,
  maxDuration = 300,
  className = '',
}: VoiceMessageRecorderProps) {
  const [mode, setMode] = useState<'button' | 'recording' | 'preview'>('button');
  const [previewAudio, setPreviewAudio] = useState<{ blob: Blob; url: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sending, setSending] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const recordedDataRef = useRef<{
    blob: Blob;
    duration: number;
    waveform: number[];
  } | null>(null);

  const {
    state,
    duration,
    waveformData,
    error,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({
    maxDuration,
    onRecordingComplete: (blob, dur, waveform) => {
      recordedDataRef.current = { blob, duration: dur, waveform };

      // Create preview URL
      const url = URL.createObjectURL(blob);
      setPreviewAudio({ blob, url });
      setMode('preview');
    },
  });

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewAudio) {
        URL.revokeObjectURL(previewAudio.url);
      }
    };
  }, [previewAudio]);

  // Handle audio playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [previewAudio]);

  const handleStartRecording = async () => {
    setMode('recording');
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleCancelRecording = () => {
    cancelRecording();
    setMode('button');
    recordedDataRef.current = null;
    setPreviewAudio(null);
  };

  const handlePlayPreview = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSendVoiceMessage = async () => {
    if (!recordedDataRef.current) return;

    setSending(true);
    try {
      await onSend(
        recordedDataRef.current.blob,
        recordedDataRef.current.duration,
        recordedDataRef.current.waveform
      );

      // Reset
      setMode('button');
      recordedDataRef.current = null;
      setPreviewAudio(null);
    } catch (error) {
      console.error('Failed to send voice message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-border bg-surface-muted p-3">
        <p className="text-sm text-muted-foreground">
          Voice messages are not supported in your browser
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {/* BUTTON MODE - Initial state */}
        {mode === 'button' && (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button onClick={handleStartRecording} variant="secondary" size="sm" className="gap-2">
              <Mic className="h-4 w-4" />
              <span>Voice Message</span>
            </Button>
          </motion.div>
        )}

        {/* RECORDING MODE - Active recording */}
        {mode === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
          >
            {/* Animated recording indicator */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex-shrink-0"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <Mic className="h-5 w-5 text-red-500" />
              </div>
            </motion.div>

            {/* Waveform visualization */}
            <div className="flex flex-1 items-center gap-1">
              {waveformData.slice(-50).map((amplitude, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 4 }}
                  animate={{ height: Math.max(4, amplitude * 40) }}
                  className="w-1 rounded-full bg-brand-primary"
                  style={{ opacity: 0.5 + amplitude * 0.5 }}
                />
              ))}
            </div>

            {/* Duration counter */}
            <div className="flex-shrink-0 font-mono text-sm font-medium text-foreground">
              {formatDuration(duration)}
            </div>

            {/* Control buttons */}
            <div className="flex gap-2">
              <Button onClick={handleCancelRecording} variant="secondary" size="sm">
                <X className="h-4 w-4" />
              </Button>
              <Button onClick={handleStopRecording} variant="default" size="sm">
                <Square className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PREVIEW MODE - Review before sending */}
        {mode === 'preview' && previewAudio && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-3 rounded-lg border border-border bg-surface p-4"
          >
            {/* Audio player (hidden, controlled by our UI) */}
            <audio ref={audioRef} src={previewAudio.url} />

            {/* Waveform preview */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePlayPreview}
                variant="secondary"
                size="sm"
                className="flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
              </Button>

              {/* Static waveform visualization */}
              <div className="flex flex-1 items-center gap-1">
                {recordedDataRef.current?.waveform.map((amplitude, index) => (
                  <div
                    key={index}
                    className="w-1 rounded-full bg-brand-primary/40"
                    style={{
                      height: `${Math.max(4, amplitude * 40)}px`,
                      opacity: 0.5 + amplitude * 0.5,
                    }}
                  />
                ))}
              </div>

              {/* Duration */}
              <div className="flex-shrink-0 font-mono text-sm text-muted-foreground">
                {formatDuration(recordedDataRef.current?.duration || 0)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancelRecording} variant="secondary" size="sm">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
              <Button
                onClick={handleSendVoiceMessage}
                disabled={sending}
                variant="default"
                size="sm"
              >
                <Send className="h-4 w-4" />
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 rounded-lg border border-border border-red-500/20 bg-red-500/10 p-3"
        >
          <p className="text-sm text-red-500">{error}</p>
        </motion.div>
      )}
    </div>
  );
}






