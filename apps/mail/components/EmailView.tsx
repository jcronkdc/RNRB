'use client';

import { useMailStore, useComposeStore } from '@/lib/store';
import {
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Archive,
  Star,
  MoreHorizontal,
  Paperclip,
  Download,
  Printer,
  ChevronDown,
  Mail,
} from 'lucide-react';
import { useState } from 'react';

export default function EmailView() {
  const { selectedEmailId, emails } = useMailStore();
  const { openCompose } = useComposeStore();
  const [showDetails, setShowDetails] = useState(false);

  const email = emails.find((e) => e.id === selectedEmailId);

  if (!email) {
    return (
      <div
        className="transition-theme flex h-full flex-1 flex-col items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <Mail className="mb-4 h-16 w-16" style={{ color: 'var(--border)' }} />
        <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
          Select an email to read
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Choose a message from the list
        </p>
      </div>
    );
  }

  // Helper to get email properties
  const sender = email.from?.[0] || { email: 'unknown@email.com', name: null };
  const recipients = email.to || [];
  const isFlagged = email.keywords?.['$flagged'] || false;

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReply = () => {
    openCompose({
      to: [{ email: sender.email, name: sender.name || undefined }],
      subject: `Re: ${email.subject}`,
      inReplyTo: email.id,
    });
  };

  const handleReplyAll = () => {
    const allRecipients = [
      { email: sender.email, name: sender.name || undefined },
      ...recipients
        .filter((r) => r.email !== sender.email)
        .map((r) => ({ email: r.email, name: r.name || undefined })),
    ];
    openCompose({
      to: allRecipients,
      subject: `Re: ${email.subject}`,
      inReplyTo: email.id,
    });
  };

  const handleForward = () => {
    openCompose({
      subject: `Fwd: ${email.subject}`,
      body: `\n\n---------- Forwarded message ----------\nFrom: ${sender.name || sender.email}\nDate: ${formatFullDate(email.receivedAt)}\nSubject: ${email.subject}\n\n${email.preview}`,
    });
  };

  // Get email body content
  const getBodyContent = () => {
    // Check for HTML body first
    if (email.htmlBody?.[0]?.partId && email.bodyValues?.[email.htmlBody[0].partId]) {
      return { html: email.bodyValues[email.htmlBody[0].partId].value };
    }
    // Fall back to text body
    if (email.textBody?.[0]?.partId && email.bodyValues?.[email.textBody[0].partId]) {
      const text = email.bodyValues[email.textBody[0].partId].value;
      return { text: text.replace(/\n/g, '<br/>') };
    }
    // Last resort: preview
    return { text: email.preview };
  };

  const bodyContent = getBodyContent();

  return (
    <div
      className="transition-theme flex h-full flex-1 flex-col"
      style={{ background: 'var(--bg)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={handleReply}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Reply"
          >
            <Reply className="h-4 w-4" />
            Reply
          </button>
          <button
            onClick={handleReplyAll}
            className="rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Reply all"
          >
            <ReplyAll className="h-4 w-4" />
          </button>
          <button
            onClick={handleForward}
            className="rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Forward"
          >
            <Forward className="h-4 w-4" />
          </button>

          <div className="mx-2 h-5 w-px" style={{ background: 'var(--border)' }} />

          <button
            className="rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Archive"
          >
            <Archive className="h-4 w-4" />
          </button>
          <button
            className="rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            className={`rounded-md p-1.5 transition-colors ${isFlagged ? 'text-yellow-500' : ''}`}
            style={{ color: isFlagged ? '#fbbf24' : 'var(--text-muted)' }}
            title={isFlagged ? 'Remove star' : 'Star'}
          >
            <Star className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            className="rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6">
          {/* Subject */}
          <h1 className="mb-6 text-xl font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {email.subject || '(no subject)'}
          </h1>

          {/* Sender info */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                {(sender.name || sender.email)[0].toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    {sender.name || sender.email.split('@')[0]}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    &lt;{sender.email}&gt;
                  </span>
                </div>

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-0.5 flex items-center gap-1 text-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  to {recipients.map((r) => r.name || r.email.split('@')[0]).join(', ') || 'me'}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  />
                </button>

                {showDetails && (
                  <div
                    className="mt-2 rounded-md p-3 text-sm"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    <div className="grid gap-1">
                      <div className="flex">
                        <span className="w-16" style={{ color: 'var(--text-muted)' }}>
                          From:
                        </span>
                        <span style={{ color: 'var(--text)' }}>{sender.email}</span>
                      </div>
                      <div className="flex">
                        <span className="w-16" style={{ color: 'var(--text-muted)' }}>
                          To:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {recipients.map((r) => r.email).join(', ') || '-'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-16" style={{ color: 'var(--text-muted)' }}>
                          Date:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {formatFullDate(email.receivedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {formatFullDate(email.receivedAt)}
            </span>
          </div>

          {/* Attachments */}
          {email.hasAttachment && email.attachments && email.attachments.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <Paperclip className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {email.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    <Paperclip className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text)' }}>
                      {att.name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      ({Math.round(att.size / 1024)}KB)
                    </span>
                    <button
                      className="ml-1 rounded p-1 transition-colors"
                      style={{ color: 'var(--accent)' }}
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email body */}
          <div
            className="email-content prose prose-sm max-w-none"
            style={{ color: 'var(--text)' }}
            dangerouslySetInnerHTML={{
              __html: bodyContent.html || bodyContent.text || '',
            }}
          />
        </div>
      </div>

      {/* Quick reply */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-3xl">
          <button
            onClick={handleReply}
            className="w-full rounded-lg px-4 py-3 text-left text-sm transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            Click here to reply...
          </button>
        </div>
      </div>
    </div>
  );
}
