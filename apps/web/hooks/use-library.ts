import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR, { mutate } from 'swr';

export type LibraryFileType =
  | 'stem'
  | 'demo'
  | 'sample'
  | 'loop'
  | 'lyrics'
  | 'chords'
  | 'sheet_music'
  | 'midi'
  | 'image'
  | 'document'
  | 'project'
  | 'other';

export type LibraryFile = {
  id: string;
  name: string;
  originalName: string;
  url: string;
  path: string;
  size: string; // BigInt serialized as string
  mimeType: string;
  type: LibraryFileType;
  // Audio metadata
  duration?: number;
  waveformData?: number[];
  bpm?: number;
  musicalKey?: string;
  mood?: string;
  // Organization
  tags: string[];
  color?: string;
  isFavorite: boolean;
  playCount: number;
  lastPlayed?: string;
  notes?: string;
  // Lyrics/Chords
  lyrics?: string;
  chordData?: any;
  // Version tracking
  version: number;
  parentId?: string;
  // Collection
  collectionId?: string;
  collection?: LibraryCollection;
  // Timestamps
  createdAt: string;
  updatedAt: string;
};

export type LibraryCollection = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  sortOrder: number;
  fileCount?: number;
  createdAt: string;
  updatedAt: string;
};

type LibraryFilters = {
  type?: LibraryFileType | 'all';
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'size' | 'duration' | 'bpm' | 'playCount' | 'lastPlayed';
  sortOrder?: 'asc' | 'desc';
  collectionId?: string;
  isFavorite?: boolean;
  bpmMin?: number;
  bpmMax?: number;
  musicalKey?: string;
  mood?: string;
  tags?: string[];
};

type LibraryResponse = {
  files: LibraryFile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats?: LibraryStats;
};

export type LibraryStats = {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
  byKey: Record<string, number>;
  favorites: number;
  recentlyPlayed: number;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch');
  }
  return res.json();
};

export function useLibrary(filters: LibraryFilters = {}) {
  const [localFiles, setLocalFiles] = useState<LibraryFile[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Build query params
  const buildQueryParams = useCallback(
    (currentOffset: number = 0) => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', currentOffset.toString());

      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
      if (filters.collectionId) {
        params.append('collectionId', filters.collectionId);
      }
      if (filters.isFavorite !== undefined) {
        params.append('isFavorite', filters.isFavorite.toString());
      }
      if (filters.bpmMin) {
        params.append('bpmMin', filters.bpmMin.toString());
      }
      if (filters.bpmMax) {
        params.append('bpmMax', filters.bpmMax.toString());
      }
      if (filters.musicalKey) {
        params.append('musicalKey', filters.musicalKey);
      }
      if (filters.mood) {
        params.append('mood', filters.mood);
      }
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      return params.toString();
    },
    [filters, limit]
  );

  // Use SWR for data fetching with caching
  const queryString = buildQueryParams(offset);
  const {
    data,
    error,
    isLoading,
    mutate: mutateLibrary,
  } = useSWR<LibraryResponse>(`/api/library?${queryString}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    keepPreviousData: true,
  });

  // Update local state when data changes
  useEffect(() => {
    if (data) {
      if (offset === 0) {
        setLocalFiles(data.files);
      } else {
        setLocalFiles((prev) => [...prev, ...data.files]);
      }
      setHasMore(data.pagination.hasMore);
    }
  }, [data, offset]);

  // Reset when filters change
  useEffect(() => {
    setOffset(0);
    setLocalFiles([]);
  }, [
    filters.type,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
    filters.collectionId,
    filters.isFavorite,
    filters.bpmMin,
    filters.bpmMax,
    filters.musicalKey,
    filters.mood,
    filters.tags?.join(','),
  ]);

  // Load more function for pagination
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setOffset((prev) => prev + limit);
    }
  }, [isLoading, hasMore, limit]);

  // Upload file
  const uploadFile = useCallback(
    async (file: File, type: LibraryFileType, metadata?: Partial<LibraryFile>) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const res = await fetch('/api/library/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const newFile = await res.json();
      setLocalFiles((prev) => [newFile, ...prev]);
      await mutateLibrary();
      return newFile;
    },
    [mutateLibrary]
  );

  // Update file metadata
  const updateFile = useCallback(
    async (id: string, updates: Partial<LibraryFile>) => {
      const res = await fetch(`/api/library/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Update failed');
      }

      const updatedFile = await res.json();
      setLocalFiles((prev) => prev.map((f) => (f.id === id ? updatedFile : f)));
      await mutateLibrary();
      return updatedFile;
    },
    [mutateLibrary]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (id: string) => {
      const file = localFiles.find((f) => f.id === id);
      if (!file) return;

      return updateFile(id, { isFavorite: !file.isFavorite });
    },
    [localFiles, updateFile]
  );

  // Increment play count
  const incrementPlayCount = useCallback(async (id: string) => {
    const res = await fetch(`/api/library/${id}/play`, {
      method: 'POST',
    });

    if (!res.ok) return;

    const updatedFile = await res.json();
    setLocalFiles((prev) => prev.map((f) => (f.id === id ? updatedFile : f)));
  }, []);

  // Move to collection
  const moveToCollection = useCallback(
    async (fileIds: string[], collectionId: string | null) => {
      const res = await fetch('/api/library/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds, collectionId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Move failed');
      }

      await mutateLibrary();
    },
    [mutateLibrary]
  );

  // Delete single file
  const deleteFile = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/library/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Delete failed');
      }

      setLocalFiles((prev) => prev.filter((f) => f.id !== id));
      await mutateLibrary();
    },
    [mutateLibrary]
  );

  // Delete multiple files
  const deleteFiles = useCallback(
    async (ids: string[]) => {
      const res = await fetch(`/api/library?ids=${ids.join(',')}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Bulk delete failed');
      }

      setLocalFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
      await mutateLibrary();
    },
    [mutateLibrary]
  );

  // Refresh data
  const refresh = useCallback(() => {
    setOffset(0);
    return mutateLibrary();
  }, [mutateLibrary]);

  return {
    files: localFiles,
    isLoading,
    error: error?.message,
    hasMore,
    loadMore,
    uploadFile,
    updateFile,
    toggleFavorite,
    incrementPlayCount,
    moveToCollection,
    deleteFile,
    deleteFiles,
    refresh,
    total: data?.pagination.total || 0,
    stats: data?.stats,
  };
}

// Hook for library collections
export function useLibraryCollections() {
  const {
    data,
    error,
    isLoading,
    mutate: mutateCollections,
  } = useSWR<LibraryCollection[]>('/api/library/collections', fetcher, {
    revalidateOnFocus: false,
  });

  const createCollection = useCallback(
    async (name: string, options?: { description?: string; color?: string; icon?: string }) => {
      const res = await fetch('/api/library/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ...options }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create collection');
      }

      const newCollection = await res.json();
      await mutateCollections();
      return newCollection;
    },
    [mutateCollections]
  );

  const updateCollection = useCallback(
    async (id: string, updates: Partial<LibraryCollection>) => {
      const res = await fetch(`/api/library/collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update collection');
      }

      await mutateCollections();
    },
    [mutateCollections]
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/library/collections/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete collection');
      }

      await mutateCollections();
    },
    [mutateCollections]
  );

  return {
    collections: data || [],
    isLoading,
    error: error?.message,
    createCollection,
    updateCollection,
    deleteCollection,
    refresh: mutateCollections,
  };
}

// Hook for a single library file
export function useLibraryFile(id: string | null) {
  const {
    data,
    error,
    isLoading,
    mutate: mutateFile,
  } = useSWR<LibraryFile>(id ? `/api/library/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    file: data,
    isLoading,
    error: error?.message,
    refresh: mutateFile,
  };
}

// Hook for library statistics
export function useLibraryStats() {
  const { data, error, isLoading } = useSWR<LibraryStats>('/api/library/stats', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
  });

  return {
    stats: data,
    isLoading,
    error: error?.message,
  };
}

// Audio upload progress tracking with multi-file support
export function useLibraryUpload() {
  const [uploads, setUploads] = useState<
    Map<string, { progress: number; status: 'uploading' | 'complete' | 'error'; error?: string }>
  >(new Map());
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const upload = useCallback(
    async (file: File, type: LibraryFileType, metadata?: Partial<LibraryFile>) => {
      const uploadId = `${file.name}-${Date.now()}`;
      setUploading(true);
      setProgress(0);
      setError(null);
      setUploads((prev) => new Map(prev).set(uploadId, { progress: 0, status: 'uploading' }));

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (metadata) {
          formData.append('metadata', JSON.stringify(metadata));
        }

        const abortController = new AbortController();
        abortControllersRef.current.set(uploadId, abortController);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setProgress(percentComplete);
            setUploads((prev) =>
              new Map(prev).set(uploadId, { progress: percentComplete, status: 'uploading' })
            );
          }
        });

        const uploadPromise = new Promise<LibraryFile>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                reject(new Error('Invalid response from server'));
              }
            } else {
              try {
                const error = JSON.parse(xhr.responseText);
                reject(new Error(error.error || 'Upload failed'));
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
          xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

          xhr.open('POST', '/api/library/upload');
          xhr.send(formData);
        });

        const result = await uploadPromise;
        setUploads((prev) => new Map(prev).set(uploadId, { progress: 100, status: 'complete' }));
        setUploading(false);
        setProgress(100);

        // Invalidate library cache
        await mutate((key) => typeof key === 'string' && key.startsWith('/api/library'));

        // Clean up after a delay
        setTimeout(() => {
          setUploads((prev) => {
            const newMap = new Map(prev);
            newMap.delete(uploadId);
            return newMap;
          });
          abortControllersRef.current.delete(uploadId);
        }, 3000);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        setUploading(false);
        setUploads((prev) =>
          new Map(prev).set(uploadId, { progress: 0, status: 'error', error: errorMessage })
        );
        throw err;
      }
    },
    []
  );

  const uploadMultiple = useCallback(
    async (files: File[], type: LibraryFileType) => {
      const results: LibraryFile[] = [];
      const errors: Error[] = [];

      for (const file of files) {
        try {
          const result = await upload(file, type);
          results.push(result);
        } catch (err) {
          errors.push(err instanceof Error ? err : new Error('Upload failed'));
        }
      }

      return { results, errors };
    },
    [upload]
  );

  const cancel = useCallback((uploadId?: string) => {
    if (uploadId) {
      const controller = abortControllersRef.current.get(uploadId);
      controller?.abort();
      abortControllersRef.current.delete(uploadId);
      setUploads((prev) => {
        const newMap = new Map(prev);
        newMap.delete(uploadId);
        return newMap;
      });
    } else {
      // Cancel all
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
      setUploads(new Map());
      setUploading(false);
      setProgress(0);
    }
  }, []);

  return {
    upload,
    uploadMultiple,
    cancel,
    uploading,
    progress,
    error,
    uploads,
  };
}

// Musical key options
export const MUSICAL_KEYS = [
  'C Major',
  'C Minor',
  'C# Major',
  'C# Minor',
  'D Major',
  'D Minor',
  'D# Major',
  'D# Minor',
  'E Major',
  'E Minor',
  'F Major',
  'F Minor',
  'F# Major',
  'F# Minor',
  'G Major',
  'G Minor',
  'G# Major',
  'G# Minor',
  'A Major',
  'A Minor',
  'A# Major',
  'A# Minor',
  'B Major',
  'B Minor',
] as const;

// Mood options
export const MOODS = [
  'Energetic',
  'Melancholic',
  'Happy',
  'Sad',
  'Aggressive',
  'Calm',
  'Dreamy',
  'Dark',
  'Bright',
  'Intense',
  'Relaxed',
  'Uplifting',
  'Moody',
  'Epic',
  'Intimate',
] as const;

// Color options for organization
export const LABEL_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
] as const;
