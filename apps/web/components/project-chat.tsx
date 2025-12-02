'use client';

import { Button } from '@cronkwaters/ui';
import type { RealtimeChannel } from 'ably';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, MoreVertical } from '@/components/ui/custom-icons';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';

import { useAblyClient } from '@/hooks/use-ably-client';
import { formatTime } from '@/lib/format-date';

type Message = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  timestamp: Date;
  avatar?: string;
};

type TypingUser = {
  userId: string;
  userName: string;
  timestamp: number;
};

interface ProjectChatProps {
  projectSlug: string;
  projectName: string;
}

export function ProjectChat({ projectSlug, projectName }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Get current user from session
  const { data: session } = useSession();
  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        avatar: session.user.image,
      }
    : null;

  // Use shared Ably client from AblyProvider (NO separate connections!)
  const { client: ablyClient, isConnected } = useAblyClient(currentUser?.id);

  // Initialize chat channel when shared client is ready
  useEffect(() => {
    if (!currentUser?.id || !ablyClient || !isConnected) return;

    let mounted = true;

    const initChat = async () => {
      try {
        // Subscribe to project chat channel
        const chatChannel = ablyClient.channels.get(`chat:project:${projectSlug}`);
        channelRef.current = chatChannel;

        // Listen for new messages
        chatChannel.subscribe('message', (message) => {
          if (!mounted) return;

          const newMessage: Message = {
            id: message.id || `${Date.now()}-${Math.random()}`,
            userId: message.clientId || 'unknown',
            userName: message.data.userName || 'Unknown',
            userEmail: message.data.userEmail || '',
            content: message.data.content,
            timestamp: new Date(message.timestamp || Date.now()),
            avatar: message.data.avatar,
          };

          setMessages((prev) => [...prev, newMessage]);

          // Clear typing indicator for this user when they send a message
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(message.clientId || '');
            return newMap;
          });
        });

        // Listen for typing indicators
        chatChannel.subscribe('typing', (message) => {
          if (!mounted) return;

          const typingUser: TypingUser = {
            userId: message.clientId || 'unknown',
            userName: message.data.userName || 'Unknown',
            timestamp: Date.now(),
          };

          // Don't show own typing indicator
          if (typingUser.userId === currentUser.id) return;

          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(typingUser.userId, typingUser);
            return newMap;
          });

          // Auto-remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newMap = new Map(prev);
              // Only remove if timestamp hasn't been updated (no new typing events)
              const current = newMap.get(typingUser.userId);
              if (current && current.timestamp === typingUser.timestamp) {
                newMap.delete(typingUser.userId);
              }
              return newMap;
            });
          }, 3000);
        });

        // Listen for typing stopped
        chatChannel.subscribe('typing-stop', (message) => {
          if (!mounted) return;
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(message.clientId || '');
            return newMap;
          });
        });

        // Get message history (last 50 messages)
        const history = await chatChannel.history({ limit: 50 });
        if (mounted && history && history.items.length > 0) {
          const historicalMessages: Message[] = history.items.reverse().map((msg: any) => ({
            id: msg.id || `${Date.now()}-${Math.random()}`,
            userId: msg.clientId || 'unknown',
            userName: msg.data.userName || 'Unknown',
            userEmail: msg.data.userEmail || '',
            content: msg.data.content,
            timestamp: new Date(msg.timestamp || Date.now()),
            avatar: msg.data.avatar,
          }));

          setMessages(historicalMessages);
        }
      } catch (error) {
        console.error('Chat initialization error:', error);
      }
    };

    initChat();

    // Cleanup - only unsubscribe, don't close shared client
    return () => {
      mounted = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }
    };
  }, [projectSlug, currentUser?.id, ablyClient, isConnected]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !channelRef.current || !currentUser) return;

    setSending(true);
    try {
      // Send typing-stop event
      await channelRef.current.publish('typing-stop', {
        userName: currentUser.name,
      });

      await channelRef.current.publish('message', {
        content: inputValue.trim(),
        userName: currentUser.name,
        userEmail: currentUser.email,
        avatar: currentUser.avatar,
      });

      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Broadcast typing indicator
    if (value.trim() && channelRef.current && currentUser) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing event
      channelRef.current.publish('typing', {
        userName: currentUser.name,
      });

      // Auto-stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        channelRef.current?.publish('typing-stop', {
          userName: currentUser.name,
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

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Project Chat</h3>
          <p className="text-sm text-muted-foreground">{projectName}</p>
        </div>
        <Button variant="secondary" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwnMessage = message.userId === currentUser.id;
            const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-foreground">
                      {message.avatar ? (
                        <img
                          src={message.avatar}
                          alt={message.userName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        message.userName[0].toUpperCase()
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
                      <span className="text-sm font-medium text-foreground">
                        {message.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-brand-primary text-brand-primary-foreground'
                        : 'border border-border bg-surface text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

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
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="h-2 w-2 rounded-full bg-brand-primary"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="h-2 w-2 rounded-full bg-brand-primary"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="h-2 w-2 rounded-full bg-brand-primary"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {Array.from(typingUsers.values()).length === 1
                  ? `${Array.from(typingUsers.values())[0].userName} is typing...`
                  : `${Array.from(typingUsers.values()).length} people are typing...`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border pt-4">
        <div className="flex items-end gap-2">
          <Button variant="secondary" size="sm" className="mb-2">
            <Paperclip className="h-4 w-4" />
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
            />
          </div>
          <Button variant="secondary" size="sm" className="mb-2">
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
            className="mb-2 bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
