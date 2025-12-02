'use client';

import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { Paperclip, Star, Loader2, RefreshCw, MoreHorizontal } from 'lucide-react';
import { useMailStore } from '@/lib/store';
import clsx from 'clsx';

function formatEmailDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE');
  }
  return format(date, 'MMM d');
}

export default function EmailList() {
  const {
    emails,
    selectedEmailId,
    selectEmail,
    isLoading,
    refreshEmails,
    mailboxes,
    selectedMailboxId,
    totalEmails,
  } = useMailStore();

  const selectedMailbox = mailboxes.find((m) => m.id === selectedMailboxId);

  return (
    <div className="flex w-full max-w-md flex-col border-r border-rnrb-border bg-rnrb-dark lg:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rnrb-border px-4 py-3">
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            {selectedMailbox?.name || 'Inbox'}
          </h2>
          <p className="text-xs text-rnrb-muted">
            {totalEmails} {totalEmails === 1 ? 'email' : 'emails'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshEmails}
            disabled={isLoading}
            className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white"
          >
            <RefreshCw className={clsx('h-5 w-5', isLoading && 'animate-spin')} />
          </button>
          <button className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && emails.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-rnrb-orange" />
          </div>
        ) : emails.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <span className="text-4xl">📭</span>
            <p className="mt-2 text-rnrb-muted">No emails here</p>
          </div>
        ) : (
          <div className="divide-y divide-rnrb-border/50">
            {emails.map((email, index) => {
              const isUnread = !email.keywords?.['$seen'];
              const isStarred = email.keywords?.['$flagged'];
              const isSelected = selectedEmailId === email.id;
              const sender = email.from?.[0];

              return (
                <motion.button
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => selectEmail(email.id)}
                  className={clsx(
                    'w-full px-4 py-3 text-left transition-colors',
                    isSelected ? 'bg-rnrb-orange/10' : 'hover:bg-rnrb-panel',
                    isUnread && 'bg-rnrb-panel/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={clsx(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase',
                        isUnread
                          ? 'bg-gradient-to-br from-rnrb-orange to-amber-500 text-white'
                          : 'bg-rnrb-border text-rnrb-muted'
                      )}
                    >
                      {sender?.name?.[0] || sender?.email?.[0] || '?'}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={clsx(
                            'truncate text-sm',
                            isUnread ? 'font-semibold text-white' : 'text-rnrb-text'
                          )}
                        >
                          {sender?.name || sender?.email || 'Unknown'}
                        </span>
                        <span className="flex-shrink-0 text-xs text-rnrb-muted">
                          {formatEmailDate(email.receivedAt)}
                        </span>
                      </div>

                      <p
                        className={clsx(
                          'truncate text-sm',
                          isUnread ? 'font-medium text-rnrb-text' : 'text-rnrb-muted'
                        )}
                      >
                        {email.subject || '(No subject)'}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-rnrb-muted">{email.preview}</p>

                      {/* Indicators */}
                      <div className="mt-1 flex items-center gap-2">
                        {isStarred && (
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        )}
                        {email.hasAttachment && (
                          <Paperclip className="h-3.5 w-3.5 text-rnrb-muted" />
                        )}
                        {isUnread && <span className="h-2 w-2 rounded-full bg-rnrb-blue" />}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
