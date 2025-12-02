'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  Inbox,
  Send,
  File,
  Trash2,
  Star,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Tag,
  X,
  Plus,
  Settings,
  Loader2,
  CheckCircle,
  Circle,
  Clock,
  Users,
  Music,
  Mic,
  Calendar,
  Edit3,
} from '@/components/ui/custom-icons';

// Types
interface Mailbox {
  id: string;
  name: string;
  role?: string;
  totalMessages: number;
  unreadMessages: number;
  icon: typeof Inbox;
  color?: string;
}

interface EmailMessage {
  id: string;
  threadId: string;
  from: { name?: string; email: string }[];
  to: { name?: string; email: string }[];
  subject: string;
  preview: string;
  receivedAt: string;
  hasAttachment: boolean;
  isUnread: boolean;
  isFlagged: boolean;
}

interface FullEmail {
  id: string;
  subject: string;
  from: { name?: string; email: string }[];
  to: { name?: string; email: string }[];
  cc?: { name?: string; email: string }[];
  receivedAt: string;
  htmlBody?: string;
  textBody?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
  }[];
}

// Default mailboxes with musician-specific folders
const DEFAULT_MAILBOXES: Mailbox[] = [
  { id: 'inbox', name: 'Inbox', role: 'inbox', totalMessages: 0, unreadMessages: 0, icon: Inbox },
  {
    id: 'starred',
    name: 'Starred',
    role: 'flagged',
    totalMessages: 0,
    unreadMessages: 0,
    icon: Star,
    color: '#fbbf24',
  },
  { id: 'sent', name: 'Sent', role: 'sent', totalMessages: 0, unreadMessages: 0, icon: Send },
  { id: 'drafts', name: 'Drafts', role: 'drafts', totalMessages: 0, unreadMessages: 0, icon: File },
  {
    id: 'spam',
    name: 'Spam',
    role: 'junk',
    totalMessages: 0,
    unreadMessages: 0,
    icon: AlertCircle,
  },
  { id: 'trash', name: 'Trash', role: 'trash', totalMessages: 0, unreadMessages: 0, icon: Trash2 },
];

// Musician-specific labels
const MUSICIAN_LABELS = [
  { id: 'booking', name: 'Booking', icon: Calendar, color: '#22c55e' },
  { id: 'fan-mail', name: 'Fan Mail', icon: Users, color: '#ec4899' },
  { id: 'press', name: 'Press', icon: Mic, color: '#3b82f6' },
  { id: 'collaborations', name: 'Collaborations', icon: Music, color: '#f59e0b' },
];

export default function WebmailPage() {
  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  // Mail state
  const [mailboxes, setMailboxes] = useState<Mailbox[]>(DEFAULT_MAILBOXES);
  const [selectedMailbox, setSelectedMailbox] = useState<string>('inbox');
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<FullEmail | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sending, setSending] = useState(false);

  // Check if user has email account
  useEffect(() => {
    async function checkAccount() {
      try {
        const response = await fetch('/api/email/account');
        const data = await response.json();

        setHasAccount(data.hasAccount);
        if (data.hasAccount) {
          setEmailAddress(data.account.emailAddress);
          // In production, fetch actual mailbox data here
        }
      } catch (error) {
        console.error('Error checking email account:', error);
      } finally {
        setLoading(false);
      }
    }
    checkAccount();
  }, []);

  // Fetch messages when mailbox changes
  useEffect(() => {
    if (!hasAccount || !selectedMailbox) return;

    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        // In production, this would call /api/email/messages
        // For now, show demo data
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Demo messages
        const demoMessages: EmailMessage[] = [
          {
            id: '1',
            threadId: '1',
            from: [{ name: 'Blue Note Records', email: 'booking@bluenote.com' }],
            to: [{ email: emailAddress }],
            subject: 'RE: Booking Inquiry - Summer Jazz Festival 2025',
            preview:
              "Thank you for your interest in performing at our festival. We'd love to discuss the details further...",
            receivedAt: new Date(Date.now() - 3600000).toISOString(),
            hasAttachment: true,
            isUnread: true,
            isFlagged: true,
          },
          {
            id: '2',
            threadId: '2',
            from: [{ name: 'Sarah (Fan)', email: 'sarah.music.lover@gmail.com' }],
            to: [{ email: emailAddress }],
            subject: 'Your music changed my life! 🎵',
            preview:
              'I just had to reach out and tell you how much your latest album has meant to me during a difficult time...',
            receivedAt: new Date(Date.now() - 7200000).toISOString(),
            hasAttachment: false,
            isUnread: true,
            isFlagged: false,
          },
          {
            id: '3',
            threadId: '3',
            from: [{ name: 'Rolling Stone Magazine', email: 'press@rollingstone.com' }],
            to: [{ email: emailAddress }],
            subject: 'Interview Request - Emerging Artists Feature',
            preview:
              "We're working on a feature about emerging artists in the indie scene and would love to include you...",
            receivedAt: new Date(Date.now() - 86400000).toISOString(),
            hasAttachment: false,
            isUnread: false,
            isFlagged: true,
          },
          {
            id: '4',
            threadId: '4',
            from: [{ name: 'Jake Williams', email: 'jake.w.music@outlook.com' }],
            to: [{ email: emailAddress }],
            subject: 'Collab idea - got some beats you might like',
            preview:
              'Hey! Been following your work for a while. I produce hip-hop beats and I think we could make something amazing...',
            receivedAt: new Date(Date.now() - 172800000).toISOString(),
            hasAttachment: true,
            isUnread: false,
            isFlagged: false,
          },
          {
            id: '5',
            threadId: '5',
            from: [{ name: 'Spotify for Artists', email: 'artists@spotify.com' }],
            to: [{ email: emailAddress }],
            subject: 'Your Weekly Stats - 50K+ streams this week!',
            preview:
              "Congratulations! Your music reached over 50,000 streams this week. Here's your breakdown...",
            receivedAt: new Date(Date.now() - 259200000).toISOString(),
            hasAttachment: false,
            isUnread: false,
            isFlagged: false,
          },
        ];

        setMessages(demoMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [hasAccount, selectedMailbox, emailAddress]);

  // Load full message
  const loadMessage = useCallback(
    async (messageId: string) => {
      setLoadingMessage(true);
      try {
        // In production, call /api/email/messages/[id]
        await new Promise((resolve) => setTimeout(resolve, 300));

        const message = messages.find((m) => m.id === messageId);
        if (message) {
          setSelectedMessage({
            id: message.id,
            subject: message.subject,
            from: message.from,
            to: message.to,
            receivedAt: message.receivedAt,
            htmlBody: `
            <div style="font-family: sans-serif; line-height: 1.6;">
              <p>Hi there,</p>
              <p>${message.preview}</p>
              <p>Looking forward to hearing from you!</p>
              <p>Best regards,<br>${message.from[0]?.name || message.from[0]?.email}</p>
            </div>
          `,
          });
        }
      } catch (error) {
        console.error('Error loading message:', error);
      } finally {
        setLoadingMessage(false);
      }
    },
    [messages]
  );

  // Send email
  const handleSend = async () => {
    if (!composeTo || !composeSubject) return;

    setSending(true);
    try {
      // In production, call /api/email/send
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset compose
      setShowCompose(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // No email account - redirect to setup
  if (!hasAccount) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-6 px-4"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #ff6347, #ffd700)' }}
          >
            <Mail className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Get Your RNRB Email
          </h1>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            Professional email for musicians at @rnrb.me
          </p>
          <Link
            href="/settings/email"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Mail className="h-5 w-5" />
            Set Up Email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 60 : 240 }}
        className="flex flex-col border-r"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        {/* Logo & Compose */}
        <div className="p-4">
          {!sidebarCollapsed && (
            <div className="mb-4 flex items-center gap-2">
              <Link href="/">
                <Image
                  src="/logo-dark.png"
                  alt="RNRB"
                  width={80}
                  height={30}
                  className="hover:opacity-80"
                />
              </Link>
              <span className="bg-[var(--accent)]/20 rounded-full px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                Mail
              </span>
            </div>
          )}

          <button
            onClick={() => setShowCompose(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Edit3 className="h-5 w-5" />
            {!sidebarCollapsed && 'Compose'}
          </button>
        </div>

        {/* Mailboxes */}
        <nav className="flex-1 overflow-y-auto px-2">
          {mailboxes.map((mailbox) => {
            const Icon = mailbox.icon;
            const isActive = selectedMailbox === mailbox.id;

            return (
              <button
                key={mailbox.id}
                onClick={() => setSelectedMailbox(mailbox.id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isActive ? 'bg-[var(--accent)]/10' : 'hover:bg-white/5'
                }`}
              >
                <Icon
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: mailbox.color || (isActive ? 'var(--accent)' : 'var(--muted)') }}
                />
                {!sidebarCollapsed && (
                  <>
                    <span
                      className="flex-1 truncate text-sm font-medium"
                      style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}
                    >
                      {mailbox.name}
                    </span>
                    {mailbox.unreadMessages > 0 && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: 'var(--accent)', color: 'white' }}
                      >
                        {mailbox.unreadMessages}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* Musician Labels */}
          {!sidebarCollapsed && (
            <>
              <div className="my-4 border-t" style={{ borderColor: 'var(--border)' }} />
              <p
                className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                Labels
              </p>
              {MUSICIAN_LABELS.map((label) => {
                const Icon = label.icon;
                return (
                  <button
                    key={label.id}
                    className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all hover:bg-white/5"
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded"
                      style={{ background: label.color + '20' }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: label.color }} />
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text)' }}>
                      {label.name}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center border-t p-3 transition-colors hover:bg-white/5"
          style={{ borderColor: 'var(--border)' }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" style={{ color: 'var(--muted)' }} />
          ) : (
            <ChevronLeft className="h-5 w-5" style={{ color: 'var(--muted)' }} />
          )}
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 border-b px-4 py-3"
          style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
        >
          {/* Search */}
          <div className="relative max-w-xl flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full rounded-xl py-2 pl-10 pr-4"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Actions */}
          <button
            onClick={() => {
              /* Refresh */
            }}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" style={{ color: 'var(--muted)' }} />
          </button>

          <Link
            href="/settings/email"
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            title="Settings"
          >
            <Settings className="h-5 w-5" style={{ color: 'var(--muted)' }} />
          </Link>

          {/* Account */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{ background: 'var(--bg)' }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {emailAddress[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {emailAddress}
            </span>
          </div>
        </header>

        {/* Message List & Detail */}
        <div className="flex flex-1 overflow-hidden">
          {/* Message List */}
          <div
            className="w-96 flex-shrink-0 overflow-y-auto border-r"
            style={{ borderColor: 'var(--border)' }}
          >
            {loadingMessages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-4 h-12 w-12" style={{ color: 'var(--muted)' }} />
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  No messages
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Your inbox is empty
                </p>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => loadMessage(message.id)}
                    className={`w-full border-b px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                      selectedMessage?.id === message.id ? 'bg-[var(--accent)]/5' : ''
                    }`}
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread indicator */}
                      <div className="mt-1.5">
                        {message.isUnread ? (
                          <Circle className="h-2.5 w-2.5 fill-[var(--accent)] text-[var(--accent)]" />
                        ) : (
                          <Circle className="h-2.5 w-2.5" style={{ color: 'transparent' }} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-sm ${message.isUnread ? 'font-semibold' : 'font-medium'}`}
                            style={{ color: 'var(--text)' }}
                          >
                            {message.from[0]?.name || message.from[0]?.email}
                          </span>
                          <span className="flex-shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
                            {formatDate(message.receivedAt)}
                          </span>
                        </div>

                        <p
                          className={`mb-1 truncate text-sm ${message.isUnread ? 'font-medium' : ''}`}
                          style={{ color: message.isUnread ? 'var(--text)' : 'var(--muted)' }}
                        >
                          {message.subject}
                        </p>

                        <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                          {message.preview}
                        </p>

                        {/* Indicators */}
                        <div className="mt-2 flex items-center gap-2">
                          {message.isFlagged && (
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          )}
                          {message.hasAttachment && (
                            <Paperclip className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
            {loadingMessage ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
            ) : selectedMessage ? (
              <div className="p-6">
                {/* Message Header */}
                <div className="mb-6">
                  <h1 className="mb-4 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {selectedMessage.subject}
                  </h1>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full font-semibold"
                        style={{ background: 'var(--accent)', color: 'white' }}
                      >
                        {(selectedMessage.from[0]?.name ||
                          selectedMessage.from[0]?.email)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          {selectedMessage.from[0]?.name || selectedMessage.from[0]?.email}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          to {selectedMessage.to.map((t) => t.email).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>
                        {new Date(selectedMessage.receivedAt).toLocaleString()}
                      </span>
                      <button className="rounded-lg p-2 transition-colors hover:bg-white/10">
                        <MoreVertical className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 flex gap-2">
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                    style={{ background: 'var(--panel)', color: 'var(--text)' }}
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                    style={{ background: 'var(--panel)', color: 'var(--text)' }}
                  >
                    <ReplyAll className="h-4 w-4" />
                    Reply All
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                    style={{ background: 'var(--panel)', color: 'var(--text)' }}
                  >
                    <Forward className="h-4 w-4" />
                    Forward
                  </button>
                </div>

                {/* Message Body */}
                <div
                  className="rounded-xl p-6"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  {selectedMessage.htmlBody ? (
                    <div
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.htmlBody }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans" style={{ color: 'var(--text)' }}>
                      {selectedMessage.textBody}
                    </pre>
                  )}
                </div>

                {/* Attachments */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      Attachments ({selectedMessage.attachments.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 rounded-lg px-3 py-2"
                          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                        >
                          <Paperclip className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                          <span className="text-sm" style={{ color: 'var(--text)' }}>
                            {att.name}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>
                            ({formatBytes(att.size)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                <Mail className="mb-4 h-16 w-16" style={{ color: 'var(--muted)' }} />
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  Select a message
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Choose a message from the list to read it
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 p-4"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-2xl rounded-t-2xl shadow-2xl"
              style={{ background: 'var(--panel)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between rounded-t-2xl px-4 py-3"
                style={{ background: 'var(--accent)' }}
              >
                <span className="font-semibold text-white">New Message</span>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-4">
                <div
                  className="mb-3 flex items-center border-b pb-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="w-16 text-sm" style={{ color: 'var(--muted)' }}>
                    To:
                  </span>
                  <input
                    type="email"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    style={{ color: 'var(--text)' }}
                    placeholder="recipient@email.com"
                  />
                </div>

                <div
                  className="mb-3 flex items-center border-b pb-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="w-16 text-sm" style={{ color: 'var(--muted)' }}>
                    Subject:
                  </span>
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    style={{ color: 'var(--text)' }}
                    placeholder="Subject"
                  />
                </div>

                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="h-64 w-full resize-none bg-transparent outline-none"
                  style={{ color: 'var(--text)' }}
                  placeholder="Write your message..."
                />

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg p-2 transition-colors hover:bg-white/10"
                      title="Attach file"
                    >
                      <Paperclip className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                    </button>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!composeTo || !composeSubject || sending}
                    className="flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send
                      </>
                    )}
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
