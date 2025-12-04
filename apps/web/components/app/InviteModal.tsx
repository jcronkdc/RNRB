'use client';

import { Button, Input, Label } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Mail, Loader2, X } from '@/components/ui/custom-icons';
import { useState } from 'react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId?: string;
  projectId?: string;
  onInviteSent: () => void;
  type: 'org' | 'project';
}

export default function InviteModal({
  isOpen,
  onClose,
  orgId,
  projectId,
  onInviteSent,
  type,
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role,
          ...(orgId && { orgId }),
          ...(projectId && { projectId }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invitation');
      }

      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        onInviteSent();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="bg-primary/20 mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Mail className="text-primary h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Invite to {type === 'org' ? 'Organization' : 'Project'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Send an invitation link via email. They'll need to sign in to accept.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending || success}
              required
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSending || success}
              className="focus:border-primary focus:ring-primary/20 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base focus:outline-none focus:ring-2"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              {type === 'project' && <option value="collaborator">Collaborator</option>}
              {type === 'project' && <option value="viewer">Viewer</option>}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-danger/60 bg-danger/10 text-danger-foreground rounded-2xl border px-4 py-3 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-success-foreground rounded-2xl border border-success/60 bg-success/10 px-4 py-3 text-sm"
            >
              Invitation sent successfully!
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-2xl"
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid"
              className="flex-1 gap-2 rounded-2xl"
              disabled={isSending || success}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : success ? (
                'Sent!'
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 rounded-2xl border border-border/60 bg-muted/50 p-4 text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> Invitations expire after 7 days. The recipient must have a
            CronkWaters account to accept the invitation.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
