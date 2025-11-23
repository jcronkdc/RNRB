'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRequireAuth } from '@/hooks/use-require-auth';
import {
  MessageSquare,
  Search,
  Send,
  Users,
  Music2,
  Paperclip,
  Smile,
  Plus,
  Check,
  Zap,
} from 'lucide-react';

// Dynamically import Ably ChatRoom
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then((m) => m.ChatRoom), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">Loading chat...</p>
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
  const [messageText, setMessageText] = useState('');
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
    if (!newUserEmail.trim() || !user) return;

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
    await supabase!.auth.updateUser({
      data: {
        ...user.user_metadata,
        dm_conversations: [...existingConversations, newConversation],
      },
    });

    setConversations([...existingConversations, newConversation]);
    setSelectedConversation(newConversation);
    setShowNewConversation(false);
    setNewUserEmail('');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Conversations List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-80 flex-col border-r border-border"
      >
        {/* Header */}
        <div className="border-b border-border p-4">
          <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="h-6 w-6 text-brand-primary" />
            Direct Messages
          </h1>

          {/* Search - Coming Soon */}
          <div className="relative cursor-not-allowed opacity-50">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="Search (coming soon)..."
              disabled
              className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-foreground"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-4">
          {conversations.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 text-brand-primary opacity-50" />
              <p className="mb-2 font-medium">No conversations yet</p>
              <p className="text-sm text-muted-foreground">Start messaging your collaborators</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`mb-2 w-full rounded-lg p-3 text-left transition-all ${
                  selectedConversation?.id === conv.id
                    ? 'border border-brand-primary/20 bg-brand-primary/10'
                    : 'border border-transparent hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 font-semibold text-white">
                    {conv.otherUserName[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{conv.otherUserName}</p>
                    <p className="truncate text-xs text-muted-foreground">{conv.otherUserEmail}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Start New Conversation */}
        <div className="border-t border-border p-4">
          {showNewConversation ? (
            <div className="space-y-2">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && startNewConversation()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={startNewConversation}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:bg-brand-primary/90"
                >
                  <Check className="h-4 w-4" />
                  Start
                </button>
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setNewUserEmail('');
                  }}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewConversation(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 font-medium text-white hover:bg-brand-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Conversation
            </button>
          )}
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-1 flex-col"
      >
        {selectedConversation ? (
          <div className="flex h-full flex-1 flex-col">
            {/* Chat Header */}
            <div className="border-b border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 font-semibold text-white">
                  {selectedConversation.otherUserName[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selectedConversation.otherUserName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.otherUserEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Ably Chat Room */}
            <div className="flex-1 overflow-hidden">
              <ChatRoom channelName={selectedConversation.channelName} />
            </div>

            {/* Info Footer */}
            <div className="border-t border-border bg-surface/50 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-brand-primary" />
                Real-time messaging powered by Ably • Messages sync instantly
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.05) 100%)',
                }}
              >
                <MessageSquare className="h-12 w-12 text-purple-400" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold">Direct Messaging</h2>
              <p className="mb-6 text-muted-foreground">
                Chat 1-on-1 with your collaborators in real-time. Powered by Ably for instant,
                reliable messaging with typing indicators and presence.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-left">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">1-on-1 Conversations</p>
                    <p className="text-xs text-muted-foreground">Private chats with band members</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-left">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <Zap className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Instant Sync</p>
                    <p className="text-xs text-muted-foreground">Messages appear in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-left">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                    <Music2 className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Music Collaboration</p>
                    <p className="text-xs text-muted-foreground">
                      Discuss tracks, lyrics, and ideas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
