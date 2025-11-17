'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  useRecording,
  useDaily,
  useParticipantCounts,
} from '@daily-co/daily-react';
import { 
  Disc, 
  Square, 
  Pause, 
  Play,
  Download,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';

interface RecordingControlsProps {
  onRecordingComplete?: (recordingId: string) => void;
}

export function RecordingControls({ onRecordingComplete }: RecordingControlsProps) {
  const daily = useDaily();
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    updateRecording,
    error 
  } = useRecording();
  
  const participantCounts = useParticipantCounts();
  const [recordingConfig, setRecordingConfig] = useState({
    showParticipantLabels: true,
    videoBitrate: 1500,
    audioBitrate: 128,
    backgroundColor: '#000000',
    layout: 'default' as 'default' | 'single-participant' | 'active-speaker' | 'portrait'
  });
  
  const [isPaused, setIsPaused] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Calculate recording duration
  useEffect(() => {
    if (!isRecording || !recordingStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - recordingStartTime.getTime()) / 1000);
      setRecordingDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, recordingStartTime]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording with configuration
  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording({
        layout: {
          preset: recordingConfig.layout,
          composition_params: {
            showParticipantLabels: recordingConfig.showParticipantLabels,
          }
        },
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
  }, [startRecording, recordingConfig]);

  // Stop recording
  const handleStopRecording = useCallback(async () => {
    try {
      const result = await stopRecording();
      setRecordingStartTime(null);
      setRecordingDuration(0);
      setIsPaused(false);
      
      // Handle recording completion
      if (result && onRecordingComplete) {
        onRecordingComplete(result);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, [stopRecording, onRecordingComplete]);

  // Pause/Resume recording
  const handlePauseResume = useCallback(async () => {
    try {
      await updateRecording({
        layout: {
          preset: isPaused ? recordingConfig.layout : 'none'
        }
      });
      setIsPaused(!isPaused);
    } catch (err) {
      console.error('Failed to pause/resume recording:', err);
    }
  }, [updateRecording, isPaused, recordingConfig.layout]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Disc className="h-5 w-5" />
            Recording Controls
          </h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
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
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium">Layout</label>
                  <select
                    value={recordingConfig.layout}
                    onChange={(e) => setRecordingConfig({
                      ...recordingConfig,
                      layout: e.target.value as any
                    })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
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
                    onChange={(e) => setRecordingConfig({
                      ...recordingConfig,
                      videoBitrate: parseInt(e.target.value)
                    })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
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
                    onChange={(e) => setRecordingConfig({
                      ...recordingConfig,
                      showParticipantLabels: e.target.checked
                    })}
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
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Recording in Progress
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {formatDuration(recordingDuration)} • {participantCounts.present} participant{participantCounts.present !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {isPaused && (
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  Paused
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  Recording Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
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
              <Button
                variant="secondary"
                onClick={handlePauseResume}
                className="gap-2"
              >
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
              
              <Button
                variant="destructive"
                onClick={handleStopRecording}
                className="flex-1 gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        {!isRecording && participantCounts.present === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Join the session to start recording
          </p>
        )}
      </div>
    </Card>
  );
}
