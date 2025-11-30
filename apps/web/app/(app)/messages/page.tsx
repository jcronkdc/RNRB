'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Search, Users, Music2, Plus, Check, Zap, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { createBrowserClient } from '@/lib/supabase';

// Dynamically import Ably ChatRoom
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then((m) => m.ChatRoom), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <p style={{ color: 'var(--muted)' }}>Loading chat...</p>
    </div>
  ),
});

type Conversation = {
  id: string;
  otherUserEmail: string;
  otherUserName: string;
  channelName: string;
  lastMessage: string;
  lastMessageTime: string;
};

export default function MessagesPage() {
  const { user, loading } = useRequireAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');

  // Load conversations from user metadata
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (user) {
      // Load direct message conversations
      const dmConversations = user.user_metadata?.dm_conversations || [];
      setConversations(dmConversations);
    }
  }, [user]);

  const generateChannelName = (userEmail: string, otherEmail: string) => {
    // Create consistent channel name regardless of who starts conversation
    const emails = [userEmail, otherEmail].sort();
    return `dm-${emails[0]}-${emails[1]}`.replace(/[@.]/g, '-');
  };

  const startNewConversation = async () => {
    if (!newUserEmail.trim() || !user || !user.email) return;

    const channelName = generateChannelName(user.email, newUserEmail);

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      otherUserEmail: newUserEmail,
      otherUserName: newUserEmail.split('@')[0],
      channelName,
      lastMessage: 'Start chatting...',
      lastMessageTime: new Date().toISOString(),
    };

    const existingConversations = user.user_metadata?.dm_conversations || [];

    // Check if conversation already exists
    const exists = existingConversations.find(
      (c: Conversation) => c.otherUserEmail === newUserEmail
    );
    if (exists) {
      setSelectedConversation(exists);
      setShowNewConversation(false);
      setNewUserEmail('');
      return;
    }

    // Save to user metadata
    const supabase = createBrowserClient();
    if (supabase) {
      await supabase.auth.updateUser({
        data: {
          ...(user.user_metadata || {}),
          dm_conversations: [...existingConversations, newConversation],
        },
      });
    }

    setConversations([...existingConversations, newConversation]);
    setSelectedConversation(newConversation);
    setShowNewConversation(false);
    setNewUserEmail('');
  };

  if (loading) {
    return (
      <div
        className="relative flex h-screen items-center justify-center overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* Animated background while loading - Landing page colors */}
        <div className="absolute inset-0">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
        </div>
        <div className="relative text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div
              className="absolute inset-0 animate-spin rounded-full border-4"
              style={{ borderColor: 'rgba(255, 99, 71, 0.3)', borderTopColor: 'var(--accent)' }}
            />
          </div>
          <p style={{ color: 'var(--muted)' }}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Floating Music Notes */}
      <div className="music-notes-container pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="music-note"
            style={{
              left: `${5 + i * 8}%`,
              animationDelay: `${i * 0.7}s`,
              fontSize: `${18 + (i % 4) * 8}px`,
            }}
          >
            {['♪', '♫', '♬', '♩'][i % 4]}
          </div>
        ))}
      </div>

      {/* Animated Background Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        <div className="gradient-orb-accent"></div>
      </div>

      {/* Hero Grid Pattern */}
      <div className="hero-grid-pattern"></div>

      {/* Header with White RR Logo */}
      <div
        className="relative z-20 flex items-center gap-4 border-b px-6 py-4"
        style={{
          borderColor: 'var(--border)',
          background:
            'linear-gradient(180deg, rgba(30, 30, 30, 0.98) 0%, rgba(22, 22, 22, 0.95) 100%)',
        }}
      >
        <Link href="/" className="group">
          <Image
            src="/logo-light.png"
            alt="Rock N' Roll Basement"
            width={56}
            height={56}
            className="transition-transform group-hover:scale-105"
            style={{
              filter:
                'drop-shadow(0 0 15px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 25px rgba(255, 99, 71, 0.3))',
            }}
          />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            Messages
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Real-time collaboration chat
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Background removed - using CSS classes above */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <motion.div
            className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255, 99, 71, 0.15), transparent)' }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent)' }}
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255, 69, 0, 0.08), transparent)' }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex w-80 flex-col border-r backdrop-blur-xl"
          style={{ borderColor: 'var(--border)', background: 'rgba(42, 42, 42, 0.5)' }}
        >
          {/* Header */}
          <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.15))',
                }}
              >
                <MessageSquare className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                Conversations
              </h2>
            </div>

            {/* Search - Coming Soon */}
            <div className="relative cursor-not-allowed opacity-50">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="text"
                placeholder="Search (coming soon)..."
                disabled
                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm"
                style={{
                  borderColor: 'var(--border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto p-4">
            {conversations.length === 0 ? (
              <div className="py-8 text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.15))',
                  }}
                >
                  <MessageSquare className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                </div>
                <p className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                  No conversations yet
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Start messaging your collaborators
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedConversation(conv)}
                  className="mb-2 w-full rounded-xl p-3 text-left transition-all"
                  style={{
                    border:
                      selectedConversation?.id === conv.id
                        ? '1px solid rgba(255, 99, 71, 0.3)'
                        : '1px solid transparent',
                    background:
                      selectedConversation?.id === conv.id
                        ? 'rgba(255, 99, 71, 0.1)'
                        : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent), #ffd700)',
                        color: 'white',
                      }}
                    >
                      {conv.otherUserName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium" style={{ color: 'var(--text)' }}>
                        {conv.otherUserName}
                      </p>
                      <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                        {conv.otherUserEmail}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>

          {/* Start New Conversation */}
          <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
            {showNewConversation ? (
              <div className="space-y-3">
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text)',
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && startNewConversation()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startNewConversation}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #ff7f50)' }}
                  >
                    <Check className="h-4 w-4" />
                    Start
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowNewConversation(false);
                      setNewUserEmail('');
                    }}
                    className="rounded-xl border px-4 py-2.5 text-sm"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text)',
                    }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNewConversation(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #ff7f50)',
                  boxShadow: '0 4px 20px rgba(255, 99, 71, 0.25)',
                }}
              >
                <Plus className="h-5 w-5" />
                New Conversation
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 flex flex-1 flex-col"
        >
          {selectedConversation ? (
            <div className="flex h-full flex-1 flex-col">
              {/* Chat Header */}
              <div
                className="border-b p-4 backdrop-blur-xl"
                style={{ borderColor: 'var(--border)', background: 'rgba(42, 42, 42, 0.5)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #ffd700)' }}
                  >
                    {selectedConversation.otherUserName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>
                      {selectedConversation.otherUserName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {selectedConversation.otherUserEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ably Chat Room */}
              <div
                className="flex-1 overflow-hidden"
                style={{ background: 'rgba(30, 30, 30, 0.3)' }}
              >
                <ChatRoom channelName={selectedConversation.channelName} />
              </div>

              {/* Info Footer */}
              <div
                className="border-t p-3 backdrop-blur-xl"
                style={{ borderColor: 'var(--border)', background: 'rgba(42, 42, 42, 0.5)' }}
              >
                <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <Zap className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                  Real-time messaging powered by Ably • Messages sync instantly
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-md text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.15))',
                  }}
                >
                  <MessageSquare className="h-12 w-12" style={{ color: 'var(--accent)' }} />
                </motion.div>
                <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  Direct Messaging
                </h2>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Chat 1-on-1 with your collaborators in real-time. Powered by Ably for instant,
                  reliable messaging with typing indicators and presence.
                </p>
                <div className="space-y-3">
                  {[
                    {
                      icon: Users,
                      label: '1-on-1 Conversations',
                      desc: 'Private chats with band members',
                      bgColor: 'rgba(255, 99, 71, 0.15)',
                      iconColor: 'var(--accent)',
                    },
                    {
                      icon: Zap,
                      label: 'Instant Sync',
                      desc: 'Messages appear in real-time',
                      bgColor: 'rgba(255, 215, 0, 0.15)',
                      iconColor: '#ffd700',
                    },
                    {
                      icon: Music2,
                      label: 'Music Collaboration',
                      desc: 'Discuss tracks, lyrics, and ideas',
                      bgColor: 'rgba(255, 127, 80, 0.15)',
                      iconColor: '#ff7f50',
                    },
                  ].map((feature) => (
                    <motion.div
                      key={feature.label}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 rounded-xl border p-4 text-left backdrop-blur-sm"
                      style={{ borderColor: 'var(--border)', background: 'rgba(42, 42, 42, 0.5)' }}
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: feature.bgColor }}
                      >
                        <feature.icon className="h-5 w-5" style={{ color: feature.iconColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                          {feature.label}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {feature.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
