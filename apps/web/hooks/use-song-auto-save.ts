import { useState, useEffect, useCallback, useRef } from 'react';

import { useDebounce } from './use-debounce';

export type SongData = {
  id?: string;
  title?: string;
  key?: string;
  tempo?: number | string;
  timeSignature?: string;
  lyrics?: string;
  chords?: unknown;
  status?: 'draft' | 'in_progress' | 'needs_review' | 'complete';
  visibility?: 'private' | 'org' | 'public';
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSongAutoSave(initialData?: SongData, autoSaveDelay = 2000) {
  const [songData, setSongData] = useState<SongData>(initialData || {});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const debouncedData = useDebounce(songData, autoSaveDelay);
  const lastSavedDataRef = useRef<string>(JSON.stringify(initialData || {}));
  const isMountedRef = useRef(true);

  // Auto-save effect
  useEffect(() => {
    const currentDataString = JSON.stringify(debouncedData);

    // Skip if no changes or no song ID yet
    if (!debouncedData.id || currentDataString === lastSavedDataRef.current) {
      return;
    }

    const saveSong = async () => {
      setSaveStatus('saving');
      setError(null);

      try {
        const response = await fetch(`/api/songs/${debouncedData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(debouncedData),
        });

        if (!response.ok) {
          throw new Error('Failed to save song');
        }

        if (isMountedRef.current) {
          setSaveStatus('saved');
          lastSavedDataRef.current = currentDataString;

          // Reset to idle after 2 seconds
          setTimeout(() => {
            if (isMountedRef.current) {
              setSaveStatus('idle');
            }
          }, 2000);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setSaveStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to save');
        }
      }
    };

    saveSong();
  }, [debouncedData]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Create new song
  const createSong = useCallback(async (data: Omit<SongData, 'id'>) => {
    setSaveStatus('saving');
    setError(null);

    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create song');
      }

      const { song } = await response.json();

      if (isMountedRef.current) {
        setSongData(song);
        lastSavedDataRef.current = JSON.stringify(song);
        setSaveStatus('saved');

        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveStatus('idle');
          }
        }, 2000);
      }

      return song;
    } catch (err) {
      if (isMountedRef.current) {
        setSaveStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to create song');
      }
      throw err;
    }
  }, []);

  // Update song data (triggers auto-save)
  const updateSong = useCallback((updates: Partial<SongData>) => {
    setSongData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Manual save
  const saveSong = useCallback(async () => {
    if (!songData.id) {
      throw new Error('Cannot save: No song ID');
    }

    setSaveStatus('saving');
    setError(null);

    try {
      const response = await fetch(`/api/songs/${songData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      if (!response.ok) {
        throw new Error('Failed to save song');
      }

      const { song } = await response.json();

      if (isMountedRef.current) {
        setSongData(song);
        lastSavedDataRef.current = JSON.stringify(song);
        setSaveStatus('saved');

        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveStatus('idle');
          }
        }, 2000);
      }

      return song;
    } catch (err) {
      if (isMountedRef.current) {
        setSaveStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to save');
      }
      throw err;
    }
  }, [songData]);

  return {
    songData,
    setSongData,
    updateSong,
    createSong,
    saveSong,
    saveStatus,
    error,
    isSaving: saveStatus === 'saving',
    isSaved: saveStatus === 'saved',
    hasError: saveStatus === 'error',
  };
}






