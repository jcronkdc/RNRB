'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { InboxSkeleton, LibrarySkeleton, SettingsSkeleton } from '@/components/loading-skeletons';
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
  Headphones,
  Ticket,
  Radio,
  Zap,
  Upload,
  FolderOpen,
  FileAudio,
  FileText,
  Download,
  Check,
  Image as ImageIcon,
  FileMusic,
  Disc,
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
    content?: string; // Base64 content for saving
  }[];
}

// Attachment for composing
interface ComposeAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  content?: string; // Base64 encoded content
  libraryFileId?: string;
  libraryFileUrl?: string;
  isFromLibrary: boolean;
}

// Library file for picker
interface LibraryFile {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: string;
  url: string;
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

// Musician-specific labels with enhanced styling
const MUSICIAN_LABELS = [
  { id: 'booking', name: 'Booking', icon: Ticket, color: '#22c55e', description: 'Gigs & shows' },
  {
    id: 'fan-mail',
    name: 'Fan Mail',
    icon: Headphones,
    color: '#ec4899',
    description: 'From your fans',
  },
  { id: 'press', name: 'Press', icon: Radio, color: '#3b82f6', description: 'Media inquiries' },
  {
    id: 'collaborations',
    name: 'Collabs',
    icon: Music,
    color: '#f59e0b',
    description: 'Work together',
  },
  { id: 'industry', name: 'Industry', icon: Zap, color: '#8b5cf6', description: 'Labels & mgmt' },
];

// Quick reply templates for musicians
const QUICK_TEMPLATES = [
  {
    id: 'booking-interest',
    name: 'Booking Interest',
    subject: 'RE: Booking Inquiry',
    body: "Thanks for reaching out about booking! I'd love to discuss this opportunity further. Could you share more details about the event?",
  },
  {
    id: 'fan-thanks',
    name: 'Thank a Fan',
    subject: 'RE: Your message',
    body: 'Thank you so much for your kind words and support! Messages like yours mean the world to me.',
  },
  {
    id: 'collab-yes',
    name: 'Accept Collab',
    subject: 'RE: Collaboration',
    body: "I'm definitely interested in collaborating! Let's set up a time to chat about ideas and next steps.",
  },
  {
    id: 'press-response',
    name: 'Press Response',
    subject: 'RE: Interview Request',
    body: "Thank you for your interest in featuring me. I'd be happy to participate. Please send over more details about the format and timeline.",
  },
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
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Attachment state
  const [composeAttachments, setComposeAttachments] = useState<ComposeAttachment[]>([]);
  const [attachmentDragging, setAttachmentDragging] = useState(false);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState<LibraryFile[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [savingAttachment, setSavingAttachment] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Fetch real messages from the email API
        const response = await fetch(`/api/email/messages?mailbox=${selectedMailbox}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        } else {
          // No messages or API not configured - show empty inbox
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Show empty inbox on error
        setMessages([]);
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
        // Fetch full message content from API
        const response = await fetch(`/api/email/messages/${messageId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.message) {
            setSelectedMessage(data.message);
          }
        } else {
          // Fallback to preview data from list
          const message = messages.find((m) => m.id === messageId);
          if (message) {
            setSelectedMessage({
              id: message.id,
              subject: message.subject,
              from: message.from,
              to: message.to,
              receivedAt: message.receivedAt,
              htmlBody: `<div style="font-family: sans-serif; line-height: 1.6;"><p>${message.preview}</p></div>`,
            });
          }
        }
      } catch (error) {
        console.error('Error loading message:', error);
        // Fallback to preview data
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          setSelectedMessage({
            id: message.id,
            subject: message.subject,
            from: message.from,
            to: message.to,
            receivedAt: message.receivedAt,
            htmlBody: `<div style="font-family: sans-serif; line-height: 1.6;"><p>${message.preview}</p></div>`,
          });
        }
      } finally {
        setLoadingMessage(false);
      }
    },
    [messages]
  );

  // Handle file attachment from local device
  const handleFileAttachment = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Process each file with explicit closure to avoid any closure issues
    const processFile = (file: File): Promise<ComposeAttachment | null> => {
      return new Promise((resolve) => {
        // Check size limit (10MB per file)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB per file.`);
          resolve(null);
          return;
        }

        // Capture file properties immediately to avoid any closure issues
        const fileName = file.name;
        const fileSize = file.size;
        const fileMimeType = file.type || 'application/octet-stream';

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          const newAttachment: ComposeAttachment = {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: fileName,
            size: fileSize,
            mimeType: fileMimeType,
            content: base64,
            isFromLibrary: false,
          };
          resolve(newAttachment);
        };
        reader.onerror = () => {
          console.error(`Failed to read file: ${fileName}`);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    };

    // Process all files in parallel and filter out nulls (failed/skipped files)
    const attachments = await Promise.all(fileArray.map(processFile));
    const validAttachments = attachments.filter((a): a is ComposeAttachment => a !== null);

    if (validAttachments.length > 0) {
      setComposeAttachments((prev) => [...prev, ...validAttachments]);
    }
  }, []);

  // Handle drag and drop for attachments
  const handleAttachmentDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAttachmentDragging(true);
  }, []);

  const handleAttachmentDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAttachmentDragging(false);
  }, []);

  const handleAttachmentDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setAttachmentDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileAttachment(files);
      }
    },
    [handleFileAttachment]
  );

  // Remove attachment
  const removeAttachment = useCallback((attachmentId: string) => {
    setComposeAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }, []);

  // Fetch library files for picker
  const fetchLibraryFiles = useCallback(async () => {
    setLibraryLoading(true);
    try {
      const response = await fetch(
        `/api/library?limit=50&search=${encodeURIComponent(librarySearch)}`
      );
      if (response.ok) {
        const data = await response.json();
        setLibraryFiles(data.files || []);
      } else {
        // API error - show empty library
        console.error('Library fetch failed:', response.status, response.statusText);
        setLibraryFiles([]);
      }
    } catch (error) {
      console.error('Error fetching library files:', error);
      setLibraryFiles([]);
    } finally {
      setLibraryLoading(false);
    }
  }, [librarySearch]);

  // Add library file as attachment
  const addLibraryAttachment = useCallback(
    (file: LibraryFile) => {
      // Check if already attached
      if (composeAttachments.find((a) => a.libraryFileId === file.id)) {
        return;
      }

      const newAttachment: ComposeAttachment = {
        id: `lib-${file.id}`,
        name: file.name,
        size: parseInt(file.size),
        mimeType: file.mimeType,
        libraryFileId: file.id,
        libraryFileUrl: file.url,
        isFromLibrary: true,
      };
      setComposeAttachments((prev) => [...prev, newAttachment]);
      setShowLibraryPicker(false);
    },
    [composeAttachments]
  );

  // Save email attachment to library
  const saveAttachmentToLibrary = useCallback(
    async (
      attachment: { id: string; name: string; type: string; size: number; content?: string },
      messageId: string
    ) => {
      if (!attachment.content) {
        alert('Attachment content not available for saving.');
        return;
      }

      setSavingAttachment(attachment.id);
      try {
        const response = await fetch('/api/email/attachments/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attachmentId: attachment.id,
            messageId,
            name: attachment.name,
            content: attachment.content,
            mimeType: attachment.type,
            size: attachment.size,
            tags: ['email-attachment'],
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert(`"${attachment.name}" saved to your library!`);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error('Error saving attachment:', error);
        alert('Failed to save attachment to library.');
      } finally {
        setSavingAttachment(null);
      }
    },
    []
  );

  // Fetch library files when picker opens
  useEffect(() => {
    if (showLibraryPicker) {
      fetchLibraryFiles();
    }
  }, [showLibraryPicker, fetchLibraryFiles]);

  // Calculate total attachment size
  const totalAttachmentSize = composeAttachments.reduce((sum, a) => sum + a.size, 0);
  const attachmentSizeLimitMB = 25;
  const isOverLimit = totalAttachmentSize > attachmentSizeLimitMB * 1024 * 1024;

  // Send email
  const handleSend = async () => {
    if (!composeTo || !composeSubject) return;
    if (isOverLimit) {
      setSendError('Total attachment size exceeds 25MB limit');
      return;
    }

    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean),
          cc: composeCc
            ? composeCc
                .split(',')
                .map((e) => e.trim())
                .filter(Boolean)
            : [],
          subject: composeSubject,
          body: composeBody,
          attachments: composeAttachments.map((a) => ({
            name: a.name,
            content: a.content || '',
            mimeType: a.mimeType,
            size: a.size,
            libraryFileId: a.libraryFileId,
            libraryFileUrl: a.libraryFileUrl,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Success! Show confirmation and reset
      setSendSuccess(true);
      setTimeout(() => {
        setShowCompose(false);
        setComposeTo('');
        setComposeCc('');
        setComposeSubject('');
        setComposeBody('');
        setComposeAttachments([]);
        setSendSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending email:', error);
      setSendError(error instanceof Error ? error.message : 'Failed to send email');
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

  // No email account - stunning welcome screen
  if (!hasAccount) {
    return (
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a0a 100%)',
        }}
      >
        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-40 -top-40 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #ff6347, #ffd700)' }}
          />
          <div
            className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
          />
          {/* Musical notes floating effect */}
          <motion.div
            animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[20%] top-[30%] text-4xl opacity-10"
          >
            ♪
          </motion.div>
          <motion.div
            animate={{ y: [20, -20, 20], rotate: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[25%] top-[20%] text-5xl opacity-10"
          >
            ♫
          </motion.div>
          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[30%] left-[15%] text-3xl opacity-10"
          >
            ♬
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          {/* RNRB Logo */}
          <Link href="/" className="mb-8 inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={180}
              height={60}
              className="mx-auto transition-all hover:scale-105"
            />
          </Link>

          {/* Mail Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #ff6347 0%, #ff8c00 50%, #ffd700 100%)',
              boxShadow: '0 0 60px rgba(255, 99, 71, 0.4), 0 0 100px rgba(255, 215, 0, 0.2)',
            }}
          >
            <Mail className="h-12 w-12 text-white drop-shadow-lg" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-3 bg-gradient-to-r from-white via-orange-200 to-yellow-200 bg-clip-text text-4xl font-black tracking-tight text-transparent"
          >
            RNRB Mail
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-2 text-xl font-medium text-white/90"
          >
            Professional Email for Musicians
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 text-white/60"
          >
            yourname@rnrb.me • Works everywhere • Made for artists
          </motion.p>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 grid grid-cols-2 gap-3 text-left sm:grid-cols-4"
          >
            {[
              { icon: Ticket, label: 'Booking', desc: 'Organize gigs' },
              { icon: Headphones, label: 'Fan Mail', desc: 'Stay connected' },
              { icon: Radio, label: 'Press', desc: 'Media inquiries' },
              { icon: Music, label: 'Collabs', desc: 'Work together' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <item.icon className="mb-1 h-5 w-5 text-orange-400" />
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-white/50">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              href="/settings/email"
              className="group inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold shadow-2xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ff6347, #ffd700)',
                boxShadow: '0 10px 40px rgba(255, 99, 71, 0.4)',
              }}
            >
              <Mail className="h-6 w-6 text-white" />
              <span className="text-white">Get Your @rnrb.me Email</span>
              <ChevronRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="mt-4 text-sm text-white/40">
              Free with your paid membership • Works on iPhone, Android, Mac & PC
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar - Premium RNRB Mail Design */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 70 : 260 }}
        className="flex flex-col border-r"
        style={{
          borderColor: 'rgba(255, 99, 71, 0.1)',
          background:
            'linear-gradient(180deg, rgba(20, 10, 15, 0.98) 0%, rgba(10, 5, 10, 0.98) 100%)',
        }}
      >
        {/* RNRB Mail Header */}
        <div className="p-4">
          {!sidebarCollapsed ? (
            <div className="mb-5">
              <Link href="/" className="mb-3 flex items-center gap-2">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  width={100}
                  height={35}
                  className="transition-opacity hover:opacity-80"
                />
              </Link>
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.15), rgba(255, 215, 0, 0.1))',
                  border: '1px solid rgba(255, 99, 71, 0.2)',
                }}
              >
                <Mail className="h-4 w-4 text-orange-400" />
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-sm font-bold text-transparent">
                  RNRB Mail
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex justify-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #ff6347, #ffd700)' }}
              >
                <Mail className="h-5 w-5 text-white" />
              </div>
            </div>
          )}

          {/* Compose Button - Stunning gradient */}
          <button
            onClick={() => setShowCompose(true)}
            className="group flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #ff6347, #ff8c00, #ffd700)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(255, 99, 71, 0.3)',
            }}
          >
            <Edit3 className="h-5 w-5 transition-transform group-hover:rotate-[-8deg]" />
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
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/15 to-yellow-500/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <Icon
                  className="h-5 w-5 flex-shrink-0"
                  style={{
                    color: mailbox.color || (isActive ? '#ff6347' : 'rgba(255, 255, 255, 0.6)'),
                  }}
                />
                {!sidebarCollapsed && (
                  <>
                    <span
                      className="flex-1 truncate text-sm font-medium"
                      style={{ color: isActive ? '#ff6347' : 'rgba(255, 255, 255, 0.85)' }}
                    >
                      {mailbox.name}
                    </span>
                    {mailbox.unreadMessages > 0 && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                        style={{ background: '#ff6347' }}
                      >
                        {mailbox.unreadMessages}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* Musician-Specific Labels - Premium Design */}
          {!sidebarCollapsed && (
            <>
              <div className="my-4 border-t" style={{ borderColor: 'rgba(255, 99, 71, 0.1)' }} />
              <p
                className="mb-3 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider"
                style={{ color: 'rgba(255, 165, 0, 0.7)' }}
              >
                <Music className="h-3 w-3" />
                Musician Labels
              </p>
              {MUSICIAN_LABELS.map((label) => {
                const Icon = label.icon;
                return (
                  <button
                    key={label.id}
                    className="group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/5"
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${label.color}30, ${label.color}10)`,
                        border: `1px solid ${label.color}40`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: label.color }} />
                    </span>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-white/90">{label.name}</span>
                      <span className="block text-[10px] text-white/50">{label.description}</span>
                    </div>
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
        {/* Header - Premium Design */}
        <header
          className="flex items-center gap-4 border-b px-5 py-3"
          style={{
            borderColor: 'rgba(255, 99, 71, 0.1)',
            background:
              'linear-gradient(90deg, rgba(15, 10, 12, 0.98) 0%, rgba(20, 12, 18, 0.98) 100%)',
          }}
        >
          {/* Search - Enhanced */}
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your music inbox..."
              className="w-full rounded-xl py-2.5 pl-11 pr-4 text-white transition-all placeholder:text-white/40 focus:ring-2 focus:ring-orange-400/30"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 99, 71, 0.2)',
              }}
            />
          </div>

          {/* Actions with tooltips */}
          <button
            onClick={() => {
              /* Refresh */
            }}
            className="rounded-xl p-2.5 transition-all hover:bg-orange-400/10"
            title="Refresh inbox"
          >
            <RefreshCw className="h-5 w-5 text-white/50 transition-colors hover:text-orange-400" />
          </button>

          <Link
            href="/settings/email"
            className="rounded-xl p-2.5 transition-all hover:bg-orange-400/10"
            title="Email settings"
          >
            <Settings className="h-5 w-5 text-white/50 transition-colors hover:text-orange-400" />
          </Link>

          {/* Account Badge - Premium look */}
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-2"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 99, 71, 0.1), rgba(255, 215, 0, 0.05))',
              border: '1px solid rgba(255, 99, 71, 0.2)',
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #ff6347, #ffd700)',
                color: 'white',
                boxShadow: '0 2px 10px rgba(255, 99, 71, 0.3)',
              }}
            >
              {emailAddress[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-semibold text-white">
                {emailAddress.split('@')[0]}
              </span>
              <span className="block text-[10px] text-orange-400/80">@rnrb.me</span>
            </div>
          </div>
        </header>

        {/* Message List & Detail */}
        <div className="flex flex-1 overflow-hidden">
          {/* Message List */}
          <div
            className="w-96 flex-shrink-0 overflow-y-auto border-r"
            style={{
              borderColor: 'rgba(255, 99, 71, 0.15)',
              background: 'rgba(10, 10, 10, 0.5)',
            }}
          >
            {loadingMessages ? (
              <InboxSkeleton count={8} />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-4 h-12 w-12 text-orange-400/30" />
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
                    className={`w-full border-b px-4 py-3.5 text-left transition-all ${
                      selectedMessage?.id === message.id
                        ? 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-500/20 to-yellow-500/10'
                        : 'border-l-4 border-l-transparent hover:bg-white/5'
                    }`}
                    style={{ borderBottomColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread indicator */}
                      <div className="mt-1.5">
                        {message.isUnread ? (
                          <Circle className="h-2.5 w-2.5 fill-orange-500 text-orange-500" />
                        ) : (
                          <div className="h-2.5 w-2.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-sm ${message.isUnread ? 'font-bold' : 'font-medium'}`}
                            style={{
                              color: message.isUnread ? 'var(--text)' : 'var(--text-secondary)',
                            }}
                          >
                            {message.from[0]?.name || message.from[0]?.email}
                          </span>
                          <span className="flex-shrink-0 text-xs text-orange-400/70">
                            {formatDate(message.receivedAt)}
                          </span>
                        </div>

                        <p
                          className={`mb-1.5 truncate text-sm ${message.isUnread ? 'font-semibold' : ''}`}
                          style={{
                            color: message.isUnread ? 'var(--text)' : 'var(--text-secondary)',
                          }}
                        >
                          {message.subject}
                        </p>

                        <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                          {message.preview}
                        </p>

                        {/* Indicators */}
                        <div className="mt-2 flex items-center gap-2">
                          {message.isFlagged && (
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          )}
                          {message.hasAttachment && (
                            <Paperclip className="h-3.5 w-3.5 text-orange-400/60" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail - Premium View */}
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
            {loadingMessage ? (
              <div className="p-6">
                <SettingsSkeleton />
              </div>
            ) : selectedMessage ? (
              <div className="p-6">
                {/* Message Header - Enhanced */}
                <div className="mb-6">
                  <h1 className="mb-4 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {selectedMessage.subject}
                  </h1>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #ff6347, #ffd700)',
                          color: 'white',
                          boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
                        }}
                      >
                        {(selectedMessage.from[0]?.name ||
                          selectedMessage.from[0]?.email)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                          {selectedMessage.from[0]?.name || selectedMessage.from[0]?.email}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          to{' '}
                          <span className="text-orange-400">
                            {selectedMessage.to.map((t) => t.email).join(', ')}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-lg px-3 py-1.5 text-sm"
                        style={{ background: 'var(--panel)', color: 'var(--muted)' }}
                      >
                        {new Date(selectedMessage.receivedAt).toLocaleString()}
                      </span>
                      <button className="rounded-lg p-2 transition-colors hover:bg-orange-400/10">
                        <MoreVertical
                          className="h-5 w-5 hover:text-orange-400"
                          style={{ color: 'var(--muted)' }}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Styled */}
                <div className="mb-6 flex flex-wrap gap-2">
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 99, 71, 0.1))',
                      border: '1px solid rgba(255, 99, 71, 0.3)',
                      color: 'var(--text)',
                    }}
                  >
                    <Reply className="h-4 w-4 text-orange-400" />
                    Reply
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <ReplyAll className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                    Reply All
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Forward className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                    Forward
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Archive className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                    Archive
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white/90 transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <Tag className="h-4 w-4 text-white/70" />
                    Label
                  </button>
                </div>

                {/* Message Body */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {selectedMessage.htmlBody ? (
                    <div
                      className="prose prose-invert max-w-none text-white/90"
                      style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.7',
                      }}
                      dangerouslySetInnerHTML={{ __html: selectedMessage.htmlBody }}
                    />
                  ) : (
                    <pre
                      className="whitespace-pre-wrap font-sans text-white/90"
                      style={{ lineHeight: '1.7' }}
                    >
                      {selectedMessage.textBody}
                    </pre>
                  )}
                </div>

                {/* Attachments - Enhanced with Save to Library */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white/90">
                        Attachments ({selectedMessage.attachments.length})
                      </h3>
                      <span className="text-xs text-white/50">
                        Click to save any attachment to your library
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedMessage.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.01]"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {/* File type icon */}
                          <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(255, 99, 71, 0.15)' }}
                          >
                            {att.type.startsWith('audio/') ? (
                              <FileAudio className="h-5 w-5 text-orange-400" />
                            ) : att.type.startsWith('image/') ? (
                              <ImageIcon className="h-5 w-5 text-pink-400" />
                            ) : att.type.includes('pdf') || att.type.includes('document') ? (
                              <FileText className="h-5 w-5 text-blue-400" />
                            ) : (
                              <Paperclip className="h-5 w-5 text-orange-400/70" />
                            )}
                          </div>

                          {/* File info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white/90">{att.name}</p>
                            <p className="text-xs text-white/50">{formatBytes(att.size)}</p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {/* Download */}
                            <button
                              className="rounded-lg p-2 text-white/50 transition-all hover:bg-white/10 hover:text-white"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            {/* Save to Library */}
                            <button
                              onClick={() => saveAttachmentToLibrary(att, selectedMessage.id)}
                              disabled={savingAttachment === att.id}
                              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-105"
                              style={{
                                background:
                                  'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                color: '#22c55e',
                              }}
                              title="Save to Library"
                            >
                              {savingAttachment === att.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <FolderOpen className="h-3 w-3" />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick action to save all */}
                    {selectedMessage.attachments.length > 1 && (
                      <button
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all hover:scale-[1.01]"
                        style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          color: '#22c55e',
                        }}
                        onClick={async () => {
                          for (const att of selectedMessage.attachments || []) {
                            if (att.content) {
                              await saveAttachmentToLibrary(att, selectedMessage.id);
                            }
                          }
                        }}
                      >
                        <FolderOpen className="h-4 w-4" />
                        Save All to Library
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-md text-center"
                >
                  <div
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255, 99, 71, 0.15), rgba(255, 215, 0, 0.1))',
                      border: '1px solid rgba(255, 99, 71, 0.3)',
                    }}
                  >
                    <Mail className="h-10 w-10 text-orange-400/70" />
                  </div>
                  <p className="mb-2 text-lg font-semibold text-white/95">Select a message</p>
                  <p className="mb-6 text-sm text-white/60">
                    Choose a message from the list to read it
                  </p>

                  {/* Quick Templates */}
                  <div className="mx-auto max-w-md">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-400/60">
                      Quick Templates
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_TEMPLATES.slice(0, 4).map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setShowCompose(true);
                            setComposeSubject(template.subject);
                            setComposeBody(template.body);
                          }}
                          className="rounded-xl p-3 text-left text-xs transition-all hover:scale-[1.02]"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                          }}
                        >
                          <span className="font-medium text-white/90">{template.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Compose Modal with Attachments */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #1a1015 0%, #0f0a0d 100%)',
                border: '1px solid rgba(255, 99, 71, 0.2)',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 99, 71, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
              onDragEnter={handleAttachmentDragEnter}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={handleAttachmentDragLeave}
              onDrop={handleAttachmentDrop}
            >
              {/* Header - Gradient */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.1))',
                  borderBottom: '1px solid rgba(255, 99, 71, 0.15)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #ff6347, #ffd700)' }}
                  >
                    <Edit3 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">New Message</span>
                  {composeAttachments.length > 0 && (
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: 'rgba(255, 99, 71, 0.2)', color: '#ff6347' }}
                    >
                      <Paperclip className="h-3 w-3" />
                      {composeAttachments.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowCompose(false)}
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drag overlay */}
              <AnimatePresence>
                {attachmentDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(255, 99, 71, 0.1)' }}
                  >
                    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-orange-500 p-8">
                      <Upload className="h-12 w-12 text-orange-500" />
                      <p className="text-lg font-semibold text-white">Drop files to attach</p>
                      <p className="text-sm text-white/60">Max 10MB per file, 25MB total</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-5">
                {/* Success message */}
                {sendSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-3 rounded-xl p-4"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-400">Email sent successfully!</span>
                  </motion.div>
                )}

                {/* Error message */}
                {sendError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-3 rounded-xl p-4"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="font-medium text-red-400">{sendError}</span>
                    <button
                      onClick={() => setSendError(null)}
                      className="ml-auto text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {/* From indicator */}
                <div
                  className="mb-4 flex items-center gap-3 rounded-xl px-4 py-2"
                  style={{
                    background: 'rgba(255, 99, 71, 0.05)',
                    border: '1px solid rgba(255, 99, 71, 0.1)',
                  }}
                >
                  <span className="text-xs font-medium text-white/40">FROM</span>
                  <span className="text-sm font-semibold text-orange-400">{emailAddress}</span>
                </div>

                <div
                  className="mb-3 flex items-center border-b pb-3"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span className="w-20 text-sm font-medium text-white/40">To:</span>
                  <input
                    type="text"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                    placeholder="recipient@email.com (comma-separated for multiple)"
                  />
                </div>

                <div
                  className="mb-3 flex items-center border-b pb-3"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span className="w-20 text-sm font-medium text-white/40">Cc:</span>
                  <input
                    type="text"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                    placeholder="cc@email.com (optional)"
                  />
                </div>

                <div
                  className="mb-4 flex items-center border-b pb-3"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span className="w-20 text-sm font-medium text-white/40">Subject:</span>
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                    placeholder="What's this about?"
                  />
                </div>

                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="min-h-[200px] w-full resize-none bg-transparent text-white outline-none placeholder:text-white/30"
                  placeholder="Write your message..."
                />

                {/* Attachments Section */}
                {composeAttachments.length > 0 && (
                  <div
                    className="mt-4 rounded-xl p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-white/90">
                        <Paperclip className="h-4 w-4 text-orange-400" />
                        Attachments ({composeAttachments.length})
                      </h4>
                      <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-white/50'}`}>
                        {formatBytes(totalAttachmentSize)} / {attachmentSizeLimitMB}MB
                      </span>
                    </div>

                    <div className="space-y-2">
                      {composeAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-white/5"
                        >
                          {/* Icon based on type */}
                          <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(255, 99, 71, 0.15)' }}
                          >
                            {attachment.mimeType.startsWith('audio/') ? (
                              <FileAudio className="h-4 w-4 text-orange-400" />
                            ) : attachment.mimeType.startsWith('image/') ? (
                              <ImageIcon className="h-4 w-4 text-pink-400" />
                            ) : attachment.mimeType.includes('pdf') ? (
                              <FileText className="h-4 w-4 text-blue-400" />
                            ) : (
                              <File className="h-4 w-4 text-gray-400" />
                            )}
                          </div>

                          {/* File info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white/90">
                              {attachment.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <span>{formatBytes(attachment.size)}</span>
                              {attachment.isFromLibrary && (
                                <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-400">
                                  <FolderOpen className="h-3 w-3" />
                                  Library
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="rounded-lg p-1.5 text-white/40 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {isOverLimit && (
                      <p className="mt-2 text-xs text-red-400">
                        Total size exceeds {attachmentSizeLimitMB}MB limit. Please remove some
                        attachments.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex items-center justify-between border-t px-5 py-4"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}
              >
                <div className="flex gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileAttachment(e.target.files)}
                  />

                  {/* Attach from device */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    title="Attach files from your device"
                  >
                    <Paperclip className="h-4 w-4 text-white/60" />
                    <span className="hidden text-white/80 sm:inline">Attach</span>
                  </button>

                  {/* Attach from library */}
                  <button
                    onClick={() => setShowLibraryPicker(true)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                    title="Attach from your library"
                  >
                    <FolderOpen className="h-4 w-4 text-emerald-400" />
                    <span className="hidden text-emerald-400 sm:inline">From Library</span>
                  </button>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!composeTo || !composeSubject || sending || isOverLimit}
                  className="flex items-center gap-2 rounded-xl px-6 py-3 font-bold shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #ff6347, #ffd700)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(255, 99, 71, 0.4)',
                  }}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library File Picker Modal */}
      <AnimatePresence>
        {showLibraryPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowLibraryPicker(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #1a1015 0%, #0f0a0d 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))',
                  borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}
                  >
                    <FolderOpen className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">Attach from Library</span>
                </div>
                <button
                  onClick={() => setShowLibraryPicker(false)}
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div
                className="border-b px-5 py-3"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Search your library..."
                    className="w-full rounded-lg bg-white/5 py-2 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* File List */}
              <div className="flex-1 overflow-y-auto p-4">
                {libraryLoading ? (
                  <LibrarySkeleton count={4} />
                ) : libraryFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderOpen className="mb-3 h-12 w-12 text-white/20" />
                    <p className="text-white/60">No files found</p>
                    <p className="mt-1 text-sm text-white/40">Upload files to your library first</p>
                    <Link
                      href="/library"
                      className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
                    >
                      Go to Library
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {libraryFiles.map((file) => {
                      const isAttached = composeAttachments.some(
                        (a) => a.libraryFileId === file.id
                      );
                      return (
                        <button
                          key={file.id}
                          onClick={() => !isAttached && addLibraryAttachment(file)}
                          disabled={isAttached}
                          className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                            isAttached ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/5'
                          }`}
                          style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
                        >
                          {/* Icon */}
                          <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(255, 99, 71, 0.15)' }}
                          >
                            {file.mimeType.startsWith('audio/') ? (
                              <FileAudio className="h-5 w-5 text-orange-400" />
                            ) : file.mimeType.startsWith('image/') ? (
                              <ImageIcon className="h-5 w-5 text-pink-400" />
                            ) : file.type === 'lyrics' ? (
                              <FileText className="h-5 w-5 text-purple-400" />
                            ) : file.type === 'sheet_music' || file.type === 'chords' ? (
                              <FileMusic className="h-5 w-5 text-blue-400" />
                            ) : file.type === 'stem' ? (
                              <Disc className="h-5 w-5 text-orange-400" />
                            ) : (
                              <File className="h-5 w-5 text-gray-400" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white/90">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <span className="capitalize">{file.type.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{formatBytes(parseInt(file.size))}</span>
                            </div>
                          </div>

                          {/* Status */}
                          {isAttached ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
                              <Check className="h-3 w-3" />
                              Attached
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-400">Click to attach</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="border-t px-5 py-3"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/50">
                    {libraryFiles.length} file{libraryFiles.length !== 1 ? 's' : ''} available
                  </p>
                  <button
                    onClick={() => setShowLibraryPicker(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/10"
                  >
                    Done
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
