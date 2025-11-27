/**
 * Optimized Messages Hook with SWR
 *
 * Features:
 * - Infinite scroll with cursor-based pagination
 * - Real-time updates via Ably (using shared client)
 * - Optimistic updates
 * - Message deduplication
 * - Smart caching and revalidation
 * - Automatic retry with exponential backoff
 */

import { useEffect, useRef, useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import type { RealtimeChannel } from 'ably';

import { useAblyClient } from './use-ably-client';

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
  userId?: string; // Required for real-time updates
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
  userId,
  messageType,
  limit = 50,
  enableRealtime = true,
  onNewMessage,
}: UseMessagesOptions) {
  // Use shared Ably client instead of creating separate connection
  const { client: ablyClient, isConnected: ablyConnected } = useAblyClient(
    enableRealtime ? userId : undefined
  );
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

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
  const { data, error, size, setSize, mutate, isLoading, isValidating } =
    useSWRInfinite<MessagesResponse>(getKey, fetcher, {
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

  // Initialize Ably real-time subscription using shared client
  useEffect(() => {
    if (!enableRealtime || !channelId || !ablyClient || !ablyConnected) return;

    mountedRef.current = true;

    try {
      // Subscribe to channel using shared client
      const channel = ablyClient.channels.get(channelId);
      channelRef.current = channel;

      // Listen for text messages
      channel.subscribe('message', (msg) => {
        if (!mountedRef.current) return;

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
        if (!mountedRef.current) return;

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
      channel.subscribe('message-update', () => {
        if (!mountedRef.current) return;
        mutate(); // Revalidate on updates
      });
    } catch (error) {
      console.error('Failed to subscribe to Ably channel:', error);
    }

    // Cleanup - only unsubscribe, don't close shared client
    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {
          // Ignore unsubscribe errors during cleanup
        }
        channelRef.current = null;
      }
    };
  }, [channelId, enableRealtime, ablyClient, ablyConnected, addMessage, mutate]);

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
