'use client';

import { Card, Button } from '@cronkwaters/ui';
import {
  Upload,
  X,
  Play,
  Pause,
  Loader2,
  Check,
  AlertCircle,
  FileAudio,
} from '@/components/ui/custom-icons';
import { useState, useRef, useEffect } from 'react';

type AudioUploaderProps = {
  songId?: string;
  currentAudioUrl?: string;
  onUploadComplete?: (url: string, path: string) => void;
  onRemove?: () => void;
  maxSizeMB?: number;
};

export function AudioUploader({
  songId,
  currentAudioUrl,
  onUploadComplete,
  onRemove,
  maxSizeMB = 50,
}: AudioUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(currentAudioUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentAudioUrl) {
      setAudioUrl(currentAudioUrl);
    }
  }, [currentAudioUrl]);

  useEffect(() => {
    // Update playback time
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [audioUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/aac',
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      setError('Invalid file type. Please upload MP3, WAV, OGG, M4A, or AAC files.');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit. Please upload a smaller file.`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('audio', file);
      if (songId) {
        formData.append('songId', songId);
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            setAudioUrl(response.url);
            if (onUploadComplete) {
              onUploadComplete(response.url, response.path);
            }
            setIsUploading(false);
            setUploadProgress(100);
          } catch (e) {
            console.error('Failed to parse upload response:', e);
            setError('Upload completed but response was invalid. Please try again.');
            setIsUploading(false);
          }
        } else {
          console.error('Upload failed with status:', xhr.status);
          // Try to extract error message from response
          let errorMessage = `Upload failed (status ${xhr.status})`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.error) {
              errorMessage = errorResponse.error;
            }
          } catch {
            // Use default error message if response isn't JSON
          }
          setError(errorMessage);
          setIsUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        // Handle network errors properly - event listeners run async so can't throw
        console.error('Network error during upload');
        setError('Network error during upload. Please check your connection and try again.');
        setIsUploading(false);
      });

      xhr.open('POST', '/api/upload/audio');
      xhr.send(formData);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload audio file');
      setIsUploading(false);
    }
  };

  const handleRemoveAudio = () => {
    if (confirm('Are you sure you want to remove this audio file?')) {
      setAudioUrl('');
      setDuration(null);
      setCurrentTime(0);
      setIsPlaying(false);
      if (onRemove) onRemove();
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {!audioUrl && (
        <div className="rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/50 p-8 text-center transition hover:border-gray-600">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/aac,.mp3,.wav,.ogg,.m4a,.aac"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!isUploading ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <Upload className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Upload Audio File</h3>
              <p className="mb-4 text-sm text-gray-400">
                Upload an instrumental, demo, or reference track for your song
              </p>
              <p className="mb-4 text-xs text-gray-500">
                MP3, WAV, OGG, M4A, AAC • Max {maxSizeMB}MB
              </p>
              <Button onClick={() => fileInputRef.current?.click()} className="mx-auto">
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">Uploading...</h3>
              <div className="mx-auto max-w-md">
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="font-mono text-sm text-gray-400">{uploadProgress}%</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border-2 border-red-500/30 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Upload Error</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <Card className="border-green-500/30 bg-linear-to-br from-green-500/10 to-blue-500/10 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <FileAudio className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Audio Track</h3>
                <p className="text-sm text-gray-400">
                  {duration ? `Duration: ${formatTime(duration)}` : 'Loading...'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveAudio}
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
              title="Remove audio"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Playback Controls */}
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-400">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${duration ? (currentTime / duration) * 100 : 0}%, #374151 ${duration ? (currentTime / duration) * 100 : 0}%, #374151 100%)`,
                }}
              />
              <span className="font-mono text-xs text-gray-400">{formatTime(duration || 0)}</span>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-green-500/50 bg-green-500/10 px-4 py-3 font-semibold text-green-400 transition hover:bg-green-500/20"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Play
                </>
              )}
            </button>
          </div>

          {/* Hidden Audio Element */}
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        </Card>
      )}

      {/* Upload Success */}
      {audioUrl && !isUploading && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
          <Check className="h-4 w-4" />
          <span>Audio uploaded successfully!</span>
        </div>
      )}
    </div>
  );
}
