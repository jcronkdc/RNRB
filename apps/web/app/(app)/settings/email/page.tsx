'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Smartphone,
  Monitor,
  Shield,
  Settings,
  Bell,
  Forward,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
} from '@/components/ui/custom-icons';

interface EmailAccount {
  id: string;
  emailAddress: string;
  username: string;
  domain: string;
  status: string;
  displayName: string | null;
  signature: string | null;
  signatureHtml: string | null;
  autoReplyEnabled: boolean;
  autoReplyMessage: string | null;
  autoReplySubject: string | null;
  forwardingEnabled: boolean;
  forwardingAddress: string | null;
  keepCopy: boolean;
  spamFilterLevel: string;
  storageUsedBytes: string;
  storageQuotaBytes: string;
  emailsSent: number;
  emailsReceived: number;
  labels: any[];
  appPasswords: any[];
  createdAt: string;
}

interface ConnectionSettings {
  imap: { server: string; port: number; security: string; username: string };
  smtp: { server: string; port: number; security: string; username: string };
  jmap: { url: string };
}

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [connectionSettings, setConnectionSettings] = useState<ConnectionSettings | null>(null);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);

  // Create account form
  const [username, setUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('rnrb.me');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Settings form
  const [displayName, setDisplayName] = useState('');
  const [signature, setSignature] = useState('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplySubject, setAutoReplySubject] = useState('');
  const [autoReplyMessage, setAutoReplyMessage] = useState('');
  const [forwardingEnabled, setForwardingEnabled] = useState(false);
  const [forwardingAddress, setForwardingAddress] = useState('');
  const [keepCopy, setKeepCopy] = useState(true);
  const [saving, setSaving] = useState(false);

  // App passwords
  const [showAppPasswordModal, setShowAppPasswordModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [creatingAppPassword, setCreatingAppPassword] = useState(false);
  const [newAppPassword, setNewAppPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Fetch email account
  useEffect(() => {
    fetchAccount();
  }, []);

  async function fetchAccount() {
    try {
      const response = await fetch('/api/email/account');
      const data = await response.json();

      setHasAccount(data.hasAccount);
      if (data.hasAccount) {
        setAccount(data.account);
        setConnectionSettings(data.connectionSettings);
        // Populate form
        setDisplayName(data.account.displayName || '');
        setSignature(data.account.signature || '');
        setAutoReplyEnabled(data.account.autoReplyEnabled);
        setAutoReplySubject(data.account.autoReplySubject || '');
        setAutoReplyMessage(data.account.autoReplyMessage || '');
        setForwardingEnabled(data.account.forwardingEnabled);
        setForwardingAddress(data.account.forwardingAddress || '');
        setKeepCopy(data.account.keepCopy);
      } else {
        setAvailableDomains(data.availableDomains || ['rnrb.me']);
      }
    } catch (error) {
      console.error('Error fetching email account:', error);
    } finally {
      setLoading(false);
    }
  }

  // Check username availability
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await fetch(
          `/api/email/check-username?username=${encodeURIComponent(username)}`
        );
        const data = await response.json();
        setUsernameAvailable(data.available);
        setUsernameError(data.available ? null : data.message);
      } catch (error) {
        setUsernameError('Error checking username');
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Create account
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameAvailable || creating) return;

    setCreating(true);
    try {
      const response = await fetch('/api/email/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          domain: selectedDomain,
          displayName: displayName || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh account data
        await fetchAccount();
      } else {
        setUsernameError(data.error);
      }
    } catch (error) {
      setUsernameError('Failed to create email account');
    } finally {
      setCreating(false);
    }
  }

  // Save settings
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/email/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          signature,
          autoReplyEnabled,
          autoReplySubject,
          autoReplyMessage,
          forwardingEnabled,
          forwardingAddress,
          keepCopy,
        }),
      });

      if (response.ok) {
        // Show success
        await fetchAccount();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  }

  // Create app password
  async function handleCreateAppPassword() {
    if (!newAppName.trim() || creatingAppPassword) return;

    setCreatingAppPassword(true);
    try {
      const response = await fetch('/api/email/app-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAppName }),
      });

      const data = await response.json();
      if (data.success) {
        setNewAppPassword(data.appPassword.password);
        await fetchAccount();
      }
    } catch (error) {
      console.error('Error creating app password:', error);
    } finally {
      setCreatingAppPassword(false);
    }
  }

  // Delete app password
  async function handleDeleteAppPassword(id: string) {
    if (!confirm('Are you sure? The connected app will no longer be able to access your email.'))
      return;

    try {
      await fetch(`/api/email/app-password?id=${id}`, { method: 'DELETE' });
      await fetchAccount();
    } catch (error) {
      console.error('Error deleting app password:', error);
    }
  }

  // Copy to clipboard
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  }

  // Format bytes
  function formatBytes(bytes: string | number) {
    const b = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
    return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // No account - show setup
  if (!hasAccount) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Image
              src="/logo-dark.png"
              alt="RNRB"
              width={120}
              height={40}
              className="hover:opacity-80"
            />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #ff6347, #ffd700)' }}
            >
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Get Your RNRB Email
            </h1>
            <p style={{ color: 'var(--muted)' }}>
              Professional email for musicians. Works with any mail app.
            </p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                Choose your email address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
                    }
                    placeholder="yourname"
                    className="w-full rounded-xl px-4 py-3 text-lg"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                  {checkingUsername && (
                    <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-[var(--muted)]" />
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <X className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
                  )}
                </div>
                <span className="flex items-center text-lg" style={{ color: 'var(--muted)' }}>
                  @
                </span>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {availableDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
              {usernameError && <p className="mt-2 text-sm text-red-500">{usernameError}</p>}
              {usernameAvailable && (
                <p className="mt-2 text-sm text-green-500">
                  {username}@{selectedDomain} is available!
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                Display Name (optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name or Band Name"
                className="w-full rounded-xl px-4 py-3"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                This will appear as the sender name in emails
              </p>
            </div>

            {/* Features List */}
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255, 99, 71, 0.1)',
                border: '1px solid rgba(255, 99, 71, 0.2)',
              }}
            >
              <h3 className="mb-3 font-semibold" style={{ color: 'var(--accent)' }}>
                What you get:
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text)' }}>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Professional @rnrb.me email address
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Works with iPhone, Android, Mac, Windows
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Spam filtering & security
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Booking & fan mail organization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Custom signature with your latest release
                </li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!usernameAvailable || creating}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-all disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {creating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Create My Email
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Has account - show settings
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Link href="/">
          <Image
            src="/logo-dark.png"
            alt="RNRB"
            width={120}
            height={40}
            className="hover:opacity-80"
          />
        </Link>
      </div>

      <h1 className="mb-8 text-2xl font-bold" style={{ color: 'var(--text)' }}>
        Email Settings
      </h1>

      {/* Email Address Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #ff6347, #ffd700)' }}
            >
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {account?.emailAddress}
              </h2>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                  style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}
                >
                  <CheckCircle className="h-3 w-3" />
                  Active
                </span>
                <span>
                  {formatBytes(account?.storageUsedBytes || '0')} /{' '}
                  {formatBytes(account?.storageQuotaBytes || '0')} used
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/mail"
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Open Webmail
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <h3
            className="mb-4 flex items-center gap-2 font-semibold"
            style={{ color: 'var(--text)' }}
          >
            <Smartphone className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            Connect Your Apps
          </h3>

          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--bg)' }}>
              <h4 className="mb-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                IMAP (Incoming Mail)
              </h4>
              <div className="space-y-1 text-sm" style={{ color: 'var(--muted)' }}>
                <p>
                  Server:{' '}
                  <code className="text-[var(--accent)]">{connectionSettings?.imap.server}</code>
                </p>
                <p>
                  Port:{' '}
                  <code className="text-[var(--accent)]">{connectionSettings?.imap.port}</code>
                </p>
                <p>
                  Security:{' '}
                  <code className="text-[var(--accent)]">{connectionSettings?.imap.security}</code>
                </p>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: 'var(--bg)' }}>
              <h4 className="mb-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                SMTP (Outgoing Mail)
              </h4>
              <div className="space-y-1 text-sm" style={{ color: 'var(--muted)' }}>
                <p>
                  Server:{' '}
                  <code className="text-[var(--accent)]">{connectionSettings?.smtp.server}</code>
                </p>
                <p>
                  Port:{' '}
                  <code className="text-[var(--accent)]">{connectionSettings?.smtp.port}</code>
                </p>
                <p>
                  Security:{' '}
                  <code className="text-[var(--accent)]">{connectionSettings?.smtp.security}</code>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* App Passwords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text)' }}>
              <Shield className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              App Passwords
            </h3>
            <button
              onClick={() => setShowAppPasswordModal(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
            Use app passwords to connect mail apps securely.
          </p>

          <div className="space-y-2">
            {account?.appPasswords.map((ap) => (
              <div
                key={ap.id}
                className="flex items-center justify-between rounded-xl p-3"
                style={{ background: 'var(--bg)' }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>
                    {ap.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Created {new Date(ap.createdAt).toLocaleDateString()}
                    {ap.lastUsedAt &&
                      ` • Last used ${new Date(ap.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAppPassword(ap.id)}
                  className="rounded-lg p-2 text-red-500 transition-all hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {(!account?.appPasswords || account.appPasswords.length === 0) && (
              <p className="py-4 text-center text-sm" style={{ color: 'var(--muted)' }}>
                No app passwords yet. Create one to connect a mail app.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 rounded-2xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <h3 className="mb-6 flex items-center gap-2 font-semibold" style={{ color: 'var(--text)' }}>
          <Settings className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          Email Preferences
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name or Band Name"
              className="w-full rounded-xl px-4 py-3"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Signature */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
              Email Signature
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={4}
              placeholder="Your signature (appears at the bottom of emails)"
              className="w-full rounded-xl px-4 py-3"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Auto Reply */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg)' }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <span className="font-medium" style={{ color: 'var(--text)' }}>
                  Auto-Reply (Vacation Mode)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  autoReplyEnabled ? 'bg-[var(--accent)]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    autoReplyEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {autoReplyEnabled && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={autoReplySubject}
                  onChange={(e) => setAutoReplySubject(e.target.value)}
                  placeholder="Subject: I'm away..."
                  className="w-full rounded-lg px-3 py-2"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <textarea
                  value={autoReplyMessage}
                  onChange={(e) => setAutoReplyMessage(e.target.value)}
                  rows={3}
                  placeholder="Your auto-reply message..."
                  className="w-full rounded-lg px-3 py-2"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Forwarding */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg)' }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Forward className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <span className="font-medium" style={{ color: 'var(--text)' }}>
                  Email Forwarding
                </span>
              </div>
              <button
                type="button"
                onClick={() => setForwardingEnabled(!forwardingEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  forwardingEnabled ? 'bg-[var(--accent)]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    forwardingEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {forwardingEnabled && (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forwardingAddress}
                  onChange={(e) => setForwardingAddress(e.target.value)}
                  placeholder="Forward to: your@otheremail.com"
                  className="w-full rounded-lg px-3 py-2"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <label
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--muted)' }}
                >
                  <input
                    type="checkbox"
                    checked={keepCopy}
                    onChange={(e) => setKeepCopy(e.target.checked)}
                    className="rounded"
                  />
                  Keep a copy in RNRB Mail
                </label>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Save Settings
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* App Password Modal */}
      {showAppPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--panel)' }}
          >
            {newAppPassword ? (
              // Show the generated password
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
                  App Password Created
                </h3>
                <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                  Use this password to sign in on your app. It won't be shown again!
                </p>

                <div
                  className="mb-4 flex items-center justify-between rounded-xl p-4"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <code className="font-mono text-lg" style={{ color: 'var(--accent)' }}>
                    {newAppPassword}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newAppPassword)}
                    className="rounded-lg p-2 transition-all hover:bg-white/10"
                  >
                    {copiedPassword ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowAppPasswordModal(false);
                    setNewAppPassword(null);
                    setNewAppName('');
                  }}
                  className="w-full rounded-xl py-3 font-semibold"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  Done
                </button>
              </div>
            ) : (
              // Create new password form
              <>
                <h3 className="mb-4 text-xl font-bold" style={{ color: 'var(--text)' }}>
                  Create App Password
                </h3>
                <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                  App passwords let you sign in on devices and apps that don't support 2FA.
                </p>

                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="App name (e.g., iPhone Mail)"
                  className="mb-4 w-full rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAppPasswordModal(false);
                      setNewAppName('');
                    }}
                    className="flex-1 rounded-xl py-3 font-medium"
                    style={{ background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAppPassword}
                    disabled={!newAppName.trim() || creatingAppPassword}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold disabled:opacity-50"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    {creatingAppPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
