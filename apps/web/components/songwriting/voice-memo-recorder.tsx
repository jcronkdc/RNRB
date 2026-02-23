'use client';

import { Mic, Square, Play, Pause, Trash2, Download, Upload } from '@/components/ui/custom-icons';
import { useState, useRef, useEffect } from 'react';

import { formatDate } from '@/lib/format-date';

type VoiceMemo = {
  id: string;
  name: string;
  url: string; // Base64 data URL for persistence
  duration: number;
  createdAt: Date;
};

/**
 * Convert a Blob to a base64 data URL for localStorage persistence
 * Blob URLs become invalid after page refresh, so we store the actual data
 */
const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

type VoiceMemoRecorderProps = {
  songId?: string;
  onMemoCreated?: (memo: VoiceMemo) => void;
};

export function VoiceMemoRecorder({ songId, onMemoCreated }: VoiceMemoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [memos, setMemos] = useState<VoiceMemo[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load memos from localStorage on mount
  useEffect(() => {
    try {
      const savedMemos = localStorage.getItem(`voice-memos-${songId}`);
      if (savedMemos) {
        // Security: Limit JSON size to prevent DoS attacks (max 5MB for voice memos)
        const MAX_JSON_SIZE = 5 * 1024 * 1024; // 5MB
        if (savedMemos.length > MAX_JSON_SIZE) {
          console.warn('Voice memos JSON too large, skipping load');
          return;
        }

        // Parse JSON and convert createdAt strings back to Date objects
        // JSON.parse returns dates as ISO strings, not Date objects
        const parsed = JSON.parse(savedMemos) as Array<
          Omit<VoiceMemo, 'createdAt'> & { createdAt: string }
        >;

        // Security: Limit array size to prevent memory exhaustion (max 1000 memos)
        const MAX_MEMOS = 1000;
        const limitedParsed = parsed.slice(0, MAX_MEMOS);

        const hydrated: VoiceMemo[] = limitedParsed.map((memo) => ({
          ...memo,
          createdAt: new Date(memo.createdAt),
        }));
        setMemos(hydrated);
      }
    } catch (error) {
      console.warn('Failed to load voice memos from localStorage:', error);
      // Continue without loading cached memos
    }
  }, [songId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioBlob(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const saveMemo = async () => {
    if (!audioUrl || !audioBlob) return;

    try {
      // Convert blob to base64 data URL for persistence
      // Blob URLs become invalid after page refresh
      const dataUrl = await blobToDataUrl(audioBlob);

      const newMemo: VoiceMemo = {
        id: `memo-${Date.now()}`,
        name: `Voice Memo ${new Date().toLocaleString()}`,
        url: dataUrl, // Store as data URL, not blob URL
        duration,
        createdAt: new Date(),
      };

      const updatedMemos = [...memos, newMemo];
      setMemos(updatedMemos);

      // Save to localStorage with data URL (persists across refreshes)
      try {
        localStorage.setItem(`voice-memos-${songId}`, JSON.stringify(updatedMemos));
      } catch (error) {
        console.warn('Failed to save voice memo to localStorage:', error);
        // Continue - memo is still saved in state
      }

      // Revoke the temporary blob URL to free memory
      URL.revokeObjectURL(audioUrl);

      // Reset recording state
      setAudioUrl(null);
      setAudioBlob(null);
      setDuration(0);

      if (onMemoCreated) {
        onMemoCreated(newMemo);
      }
    } catch (error) {
      console.error('Failed to save voice memo:', error);
      alert('Failed to save voice memo. Please try again.');
    }
  };

  const deleteMemo = (id: string) => {
    const updatedMemos = memos.filter((m) => m.id !== id);
    setMemos(updatedMemos);
    try {
      localStorage.setItem(`voice-memos-${songId}`, JSON.stringify(updatedMemos));
    } catch (error) {
      console.warn('Failed to save deleted memo to localStorage:', error);
      // Continue - memo is still deleted from memory
    }
  };

  const downloadMemo = (memo: VoiceMemo) => {
    const a = document.createElement('a');
    a.href = memo.url;
    a.download = `${memo.name}.webm`;
    a.click();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Interface */}
      <div className="rounded-xl border-2 border-red-500/20 bg-linear-to-br from-red-500/5 to-orange-500/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="mb-1 text-lg font-bold text-white">Voice Memo Recorder</h3>
            <p className="text-sm text-gray-400">
              Capture melody ideas, vocal demos, or quick notes
            </p>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
              <span className="font-mono text-lg font-bold text-red-400">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 rounded-xl border-2 border-red-500 bg-red-500/10 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-xl border-2 border-red-500 bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
            >
              <Square className="h-5 w-5" />
              Stop Recording
            </button>
          )}

          {audioUrl && (
            <>
              <button
                onClick={playAudio}
                className="flex items-center gap-2 rounded-xl border-2 border-green-500/40 bg-green-500/10 px-6 py-3 font-semibold text-green-400 transition hover:bg-green-500/20"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Play ({formatDuration(duration)})
                  </>
                )}
              </button>

              <button
                onClick={saveMemo}
                className="flex items-center gap-2 rounded-xl border-2 border-blue-500/40 bg-blue-500/10 px-6 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                <Upload className="h-5 w-5" />
                Save Memo
              </button>

              <button
                onClick={() => {
                  setAudioUrl(null);
                  setAudioBlob(null);
                  setDuration(0);
                }}
                className="flex items-center gap-2 rounded-xl border-2 border-gray-700 bg-gray-800/50 px-4 py-3 font-semibold text-gray-400 transition hover:bg-gray-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Hidden audio element for playback */}
        {audioUrl && (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- Voice memos are user recordings without transcripts
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>

      {/* Saved Memos List */}
      {memos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Saved Voice Memos ({memos.length})
          </h4>

          {memos.map((memo) => (
            <div
              key={memo.id}
              className="flex items-center justify-between rounded-xl border-2 border-gray-800 bg-gray-900/50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Mic className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{memo.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(memo.duration)} • {formatDate(memo.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const audio = new Audio(memo.url);
                    audio.play();
                  }}
                  className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-green-400 transition hover:bg-green-500/20"
                  title="Play memo"
                >
                  <Play className="h-4 w-4" />
                </button>

                <button
                  onClick={() => downloadMemo(memo)}
                  className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400 transition hover:bg-blue-500/20"
                  title="Download memo"
                >
                  <Download className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm('Delete this voice memo?')) {
                      deleteMemo(memo.id);
                    }
                  }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                  title="Delete memo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
