'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Search, Users, Music2, Plus, Check, Zap, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { createBrowserClient } from '@/lib/supabase';

// Dynamically import Ably ChatRoom
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then((m) => m.ChatRoom), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <p className="text-gray-500">Loading chat...</p>
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
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-black">
        {/* Animated background while loading */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
          </div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-black">
      {/* Animated Background Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-600/15 to-transparent blur-3xl"
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
          className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-cyan-600/10 to-transparent blur-3xl"
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
      </div>

      {/* Conversations List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex w-80 flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="border-b border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <MessageSquare className="h-5 w-5 text-purple-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Messages</h1>
          </div>

          {/* Search - Coming Soon */}
          <div className="relative cursor-not-allowed opacity-50">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            <input
              type="text"
              placeholder="Search (coming soon)..."
              disabled
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-4">
          {conversations.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <MessageSquare className="h-8 w-8 text-purple-400" />
              </div>
              <p className="mb-2 font-semibold text-white">No conversations yet</p>
              <p className="text-sm text-gray-500">Start messaging your collaborators</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <motion.button
                key={conv.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedConversation(conv)}
                className={`mb-2 w-full rounded-xl p-3 text-left transition-all ${
                  selectedConversation?.id === conv.id
                    ? 'border border-purple-500/30 bg-purple-500/10'
                    : 'border border-transparent hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 font-semibold text-white">
                    {conv.otherUserName[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{conv.otherUserName}</p>
                    <p className="truncate text-xs text-gray-500">{conv.otherUserEmail}</p>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Start New Conversation */}
        <div className="border-t border-white/10 p-4">
          {showNewConversation ? (
            <div className="space-y-3">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && startNewConversation()}
                autoFocus
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startNewConversation}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white"
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
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/25"
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
            <div className="border-b border-white/10 bg-black/50 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-semibold text-white">
                  {selectedConversation.otherUserName[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedConversation.otherUserName}</p>
                  <p className="text-xs text-gray-500">{selectedConversation.otherUserEmail}</p>
                </div>
              </div>
            </div>

            {/* Ably Chat Room */}
            <div className="flex-1 overflow-hidden bg-black/30">
              <ChatRoom channelName={selectedConversation.channelName} />
            </div>

            {/* Info Footer */}
            <div className="border-t border-white/10 bg-black/50 p-3 backdrop-blur-xl">
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <Zap className="h-3 w-3 text-purple-400" />
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
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20"
              >
                <MessageSquare className="h-12 w-12 text-purple-400" />
              </motion.div>
              <h2 className="mb-3 text-2xl font-bold text-white">Direct Messaging</h2>
              <p className="mb-8 text-gray-400">
                Chat 1-on-1 with your collaborators in real-time. Powered by Ably for instant,
                reliable messaging with typing indicators and presence.
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: Users,
                    label: '1-on-1 Conversations',
                    desc: 'Private chats with band members',
                    color: 'blue',
                  },
                  {
                    icon: Zap,
                    label: 'Instant Sync',
                    desc: 'Messages appear in real-time',
                    color: 'green',
                  },
                  {
                    icon: Music2,
                    label: 'Music Collaboration',
                    desc: 'Discuss tracks, lyrics, and ideas',
                    color: 'purple',
                  },
                ].map((feature) => (
                  <motion.div
                    key={feature.label}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm"
                  >
                    <div
                      className={`bg- flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl${feature.color}-500/20`}
                    >
                      <feature.icon className={`text- h-5 w-5${feature.color}-400`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{feature.label}</p>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
