/**
 * Voice Recorder Hook
 *
 * Records voice messages for async communication in chat
 * WhatsApp-style voice notes with waveform visualization
 *
 * Features:
 * - Start/stop recording
 * - Real-time waveform data capture
 * - Audio blob generation
 * - Duration tracking
 * - Auto-stop after 5 minutes
 * - Browser compatibility checks
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceRecordingState = 'idle' | 'recording' | 'paused' | 'processing';

interface UseVoiceRecorderOptions {
  maxDuration?: number; // Maximum recording duration in seconds (default: 300 = 5 minutes)
  onRecordingComplete?: (audioBlob: Blob, duration: number, waveformData: number[]) => void;
}

export function useVoiceRecorder({
  maxDuration = 300,
  onRecordingComplete,
}: UseVoiceRecorderOptions = {}) {
  const [state, setState] = useState<VoiceRecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check browser compatibility
  useEffect(() => {
    const checkSupport = () => {
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasMediaRecorder = !!window.MediaRecorder;

      if (!hasMediaDevices || !hasMediaRecorder) {
        setIsSupported(false);
        setError('Voice recording is not supported in this browser');
      }
    };

    checkSupport();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Voice recording is not supported');
      return;
    }

    try {
      setError(null);
      setState('processing');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Set up audio context for waveform visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const recordedDuration = duration;
        const waveform = [...waveformData];

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, recordedDuration, waveform);
        }

        cleanup();
        setState('idle');
        setDuration(0);
        setWaveformData([]);
      };

      mediaRecorder.start(100); // Collect data every 100ms

      // Start tracking duration
      startTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

      // Start capturing waveform data
      waveformIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average amplitude for this frame
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          const normalized = Math.min(average / 128, 1); // Normalize to 0-1

          setWaveformData((prev) => [...prev, normalized]);
        }
      }, 100);

      setState('recording');
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to access microphone. Please check permissions.'
      );
      cleanup();
      setState('idle');
    }
  }, [isSupported, maxDuration, onRecordingComplete, duration, waveformData, cleanup]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setState('processing');

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    cleanup();
    setState('idle');
    setDuration(0);
    setWaveformData([]);
  }, [cleanup]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');

      // Clear any existing intervals before creating new ones
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }

      // Resume duration tracking
      const pausedDuration = duration;
      startTimeRef.current = Date.now() - pausedDuration * 1000;

      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

      // Resume waveform capture
      waveformIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          const normalized = Math.min(average / 128, 1);

          setWaveformData((prev) => [...prev, normalized]);
        }
      }, 100);
    }
  }, [duration, maxDuration, stopRecording]);

  return {
    state,
    duration,
    waveformData,
    error,
    isSupported,
    isRecording: state === 'recording',
    isPaused: state === 'paused',
    isProcessing: state === 'processing',
    startRecording,
    stopRecording,
    cancelRecording,
    pauseRecording,
    resumeRecording,
  };
}






