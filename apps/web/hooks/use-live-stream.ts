/**
 * Live Stream Hook
 *
 * Manages live stream state for both streamers and viewers
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChannel } from 'ably/react';

interface StreamerInfo {
  id: string;
  name: string;
  avatar?: string;
}

interface LiveStreamState {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'starting' | 'live' | 'ending' | 'ended';
  playbackUrl?: string;
  playbackId?: string;
  streamKey?: string;
  rtmpUrl?: string;
  viewerCount: number;
  chatEnabled: boolean;
  reactionsEnabled: boolean;
  streamer: StreamerInfo;
  startedAt?: string;
  thumbnailUrl?: string;
}

interface ViewerSession {
  sessionId: string;
  isAuthenticated: boolean;
  isFollowing: boolean;
  userId?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  type: 'text' | 'tip' | 'highlight' | 'system' | 'pinned';
  isPinned: boolean;
  badges: string[];
  color?: string;
  replyToId?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Reaction {
  id: string;
  type: 'heart' | 'fire' | 'clap' | 'wow' | 'love' | 'laugh' | 'rock' | 'star';
  positionX: number;
  createdAt: string;
}

export function useLiveStream(streamId: string | null) {
  const [stream, setStream] = useState<LiveStreamState | null>(null);
  const [viewer, setViewer] = useState<ViewerSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasJoined = useRef(false);
  const reactionCleanupInterval = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to real-time updates via Ably
  const { channel } = useChannel(`live-stream:${streamId}`, (message) => {
    switch (message.name) {
      case 'chat':
        setMessages((prev) => [...prev, message.data]);
        break;
      case 'reaction':
        setReactions((prev) => [...prev, message.data]);
        break;
      case 'viewer_count':
        setStream((prev) => (prev ? { ...prev, viewerCount: message.data.count } : null));
        break;
      case 'stream_ended':
        setStream((prev) => (prev ? { ...prev, status: 'ended' } : null));
        break;
      case 'chat_settings':
        setStream((prev) => (prev ? { ...prev, ...message.data } : null));
        break;
    }
  });

  // Join stream
  const joinStream = useCallback(async () => {
    if (!streamId || hasJoined.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/live/${streamId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join stream');
      }

      const data = await response.json();
      setStream(data.stream);
      setViewer(data.viewer);
      hasJoined.current = true;

      // Fetch initial chat messages
      await fetchMessages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  // Leave stream
  const leaveStream = useCallback(async () => {
    if (!streamId || !hasJoined.current) return;

    try {
      await fetch(`/api/live/${streamId}/leave`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to leave stream:', err);
    }

    hasJoined.current = false;
  }, [streamId]);

  // Fetch chat messages
  const fetchMessages = useCallback(
    async (before?: string) => {
      if (!streamId) return;

      try {
        const url = new URL(`/api/live/${streamId}/chat`, window.location.origin);
        if (before) url.searchParams.set('before', before);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        setMessages((prev) => (before ? [...data.messages, ...prev] : data.messages));
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    },
    [streamId]
  );

  // Send chat message
  const sendMessage = useCallback(
    async (message: string, replyToId?: string) => {
      if (!streamId || !stream?.chatEnabled) return;

      try {
        const response = await fetch(`/api/live/${streamId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, replyToId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to send message');
        }

        // Message will come back via Ably
      } catch (err: any) {
        throw err;
      }
    },
    [streamId, stream?.chatEnabled]
  );

  // Send reaction
  const sendReaction = useCallback(
    async (type: Reaction['type'] = 'heart') => {
      if (!streamId || !stream?.reactionsEnabled) return;

      try {
        const response = await fetch(`/api/live/${streamId}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reactionType: type }),
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 429) {
            // Rate limited, silently ignore
            return;
          }
          throw new Error(data.error || 'Failed to send reaction');
        }

        // Reaction will come back via Ably
      } catch (err) {
        console.error('Failed to send reaction:', err);
      }
    },
    [streamId, stream?.reactionsEnabled]
  );

  // Clean up old reactions (keep last 3 seconds for animations)
  useEffect(() => {
    reactionCleanupInterval.current = setInterval(() => {
      const cutoff = Date.now() - 3000;
      setReactions((prev) => prev.filter((r) => new Date(r.createdAt).getTime() > cutoff));
    }, 1000);

    return () => {
      if (reactionCleanupInterval.current) {
        clearInterval(reactionCleanupInterval.current);
      }
    };
  }, []);

  // Refresh stream state
  const refreshStream = useCallback(async () => {
    if (!streamId) return;

    try {
      const response = await fetch(`/api/live/${streamId}`);
      if (response.ok) {
        const data = await response.json();
        setStream((prev) => (prev ? { ...prev, ...data.stream } : data.stream));
      }
    } catch (err) {
      console.error('Failed to refresh stream:', err);
    }
  }, [streamId]);

  return {
    stream,
    viewerSession: viewer,
    chatMessages: messages,
    reactions,
    isLoading,
    error,
    joinStream,
    leaveStream,
    sendMessage,
    sendReaction,
    fetchMessages,
    refreshStream,
  };
}

// Hook for streamers to manage their stream
export function useStreamManager() {
  const [stream, setStream] = useState<LiveStreamState | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new stream
  const createStream = useCallback(
    async (options: {
      title: string;
      description?: string;
      category?: string;
      visibility?: 'public' | 'followers' | 'private' | 'unlisted';
      scheduledStartAt?: Date;
    }) => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await fetch('/api/live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create stream');
        }

        const data = await response.json();
        setStream(data.stream);
        return data.stream;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  // Update stream status
  const updateStatus = useCallback(
    async (streamId: string, status: 'live' | 'ending' | 'ended') => {
      try {
        const response = await fetch(`/api/live/${streamId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update stream');
        }

        const data = await response.json();
        setStream(data.stream);
        return data.stream;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  // Update stream settings
  const updateSettings = useCallback(
    async (
      streamId: string,
      settings: {
        title?: string;
        description?: string;
        chatEnabled?: boolean;
        reactionsEnabled?: boolean;
        slowModeSeconds?: number;
      }
    ) => {
      try {
        const response = await fetch(`/api/live/${streamId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update stream');
        }

        const data = await response.json();
        setStream(data.stream);
        return data.stream;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  // End stream
  const endStream = useCallback(
    async (streamId: string) => {
      return updateStatus(streamId, 'ending');
    },
    [updateStatus]
  );

  // Delete stream
  const deleteStream = useCallback(async (streamId: string) => {
    try {
      const response = await fetch(`/api/live/${streamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete stream');
      }

      setStream(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    stream,
    isCreating,
    error,
    createStream,
    updateStatus,
    updateSettings,
    endStream,
    deleteStream,
  };
}
