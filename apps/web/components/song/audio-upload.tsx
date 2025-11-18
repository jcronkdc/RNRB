'use client';

import { useState, useRef } from 'react';
import { Upload, Music, X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Audio Upload Component
 * Upload MP3/WAV instrumental tracks
 * Attach to songs for writing lyrics to music
 */

interface AudioUploadProps {
  songId: string;
  onUploadComplete: (audioUrl: string, filename: string, duration: number) => void;
}

export default function AudioUpload({ songId, onUploadComplete }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/audio\/(mpeg|mp3|wav|ogg)/)) {
      setError('Please upload MP3, WAV, or OGG files only');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size: 50MB');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Get audio duration
      const duration = await getAudioDuration(file);

      // For now, create object URL (temporary storage)
      // TODO: Upload to Supabase Storage or similar
      const audioUrl = URL.createObjectURL(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // Call callback
      onUploadComplete(audioUrl, file.name, duration);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed');
      setUploading(false);
      setProgress(0);
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => reject(new Error('Failed to load audio'));
      audio.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="rnrb-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Music className="w-5 h-5 text-brand-primary" />
        Upload Instrumental
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-500">
          {error}
        </div>
      )}

      {uploading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-brand-primary"
                />
              </div>
            </div>
            <span className="text-sm font-mono">{progress}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Uploading instrumental track...</p>
        </div>
      ) : (
        <>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-brand-primary/50 transition-colors">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rnrb-button-primary px-6 py-2 rounded-lg"
            >
              SELECT AUDIO FILE
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              MP3, WAV, or OGG • Max 50MB
            </p>
          </div>

          <div className="mt-4 p-3 bg-muted/20 rounded text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Upload your instrumental track to:</p>
            <ul className="space-y-1 ml-3">
              <li>• Write lyrics while music plays</li>
              <li>• Match timing and feel</li>
              <li>• Share with collaborators</li>
              <li>• Sync to song structure</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
