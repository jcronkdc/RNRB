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
  duration?: number;
  waveformData?: any;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type LibraryFilters = {
  type?: LibraryFileType | 'all';
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'size' | 'duration';
  sortOrder?: 'asc' | 'desc';
};

type LibraryResponse = {
  files: LibraryFile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
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
        // Replace files for new query
        setLocalFiles(data.files);
      } else {
        // Append files for pagination
        setLocalFiles((prev) => [...prev, ...data.files]);
      }
      setHasMore(data.pagination.hasMore);
    }
  }, [data, offset]);

  // Reset when filters change
  useEffect(() => {
    setOffset(0);
    setLocalFiles([]);
  }, [filters.type, filters.search, filters.sortBy, filters.sortOrder]);

  // Load more function for pagination
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setOffset((prev) => prev + limit);
    }
  }, [isLoading, hasMore, limit]);

  // Upload file
  const uploadFile = useCallback(
    async (file: File, type: LibraryFileType, tags: string[] = []) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('tags', JSON.stringify(tags));

      const res = await fetch('/api/library/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const newFile = await res.json();

      // Optimistically update the local state
      setLocalFiles((prev) => [newFile, ...prev]);

      // Revalidate to sync with server
      await mutateLibrary();

      return newFile;
    },
    [mutateLibrary]
  );

  // Update file metadata
  const updateFile = useCallback(
    async (id: string, updates: { name?: string; tags?: string[] }) => {
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

      // Optimistically update the local state
      setLocalFiles((prev) => prev.map((f) => (f.id === id ? updatedFile : f)));

      // Revalidate to sync with server
      await mutateLibrary();

      return updatedFile;
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

      // Optimistically update the local state
      setLocalFiles((prev) => prev.filter((f) => f.id !== id));

      // Revalidate to sync with server
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

      // Optimistically update the local state
      setLocalFiles((prev) => prev.filter((f) => !ids.includes(f.id)));

      // Revalidate to sync with server
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
    deleteFile,
    deleteFiles,
    refresh,
    total: data?.pagination.total || 0,
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

// Audio upload progress tracking
export function useLibraryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(async (file: File, type: LibraryFileType, tags: string[] = []) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('tags', JSON.stringify(tags));

      abortControllerRef.current = new AbortController();

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
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

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', '/api/library/upload');
        xhr.send(formData);
      });

      const result = await uploadPromise;
      setUploading(false);
      setProgress(100);

      // Invalidate library cache
      await mutate((key) => typeof key === 'string' && key.startsWith('/api/library'));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setUploading(false);
      throw err;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploading(false);
      setProgress(0);
    }
  }, []);

  return {
    upload,
    cancel,
    uploading,
    progress,
    error,
  };
}
