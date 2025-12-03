'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Users,
  Music2,
  Plus,
  Check,
  Zap,
  X,
  Folder,
  Hash,
  Send,
  Loader2,
  ChevronRight,
  Filter,
  Star,
  Pin,
  Archive,
  Settings,
  Sparkles,
  Bell,
  BellOff,
  MoreVertical,
  Trash2,
  UserPlus,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { createBrowserClient } from '@/lib/supabase';
import { EmptyStateInline } from '@/components/workshop';
import { useAblyClient } from '@/hooks/use-ably-client';
import { formatRelativeTime } from '@/lib/format-date';

// Dynamically import Ably ChatRoom for real-time messaging
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then((m) => m.ChatRoom), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
        />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Loading chat...
        </p>
      </div>
    </div>
  ),
});

// Types
type ConversationType = 'direct' | 'project' | 'band' | 'group';

type Conversation = {
  id: string;
  type: ConversationType;
  name: string;
  channelName: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  participants: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }[];
  // For project/band conversations
  entityId?: string;
  entitySlug?: string;
};

type Project = {
  id: string;
  name: string;
  slug: string;
  cover_image?: string;
  memberCount: number;
};

type Band = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  memberCount: number;
};

type TabType = 'all' | 'direct' | 'projects' | 'bands';

export default function MessagesPage() {
  const { user, loading } = useRequireAuth();
  const { client: ablyClient, isConnected } = useAblyClient(user?.id);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [contextMenuConversation, setContextMenuConversation] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load conversations and projects
  useEffect(() => {
    if (!user) return;

    // Load DM conversations from user metadata
    const dmConversations = user.user_metadata?.dm_conversations || [];
    const formattedDMConversations: Conversation[] = dmConversations.map((conv: any) => ({
      id: conv.id,
      type: 'direct' as ConversationType,
      name: conv.otherUserName || conv.otherUserEmail?.split('@')[0] || 'Unknown',
      channelName: conv.channelName,
      lastMessage: conv.lastMessage || 'Start chatting...',
      lastMessageTime: conv.lastMessageTime || new Date().toISOString(),
      unreadCount: conv.unreadCount || 0,
      isPinned: conv.isPinned || false,
      isMuted: conv.isMuted || false,
      participants: [
        {
          id: conv.otherUserId || conv.id,
          name: conv.otherUserName || conv.otherUserEmail?.split('@')[0] || 'Unknown',
          email: conv.otherUserEmail,
          avatarUrl: conv.otherUserAvatar,
        },
      ],
    }));

    setConversations(formattedDMConversations);

    // Load user's projects for group chats
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            cover_image: p.cover_image,
            memberCount: p.collaborator_count || 1,
          }))
        );

        // Add project conversations
        const projectConversations: Conversation[] = data.map((p: any) => ({
          id: `project-${p.id}`,
          type: 'project' as ConversationType,
          name: p.name,
          channelName: `chat:project:${p.slug}`,
          avatarUrl: p.cover_image,
          lastMessage: 'Project chat',
          lastMessageTime: p.updated_at || new Date().toISOString(),
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          participants: [],
          entityId: p.id,
          entitySlug: p.slug,
        }));

        setConversations((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newConvs = projectConversations.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newConvs];
        });
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Filter conversations based on tab and search
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by tab
    if (activeTab !== 'all') {
      const typeMap: Record<TabType, ConversationType | ConversationType[]> = {
        all: ['direct', 'project', 'band', 'group'],
        direct: 'direct',
        projects: 'project',
        bands: 'band',
      };
      const targetType = typeMap[activeTab];
      filtered = filtered.filter((c) =>
        Array.isArray(targetType) ? targetType.includes(c.type) : c.type === targetType
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.participants.some(
            (p) => p.name.toLowerCase().includes(query) || p.email.toLowerCase().includes(query)
          )
      );
    }

    // Sort: pinned first, then by last message time
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });
  }, [conversations, activeTab, searchQuery]);

  // Generate channel name for DMs
  const generateChannelName = (userEmail: string, otherEmail: string) => {
    const emails = [userEmail, otherEmail].sort();
    return `dm-${emails[0]}-${emails[1]}`.replace(/[@.]/g, '-');
  };

  // Start new conversation
  const startNewConversation = async () => {
    if (!newUserEmail.trim() || !user?.email) return;

    const channelName = generateChannelName(user.email, newUserEmail);

    // Check if conversation already exists
    const existing = conversations.find(
      (c) =>
        c.type === 'direct' && c.participants.some((p) => p.email === newUserEmail.toLowerCase())
    );

    if (existing) {
      setSelectedConversation(existing);
      setShowNewConversation(false);
      setNewUserEmail('');
      setShowMobileList(false);
      return;
    }

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      type: 'direct',
      name: newUserEmail.split('@')[0],
      channelName,
      lastMessage: 'Start chatting...',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      participants: [
        {
          id: `user_${Date.now()}`,
          name: newUserEmail.split('@')[0],
          email: newUserEmail.toLowerCase(),
        },
      ],
    };

    // Save to user metadata
    const supabase = createBrowserClient();
    if (supabase) {
      const existingConvs = user.user_metadata?.dm_conversations || [];
      await supabase.auth.updateUser({
        data: {
          ...(user.user_metadata || {}),
          dm_conversations: [
            ...existingConvs,
            {
              id: newConversation.id,
              otherUserEmail: newUserEmail.toLowerCase(),
              otherUserName: newUserEmail.split('@')[0],
              channelName,
              lastMessage: 'Start chatting...',
              lastMessageTime: new Date().toISOString(),
            },
          ],
        },
      });
    }

    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setShowNewConversation(false);
    setNewUserEmail('');
    setShowMobileList(false);
  };

  // Toggle pin conversation
  const togglePin = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isPinned: !c.isPinned } : c))
    );
    setContextMenuConversation(null);
  }, []);

  // Toggle mute conversation
  const toggleMute = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isMuted: !c.isMuted } : c))
    );
    setContextMenuConversation(null);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(
    async (convId: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (selectedConversation?.id === convId) {
        setSelectedConversation(null);
        setShowMobileList(true);
      }
      setContextMenuConversation(null);

      // Also remove from user metadata if it's a DM
      const conv = conversations.find((c) => c.id === convId);
      if (conv?.type === 'direct') {
        const supabase = createBrowserClient();
        if (supabase && user) {
          const existingConvs = user.user_metadata?.dm_conversations || [];
          await supabase.auth.updateUser({
            data: {
              ...(user.user_metadata || {}),
              dm_conversations: existingConvs.filter((c: any) => c.id !== convId),
            },
          });
        }
      }
    },
    [conversations, selectedConversation, user]
  );

  // Get conversation avatar
  const getConversationAvatar = (conv: Conversation) => {
    if (conv.avatarUrl) {
      return (
        <img
          src={conv.avatarUrl}
          alt={conv.name}
          className="h-full w-full rounded-full object-cover"
        />
      );
    }

    if (conv.type === 'project') {
      return <Folder className="h-5 w-5" style={{ color: 'var(--accent)' }} />;
    }

    if (conv.type === 'band') {
      return <Users className="h-5 w-5" style={{ color: '#ffd700' }} />;
    }

    // For direct messages, show initial
    return (
      <span className="text-sm font-semibold text-white">{conv.name[0]?.toUpperCase() || '?'}</span>
    );
  };

  // Get type icon
  const getTypeIcon = (type: ConversationType) => {
    switch (type) {
      case 'project':
        return <Folder className="h-3 w-3" style={{ color: 'var(--accent)' }} />;
      case 'band':
        return <Users className="h-3 w-3" style={{ color: '#ffd700' }} />;
      case 'group':
        return <Hash className="h-3 w-3" style={{ color: 'var(--sage)' }} />;
      default:
        return null;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        if (showNewConversation) {
          setShowNewConversation(false);
          setNewUserEmail('');
        }
        if (contextMenuConversation) {
          setContextMenuConversation(null);
        }
        if (isSearchFocused) {
          searchInputRef.current?.blur();
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNewConversation, contextMenuConversation, isSearchFocused]);

  // Loading state
  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="border-3 h-10 w-10 animate-spin rounded-full"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Loading your conversations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header with Logo [[memory:11700420]] */}
      <div
        className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={48}
              height={48}
              className="transition-opacity group-hover:opacity-80"
            />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              Messages
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {filteredConversations.length} conversations
              </p>
              {isConnected && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-500">Live</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewConversation(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Message</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <AnimatePresence mode="wait">
          {(showMobileList || window.innerWidth >= 768) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex w-full flex-col border-r md:w-80 lg:w-96 ${
                !showMobileList ? 'hidden md:flex' : 'flex'
              }`}
              style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
            >
              {/* Search & Tabs */}
              <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
                {/* Search */}
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: 'var(--muted)' }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search conversations... (⌘K)"
                    className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: isSearchFocused ? 'var(--accent)' : 'var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg)' }}>
                  {[
                    { id: 'all', label: 'All', icon: MessageSquare },
                    { id: 'direct', label: 'Direct', icon: Users },
                    { id: 'projects', label: 'Projects', icon: Folder },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all"
                      style={{
                        background: activeTab === tab.id ? 'var(--panel)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--text)' : 'var(--muted)',
                        boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4">
                    {searchQuery ? (
                      <EmptyStateInline
                        text={`No conversations matching "${searchQuery}"`}
                        action="Clear Search"
                        onAction={() => setSearchQuery('')}
                      />
                    ) : activeTab === 'projects' ? (
                      <EmptyStateInline
                        text="No project conversations yet. Create a project to start collaborating."
                        action="New Project"
                        actionHref="/projects/new"
                      />
                    ) : (
                      <EmptyStateInline
                        text="The best collaborations start with a simple hello."
                        action="Find Musicians"
                        actionHref="/discover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {filteredConversations.map((conv) => (
                      <div key={conv.id} className="relative">
                        <motion.button
                          whileHover={{ backgroundColor: 'rgba(255, 99, 71, 0.05)' }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            setSelectedConversation(conv);
                            setShowMobileList(false);
                          }}
                          className="w-full p-4 text-left transition-all"
                          style={{
                            background:
                              selectedConversation?.id === conv.id
                                ? 'rgba(255, 99, 71, 0.1)'
                                : 'transparent',
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div
                              className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                              style={{
                                background:
                                  conv.type === 'project'
                                    ? 'rgba(255, 99, 71, 0.15)'
                                    : conv.type === 'band'
                                      ? 'rgba(255, 215, 0, 0.15)'
                                      : 'linear-gradient(135deg, var(--accent), #ffd700)',
                              }}
                            >
                              {getConversationAvatar(conv)}
                              {/* Online indicator */}
                              {conv.type === 'direct' && (
                                <span
                                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 bg-green-500"
                                  style={{ borderColor: 'var(--panel)' }}
                                />
                              )}
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                {conv.isPinned && (
                                  <Pin className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                                )}
                                {getTypeIcon(conv.type)}
                                <span
                                  className="truncate font-medium"
                                  style={{ color: 'var(--text)' }}
                                >
                                  {conv.name}
                                </span>
                                {conv.isMuted && (
                                  <BellOff className="h-3 w-3" style={{ color: 'var(--muted)' }} />
                                )}
                              </div>
                              <p className="truncate text-sm" style={{ color: 'var(--muted)' }}>
                                {conv.lastMessage}
                              </p>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                                {formatRelativeTime(conv.lastMessageTime)}
                              </span>
                              {conv.unreadCount > 0 && (
                                <span
                                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white"
                                  style={{ background: 'var(--accent)' }}
                                >
                                  {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.button>

                        {/* Context Menu Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenuConversation(
                              contextMenuConversation === conv.id ? null : conv.id
                            );
                          }}
                          className="absolute right-2 top-2 rounded-lg p-2 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
                          style={{ color: 'var(--muted)' }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Context Menu */}
                        <AnimatePresence>
                          {contextMenuConversation === conv.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-2 top-10 z-50 w-48 rounded-xl border shadow-lg"
                              style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
                            >
                              <div className="p-1">
                                <button
                                  onClick={() => togglePin(conv.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
                                  style={{ color: 'var(--text)' }}
                                >
                                  <Pin className="h-4 w-4" />
                                  {conv.isPinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button
                                  onClick={() => toggleMute(conv.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
                                  style={{ color: 'var(--text)' }}
                                >
                                  {conv.isMuted ? (
                                    <Bell className="h-4 w-4" />
                                  ) : (
                                    <BellOff className="h-4 w-4" />
                                  )}
                                  {conv.isMuted ? 'Unmute' : 'Mute'}
                                </button>
                                {conv.type === 'direct' && (
                                  <button
                                    onClick={() => deleteConversation(conv.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-red-500/10"
                                    style={{ color: 'var(--error)' }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                )}
                                {conv.type === 'project' && conv.entitySlug && (
                                  <Link
                                    href={`/projects/${conv.entitySlug}`}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
                                    style={{ color: 'var(--text)' }}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                    View Project
                                  </Link>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* New Conversation Button (Mobile) */}
              <div className="border-t p-4 md:hidden" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  <Plus className="h-5 w-5" />
                  New Conversation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`relative z-10 flex flex-1 flex-col ${showMobileList ? 'hidden md:flex' : 'flex'}`}
        >
          {selectedConversation ? (
            <div className="flex h-full flex-1 flex-col">
              {/* Chat Header */}
              <div
                className="flex items-center justify-between border-b p-4 backdrop-blur-xl"
                style={{ borderColor: 'var(--border)', background: 'rgba(42, 42, 42, 0.8)' }}
              >
                <div className="flex items-center gap-3">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => {
                      setSelectedConversation(null);
                      setShowMobileList(true);
                    }}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10 md:hidden"
                  >
                    <ChevronRight
                      className="h-5 w-5 rotate-180"
                      style={{ color: 'var(--muted)' }}
                    />
                  </button>

                  {/* Avatar */}
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background:
                        selectedConversation.type === 'project'
                          ? 'rgba(255, 99, 71, 0.15)'
                          : selectedConversation.type === 'band'
                            ? 'rgba(255, 215, 0, 0.15)'
                            : 'linear-gradient(135deg, var(--accent), #ffd700)',
                    }}
                  >
                    {getConversationAvatar(selectedConversation)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(selectedConversation.type)}
                      <p className="font-semibold" style={{ color: 'var(--text)' }}>
                        {selectedConversation.name}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {selectedConversation.type === 'project'
                        ? 'Project Chat'
                        : selectedConversation.type === 'band'
                          ? 'Band Chat'
                          : selectedConversation.participants[0]?.email || 'Direct Message'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {selectedConversation.type === 'project' && selectedConversation.entitySlug && (
                    <Link
                      href={`/projects/${selectedConversation.entitySlug}`}
                      className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      View Project
                    </Link>
                  )}
                  <button
                    onClick={() => toggleMute(selectedConversation.id)}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    title={selectedConversation.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {selectedConversation.isMuted ? (
                      <BellOff className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                    ) : (
                      <Bell className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Chat Room */}
              <div
                className="flex-1 overflow-hidden"
                style={{ background: 'rgba(30, 30, 30, 0.3)' }}
              >
                <ChatRoom
                  channelName={selectedConversation.channelName}
                  userName={user?.name || user?.email?.split('@')[0] || 'Anonymous'}
                />
              </div>

              {/* Info Footer */}
              <div
                className="border-t p-3 backdrop-blur-xl"
                style={{ borderColor: 'var(--border)', background: 'rgba(42, 42, 42, 0.5)' }}
              >
                <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <Zap className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                  Real-time messaging powered by Ably • Messages sync instantly
                  {selectedConversation.type === 'project' && (
                    <span className="ml-auto">
                      <Sparkles className="mr-1 inline h-3 w-3" style={{ color: '#a855f7' }} />
                      AI Assistant available
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-lg text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-3xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.15))',
                  }}
                >
                  <MessageSquare className="h-14 w-14" style={{ color: 'var(--accent)' }} />
                </motion.div>

                <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  Rock N' Roll Messaging
                </h2>

                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Stay connected with your collaborators. Chat 1-on-1 or in project group chats with
                  real-time messaging, typing indicators, and AI assistance.
                </p>

                <div className="mb-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
                  {[
                    {
                      icon: Users,
                      label: 'Direct Messages',
                      desc: 'Private 1-on-1 conversations',
                      bgColor: 'rgba(255, 99, 71, 0.15)',
                      iconColor: 'var(--accent)',
                    },
                    {
                      icon: Folder,
                      label: 'Project Chats',
                      desc: 'Collaborate with your team',
                      bgColor: 'rgba(255, 215, 0, 0.15)',
                      iconColor: '#ffd700',
                    },
                    {
                      icon: Zap,
                      label: 'Real-Time Sync',
                      desc: 'Messages appear instantly',
                      bgColor: 'rgba(255, 127, 80, 0.15)',
                      iconColor: '#ff7f50',
                    },
                    {
                      icon: Sparkles,
                      label: 'AI Assistant',
                      desc: 'Get help with chords & theory',
                      bgColor: 'rgba(168, 85, 247, 0.15)',
                      iconColor: '#a855f7',
                    },
                  ].map((feature) => (
                    <motion.div
                      key={feature.label}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 rounded-xl border p-4 backdrop-blur-sm"
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

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => setShowNewConversation(true)}
                    className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Plus className="h-5 w-5" />
                    Start New Conversation
                  </button>
                  <Link
                    href="/discover"
                    className="flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold transition-all hover:bg-white/5"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <Users className="h-5 w-5" />
                    Find Musicians
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => {
              setShowNewConversation(false);
              setNewUserEmail('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border p-6"
              style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255, 99, 71, 0.15)' }}
                  >
                    <UserPlus className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    New Conversation
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setNewUserEmail('');
                  }}
                  className="rounded-lg p-2 transition-colors hover:bg-white/10"
                >
                  <X className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--text)' }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && startNewConversation()}
                    autoFocus
                  />
                </div>

                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Enter the email of a Rock N' Roll Basement user to start chatting.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowNewConversation(false);
                      setNewUserEmail('');
                    }}
                    className="flex-1 rounded-xl border px-4 py-3 font-medium transition-colors hover:bg-white/5"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startNewConversation}
                    disabled={!newUserEmail.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-50"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Send className="h-4 w-4" />
                    Start Chat
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
