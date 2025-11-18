import { useState } from 'react';
import { uploadAudioFile, deleteAudioFile, type AudioFile, type UploadProgress } from '@/lib/storage';

export function useAudioUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    projectSlug: string,
    songId: string,
    type: 'demo' | 'stem' | 'final' | 'reference' = 'demo'
  ): Promise<{ url: string; path: string } | null> => {
    setUploading(true);
    setError(null);
    setProgress(null);

    try {
      const result = await uploadAudioFile(
        file,
        projectSlug,
        songId,
        type,
        (uploadProgress) => {
          setProgress(uploadProgress);
        }
      );

      if (!result) {
        throw new Error('Upload failed - no result returned');
      }

      setUploading(false);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
      setProgress(null);
      return null;
    }
  };

  const remove = async (filePath: string): Promise<boolean> => {
    try {
      const success = await deleteAudioFile(filePath);
      return success;
    } catch (err: any) {
      setError(err.message || 'Delete failed');
      return false;
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(null);
    setError(null);
  };

  return {
    upload,
    remove,
    reset,
    uploading,
    progress,
    error,
  };
}

