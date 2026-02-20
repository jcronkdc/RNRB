'use client';

/**
 * Optimized Enhanced Project Chat
 *
 * Performance features:
 * - Virtual scrolling with @tanstack/react-virtual
 * - Cursor-based pagination via SWR Infinite
 * - Uses shared Ably client from AblyProvider (NO separate connections!)
 * - Batch read receipts
 * - Lazy loading of media
 * - Message deduplication
 * - Optimistic updates
 * - Smart caching and revalidation
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MoreVertical, Loader2, WifiOff } from '@/components/ui/custom-icons';
import { useEffect, useState, useRef } from 'react';

import { VirtualizedMessageList } from './virtualized-message-list';
import { VoiceMessageRecorder } from './voice-message-recorder';

import { useAblyClient } from '@/hooks/use-ably-client';
import { useMessages } from '@/hooks/use-messages';
import { useReadReceipts } from '@/lib/read-receipts';

interface OptimizedChatProps {
  projectSlug: string;
  projectName: string;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  currentUserAvatar?: string;
}

type TypingUser = {
  userId: string;
  userName: string;
  timestamp: number;
};

export function OptimizedChat({
  projectSlug,
  projectName,
  currentUserId,
  currentUserName,
  currentUserEmail,
  currentUserAvatar,
}: OptimizedChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelId = `chat:project:${projectSlug}`;

  // Use shared Ably client from AblyProvider (NO separate connections!)
  const { client: ablyClient, isConnected, status } = useAblyClient(currentUserId);
  const isDisconnected =
    status === 'error' || status === 'disconnected' || status === 'unavailable';

  // Optimized message loading with SWR Infinite
  const {
    messages,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    addMessage: addOptimisticMessage,
  } = useMessages({
    channelId,
    userId: currentUserId,
    enableRealtime: true,
    onNewMessage: (message) => {
      // Clear typing indicator when message is received
      if (message.senderId !== currentUserId) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(message.senderId);
          return newMap;
        });
      }
    },
  });

  // Read receipts tracking
  const { observeMessage, syncReceipts } = useReadReceipts({
    channelId,
    userId: currentUserId,
    onMarkAsRead: () => {
      // Read receipts synced
    },
  });

  // Subscribe to typing indicators using shared Ably client
  useEffect(() => {
    if (!ablyClient || !isConnected) return;

    let mounted = true;
    const channel = ablyClient.channels.get(channelId);

    // Subscribe to typing events
    channel.subscribe('typing', (msg) => {
      if (!mounted || msg.clientId === currentUserId) return;

      const typingUser: TypingUser = {
        userId: msg.clientId || 'unknown',
        userName: msg.data.userName || 'Unknown',
        timestamp: Date.now(),
      };

      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(typingUser.userId, typingUser);
        return newMap;
      });

      setTimeout(() => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(typingUser.userId);
          if (current && current.timestamp === typingUser.timestamp) {
            newMap.delete(typingUser.userId);
          }
          return newMap;
        });
      }, 3000);
    });

    channel.subscribe('typing-stop', (msg) => {
      if (!mounted) return;
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(msg.clientId || '');
        return newMap;
      });
    });

    return () => {
      mounted = false;
      try {
        channel.unsubscribe('typing');
        channel.unsubscribe('typing-stop');
      } catch {
        // Ignore cleanup errors
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [ablyClient, isConnected, channelId, currentUserId]);

  // Sync read receipts on unmount
  useEffect(() => {
    return () => {
      syncReceipts();
    };
  }, [syncReceipts]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !ablyClient || !isConnected) return;

    const messageContent = inputValue.trim();
    setSending(true);

    try {
      const channel = ablyClient.channels.get(channelId);

      // Stop typing indicator
      await channel.publish('typing-stop', {
        userName: currentUserName,
      });

      // Publish message
      await channel.publish('message', {
        content: messageContent,
        senderName: currentUserName,
        senderEmail: currentUserEmail,
        senderAvatar: currentUserAvatar,
      });

      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleVoiceMessageSend = async (
    audioBlob: Blob,
    duration: number,
    waveformData: number[]
  ) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('channelId', channelId);
      formData.append('channelType', 'project');
      formData.append('duration', duration.toString());
      formData.append('waveformData', JSON.stringify(waveformData));

      const response = await fetch('/api/chat/voice-message', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send voice message');
      }

      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() && ablyClient && isConnected) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Publish typing indicator
      const channel = ablyClient.channels.get(channelId);
      channel.publish('typing', {
        userName: currentUserName,
      });

      typingTimeoutRef.current = setTimeout(() => {
        channel.publish('typing-stop', {
          userName: currentUserName,
        });
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[700px] flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Project Chat</h3>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {projectName}
            {isDisconnected && (
              <span className="flex items-center gap-1 text-xs text-yellow-500">
                <WifiOff className="h-3 w-3" />
                Reconnecting...
              </span>
            )}
            {isConnected && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
            )}
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Virtualized Messages List */}
      <VirtualizedMessageList
        messages={messages}
        currentUserId={currentUserId}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={loadMore}
        className="flex-1"
      />

      {/* Typing Indicators */}
      <AnimatePresence>
        {typingUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-3 py-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="h-2 w-2 rounded-full bg-brand-primary"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {Array.from(typingUsers.values()).length === 1
                ? `${Array.from(typingUsers.values())[0].userName} is typing...`
                : `${Array.from(typingUsers.values()).length} people are typing...`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="space-y-3 border-t border-border pt-4">
        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <VoiceMessageRecorder
            onSend={handleVoiceMessageSend}
            maxDuration={300}
            className="mb-3"
          />
        )}

        {/* Text Input */}
        <div className="flex items-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="mb-2"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
          >
            🎙️
          </Button>
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isDisconnected}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending || isDisconnected}
            className="mb-2 bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line • Type @ to mention someone
        </p>
      </div>
    </div>
  );
}
