'use client';

/**
 * Invite Collaborator — One input, one sentence, one link
 *
 * The simplest possible invite flow:
 * 1. Click "Invite" in the song editor
 * 2. Type an email
 * 3. They get a link that opens the song
 *
 * No forms, no roles dropdown, no permission matrix.
 * Just: "I want this person in my song."
 */

import { Check, Copy, Loader2, UserPlus, X } from '@/components/ui/custom-icons';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface InviteCollaboratorProps {
  songId: string;
  songTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onInvited?: () => void;
}

export function InviteCollaborator({
  songId,
  songTitle,
  isOpen,
  onClose,
  onInvited,
}: InviteCollaboratorProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Generate the shareable link
  const shareLink =
    typeof window !== 'undefined' ? `${window.location.origin}/songwriting?id=${songId}` : '';

  const handleInvite = useCallback(async () => {
    if (!email.trim() || !email.includes('@')) return;

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/songs/${songId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: 'co-writer' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to invite');
      }

      setStatus('sent');
      setEmail('');
      onInvited?.();

      // Reset after a moment
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [email, songId, onInvited]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareLink]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
            className="fixed top-20 right-6 z-50 w-80 overflow-hidden rounded-xl"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Invite to song
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4">
              {/* Email input */}
              <div className="mb-3">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInvite();
                    if (e.key === 'Escape') onClose();
                  }}
                  placeholder="Their email address"
                  className="w-full rounded-lg border-0 px-3 py-2.5 text-sm outline-hidden"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    caretColor: 'var(--accent)',
                  }}
                />
              </div>

              {/* Invite button */}
              <button
                onClick={handleInvite}
                disabled={status === 'sending' || !email.includes('@')}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {status === 'sending' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {status === 'sent' && <Check className="h-3.5 w-3.5" />}
                {status === 'idle' && 'Send invite'}
                {status === 'sending' && 'Sending...'}
                {status === 'sent' && 'Invited!'}
                {status === 'error' && 'Try again'}
              </button>

              {/* Error */}
              {status === 'error' && errorMessage && (
                <p className="mb-3 text-xs" style={{ color: '#EF4444' }}>
                  {errorMessage}
                </p>
              )}

              {/* Or share a link */}
              <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="mb-2 text-xs" style={{ color: 'var(--muted)' }}>
                  Or share a link
                </p>
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all hover:bg-white/5"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--sage)' }} />
                  ) : (
                    <Copy className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
                  )}
                  <span className="truncate">{copied ? 'Copied!' : shareLink}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
