'use client';

import { useState, useRef } from 'react';
import { useComposeStore, useAuthStore } from '@/lib/store';
import { syncClient } from '@/lib/sync-client';
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';

export default function ComposeModal() {
  const { email: userEmail } = useAuthStore();
  const { closeCompose, draftData, isMinimized, toggleMinimize } = useComposeStore();

  const [to, setTo] = useState(draftData?.to?.map((r) => r.email).join(', ') || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(draftData?.subject || '');
  const [body, setBody] = useState(draftData?.body || '');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!to.trim()) {
      setError('Please enter at least one recipient');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/jmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          using: [
            'urn:ietf:params:jmap:core',
            'urn:ietf:params:jmap:mail',
            'urn:ietf:params:jmap:submission',
          ],
          methodCalls: [
            [
              'Email/set',
              {
                accountId: userEmail,
                create: {
                  draft: {
                    from: [{ email: userEmail }],
                    to: to.split(',').map((e) => ({ email: e.trim() })),
                    cc: cc ? cc.split(',').map((e) => ({ email: e.trim() })) : [],
                    bcc: bcc ? bcc.split(',').map((e) => ({ email: e.trim() })) : [],
                    subject: subject,
                    bodyValues: {
                      body: { value: body, isEncodingProblem: false, isTruncated: false },
                    },
                    textBody: [{ partId: 'body', type: 'text/plain' }],
                    mailboxIds: {}, // Will be set by submission
                  },
                },
              },
              'createEmail',
            ],
            [
              'EmailSubmission/set',
              {
                accountId: userEmail,
                create: {
                  submission: {
                    emailId: '#draft',
                    envelope: {
                      mailFrom: { email: userEmail },
                      rcptTo: [
                        ...to.split(',').map((e) => ({ email: e.trim() })),
                        ...(cc ? cc.split(',').map((e) => ({ email: e.trim() })) : []),
                        ...(bcc ? bcc.split(',').map((e) => ({ email: e.trim() })) : []),
                      ],
                    },
                  },
                },
              },
              'submitEmail',
            ],
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Report to RNRB platform
      syncClient.trackEmailSent(to, subject);

      closeCompose();
    } catch (err) {
      console.error('Send error:', err);
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDiscard = () => {
    if (to || subject || body) {
      if (window.confirm('Discard this draft?')) {
        closeCompose();
      }
    } else {
      closeCompose();
    }
  };

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-0 right-4 z-50 flex cursor-pointer items-center gap-2 rounded-t-lg px-4 py-2 shadow-lg"
        style={{ background: 'var(--accent)', color: 'white' }}
        onClick={toggleMinimize}
      >
        <span className="text-sm font-medium">{subject || 'New message'}</span>
        <Maximize2 className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleDiscard} />

      {/* Modal */}
      <div
        className="relative flex h-[600px] w-full max-w-2xl flex-col rounded-xl shadow-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between rounded-t-xl px-4 py-3"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
        >
          <h3 className="font-medium" style={{ color: 'var(--text)' }}>
            New message
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMinimize}
              className="rounded p-1 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDiscard}
              className="rounded p-1 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Recipients */}
          <div className="space-y-0" style={{ borderBottom: '1px solid var(--border)' }}>
            {/* To field */}
            <div className="flex items-center px-4">
              <label className="w-16 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                To
              </label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                style={{ color: 'var(--text)' }}
                placeholder="recipient@example.com"
                autoFocus
              />
              {!showCcBcc && (
                <button
                  onClick={() => setShowCcBcc(true)}
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Cc Bcc
                </button>
              )}
            </div>

            {/* Cc/Bcc fields */}
            {showCcBcc && (
              <>
                <div
                  className="flex items-center px-4"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <label className="w-16 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Cc
                  </label>
                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                    style={{ color: 'var(--text)' }}
                  />
                </div>
                <div
                  className="flex items-center px-4"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <label className="w-16 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Bcc
                  </label>
                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                    style={{ color: 'var(--text)' }}
                  />
                </div>
              </>
            )}

            {/* Subject */}
            <div
              className="flex items-center px-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <label className="w-16 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                style={{ color: 'var(--text)' }}
                placeholder="Subject"
              />
            </div>
          </div>

          {/* Formatting toolbar */}
          <div
            className="flex items-center gap-1 px-4 py-2"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <button
              className="rounded p-1.5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
            <button
              className="rounded p-1.5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Bullet list"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Numbered list"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
            <button
              className="rounded p-1.5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Insert link"
            >
              <Link className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Insert image"
            >
              <Image className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="h-full w-full resize-none bg-transparent p-4 text-sm outline-none"
              style={{ color: 'var(--text)' }}
              placeholder="Write your message..."
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              className="mx-4 mb-2 rounded-md px-3 py-2 text-sm"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
            >
              {error}
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between rounded-b-xl px-4 py-3"
            style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={handleSend}
                disabled={sending || !to.trim()}
                className={clsx(
                  'btn btn-primary gap-2 disabled:opacity-50',
                  sending && 'cursor-wait'
                )}
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
              <button className="btn btn-secondary" title="Attach file">
                <Paperclip className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleDiscard}
              className="rounded p-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Discard"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
