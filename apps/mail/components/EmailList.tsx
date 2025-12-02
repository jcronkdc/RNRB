'use client';

import { useState } from 'react';
import { useMailStore } from '@/lib/store';
import {
  Star,
  Paperclip,
  RefreshCw,
  Search,
  Trash2,
  Archive,
  Mail,
  MailOpen,
  CheckSquare,
  Square,
} from 'lucide-react';
import clsx from 'clsx';

export default function EmailList() {
  const {
    emails,
    selectedMailboxId,
    selectedEmailId,
    selectEmail,
    loading,
    fetchEmails,
    mailboxes,
  } = useMailStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const currentMailbox = mailboxes.find((m) => m.id === selectedMailboxId);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmails(selectedMailboxId);
    setRefreshing(false);
  };

  const filteredEmails = emails.filter((email) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      email.subject.toLowerCase().includes(query) ||
      email.from.email.toLowerCase().includes(query) ||
      email.from.name?.toLowerCase().includes(query) ||
      email.preview.toLowerCase().includes(query)
    );
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const emailDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return emailDate.toLocaleDateString([], { weekday: 'short' });
    } else if (diffDays < 365) {
      return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const toggleSelectAll = () => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredEmails.map((e) => e.id)));
    }
  };

  const toggleSelectEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmails(newSelected);
  };

  return (
    <div
      className="transition-theme flex h-full w-80 flex-col"
      style={{ borderRight: '1px solid var(--border)', background: 'var(--bg)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
          {currentMailbox?.name || 'Inbox'}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-md p-1.5 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
          title="Refresh"
        >
          <RefreshCw className={clsx('h-4 w-4', refreshing && 'animate-spin')} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div
          className="flex items-center gap-2 rounded-md px-3 py-2"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <Search className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text)' }}
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selectedEmails.size > 0 && (
        <div
          className="flex items-center gap-1 px-3 py-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent-light)' }}
        >
          <button
            onClick={toggleSelectAll}
            className="rounded p-1"
            style={{ color: 'var(--accent)' }}
          >
            {selectedEmails.size === filteredEmails.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
          <span className="ml-1 text-xs font-medium" style={{ color: 'var(--accent)' }}>
            {selectedEmails.size} selected
          </span>
          <div className="ml-auto flex gap-1">
            <button
              className="rounded p-1.5"
              style={{ color: 'var(--text-muted)' }}
              title="Archive"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5" style={{ color: 'var(--text-muted)' }} title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5"
              style={{ color: 'var(--text-muted)' }}
              title="Mark as read"
            >
              <MailOpen className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-md p-3" style={{ background: 'var(--panel)' }}>
                <div className="skeleton mb-2 h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <Mail className="mb-3 h-10 w-10" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery ? 'No emails found' : 'No emails'}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              {searchQuery ? 'Try a different search' : 'Your inbox is empty'}
            </p>
          </div>
        ) : (
          <div className="p-1">
            {filteredEmails.map((email) => {
              const isSelected = selectedEmailId === email.id;
              const isChecked = selectedEmails.has(email.id);

              return (
                <div
                  key={email.id}
                  onClick={() => selectEmail(email.id)}
                  className={clsx(
                    'group relative cursor-pointer rounded-md px-3 py-2.5 transition-all',
                    isSelected && 'ring-1 ring-inset'
                  )}
                  style={{
                    background: isSelected ? 'var(--accent-light)' : 'transparent',
                    borderColor: isSelected ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {/* Unread indicator */}
                  {!email.isRead && (
                    <div
                      className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}

                  <div className="flex items-start gap-2.5 pl-3">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => toggleSelectEmail(email.id, e)}
                      className={clsx(
                        'mt-0.5 flex-shrink-0 rounded transition-opacity',
                        isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      )}
                      style={{ color: isChecked ? 'var(--accent)' : 'var(--text-muted)' }}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      {/* Sender & Date */}
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span
                          className={clsx('truncate text-sm', !email.isRead && 'font-semibold')}
                          style={{ color: 'var(--text)' }}
                        >
                          {email.from.name || email.from.email.split('@')[0]}
                        </span>
                        <span
                          className="flex-shrink-0 text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {formatDate(email.receivedAt)}
                        </span>
                      </div>

                      {/* Subject */}
                      <p
                        className={clsx('mb-0.5 truncate text-sm', !email.isRead && 'font-medium')}
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {email.subject || '(no subject)'}
                      </p>

                      {/* Preview */}
                      <p className="line-clamp-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {email.preview}
                      </p>

                      {/* Indicators */}
                      <div className="mt-1.5 flex items-center gap-2">
                        {email.hasAttachment && (
                          <Paperclip className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                        )}
                        {email.isFlagged && (
                          <Star className="h-3 w-3 fill-current" style={{ color: '#fbbf24' }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2 text-xs"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        <span>{filteredEmails.length} emails</span>
      </div>
    </div>
  );
}
