import { useState, useCallback, useRef } from 'react';

interface RoomConfig {
  enable_screenshare?: boolean;
  enable_recording?: boolean;
  enable_live_streaming?: boolean;
  max_participants?: number;
  [key: string]: unknown;
}

interface Room {
  id: string;
  name: string;
  url: string;
  privacy: string;
  created_at: string;
  config: RoomConfig;
}

interface CreateRoomOptions {
  name?: string;
  privacy?: 'private' | 'public';
  properties?: Record<string, unknown>;
}

export function useDailyRoom() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track pending requests and prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  const createRoom = useCallback(async (options: CreateRoomOptions = {}) => {
    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/daily/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create room' }));
        throw new Error(errorData.error || 'Failed to create room');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      
      const message = err instanceof Error ? err.message : 'Failed to create room';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const getRoom = useCallback(async (roomName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/daily/rooms/${encodeURIComponent(roomName)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch room' }));
        throw new Error(errorData.error || 'Failed to fetch room');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch room';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/daily/rooms', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch rooms' }));
        throw new Error(errorData.error || 'Failed to fetch rooms');
      }

      const data = await response.json();
      return data.rooms || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rooms';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRoom = useCallback(async (roomName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/daily/rooms/${encodeURIComponent(roomName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete room' }));
        throw new Error(errorData.error || 'Failed to delete room');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete room';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createRoom,
    getRoom,
    getRooms,
    deleteRoom,
    isLoading,
    error,
  };
}
