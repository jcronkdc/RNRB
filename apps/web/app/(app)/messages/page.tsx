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
  Zap
} from 'lucide-react';

// Dynamically import Ably ChatRoom
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then(m => m.ChatRoom), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Loading chat...</p>
    </div>
  )
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
      lastMessageTime: new Date().toISOString()
    };

    const existingConversations = user.user_metadata?.dm_conversations || [];
    
    // Check if conversation already exists
    const exists = existingConversations.find((c: Conversation) => c.otherUserEmail === newUserEmail);
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
        dm_conversations: [...existingConversations, newConversation]
      }
    });

    setConversations([...existingConversations, newConversation]);
    setSelectedConversation(newConversation);
    setShowNewConversation(false);
    setNewUserEmail('');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Conversations List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-80 border-r flex flex-col border-border"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-primary" />
            Direct Messages
          </h1>
          
          {/* Search - Coming Soon */}
          <div className="relative opacity-50 cursor-not-allowed">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search (coming soon)..."
              disabled
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border text-foreground"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50 text-brand-primary" />
              <p className="font-medium mb-2">No conversations yet</p>
              <p className="text-sm text-muted-foreground">
                Start messaging your collaborators
              </p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 rounded-lg mb-2 text-left transition-all ${
                  selectedConversation?.id === conv.id 
                    ? 'bg-brand-primary/10 border border-brand-primary/20' 
                    : 'hover:bg-surface-muted border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {conv.otherUserName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.otherUserName}</p>
                    <p className="text-xs truncate text-muted-foreground">
                      {conv.otherUserEmail}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Start New Conversation */}
        <div className="p-4 border-t border-border">
          {showNewConversation ? (
            <div className="space-y-2">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm"
                onKeyPress={(e) => e.key === 'Enter' && startNewConversation()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={startNewConversation}
                  className="flex-1 px-3 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Start
                </button>
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setNewUserEmail('');
                  }}
                  className="px-3 py-2 bg-surface hover:bg-surface-muted border border-border rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewConversation(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
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
        className="flex-1 flex flex-col"
      >
        {selectedConversation ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.otherUserName[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selectedConversation.otherUserName}</p>
                  <p className="text-xs text-muted-foreground">{selectedConversation.otherUserEmail}</p>
                </div>
              </div>
            </div>

            {/* Ably Chat Room */}
            <div className="flex-1 overflow-hidden">
              <ChatRoom channelName={selectedConversation.channelName} />
            </div>

            {/* Info Footer */}
            <div className="p-3 border-t border-border bg-surface/50">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Zap className="w-3 h-3 text-brand-primary" />
                Real-time messaging powered by Ably • Messages sync instantly
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.05) 100%)' }}
              >
                <MessageSquare className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Direct Messaging</h2>
              <p className="mb-6 text-muted-foreground">
                Chat 1-on-1 with your collaborators in real-time. Powered by Ably for instant, 
                reliable messaging with typing indicators and presence.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-surface border border-border rounded-lg text-left">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1-on-1 Conversations</p>
                    <p className="text-xs text-muted-foreground">Private chats with band members</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-surface border border-border rounded-lg text-left">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Instant Sync</p>
                    <p className="text-xs text-muted-foreground">Messages appear in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-surface border border-border rounded-lg text-left">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Music2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Music Collaboration</p>
                    <p className="text-xs text-muted-foreground">Discuss tracks, lyrics, and ideas</p>
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