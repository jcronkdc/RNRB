/**
 * Optimized Messages Hook with SWR
 * 
 * Features:
 * - Infinite scroll with cursor-based pagination
 * - Real-time updates via Ably
 * - Optimistic updates
 * - Message deduplication
 * - Smart caching and revalidation
 * - Automatic retry with exponential backoff
 */

import { useEffect, useRef, useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import Ably from 'ably';

type MessageType = 'text' | 'voice' | 'video' | 'file' | 'system';

export type Message = {
  id: string;
  type: MessageType;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  content?: string;
  audioUrl?: string;
  audioDuration?: number;
  waveformData?: number[];
  videoUrl?: string;
  videoDuration?: number;
  videoThumbnail?: string;
  attachments?: any;
  timestamp: Date;
  isEdited?: boolean;
  editedAt?: Date;
  threadId?: string;
  reactions?: Record<string, string[]>;
  mentions?: string[];
  isRead?: boolean;
};

type MessagesResponse = {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

interface UseMessagesOptions {
  channelId: string;
  messageType?: MessageType;
  limit?: number;
  enableRealtime?: boolean;
  onNewMessage?: (message: Message) => void;
}

const fetcher = async (url: string): Promise<MessagesResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
};

export function useMessages({
  channelId,
  messageType,
  limit = 50,
  enableRealtime = true,
  onNewMessage,
}: UseMessagesOptions) {
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Generate SWR key for infinite loading
  const getKey = (pageIndex: number, previousPageData: MessagesResponse | null) => {
    // Reached the end
    if (previousPageData && !previousPageData.hasMore) return null;

    // First page
    if (pageIndex === 0) {
      const params = new URLSearchParams({
        channelId,
        limit: limit.toString(),
      });
      if (messageType) params.append('type', messageType);
      return `/api/chat/messages?${params.toString()}`;
    }

    // Next page with cursor
    if (previousPageData?.nextCursor) {
      const params = new URLSearchParams({
        channelId,
        limit: limit.toString(),
        cursor: previousPageData.nextCursor,
      });
      if (messageType) params.append('type', messageType);
      return `/api/chat/messages?${params.toString()}`;
    }

    return null;
  };

  // Use SWR Infinite for pagination
  const {
    data,
    error,
    size,
    setSize,
    mutate,
    isLoading,
    isValidating,
  } = useSWRInfinite<MessagesResponse>(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    dedupingInterval: 2000, // Dedupe requests within 2 seconds
    errorRetryInterval: 5000,
    errorRetryCount: 3,
  });

  // Flatten all messages from all pages
  const messages = data?.flatMap((page) => page.messages) ?? [];
  const hasMore = data?.[data.length - 1]?.hasMore ?? false;

  // Track message IDs for deduplication
  useEffect(() => {
    messageIdsRef.current = new Set(messages.map((m) => m.id));
  }, [messages]);

  // Load more messages
  const loadMore = useCallback(() => {
    if (!isLoading && !isValidating && hasMore) {
      setSize(size + 1);
    }
  }, [isLoading, isValidating, hasMore, size, setSize]);

  // Add new message (optimistic update)
  const addMessage = useCallback(
    (message: Message) => {
      // Check for duplicates
      if (messageIdsRef.current.has(message.id)) return;
      
      messageIdsRef.current.add(message.id);
      
      // Optimistic update - add to first page
      mutate(
        (data) => {
          if (!data || data.length === 0) return data;
          
          const firstPage = data[0];
          return [
            {
              ...firstPage,
              messages: [...firstPage.messages, message],
            },
            ...data.slice(1),
          ];
        },
        false // Don't revalidate
      );

      onNewMessage?.(message);
    },
    [mutate, onNewMessage]
  );

  // Initialize Ably real-time subscription
  useEffect(() => {
    if (!enableRealtime || !channelId) return;

    const initRealtime = async () => {
      const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
      if (!ablyKey) return;

      try {
        // Create Ably client
        const client = new Ably.Realtime({
          key: ablyKey,
          recover: (lastConnectionDetails, cb) => {
            // Connection recovery for offline support
            cb(true);
          },
        });

        ablyRef.current = client;

        // Subscribe to channel
        const channel = client.channels.get(channelId);
        channelRef.current = channel;

        // Listen for text messages
        channel.subscribe('message', (msg) => {
          const newMessage: Message = {
            id: msg.id || `${Date.now()}-${Math.random()}`,
            type: 'text',
            senderId: msg.clientId || 'unknown',
            senderName: msg.data.senderName || 'Unknown',
            senderEmail: msg.data.senderEmail || '',
            senderAvatar: msg.data.senderAvatar,
            content: msg.data.content,
            timestamp: new Date(msg.timestamp || Date.now()),
            threadId: msg.data.threadId,
            reactions: msg.data.reactions,
            mentions: msg.data.mentions,
          };

          addMessage(newMessage);
        });

        // Listen for voice messages
        channel.subscribe('voice-message', (msg) => {
          const newMessage: Message = {
            id: msg.data.messageId || `${Date.now()}-${Math.random()}`,
            type: 'voice',
            senderId: msg.data.senderId || 'unknown',
            senderName: msg.data.senderName || 'Unknown',
            senderEmail: msg.data.senderEmail || '',
            senderAvatar: msg.data.senderAvatar,
            audioUrl: msg.data.audioUrl,
            audioDuration: msg.data.duration,
            waveformData: msg.data.waveformData,
            timestamp: new Date(msg.data.timestamp || Date.now()),
          };

          addMessage(newMessage);
        });

        // Listen for message updates (edits, reactions, etc.)
        channel.subscribe('message-update', (msg) => {
          mutate(); // Revalidate on updates
        });
      } catch (error) {
        console.error('Failed to initialize Ably:', error);
      }
    };

    initRealtime();

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (ablyRef.current) {
        ablyRef.current.close();
      }
    };
  }, [channelId, enableRealtime, addMessage, mutate]);

  return {
    messages,
    isLoading,
    isValidating,
    error,
    hasMore,
    loadMore,
    refresh: mutate,
    addMessage,
  };
}



