import { useState, useCallback } from 'react';

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

  const createRoom = useCallback(async (options: CreateRoomOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/daily/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create room');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create room';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRoom = useCallback(async (roomName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/daily/rooms/${roomName}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch room');
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
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch rooms');
      }

      const data = await response.json();
      return data.rooms;
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
      const response = await fetch(`/api/daily/rooms/${roomName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete room');
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
