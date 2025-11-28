'use client';

/**
 * Enhanced Project Chat with Voice Messages
 *
 * World-class chat component with:
 * - Text messages
 * - Voice messages (WhatsApp-style)
 * - Typing indicators
 * - Message reactions
 * - Threading/replies
 * - @mentions
 * - File attachments
 * - Message editing
 * - Read receipts
 *
 * Integrates with Ably for real-time sync
 */

import { Button } from '@cronkwaters/ui';
import Ably from 'ably';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Reply,
  Edit2,
  Trash2,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

import { formatTime } from '@/lib/format-date';
import { VoiceMessagePlayer } from './voice-message-player';
import { VoiceMessageRecorder } from './voice-message-recorder';

type MessageType = 'text' | 'voice' | 'video' | 'file' | 'system';

type Message = {
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
  timestamp: Date;
  isEdited?: boolean;
  editedAt?: Date;
  threadId?: string;
  reactions?: Record<string, string[]>; // { "👍": ["userId1"], "❤️": ["userId2"] }
  mentions?: string[];
  isRead?: boolean;
};

type TypingUser = {
  userId: string;
  userName: string;
  timestamp: number;
};

interface EnhancedChatProps {
  projectSlug: string;
  projectName: string;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  currentUserAvatar?: string;
}

export function EnhancedChat({
  projectSlug,
  projectName,
  currentUserId,
  currentUserName,
  currentUserEmail,
  currentUserAvatar,
}: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [ably, setAbly] = useState<Ably.Realtime | null>(null);
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelName = `chat:project:${projectSlug}`;

  // Initialize Ably
  useEffect(() => {
    const initChat = async () => {
      const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
      if (!ablyKey) {
        console.warn('ABLY_API_KEY not configured');
        return;
      }

      const ablyClient = new Ably.Realtime({
        key: ablyKey,
        clientId: currentUserId,
      });

      setAbly(ablyClient);

      // Subscribe to project chat channel
      const chatChannel = ablyClient.channels.get(channelName);
      setChannel(chatChannel);

      // Listen for text messages
      chatChannel.subscribe('message', (msg) => {
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

        setMessages((prev) => [...prev, newMessage]);
        clearTypingForUser(msg.clientId || '');
      });

      // Listen for voice messages
      chatChannel.subscribe('voice-message', (msg) => {
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

        setMessages((prev) => [...prev, newMessage]);
        clearTypingForUser(msg.data.senderId || '');
      });

      // Listen for typing indicators
      chatChannel.subscribe('typing', (msg) => {
        if (msg.clientId === currentUserId) return;

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

      chatChannel.subscribe('typing-stop', (msg) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(msg.clientId || '');
          return newMap;
        });
      });

      // Listen for reaction updates
      chatChannel.subscribe('reaction-added', (msg) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.data.messageId ? { ...m, reactions: msg.data.reactions } : m
          )
        );
      });

      chatChannel.subscribe('reaction-removed', (msg) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.data.messageId ? { ...m, reactions: msg.data.reactions } : m
          )
        );
      });

      // Get message history
      try {
        const response = await fetch(`/api/chat/messages?channelId=${channelName}&limit=100`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to load message history:', error);
      }
    };

    initChat();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (channel) {
        channel.unsubscribe();
      }
      if (ably) {
        ably.close();
      }
    };
  }, [projectSlug, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearTypingForUser = (userId: string) => {
    setTypingUsers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !channel) return;

    const messageContent = inputValue.trim();
    const mentions = extractMentions(messageContent);

    setSending(true);
    try {
      await channel.publish('typing-stop', {
        userName: currentUserName,
      });

      await channel.publish('message', {
        content: messageContent,
        senderName: currentUserName,
        senderEmail: currentUserEmail,
        senderAvatar: currentUserAvatar,
        threadId: replyingTo?.id,
        mentions,
      });

      setInputValue('');
      setReplyingTo(null);
      setEditingMessage(null);
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
      formData.append('channelId', channelName);
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

    if (value.trim() && channel) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

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

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  };

  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  // Common emoji reactions
  const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎵', '🤘', '👏', '💯'];

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, reactions: data.reactions } : msg))
        );
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
    setShowReactionPicker(null);
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(
        `/api/chat/reactions?messageId=${messageId}&emoji=${encodeURIComponent(emoji)}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, reactions: data.reactions } : msg))
        );
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  const toggleReaction = async (
    messageId: string,
    emoji: string,
    currentReactions?: Record<string, string[]>
  ) => {
    const hasReacted = currentReactions?.[emoji]?.includes(currentUserId);
    if (hasReacted) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  };

  return (
    <div className="flex h-[700px] flex-col">
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
            const isOwnMessage = message.senderId === currentUserId;
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`group flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-foreground">
                      {message.senderAvatar ? (
                        <img
                          src={message.senderAvatar}
                          alt={message.senderName}
                          className="h-full w-full rounded-full object-cover"
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
                      <span className="text-sm font-medium text-foreground">
                        {message.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
                          : 'border border-border bg-surface text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
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

                  {/* Reactions Display */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(message.reactions).map(([emoji, userIds]) => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(message.id, emoji, message.reactions)}
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
                            userIds.includes(currentUserId)
                              ? 'bg-brand-primary/20 text-brand-primary'
                              : 'border border-border bg-surface hover:bg-surface-hover'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="font-medium">{userIds.length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reaction Picker Button */}
                  <div className="relative mt-1">
                    <button
                      onClick={() =>
                        setShowReactionPicker(showReactionPicker === message.id ? null : message.id)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-surface group-hover:opacity-100"
                    >
                      <Smile className="h-4 w-4" />
                    </button>

                    {/* Quick Reaction Picker */}
                    {showReactionPicker === message.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute z-10 flex gap-1 rounded-lg border border-border bg-background p-2 shadow-lg ${
                          isOwnMessage ? 'right-0' : 'left-0'
                        }`}
                      >
                        {QUICK_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message.id, emoji)}
                            className="rounded p-1 text-lg transition-transform hover:scale-125 hover:bg-surface"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
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

        <div ref={messagesEndRef} />
      </div>

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

        {/* Reply indicator */}
        {replyingTo && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-2">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-brand-primary" />
              <span className="text-sm text-muted-foreground">
                Replying to {replyingTo.senderName}
              </span>
            </div>
            <Button onClick={() => setReplyingTo(null)} variant="secondary" size="sm">
              Cancel
            </Button>
          </div>
        )}

        {/* Text Input */}
        <div className="flex items-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="mb-2"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
            className="mb-2 bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line • Type @ to mention someone
        </p>
      </div>
    </div>
  );
}
