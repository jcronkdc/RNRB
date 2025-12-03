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
  Crown,
  Zap,
  Star,
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
  recoveryEmail: string | null;
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
  const [settingsRecoveryEmail, setSettingsRecoveryEmail] = useState('');
  const [recoveryEmailError, setRecoveryEmailError] = useState<string | null>(null);

  // App passwords
  const [showAppPasswordModal, setShowAppPasswordModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [creatingAppPassword, setCreatingAppPassword] = useState(false);
  const [newAppPassword, setNewAppPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Email Pro upgrade
  const [emailTier, setEmailTier] = useState<string>('NONE');
  const [canCreate, setCanCreate] = useState(false);
  const [upgradeCta, setUpgradeCta] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  // Success state - show after email created
  const [justCreated, setJustCreated] = useState(false);
  const [createdEmail, setCreatedEmail] = useState('');
  const [createdPassword, setCreatedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeSetupTab, setActiveSetupTab] = useState<'iphone' | 'android' | 'mac' | 'windows'>(
    'iphone'
  );

  // User info for suggestions
  const [userName, setUserName] = useState('');
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);

  // Fetch email account
  useEffect(() => {
    fetchAccount();
    fetchUserInfo();
  }, []);

  async function fetchUserInfo() {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (data.name) {
        setUserName(data.name);
        // Generate username suggestions from name
        const name = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const suggestions = [
          name,
          name.replace(/\s/g, '.'),
          name.replace(/\s/g, '_'),
          `${name}music`,
          `${name}official`,
        ].filter((s) => s.length >= 3 && s.length <= 30);
        setSuggestedUsernames([...new Set(suggestions)].slice(0, 4));
        // Auto-fill display name
        if (!displayName) {
          setDisplayName(data.name);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }

  async function fetchAccount() {
    try {
      console.log('[EMAIL-SETTINGS] Fetching account...');
      const response = await fetch('/api/email/account');
      console.log('[EMAIL-SETTINGS] Response status:', response.status);

      if (!response.ok) {
        console.error(
          '[EMAIL-SETTINGS] Failed to fetch account:',
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error('[EMAIL-SETTINGS] Error response:', errorText);
        throw new Error(`Failed to fetch account: ${response.status}`);
      }

      const data = await response.json();
      console.log('[EMAIL-SETTINGS] Account data:', data);

      setHasAccount(data.hasAccount);
      setEmailTier(data.emailTier || 'NONE');
      setCanCreate(data.canCreate ?? false);
      setUpgradeCta(data.upgradeCta || null);

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
        setSettingsRecoveryEmail(data.account.recoveryEmail || '');
      } else {
        setAvailableDomains(data.availableDomains || ['rnrb.me']);
      }
    } catch (error) {
      console.error('[EMAIL-SETTINGS] Error fetching email account:', error);
      // Show a user-friendly error
      alert('Failed to load email settings. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Email Pro upgrade
  async function handleUpgradeToEmailPro() {
    setUpgrading(true);
    try {
      const response = await fetch('/api/email/upgrade', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.error) {
        alert(data.message || data.error);
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('Failed to start upgrade process');
    } finally {
      setUpgrading(false);
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

  // Validate password and optional recovery email
  function validateForm(): boolean {
    setPasswordError(null);

    // Validate recovery email format if provided (optional - falls back to platform email)
    if (recoveryEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recoveryEmail)) {
        setPasswordError('Please enter a valid recovery email address');
        return false;
      }

      if (recoveryEmail.toLowerCase().endsWith('@rnrb.me')) {
        setPasswordError('Recovery email cannot be an @rnrb.me address');
        return false;
      }
    }

    if (!newPassword) {
      setPasswordError('Password is required');
      return false;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    return true;
  }

  // Create account
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameAvailable || creating) return;

    // Validate form before submitting
    if (!validateForm()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/email/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          domain: selectedDomain,
          displayName: displayName || userName || undefined,
          password: newPassword,
          recoveryEmail: recoveryEmail ? recoveryEmail.toLowerCase() : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Show success screen
        setCreatedEmail(data.emailAddress);
        setJustCreated(true);
        // Refresh account data in background
        await fetchAccount();
      } else {
        setPasswordError(data.error || data.message);
      }
    } catch (error) {
      setPasswordError('Failed to create email account');
    } finally {
      setCreating(false);
    }
  }

  // Copy helpers
  function copyEmail() {
    navigator.clipboard.writeText(createdEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  function copyPassword() {
    navigator.clipboard.writeText(createdPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  }

  // Save settings
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryEmailError(null);

    // Validate recovery email if provided
    if (settingsRecoveryEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settingsRecoveryEmail)) {
        setRecoveryEmailError('Please enter a valid email address');
        return;
      }
      if (settingsRecoveryEmail.toLowerCase().endsWith('@rnrb.me')) {
        setRecoveryEmailError('Recovery email cannot be an @rnrb.me address');
        return;
      }
    }

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
          recoveryEmail: settingsRecoveryEmail || null,
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

  // Success screen - shown right after account creation
  if (justCreated && createdEmail) {
    const setupInstructions = {
      iphone: [
        { step: 1, text: 'Open Settings → Mail → Accounts → Add Account' },
        { step: 2, text: 'Tap "Other" → "Add Mail Account"' },
        { step: 3, text: `Enter your name and email: ${createdEmail}` },
        { step: 4, text: 'Enter your password (copy from above)' },
        { step: 5, text: 'Tap "IMAP" and enter mail.rnrb.me for both servers' },
        { step: 6, text: "Save and you're done!" },
      ],
      android: [
        { step: 1, text: 'Open Gmail → Settings → Add Account' },
        { step: 2, text: 'Select "Other"' },
        { step: 3, text: `Enter your email: ${createdEmail}` },
        { step: 4, text: 'Select "IMAP" when prompted' },
        { step: 5, text: 'Server: mail.rnrb.me, Port: 993, Security: SSL/TLS' },
        { step: 6, text: "Enter your password and you're done!" },
      ],
      mac: [
        { step: 1, text: 'Open Mail → Mail menu → Add Account' },
        { step: 2, text: 'Select "Other Mail Account"' },
        { step: 3, text: `Enter name, email (${createdEmail}), and password` },
        { step: 4, text: 'Select "IMAP" → Server: mail.rnrb.me' },
        { step: 5, text: 'For SMTP, use mail.rnrb.me port 465' },
        { step: 6, text: 'Done! Check your inbox' },
      ],
      windows: [
        { step: 1, text: 'Open Outlook → File → Add Account' },
        { step: 2, text: 'Select "Manual setup"' },
        { step: 3, text: 'Choose "IMAP" as account type' },
        { step: 4, text: 'Incoming: mail.rnrb.me:993 (SSL/TLS)' },
        { step: 5, text: 'Outgoing: mail.rnrb.me:465 (SSL/TLS)' },
        { step: 6, text: "Enter your credentials and you're set!" },
      ],
    };

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={50}
              className="transition-all hover:scale-105"
            />
          </Link>
        </div>

        <div className="relative mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden rounded-3xl shadow-2xl"
            style={{
              background:
                'linear-gradient(180deg, rgba(15, 25, 15, 0.95) 0%, rgba(10, 15, 10, 0.98) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(34, 197, 94, 0.15)',
            }}
          >
            {/* Success Header */}
            <div
              className="px-8 py-6 text-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #10b981)',
                  boxShadow: '0 0 40px rgba(34, 197, 94, 0.5)',
                }}
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="mb-2 text-3xl font-black text-white">You're All Set!</h1>
              <p className="text-lg text-green-200">Your professional musician email is ready</p>
            </div>

            <div className="p-8">
              {/* Email Address */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-white/60">
                  Your Email Address
                </label>
                <div
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <span className="text-xl font-bold text-green-400">{createdEmail}</span>
                  <button
                    onClick={copyEmail}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                  >
                    {copiedEmail ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : (
                      <Copy className="h-5 w-5 text-white/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password reminder */}
              <div
                className="mb-6 flex items-center gap-3 rounded-xl p-4"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
              >
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="text-sm text-green-200">
                  Use the password you just created to sign in to your email.
                </p>
              </div>

              {/* Setup Instructions Tabs */}
              <div className="mb-4">
                <label className="mb-3 block text-sm font-medium text-white/60">
                  Setup on Your Device
                </label>
                <div className="flex gap-2">
                  {[
                    { key: 'iphone', label: '📱 iPhone', icon: Smartphone },
                    { key: 'android', label: '🤖 Android', icon: Smartphone },
                    { key: 'mac', label: '💻 Mac', icon: Monitor },
                    { key: 'windows', label: '🖥️ Windows', icon: Monitor },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSetupTab(tab.key as any)}
                      className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        activeSetupTab === tab.key
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setup Steps */}
              <div
                className="mb-6 rounded-xl p-4"
                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
              >
                <ol className="space-y-3">
                  {setupInstructions[activeSetupTab].map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}
                      >
                        {item.step}
                      </span>
                      <span className="text-sm text-white/80">{item.text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Server Settings Reference */}
              <div
                className="mb-6 rounded-xl p-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <h4 className="mb-3 text-sm font-semibold text-white/80">Quick Reference</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-white/40">Incoming (IMAP)</p>
                    <p className="font-mono text-green-400">mail.rnrb.me:993</p>
                  </div>
                  <div>
                    <p className="text-white/40">Outgoing (SMTP)</p>
                    <p className="font-mono text-green-400">mail.rnrb.me:465</p>
                  </div>
                  <div>
                    <p className="text-white/40">Security</p>
                    <p className="font-mono text-green-400">SSL/TLS</p>
                  </div>
                  <div>
                    <p className="text-white/40">Username</p>
                    <p className="font-mono text-green-400">{createdEmail}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <a
                  href="https://webmail.rnrb.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #10b981)',
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <Mail className="h-5 w-5" />
                  Open Webmail
                </a>
                <button
                  onClick={() => setJustCreated(false)}
                  className="rounded-xl px-6 py-3 font-medium transition-all hover:bg-white/10"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
                >
                  Settings
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // No account - setup screen (simplified for AppLayout)
  if (!hasAccount) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={50}
              className="hover:opacity-80"
            />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background:
              'linear-gradient(180deg, rgba(20, 12, 18, 0.95) 0%, rgba(15, 10, 15, 0.98) 100%)',
            border: '1px solid rgba(255, 99, 71, 0.2)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(255, 99, 71, 0.1)',
          }}
        >
          {/* Header with gradient */}
          <div
            className="px-8 py-6 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 99, 71, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)',
              borderBottom: '1px solid rgba(255, 99, 71, 0.1)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #ff6347 0%, #ff8c00 50%, #ffd700 100%)',
                boxShadow: '0 0 40px rgba(255, 99, 71, 0.4), 0 0 80px rgba(255, 215, 0, 0.2)',
              }}
            >
              <Mail className="h-10 w-10 text-white drop-shadow-lg" />
            </motion.div>
            <h1
              className="mb-2 text-3xl font-black"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #ffb347 50%, #ffd700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              RNRB Mail
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              Professional email for musicians
            </p>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Works with iPhone, Android, Mac & PC
            </p>
          </div>

          <div className="p-8">
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

                {/* Username suggestions */}
                {suggestedUsernames.length > 0 && !username && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs text-white/40">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedUsernames.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setUsername(suggestion)}
                          className="rounded-lg px-3 py-1.5 text-sm transition-all hover:scale-105"
                          style={{
                            background: 'rgba(255, 99, 71, 0.1)',
                            border: '1px solid rgba(255, 99, 71, 0.2)',
                            color: '#ff8c00',
                          }}
                        >
                          {suggestion}@rnrb.me
                        </button>
                      ))}
                    </div>
                  </div>
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

              {/* Recovery Email */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Recovery Email <span className="text-white/40">(optional)</span>
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="your@gmail.com"
                  className="w-full rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                  For password resets. If not set, your platform account email will be used instead.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Choose a Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl px-4 py-3 pr-12"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                  Must include uppercase, lowercase, and a number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Confirm Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                {passwordError && <p className="mt-2 text-sm text-red-500">{passwordError}</p>}
              </div>

              {/* Features List - Premium */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)',
                  border: '1px solid rgba(255, 99, 71, 0.15)',
                }}
              >
                <h3 className="mb-4 flex items-center gap-2 font-bold text-orange-400">
                  <Zap className="h-5 w-5" />
                  What you get:
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Mail, text: 'Professional @rnrb.me address' },
                    { icon: Smartphone, text: 'Works on all devices' },
                    { icon: Shield, text: 'Spam filtering & security' },
                    { icon: Star, text: 'Musician-specific labels' },
                    { icon: Forward, text: 'Auto-reply for touring' },
                    { icon: Settings, text: 'Custom signatures' },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: 'rgba(255, 99, 71, 0.15)' }}
                      >
                        <feature.icon className="h-4 w-4 text-orange-400" />
                      </div>
                      <span className="text-sm text-white/80">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit - Stunning gradient button */}
              <button
                type="submit"
                disabled={!usernameAvailable || creating}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #ff6347 0%, #ff8c00 50%, #ffd700 100%)',
                  color: 'white',
                  boxShadow: '0 8px 30px rgba(255, 99, 71, 0.4)',
                }}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Creating your email...
                  </>
                ) : (
                  <>
                    <Mail className="h-6 w-6 transition-transform group-hover:scale-110" />
                    Create My @rnrb.me Email
                  </>
                )}
              </button>
            </form>
          </div>
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
          <a
            href="https://webmail.rnrb.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Open Webmail
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </motion.div>

      {/* Email Pro Upgrade Card - Only show if not already PRO */}
      {emailTier !== 'PRO' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 overflow-hidden rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
                >
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                      Upgrade to Email Pro
                    </h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ background: '#8b5cf6', color: 'white' }}
                    >
                      $3/mo
                    </span>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Get 10GB storage, multiple accounts, and priority support
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpgradeToEmailPro}
                disabled={upgrading}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                }}
              >
                {upgrading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Upgrade Now
                  </>
                )}
              </button>
            </div>

            {/* Features List */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {['10GB Storage', 'Multiple Accounts', 'Priority Delivery', 'Advanced Filters'].map(
                (feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Star className="h-3.5 w-3.5" style={{ color: '#8b5cf6' }} />
                    {feature}
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* PRO Badge - Show if user has Email Pro */}
      {emailTier === 'PRO' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 flex items-center gap-3 rounded-xl p-4"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <Crown className="h-5 w-5" style={{ color: '#8b5cf6' }} />
          <span className="font-medium" style={{ color: 'var(--text)' }}>
            Email Pro Active
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            — 10GB storage, priority support
          </span>
        </motion.div>
      )}

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

          {/* Recovery Email */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
              Recovery Email
            </label>
            <input
              type="email"
              value={settingsRecoveryEmail}
              onChange={(e) => {
                setSettingsRecoveryEmail(e.target.value);
                setRecoveryEmailError(null);
              }}
              placeholder="your@gmail.com"
              className="w-full rounded-xl px-4 py-3"
              style={{
                background: 'var(--bg)',
                border: recoveryEmailError ? '1px solid #ef4444' : '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
            {recoveryEmailError ? (
              <p className="mt-1 text-sm text-red-500">{recoveryEmailError}</p>
            ) : (
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                Used for password resets. Use a different email address (not @rnrb.me).
              </p>
            )}
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
