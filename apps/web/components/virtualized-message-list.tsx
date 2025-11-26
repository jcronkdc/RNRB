'use client';

/**
 * Virtualized Message List Component
 * 
 * High-performance message list with:
 * - Virtual scrolling for thousands of messages
 * - Automatic scroll-to-bottom on new messages
 * - Infinite scroll pagination
 * - Optimized rendering with React.memo
 * - Intersection Observer for lazy loading
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { formatTime } from '@/lib/format-date';
import { VoiceMessagePlayer } from './voice-message-player';
import type { Message } from '@/hooks/use-messages';

interface VirtualizedMessageListProps {
  messages: Message[];
  currentUserId: string;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
}

// Memoized message item for better performance
const MessageItem = memo(({
  message,
  isOwnMessage,
  showAvatar,
}: {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex gap-3 px-4 py-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          <div className="bg-brand-primary/20 text-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
            {message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                className="h-full w-full rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              message.senderName[0].toUpperCase()
            )}
          </div>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex max-w-[70%] flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
      >
        {showAvatar && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-foreground text-sm font-medium">
              {message.senderName}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        {/* Text Message */}
        {message.type === 'text' && (
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'border-border bg-surface text-foreground border'
            }`}
          >
            <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
            {message.isEdited && (
              <span className="text-xs opacity-60 mt-1 block">(edited)</span>
            )}
          </div>
        )}

        {/* Voice Message */}
        {message.type === 'voice' && message.audioUrl && (
          <VoiceMessagePlayer
            audioUrl={message.audioUrl}
            duration={message.audioDuration || 0}
            waveformData={message.waveformData || []}
            className="min-w-[300px]"
          />
        )}

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="mt-1 flex gap-1">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <div
                key={emoji}
                className="bg-surface-muted border-border flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{users.length}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

MessageItem.displayName = 'MessageItem';

export function VirtualizedMessageList({
  messages,
  currentUserId,
  hasMore,
  isLoading,
  onLoadMore,
  className = '',
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAutoScrolling = useRef(true);
  const previousMessageCount = useRef(messages.length);

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 80, []), // Estimated row height
    overscan: 10, // Render 10 extra items above/below viewport
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (parentRef.current) {
      const scrollOptions: ScrollToOptions = {
        top: parentRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      };
      parentRef.current.scrollTo(scrollOptions);
      isAutoScrolling.current = true;
    }
  }, []);

  // Auto-scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    const newMessageCount = messages.length;
    const messagesAdded = newMessageCount > previousMessageCount.current;
    
    if (messagesAdded && isAutoScrolling.current) {
      // Delay to allow rendering
      setTimeout(() => scrollToBottom(true), 100);
    }
    
    previousMessageCount.current = newMessageCount;
  }, [messages.length, scrollToBottom]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!parentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show scroll button if not at bottom
    setShowScrollButton(distanceFromBottom > 100);

    // Disable auto-scroll if user scrolls up
    if (distanceFromBottom > 100) {
      isAutoScrolling.current = false;
    } else {
      isAutoScrolling.current = true;
    }

    // Load more when scrolling near top
    if (scrollTop < 200 && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, []); // Only on mount

  return (
    <div className={`relative flex-1 ${className}`}>
      {/* Messages container with virtual scrolling */}
      <div
        ref={parentRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Loading indicator at top */}
          {isLoading && (
            <div className="sticky top-0 z-10 flex justify-center py-2">
              <div className="bg-surface border-border rounded-full border px-4 py-2 text-sm">
                Loading messages...
              </div>
            </div>
          )}

          {/* Virtualized messages */}
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages[virtualRow.index];
            const previousMessage = messages[virtualRow.index - 1];
            const isOwnMessage = message.senderId === currentUserId;
            const showAvatar =
              virtualRow.index === 0 || previousMessage?.senderId !== message.senderId;

            return (
              <div
                key={message.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MessageItem
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 right-4"
          >
            <Button
              onClick={() => scrollToBottom(true)}
              size="sm"
              className="shadow-lg"
              variant="secondary"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



