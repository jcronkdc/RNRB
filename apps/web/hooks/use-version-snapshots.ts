/**
 * Version Snapshots Hook
 *
 * Save and restore named versions of songs
 * Like Git tags - mark important milestones
 *
 * Features:
 * - Create named snapshots ("Demo Ready", "Final Mix")
 * - List all versions with metadata
 * - Restore to any version
 * - Compare versions
 * - Auto-snapshots on major changes
 */

import { useState, useCallback, useEffect } from 'react';

export type SongSnapshot = {
  id: string;
  songId: string;
  versionNum: number;
  label: string | null;
  description: string | null;

  // Snapshot of song state
  title: string;
  lyrics: string | null;
  chords: string | null;
  key: string | null;
  tempo: number | null;
  timeSignature: string | null;
  audioUrl: string | null;

  // Metadata
  createdById: string;
  createdByName?: string;
  createdAt: Date;
  isPublished: boolean;
};

interface UseVersionSnapshotsOptions {
  songId: string;
  currentUserId: string;
}

export function useVersionSnapshots({ songId, currentUserId }: UseVersionSnapshotsOptions) {
  const [snapshots, setSnapshots] = useState<SongSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all snapshots
  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/songs/${songId}/snapshots`);

      if (!response.ok) {
        throw new Error('Failed to fetch snapshots');
      }

      const data = await response.json();
      setSnapshots(data.snapshots || []);
    } catch (err) {
      console.error('Error fetching snapshots:', err);
      setError(err instanceof Error ? err.message : 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  }, [songId]);

  // Load snapshots on mount
  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  // Create new snapshot
  const createSnapshot = useCallback(
    async (label: string, description?: string) => {
      try {
        const response = await fetch(`/api/songs/${songId}/snapshots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label,
            description,
            createdById: currentUserId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create snapshot');
        }

        const data = await response.json();
        const newSnapshot: SongSnapshot = data.snapshot;

        setSnapshots((prev) => [...prev, newSnapshot]);

        return newSnapshot;
      } catch (err) {
        console.error('Error creating snapshot:', err);
        throw err;
      }
    },
    [songId, currentUserId]
  );

  // Restore to snapshot
  const restoreSnapshot = useCallback(
    async (snapshotId: string) => {
      try {
        const response = await fetch(`/api/songs/${songId}/snapshots/${snapshotId}/restore`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to restore snapshot');
        }

        const data = await response.json();
        return data.song;
      } catch (err) {
        console.error('Error restoring snapshot:', err);
        throw err;
      }
    },
    [songId]
  );

  // Delete snapshot
  const deleteSnapshot = useCallback(
    async (snapshotId: string) => {
      try {
        const response = await fetch(`/api/songs/${songId}/snapshots/${snapshotId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete snapshot');
        }

        setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
      } catch (err) {
        console.error('Error deleting snapshot:', err);
        throw err;
      }
    },
    [songId]
  );

  // Update snapshot metadata
  const updateSnapshot = useCallback(
    async (snapshotId: string, updates: { label?: string; description?: string }) => {
      try {
        const response = await fetch(`/api/songs/${songId}/snapshots/${snapshotId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update snapshot');
        }

        const data = await response.json();
        const updatedSnapshot: SongSnapshot = data.snapshot;

        setSnapshots((prev) => prev.map((s) => (s.id === snapshotId ? updatedSnapshot : s)));

        return updatedSnapshot;
      } catch (err) {
        console.error('Error updating snapshot:', err);
        throw err;
      }
    },
    [songId]
  );

  // Compare two snapshots
  const compareSnapshots = useCallback(
    (snapshot1Id: string, snapshot2Id: string) => {
      const snap1 = snapshots.find((s) => s.id === snapshot1Id);
      const snap2 = snapshots.find((s) => s.id === snapshot2Id);

      if (!snap1 || !snap2) return null;

      return {
        snapshot1: snap1,
        snapshot2: snap2,
        differences: {
          title: snap1.title !== snap2.title,
          lyrics: snap1.lyrics !== snap2.lyrics,
          chords: snap1.chords !== snap2.chords,
          key: snap1.key !== snap2.key,
          tempo: snap1.tempo !== snap2.tempo,
          timeSignature: snap1.timeSignature !== snap2.timeSignature,
        },
      };
    },
    [snapshots]
  );

  // Get latest snapshot
  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  // Get published snapshot
  const publishedSnapshot = snapshots.find((s) => s.isPublished) || null;

  return {
    snapshots,
    loading,
    error,
    latestSnapshot,
    publishedSnapshot,

    // Actions
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    updateSnapshot,
    compareSnapshots,

    // Refresh
    refetch: fetchSnapshots,
  };
}
