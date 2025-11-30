'use client';

import { Button, Input } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { formatTime } from '@/lib/format-date';

interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userImage?: string;
  createdAt: Date;
}

interface RoomChatProps {
  roomId: string;
  currentUser: {
    id: string;
    name: string;
    image?: string;
  };
  onSendMessage: (content: string) => Promise<void>;
  messages: Message[];
}

export default function RoomChat({ roomId, currentUser, onSendMessage, messages }: RoomChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      await onSendMessage(messageContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface">
      {/* Chat Header */}
      <div className="border-b border-border p-4">
        <h3 className="font-semibold text-foreground">Room Chat</h3>
        <p className="text-sm text-muted-foreground">{messages.length} messages</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isOwnMessage = message.userId === currentUser.id;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.userImage ? (
                    <img
                      src={message.userImage}
                      alt={message.userName}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="bg-primary/20 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                      {message.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex max-w-[70%] flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{isOwnMessage ? 'You' : message.userName}</span>
                    <span>{formatTime(message.createdAt)}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="lg"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
