import { useEffect, useRef, useCallback } from 'react';

/**
 * Auto-Snapshot Hook
 * Creates version snapshots automatically
 * - Every 5 minutes if changes detected
 * - Before major operations
 * - Permanent storage in database
 */

interface AutoSnapshotOptions {
  songId: string;
  currentData: unknown;
  intervalMinutes?: number;
  onSnapshot: (reason: string) => Promise<void>;
}

export function useAutoSnapshot({
  songId,
  currentData,
  intervalMinutes = 5,
  onSnapshot,
}: AutoSnapshotOptions) {
  const lastSnapshotRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotTime = useRef<Date>(new Date());

  // Check if data has changed
  const hasChanged = useCallback(() => {
    const currentJson = JSON.stringify(currentData);
    return currentJson !== lastSnapshotRef.current;
  }, [currentData]);

  // Create snapshot
  const createSnapshot = useCallback(
    async (reason: string) => {
      if (!currentData) return;

      try {
        await onSnapshot(reason);
        lastSnapshotRef.current = JSON.stringify(currentData);
        lastSnapshotTime.current = new Date();
      } catch (error) {
        console.error('Snapshot error:', error);
      }
    },
    [currentData, onSnapshot]
  );

  // Manual snapshot (call before major operations)
  const manualSnapshot = useCallback(
    (reason: string) => {
      return createSnapshot(reason);
    },
    [createSnapshot]
  );

  // Auto-snapshot interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(
      () => {
        if (hasChanged()) {
          createSnapshot('Auto-save snapshot');
        }
      },
      intervalMinutes * 60 * 1000
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMinutes, hasChanged, createSnapshot]);

  // Snapshot on unmount if changes
  useEffect(() => {
    return () => {
      if (hasChanged()) {
        // Create snapshot before leaving (async, fire and forget)
        createSnapshot('Before closing').catch(console.error);
      }
    };
  }, [hasChanged, createSnapshot]);

  return {
    manualSnapshot,
    lastSnapshotTime: lastSnapshotTime.current,
  };
}
