'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Users,
  Archive,
  Trash2,
  Pin,
  BellOff,
  Bell,
  MoreVertical,
  Check,
  X,
  Loader2,
  ChevronRight,
  Shield,
  Flag,
  UserX,
  RotateCcw,
  Inbox,
  Filter,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

type FilterType = 'all' | 'unread' | 'archived' | 'trash';

interface Conversation {
  id: string;
  type: string;
  participant: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    type: string;
  } | null;
  unreadCount: number;
  isArchived: boolean;
  isDeleted: boolean;
  isMuted: boolean;
  isPinned: boolean;
  isBlocked: boolean;
  updatedAt: string;
}

export default function MessagesInboxPage() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get('filter') as FilterType) || 'all';

  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    fetchConversations();
    fetchRequestCount();
  }, [filter]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestCount = async () => {
    try {
      const response = await fetch('/api/messages/requests');
      if (response.ok) {
        const data = await response.json();
        setRequestCount(data.count || 0);
      }
    } catch {
      // Ignore
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAction = useCallback(
    async (conversationId: string, action: string, value?: boolean) => {
      setProcessingAction(`${conversationId}-${action}`);
      try {
        let response;

        switch (action) {
          case 'archive':
            response = await fetch(`/api/messages/conversations/${conversationId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ archive: value ?? true }),
            });
            break;

          case 'delete':
            response = await fetch(`/api/messages/conversations/${conversationId}`, {
              method: 'DELETE',
            });
            break;

          case 'permanentDelete':
            response = await fetch(`/api/messages/conversations/${conversationId}?permanent=true`, {
              method: 'DELETE',
            });
            break;

          case 'restore':
            response = await fetch(`/api/messages/conversations/${conversationId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ restore: true }),
            });
            break;

          case 'mute':
            response = await fetch(`/api/messages/conversations/${conversationId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mute: value ?? true }),
            });
            break;

          case 'pin':
            response = await fetch(`/api/messages/conversations/${conversationId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pin: value ?? true }),
            });
            break;

          case 'block':
            response = await fetch(`/api/messages/conversations/${conversationId}/block`, {
              method: 'POST',
            });
            break;

          case 'unblock':
            response = await fetch(`/api/messages/conversations/${conversationId}/block`, {
              method: 'DELETE',
            });
            break;
        }

        if (response?.ok) {
          // Refresh conversations
          fetchConversations();
        }
      } catch (error) {
        console.error('Error performing action:', error);
      } finally {
        setProcessingAction(null);
        setShowContextMenu(null);
      }
    },
    []
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filterCounts = {
    all: conversations.filter((c) => !c.isArchived && !c.isDeleted).length,
    unread: conversations.filter((c) => c.unreadCount > 0).length,
    archived: conversations.filter((c) => c.isArchived).length,
    trash: conversations.filter((c) => c.isDeleted).length,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex justify-center"
          >
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </motion.div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                style={{
                  display: 'flex',
                  height: '56px',
                  width: '56px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
                }}
              >
                <MessageSquare style={{ height: '28px', width: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                  Messages
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  {conversations.length} conversations
                </p>
              </div>
            </div>

            {/* Message Requests Button */}
            <Link href="/social/messages/requests">
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: requestCount > 0 ? 'var(--accent)' : 'var(--bg)',
                  border: requestCount > 0 ? 'none' : '1px solid var(--border)',
                  color: requestCount > 0 ? 'white' : 'var(--text)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                }}
              >
                <Shield className="h-4 w-4" />
                Message Requests
                {requestCount > 0 && (
                  <span
                    style={{
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '9999px',
                      backgroundColor: requestCount > 0 ? 'white' : 'var(--accent)',
                      color: requestCount > 0 ? 'var(--accent)' : 'white',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {requestCount}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mt-6">
            <Search
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '20px',
                width: '20px',
                color: 'var(--muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search messages..."
              style={{
                width: '100%',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                padding: '14px 48px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            {isSearching && (
              <Loader2
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin"
                style={{ color: 'var(--muted)' }}
              />
            )}
          </div>

          {/* Filter Tabs */}
          <div className="mt-4 flex gap-2">
            {(['all', 'unread', 'archived', 'trash'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  backgroundColor: filter === f ? 'var(--accent)' : 'var(--bg)',
                  color: filter === f ? 'white' : 'var(--text)',
                  border: filter === f ? 'none' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'all' && <Inbox className="h-4 w-4" />}
                {f === 'unread' && <MessageSquare className="h-4 w-4" />}
                {f === 'archived' && <Archive className="h-4 w-4" />}
                {f === 'trash' && <Trash2 className="h-4 w-4" />}
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Search Results */}
        {searchQuery.length >= 2 && searchResults.length > 0 && (
          <div
            className="mb-6 rounded-xl"
            style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
              <h3 style={{ fontWeight: '600', color: 'var(--text)' }}>
                Search Results ({searchResults.length})
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/messages?channel=${result.conversationId}`}
                  className="flex items-center gap-4 p-4 transition-all hover:bg-white/5"
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg)',
                      flexShrink: 0,
                    }}
                  >
                    {result.participant?.image ? (
                      <img
                        src={result.participant.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Users style={{ height: '16px', width: '16px', color: 'var(--muted)' }} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p style={{ fontWeight: '500', color: 'var(--text)', fontSize: '0.875rem' }}>
                      {result.participant?.name || 'Unknown'}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      dangerouslySetInnerHTML={{ __html: result.highlight }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {formatTime(result.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : conversations.length === 0 ? (
          <div
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--panel)',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            {filter === 'all' && (
              <Inbox className="mx-auto mb-4 h-16 w-16" style={{ color: 'var(--muted)' }} />
            )}
            {filter === 'unread' && (
              <MessageSquare className="mx-auto mb-4 h-16 w-16" style={{ color: 'var(--muted)' }} />
            )}
            {filter === 'archived' && (
              <Archive className="mx-auto mb-4 h-16 w-16" style={{ color: 'var(--muted)' }} />
            )}
            {filter === 'trash' && (
              <Trash2 className="mx-auto mb-4 h-16 w-16" style={{ color: 'var(--muted)' }} />
            )}
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '8px',
              }}
            >
              {filter === 'all' && 'No conversations yet'}
              {filter === 'unread' && 'All caught up!'}
              {filter === 'archived' && 'No archived conversations'}
              {filter === 'trash' && 'Trash is empty'}
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              {filter === 'all' && 'Start a conversation with someone!'}
              {filter === 'unread' && 'You have no unread messages'}
              {filter === 'archived' && 'Archived conversations will appear here'}
              {filter === 'trash' && 'Deleted conversations will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
                style={{
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  backgroundColor:
                    conversation.unreadCount > 0 ? 'var(--accent-dim)' : 'var(--panel)',
                  overflow: 'hidden',
                }}
              >
                <Link
                  href={`/messages?channel=${conversation.id}`}
                  className="flex items-center gap-4 p-4 transition-all hover:bg-white/5"
                >
                  {/* Pinned/Muted Indicators */}
                  {(conversation.isPinned || conversation.isMuted) && (
                    <div className="absolute left-2 top-2 flex gap-1">
                      {conversation.isPinned && (
                        <Pin className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                      )}
                      {conversation.isMuted && (
                        <BellOff className="h-3 w-3" style={{ color: 'var(--muted)' }} />
                      )}
                    </div>
                  )}

                  {/* Avatar */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg)',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {conversation.participant.image ? (
                      <img
                        src={conversation.participant.image}
                        alt={conversation.participant.name || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Users style={{ height: '24px', width: '24px', color: 'var(--muted)' }} />
                      </div>
                    )}
                    {conversation.isBlocked && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                      >
                        <UserX className="h-5 w-5" style={{ color: '#ef4444' }} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        style={{
                          fontWeight: conversation.unreadCount > 0 ? '700' : '500',
                          color: 'var(--text)',
                        }}
                      >
                        {conversation.participant.name || 'Unknown'}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: conversation.unreadCount > 0 ? 'var(--text)' : 'var(--muted)',
                        fontWeight: conversation.unreadCount > 0 ? '500' : '400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <div
                      style={{
                        minWidth: '24px',
                        height: '24px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </div>
                  )}
                </Link>

                {/* Context Menu Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowContextMenu(
                      showContextMenu === conversation.id ? null : conversation.id
                    );
                  }}
                  className="absolute right-4 top-4 rounded-lg p-2 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: 'var(--bg)' }}
                >
                  <MoreVertical className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                </button>

                {/* Context Menu */}
                <AnimatePresence>
                  {showContextMenu === conversation.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-4 top-14 z-50 min-w-[200px] rounded-xl shadow-lg"
                      style={{
                        backgroundColor: 'var(--panel)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {/* Pin/Unpin */}
                      <button
                        onClick={() => handleAction(conversation.id, 'pin', !conversation.isPinned)}
                        disabled={processingAction === `${conversation.id}-pin`}
                        className="flex w-full items-center gap-3 px-4 py-3 transition-all hover:bg-white/5"
                      >
                        <Pin className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                        <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                          {conversation.isPinned ? 'Unpin' : 'Pin'} conversation
                        </span>
                      </button>

                      {/* Mute/Unmute */}
                      <button
                        onClick={() => handleAction(conversation.id, 'mute', !conversation.isMuted)}
                        disabled={processingAction === `${conversation.id}-mute`}
                        className="flex w-full items-center gap-3 px-4 py-3 transition-all hover:bg-white/5"
                      >
                        {conversation.isMuted ? (
                          <Bell className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                        ) : (
                          <BellOff className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                        )}
                        <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                          {conversation.isMuted ? 'Unmute' : 'Mute'} notifications
                        </span>
                      </button>

                      {/* Archive/Unarchive */}
                      {filter !== 'trash' && (
                        <button
                          onClick={() =>
                            handleAction(conversation.id, 'archive', !conversation.isArchived)
                          }
                          disabled={processingAction === `${conversation.id}-archive`}
                          className="flex w-full items-center gap-3 px-4 py-3 transition-all hover:bg-white/5"
                        >
                          <Archive className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                          <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                            {conversation.isArchived ? 'Unarchive' : 'Archive'}
                          </span>
                        </button>
                      )}

                      {/* Restore from Trash */}
                      {filter === 'trash' && (
                        <button
                          onClick={() => handleAction(conversation.id, 'restore')}
                          disabled={processingAction === `${conversation.id}-restore`}
                          className="flex w-full items-center gap-3 px-4 py-3 transition-all hover:bg-white/5"
                        >
                          <RotateCcw className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                          <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                            Restore
                          </span>
                        </button>
                      )}

                      <div style={{ borderTop: '1px solid var(--border)' }} />

                      {/* Block/Unblock */}
                      <button
                        onClick={() =>
                          handleAction(
                            conversation.id,
                            conversation.isBlocked ? 'unblock' : 'block'
                          )
                        }
                        disabled={processingAction?.startsWith(`${conversation.id}-block`)}
                        className="flex w-full items-center gap-3 px-4 py-3 transition-all hover:bg-white/5"
                      >
                        <UserX className="h-4 w-4" style={{ color: '#f59e0b' }} />
                        <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                          {conversation.isBlocked ? 'Unblock' : 'Block'} user
                        </span>
                      </button>

                      {/* Report */}
                      <Link href={`/social/messages/report?conversation=${conversation.id}`}>
                        <button className="flex w-full items-center gap-3 px-4 py-3 transition-all hover:bg-white/5">
                          <Flag className="h-4 w-4" style={{ color: '#f59e0b' }} />
                          <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                            Report conversation
                          </span>
                        </button>
                      </Link>

                      <div style={{ borderTop: '1px solid var(--border)' }} />

                      {/* Delete */}
                      <button
                        onClick={() =>
                          handleAction(
                            conversation.id,
                            filter === 'trash' ? 'permanentDelete' : 'delete'
                          )
                        }
                        disabled={processingAction === `${conversation.id}-delete`}
                        className="flex w-full items-center gap-3 px-4 py-3 transition-all hover:bg-white/5"
                      >
                        <Trash2 className="h-4 w-4" style={{ color: '#ef4444' }} />
                        <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                          {filter === 'trash' ? 'Delete permanently' : 'Move to trash'}
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close context menu */}
      {showContextMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowContextMenu(null)} />
      )}
    </div>
  );
}
