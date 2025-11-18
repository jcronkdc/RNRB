import { supabase } from './supabase';

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type AudioFile = {
  id: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  type: 'demo' | 'stem' | 'final' | 'reference';
};

/**
 * Upload audio file to Supabase Storage
 * Bucket: 'audio-files'
 * Path: {projectSlug}/{songId}/{filename}
 */
export async function uploadAudioFile(
  file: File,
  projectSlug: string,
  songId: string,
  type: 'demo' | 'stem' | 'final' | 'reference',
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; path: string } | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/aiff', 'audio/flac', 'audio/ogg', 'audio/x-m4a'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|aiff|flac|ogg|m4a)$/i)) {
      throw new Error('Invalid file type. Please upload audio files only (MP3, WAV, AIFF, FLAC, OGG, M4A)');
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 500MB');
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${projectSlug}/${songId}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Delete audio file from Supabase Storage
 */
export async function deleteAudioFile(filePath: string): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }

  try {
    const { error } = await supabase.storage
      .from('audio-files')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * List all audio files for a song
 */
export async function listSongAudioFiles(
  projectSlug: string,
  songId: string
): Promise<string[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list(`${projectSlug}/${songId}`);

    if (error) {
      console.error('List error:', error);
      return [];
    }

    return data.map((file) => file.name);
  } catch (error) {
    console.error('List error:', error);
    return [];
  }
}

/**
 * Get download URL for audio file
 */
export async function getAudioFileUrl(filePath: string): Promise<string | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    const { data } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Get URL error:', error);
    return null;
  }
}

