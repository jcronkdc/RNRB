import { useState, useCallback } from 'react';

export interface Track {
  id: string;
  trackName: string;
  trackType: string;
  audioUrl: string;
  duration: number | null;
  volume: number;
  pan: number;
  solo: boolean;
  mute: boolean;
  order: number;
  color: string | null;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

export interface UseTracksOptions {
  songId: string;
  autoLoad?: boolean;
}

export interface UseTracksReturn {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  trackCount: number;
  loadTracks: () => Promise<void>;
  createTrack: (data: CreateTrackData) => Promise<Track>;
  updateTrack: (trackId: string, updates: Partial<Track>) => Promise<void>;
  bulkUpdateTracks: (updates: BulkUpdateData[]) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  reorderTracks: (trackIds: string[]) => Promise<void>;
}

export interface CreateTrackData {
  trackName: string;
  trackType: 'VOCAL' | 'INSTRUMENTAL' | 'BACKING' | 'FULL_MIX' | 'OTHER';
  audioUrl: string;
  audioPath: string;
  duration?: number;
  waveformData?: any;
  color?: string;
  versionId?: string;
}

export interface BulkUpdateData {
  trackId: string;
  volume?: number;
  pan?: number;
  solo?: boolean;
  mute?: boolean;
  order?: number;
}

/**
 * React hook for managing track data with optimized caching and updates
 * Provides CRUD operations for tracks with proper error handling
 */
export function useTracks({ songId, autoLoad = true }: UseTracksOptions): UseTracksReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Load tracks from API
  const loadTracks = useCallback(async () => {
    if (!songId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/songs/${songId}/tracks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Use cache for better performance
        cache: 'default',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load tracks');
      }

      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load tracks:', err);
    } finally {
      setLoading(false);
    }
  }, [songId]);

  // Create a new track
  const createTrack = useCallback(
    async (trackData: CreateTrackData): Promise<Track> => {
      try {
        setError(null);

        const response = await fetch(`/api/songs/${songId}/tracks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create track');
        }

        const data = await response.json();
        const newTrack = data.track;

        // Optimistically update state
        setTracks((prev) => [...prev, newTrack]);

        return newTrack;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [songId]
  );

  // Update a single track
  const updateTrack = useCallback(
    async (trackId: string, updates: Partial<Track>) => {
      try {
        setError(null);

        // Optimistically update UI
        setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, ...updates } : t)));

        const response = await fetch(`/api/songs/${songId}/tracks/${trackId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const data = await response.json();
          // Revert optimistic update on error
          await loadTracks();
          throw new Error(data.error || 'Failed to update track');
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [songId, loadTracks]
  );

  // Bulk update multiple tracks
  const bulkUpdateTracks = useCallback(
    async (updates: BulkUpdateData[]) => {
      try {
        setError(null);

        // Optimistically update UI
        const updateMap = new Map(updates.map((u) => [u.trackId, u]));
        setTracks((prev) =>
          prev.map((t) => {
            const update = updateMap.get(t.id);
            return update ? { ...t, ...update } : t;
          })
        );

        const response = await fetch(`/api/songs/${songId}/tracks`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates }),
        });

        if (!response.ok) {
          const data = await response.json();
          // Revert optimistic update on error
          await loadTracks();
          throw new Error(data.error || 'Failed to update tracks');
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [songId, loadTracks]
  );

  // Delete a track
  const deleteTrack = useCallback(
    async (trackId: string) => {
      try {
        setError(null);

        // Optimistically remove from UI
        setTracks((prev) => prev.filter((t) => t.id !== trackId));

        const response = await fetch(`/api/songs/${songId}/tracks/${trackId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          // Revert optimistic update on error
          await loadTracks();
          throw new Error(data.error || 'Failed to delete track');
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [songId, loadTracks]
  );

  // Reorder tracks
  const reorderTracks = useCallback(
    async (trackIds: string[]) => {
      const updates = trackIds.map((id, index) => ({
        trackId: id,
        order: index,
      }));

      await bulkUpdateTracks(updates);
    },
    [bulkUpdateTracks]
  );

  // Auto-load on mount if enabled
  useState(() => {
    if (autoLoad) {
      loadTracks();
    }
  });

  return {
    tracks,
    loading,
    error,
    trackCount: tracks.length,
    loadTracks,
    createTrack,
    updateTrack,
    bulkUpdateTracks,
    deleteTrack,
    reorderTracks,
  };
}



