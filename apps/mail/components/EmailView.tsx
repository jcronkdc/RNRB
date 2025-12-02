'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Archive,
  Star,
  MoreHorizontal,
  Paperclip,
  Download,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useMailStore, useComposeStore } from '@/lib/store';
import { jmapClient, type Email } from '@/lib/jmap-client';
import clsx from 'clsx';

export default function EmailView() {
  const { selectedEmailId, selectEmail, deleteEmails, markAsUnread } = useMailStore();
  const { openCompose } = useComposeStore();
  const [email, setEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!selectedEmailId) return;

    const loadEmail = async () => {
      setIsLoading(true);
      try {
        const fullEmail = await jmapClient.getEmail(selectedEmailId);
        setEmail(fullEmail);
      } catch (error) {
        console.error('Failed to load email:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmail();
  }, [selectedEmailId]);

  if (isLoading || !email) {
    return (
      <div className="hidden flex-1 items-center justify-center bg-rnrb-dark lg:flex">
        <Loader2 className="h-8 w-8 animate-spin text-rnrb-orange" />
      </div>
    );
  }

  const sender = email.from?.[0];
  const isStarred = email.keywords?.['$flagged'];

  // Get email body
  const htmlBody = email.htmlBody?.[0]?.partId
    ? email.bodyValues?.[email.htmlBody[0].partId]?.value
    : null;
  const textBody = email.textBody?.[0]?.partId
    ? email.bodyValues?.[email.textBody[0].partId]?.value
    : null;

  const handleReply = () => {
    openCompose(email);
  };

  const handleDelete = async () => {
    await deleteEmails([email.id]);
  };

  const handleMarkUnread = async () => {
    await markAsUnread([email.id]);
    selectEmail('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-1 flex-col bg-rnrb-dark"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-rnrb-border px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => selectEmail('')}
            className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleReply}
            className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white"
            title="Reply"
          >
            <Reply className="h-5 w-5" />
          </button>
          <button
            className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white"
            title="Reply All"
          >
            <ReplyAll className="h-5 w-5" />
          </button>
          <button
            className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white"
            title="Forward"
          >
            <Forward className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white"
            title="Archive"
          >
            <Archive className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            className={clsx(
              'rounded-lg p-2 transition-colors',
              isStarred
                ? 'text-yellow-400 hover:bg-yellow-500/10'
                : 'text-rnrb-muted hover:bg-rnrb-panel hover:text-white'
            )}
            title="Star"
          >
            <Star className={clsx('h-5 w-5', isStarred && 'fill-current')} />
          </button>
          <button
            onClick={handleMarkUnread}
            className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white"
            title="Mark as unread"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Subject */}
        <h1 className="font-display text-2xl font-bold text-white">
          {email.subject || '(No subject)'}
        </h1>

        {/* Sender Info */}
        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rnrb-orange to-amber-500 text-lg font-bold text-white">
            {sender?.name?.[0] || sender?.email?.[0] || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {sender?.name || sender?.email || 'Unknown'}
              </span>
              {sender?.name && (
                <span className="text-sm text-rnrb-muted">&lt;{sender.email}&gt;</span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-rnrb-muted">
              <span>To: {email.to?.map((t) => t.name || t.email).join(', ') || 'me'}</span>
            </div>
            <div className="mt-1 text-xs text-rnrb-muted">
              {format(new Date(email.receivedAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 rounded-xl border border-rnrb-border bg-rnrb-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-rnrb-text">
              <Paperclip className="h-4 w-4" />
              {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {email.attachments.map((attachment) => (
                <div
                  key={attachment.partId}
                  className="flex items-center gap-3 rounded-lg border border-rnrb-border bg-rnrb-black p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rnrb-border">
                    <Paperclip className="h-5 w-5 text-rnrb-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{attachment.name}</p>
                    <p className="text-xs text-rnrb-muted">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Body */}
        <div className="mt-6">
          {htmlBody ? (
            <div
              className="email-content prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlBody }}
            />
          ) : textBody ? (
            <pre className="whitespace-pre-wrap font-body text-rnrb-text">{textBody}</pre>
          ) : (
            <p className="text-rnrb-muted">(No content)</p>
          )}
        </div>
      </div>

      {/* Quick Reply */}
      <div className="border-t border-rnrb-border p-4">
        <button
          onClick={handleReply}
          className="flex w-full items-center gap-3 rounded-xl border border-rnrb-border bg-rnrb-panel px-4 py-3 text-left text-rnrb-muted transition-colors hover:border-rnrb-orange hover:text-white"
        >
          <Reply className="h-5 w-5" />
          Click to reply...
        </button>
      </div>
    </motion.div>
  );
}
