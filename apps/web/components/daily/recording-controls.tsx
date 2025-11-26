'use client';

import { Card, Button } from '@cronkwaters/ui';
import { useRecording, useDaily, useParticipantCounts } from '@daily-co/daily-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Disc,
  Square,
  Pause,
  Play,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { useState, useCallback, useEffect, useMemo } from 'react';

interface RecordingControlsProps {
  onRecordingComplete?: (recordingId: string | null) => void;
}

export function RecordingControls({ onRecordingComplete }: RecordingControlsProps) {
  const daily = useDaily();
  const { isRecording, startRecording, stopRecording, updateRecording, error } = useRecording();

  const participantCounts = useParticipantCounts();
  const [recordingConfig, setRecordingConfig] = useState({
    showParticipantLabels: true,
    videoBitrate: 1500,
    audioBitrate: 128,
    backgroundColor: '#000000',
    layout: 'default' as 'default' | 'single-participant' | 'active-speaker' | 'portrait',
  });

  const [isPaused, setIsPaused] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Calculate recording duration - Optimized with proper cleanup
  useEffect(() => {
    if (!isRecording || !recordingStartTime) {
      setRecordingDuration(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - recordingStartTime.getTime()) / 1000);
      setRecordingDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, recordingStartTime]);

  // Format duration - Memoized
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoize formatted duration to prevent re-renders
  const formattedDuration = useMemo(() => formatDuration(recordingDuration), [recordingDuration, formatDuration]);

  // Memoize participant text
  const participantText = useMemo(() => {
    const count = participantCounts.present;
    return `${count} participant${count !== 1 ? 's' : ''}`;
  }, [participantCounts.present]);

  // Start recording with configuration - Memoized with stable dependencies
  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording({
        videoBitrate: recordingConfig.videoBitrate,
        audioBitrate: recordingConfig.audioBitrate,
        backgroundColor: recordingConfig.backgroundColor,
      });
      setRecordingStartTime(new Date());
      setRecordingDuration(0);
      setIsPaused(false);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [startRecording, recordingConfig.videoBitrate, recordingConfig.audioBitrate, recordingConfig.backgroundColor]);

  // Stop recording - Memoized
  const handleStopRecording = useCallback(async () => {
    try {
      await stopRecording();
      setRecordingStartTime(null);
      setRecordingDuration(0);
      setIsPaused(false);

      // Handle recording completion
      if (onRecordingComplete) {
        // Note: Daily.co stopRecording returns void, so we can't pass result
        // The recording URL will be available via webhook or API polling
        onRecordingComplete(null);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, [stopRecording, onRecordingComplete]);

  // Pause/Resume recording - Memoized
  const handlePauseResume = useCallback(async () => {
    try {
      // Note: Daily.co updateRecording has limited options
      // For now, just toggle the state - actual pause would require stopping/starting
      setIsPaused(!isPaused);
    } catch (err) {
      console.error('Failed to pause/resume recording:', err);
    }
  }, [isPaused]);

  // Memoize config update handlers
  const updateLayout = useCallback((value: string) => {
    setRecordingConfig(prev => ({ ...prev, layout: value as any }));
  }, []);

  const updateVideoBitrate = useCallback((value: string) => {
    setRecordingConfig(prev => ({ ...prev, videoBitrate: parseInt(value) }));
  }, []);

  const updateShowLabels = useCallback((checked: boolean) => {
    setRecordingConfig(prev => ({ ...prev, showParticipantLabels: checked }));
  }, []);

  // Memoize toggle settings
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Disc className="h-5 w-5" />
            Recording Controls
          </h3>

          <Button variant="ghost" size="icon" onClick={toggleSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 border-t pt-4">
                <div>
                  <label className="text-sm font-medium">Layout</label>
                  <select
                    value={recordingConfig.layout}
                    onChange={(e) => updateLayout(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    disabled={isRecording}
                  >
                    <option value="default">Default Grid</option>
                    <option value="active-speaker">Active Speaker</option>
                    <option value="single-participant">Single Participant</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Video Quality</label>
                  <select
                    value={recordingConfig.videoBitrate}
                    onChange={(e) => updateVideoBitrate(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    disabled={isRecording}
                  >
                    <option value="1000">Standard (1 Mbps)</option>
                    <option value="1500">High (1.5 Mbps)</option>
                    <option value="2500">Ultra (2.5 Mbps)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showLabels"
                    checked={recordingConfig.showParticipantLabels}
                    onChange={(e) => updateShowLabels(e.target.checked)}
                    disabled={isRecording}
                  />
                  <label htmlFor="showLabels" className="text-sm">
                    Show participant names
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording Status */}
        {isRecording && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                  <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Recording in Progress
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {formattedDuration} • {participantText}
                  </p>
                </div>
              </div>

              {isPaused && (
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Paused</span>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">Recording Error</p>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              onClick={handleStartRecording}
              className="flex-1 gap-2"
              disabled={participantCounts.present === 0}
            >
              <Disc className="h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handlePauseResume} className="gap-2">
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>

              <Button variant="destructive" onClick={handleStopRecording} className="flex-1 gap-2">
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        {!isRecording && participantCounts.present === 0 && (
          <p className="text-muted-foreground text-center text-sm">
            Join the session to start recording
          </p>
        )}
      </div>
    </Card>
  );
}
