'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, Pin, Crown, Shield, Star } from '@/components/ui/custom-icons';
import Image from 'next/image';
import { useEffect, useRef, useState, FormEvent } from 'react';

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

interface LiveChatProps {
  messages: ChatMessage[];
  onSend: (message: string, replyToId?: string) => Promise<void>;
  disabled?: boolean;
  slowModeSeconds?: number;
  isAuthenticated: boolean;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  streamer: <Crown className="h-4 w-4 text-yellow-400" />,
  moderator: <Shield className="h-4 w-4 text-green-500" />,
  subscriber: <Star className="h-4 w-4 text-purple-400" />,
  vip: <Star className="h-4 w-4 text-blue-400" />,
};

function MessageItem({
  message,
  onReply,
}: {
  message: ChatMessage;
  onReply?: (id: string) => void;
}) {
  const isSystem = message.type === 'system';
  const isHighlight = message.type === 'highlight' || message.type === 'tip';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-2 text-center"
      >
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/40">
          {message.message}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-2 rounded-lg px-3 py-1.5 ${isHighlight ? 'border border-yellow-500/30 bg-linear-to-r from-yellow-500/20 to-orange-500/20' : 'hover:bg-white/5'} ${message.isPinned ? 'border border-purple-500/30 bg-purple-500/10' : ''} group`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {message.sender.avatar ? (
          <Image
            src={message.sender.avatar}
            alt={message.sender.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
            {message.sender.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Badges */}
          {message.badges.map((badge) => (
            <span key={badge} title={badge}>
              {BADGE_ICONS[badge]}
            </span>
          ))}

          {/* Pinned indicator */}
          {message.isPinned && <Pin className="h-3 w-3 text-purple-400" />}

          {/* Name */}
          <span className="text-sm font-semibold" style={{ color: message.color || '#fff' }}>
            {message.sender.name}
          </span>

          {/* Tip amount */}
          {message.type === 'tip' && (
            <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-400">
              Tipped
            </span>
          )}
        </div>

        {/* Message text */}
        <p className="wrap-break-word text-sm text-white/90">{message.message}</p>
      </div>

      {/* Reply button */}
      {onReply && (
        <button
          onClick={() => onReply(message.id)}
          className="text-white/40 opacity-0 transition-opacity hover:text-white/80 group-hover:opacity-100"
        >
          <span className="text-xs">Reply</span>
        </button>
      )}
    </motion.div>
  );
}

export function LiveChat({
  messages,
  onSend,
  disabled,
  slowModeSeconds = 0,
  isAuthenticated,
}: LiveChatProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled || isSending || cooldown > 0) return;

    setIsSending(true);
    setError(null);

    try {
      await onSend(input.trim(), replyingTo || undefined);
      setInput('');
      setReplyingTo(null);

      // Apply slow mode cooldown
      if (slowModeSeconds > 0) {
        setCooldown(slowModeSeconds);
      }
    } catch (err: any) {
      setError(err.message);

      // Handle specific errors
      if (err.message.includes('wait')) {
        const match = err.message.match(/(\d+)/);
        if (match) setCooldown(parseInt(match[1]));
      }
    } finally {
      setIsSending(false);
    }
  };

  // Get pinned message
  const pinnedMessage = messages.find((m) => m.isPinned);
  const regularMessages = messages.filter((m) => !m.isPinned);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="font-semibold text-white">Live Chat</h3>
        <div className="flex items-center gap-2 text-xs text-white/50">
          {slowModeSeconds > 0 && <span>Slow mode: {slowModeSeconds}s</span>}
          <span>{messages.length} messages</span>
        </div>
      </div>

      {/* Pinned message */}
      <AnimatePresence>
        {pinnedMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 bg-purple-500/10"
          >
            <div className="px-3 py-2">
              <div className="mb-1 flex items-center gap-1 text-xs text-purple-400">
                <Pin className="h-3 w-3" />
                <span>Pinned</span>
              </div>
              <p className="text-sm text-white">{pinnedMessage.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto py-2">
        {regularMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onReply={isAuthenticated ? setReplyingTo : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-white/5 px-4 py-2"
          >
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Replying to message...</span>
              <button onClick={() => setReplyingTo(null)} className="hover:text-white">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="border-t border-white/10 p-3">
        {!isAuthenticated ? (
          <p className="py-2 text-center text-sm text-white/50">Sign in to chat</p>
        ) : disabled ? (
          <p className="py-2 text-center text-sm text-white/50">Chat is disabled</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : 'Say something...'}
              disabled={isSending || cooldown > 0}
              maxLength={500}
              className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-hidden disabled:opacity-50"
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isSending || cooldown > 0}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </form>
        )}

        {/* Error message */}
        {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
