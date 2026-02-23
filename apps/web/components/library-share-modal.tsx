'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Search,
  Users,
  Check,
  Loader2,
  Download,
  RefreshCw,
  Mail,
  Clock,
  AlertCircle,
  Copy,
  Link2,
  Send,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Shield,
  ExternalLink,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import useSWR from 'swr';

interface LibraryShareModalProps {
  fileIds: string[];
  fileNames: string[];
  onClose: () => void;
  onShareComplete?: () => void;
}

interface Collaborator {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface ShareLink {
  id: string;
  token: string;
  url: string;
  name: string;
  hasPassword: boolean;
  canDownload: boolean;
  maxViews: number | null;
  viewCount?: number;
  expiresAt: string | null;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LibraryShareModal({
  fileIds,
  fileNames,
  onClose,
  onShareComplete,
}: LibraryShareModalProps) {
  // Tab state - 'people' for sharing with users, 'link' for public links
  const [activeTab, setActiveTab] = useState<'people' | 'link'>('link');

  // People sharing state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [canDownload, setCanDownload] = useState(true);
  const [canReshare, setCanReshare] = useState(false);
  const [message, setMessage] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Link sharing state
  const [linkName, setLinkName] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkCanDownload, setLinkCanDownload] = useState(true);
  const [linkMaxViews, setLinkMaxViews] = useState<number | null>(null);
  const [linkExpiresInDays, setLinkExpiresInDays] = useState<number | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<ShareLink | null>(null);
  const [existingLinks, setExistingLinks] = useState<ShareLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showLinkPassword, setShowLinkPassword] = useState(false);

  // Fetch collaborators (users the current user has worked with)
  const { data: collaborators } = useSWR<Collaborator[]>('/api/collaborators?limit=50', fetcher, {
    revalidateOnFocus: false,
  });

  // Search users
  const { data: searchResults, isLoading: searching } = useSWR<Collaborator[]>(
    searchQuery.length >= 2 ? `/api/users/search?q=${encodeURIComponent(searchQuery)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Load existing share links for this file
  useEffect(() => {
    if (fileIds.length === 1 && activeTab === 'link') {
      loadExistingLinks();
    }
  }, [fileIds, activeTab]);

  const loadExistingLinks = async () => {
    if (fileIds.length !== 1) return;
    setLoadingLinks(true);
    try {
      const response = await fetch(`/api/library/share-link?fileId=${fileIds[0]}`);
      if (response.ok) {
        const data = await response.json();
        setExistingLinks(data.shareLinks || []);
      }
    } catch (err) {
      console.error('Failed to load existing links:', err);
    } finally {
      setLoadingLinks(false);
    }
  };

  // Generate a shareable link
  const handleGenerateLink = async () => {
    if (fileIds.length !== 1) {
      setError('Link sharing currently supports single files only');
      return;
    }

    setGeneratingLink(true);
    setError(null);

    try {
      const response = await fetch('/api/library/share-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: fileIds[0],
          name: linkName.trim() || fileNames[0],
          password: linkPassword.trim() || undefined,
          canDownload: linkCanDownload,
          maxViews: linkMaxViews || undefined,
          expiresInDays: linkExpiresInDays || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate link');
      }

      const data = await response.json();
      setGeneratedLink(data.shareLink);
      // Copy to clipboard automatically
      await navigator.clipboard.writeText(data.shareLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      // Refresh existing links
      loadExistingLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate link');
    } finally {
      setGeneratingLink(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  // Send link via email
  const handleSendEmail = async () => {
    if (!generatedLink || !emailRecipient.trim()) return;

    setSendingEmail(true);
    setError(null);

    try {
      const response = await fetch('/api/library/share-link/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailRecipient.trim(),
          fileName: generatedLink.name,
          shareUrl: generatedLink.url,
          hasPassword: generatedLink.hasPassword,
          canDownload: generatedLink.canDownload,
          expiresAt: generatedLink.expiresAt,
          message: message.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailSent(true);
      setEmailRecipient('');
      setTimeout(() => setEmailSent(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Delete a share link
  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/library/share-link?id=${linkId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setExistingLinks((prev) => prev.filter((l) => l.id !== linkId));
        if (generatedLink?.id === linkId) {
          setGeneratedLink(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete link:', err);
    }
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleShare = async () => {
    if (selectedUsers.size === 0) {
      setError('Please select at least one person to share with');
      return;
    }

    setSharing(true);
    setError(null);

    try {
      const response = await fetch('/api/library/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds,
          recipientIds: Array.from(selectedUsers),
          canDownload,
          canReshare,
          message: message.trim() || undefined,
          expiresInDays: expiresInDays || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to share files');
      }

      setSuccess(true);
      onShareComplete?.();

      // Close after brief success display
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share files');
    } finally {
      setSharing(false);
    }
  };

  // Get displayed users (search results or collaborators)
  const displayedUsers = searchQuery.length >= 2 ? searchResults || [] : collaborators || [];

  // Format expiration date
  const formatExpiration = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Expired';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `${days} days`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl"
        >
          {/* Header */}
          <div className="border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
                  <Share2 className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Share Files</h2>
                  <p className="text-sm text-gray-400">
                    {fileIds.length} file{fileIds.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs - Dropbox style */}
            <div className="mt-4 flex gap-1 rounded-lg bg-gray-800 p-1">
              <button
                onClick={() => setActiveTab('link')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'link'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Link2 className="h-4 w-4" />
                Get Link
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'people'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                Share with People
              </button>
            </div>
          </div>

          {/* Success State */}
          {success ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Shared Successfully!</h3>
              <p className="mt-2 text-gray-400">
                {fileNames.slice(0, 2).join(', ')}
                {fileNames.length > 2 && ` and ${fileNames.length - 2} more`} shared with{' '}
                {selectedUsers.size} {selectedUsers.size === 1 ? 'person' : 'people'}
              </p>
            </div>
          ) : activeTab === 'link' ? (
            /* ========== GET LINK TAB ========== */
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {/* Files being shared */}
              <div className="mb-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3">
                <p className="mb-2 text-xs font-medium uppercase text-gray-500">File</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-700 px-3 py-1 text-sm text-white">
                    {fileNames[0]}
                  </span>
                  {fileIds.length > 1 && (
                    <span className="text-xs text-amber-400">
                      (Link sharing supports single files only)
                    </span>
                  )}
                </div>
              </div>

              {/* Generated Link Display */}
              {generatedLink && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="font-medium text-green-400">Link Created!</span>
                  </div>

                  {/* Link URL */}
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-gray-900/50 p-2">
                    <input
                      type="text"
                      value={generatedLink.url}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-white outline-none"
                    />
                    <button
                      onClick={() => handleCopyLink(generatedLink.url)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <a
                      href={generatedLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-gray-700 p-1.5 text-gray-400 hover:bg-gray-600 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Link Info */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    {generatedLink.hasPassword && (
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Password protected
                      </span>
                    )}
                    {generatedLink.canDownload && (
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        Download enabled
                      </span>
                    )}
                    {generatedLink.maxViews && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {generatedLink.maxViews} views max
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires: {formatExpiration(generatedLink.expiresAt)}
                    </span>
                  </div>

                  {/* Email sharing */}
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <p className="mb-2 text-xs font-medium text-gray-400">Send via email</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                        placeholder="recipient@email.com"
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSendEmail}
                        disabled={sendingEmail || !emailRecipient.trim() || emailSent}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                          emailSent
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
                        }`}
                      >
                        {sendingEmail ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : emailSent ? (
                          <>
                            <Check className="h-4 w-4" />
                            Sent!
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4" />
                            Send
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Link Options */}
              {!generatedLink && (
                <div className="space-y-4">
                  {/* Link Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      Link name (optional)
                    </label>
                    <input
                      type="text"
                      value={linkName}
                      onChange={(e) => setLinkName(e.target.value)}
                      placeholder={fileNames[0]}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Security Options */}
                  <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-white">Security Options</span>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label className="mb-1.5 block text-xs text-gray-400">
                        Password (optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-500" />
                        <div className="relative flex-1">
                          <input
                            type={showLinkPassword ? 'text' : 'password'}
                            value={linkPassword}
                            onChange={(e) => setLinkPassword(e.target.value)}
                            placeholder="Set a password"
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLinkPassword(!showLinkPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-500 transition-colors hover:bg-gray-700 hover:text-gray-300"
                            tabIndex={-1}
                            aria-label={showLinkPassword ? 'Hide password' : 'Show password'}
                          >
                            {showLinkPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expiration */}
                    <div className="mb-3">
                      <label className="mb-1.5 block text-xs text-gray-400">Link expiration</label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <select
                          value={linkExpiresInDays || ''}
                          onChange={(e) =>
                            setLinkExpiresInDays(e.target.value ? parseInt(e.target.value) : null)
                          }
                          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                        >
                          <option value="">Never expires</option>
                          <option value="1">1 day</option>
                          <option value="7">1 week</option>
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                          <option value="365">1 year</option>
                        </select>
                      </div>
                    </div>

                    {/* Max Views */}
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-400">
                        View limit (optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <select
                          value={linkMaxViews || ''}
                          onChange={(e) =>
                            setLinkMaxViews(e.target.value ? parseInt(e.target.value) : null)
                          }
                          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                        >
                          <option value="">Unlimited views</option>
                          <option value="1">1 view (single use)</option>
                          <option value="5">5 views</option>
                          <option value="10">10 views</option>
                          <option value="50">50 views</option>
                          <option value="100">100 views</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setLinkCanDownload(!linkCanDownload)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                        linkCanDownload
                          ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      Allow Download
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Links */}
              {existingLinks.length > 0 && !generatedLink && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                    Existing Links ({existingLinks.length})
                  </p>
                  <div className="space-y-2">
                    {existingLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        <Globe className="h-4 w-4 text-gray-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">{link.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {link.hasPassword && <Lock className="h-3 w-3" />}
                            <span>{link.viewCount || 0} views</span>
                            <span>•</span>
                            <span>Expires: {formatExpiration(link.expiresAt)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyLink(link.url)}
                          className="rounded-lg bg-gray-700 p-2 text-gray-400 hover:bg-gray-600 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="rounded-lg bg-gray-700 p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Footer for Link tab */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  {generatedLink ? 'Done' : 'Cancel'}
                </button>

                {!generatedLink && (
                  <button
                    onClick={handleGenerateLink}
                    disabled={generatingLink || fileIds.length !== 1}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatingLink ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        Create Link
                      </>
                    )}
                  </button>
                )}

                {generatedLink && (
                  <button
                    onClick={() => {
                      setGeneratedLink(null);
                      setLinkPassword('');
                      setLinkName('');
                      setLinkMaxViews(null);
                      setLinkExpiresInDays(null);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Create Another Link
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ========== SHARE WITH PEOPLE TAB ========== */
            <>
              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {/* Files being shared */}
                <div className="mb-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3">
                  <p className="mb-2 text-xs font-medium uppercase text-gray-500">Files</p>
                  <div className="flex flex-wrap gap-2">
                    {fileNames.slice(0, 5).map((name, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-700 px-3 py-1 text-sm text-white"
                      >
                        {name}
                      </span>
                    ))}
                    {fileNames.length > 5 && (
                      <span className="rounded-full bg-gray-700 px-3 py-1 text-sm text-gray-400">
                        +{fileNames.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
                  )}
                </div>

                {/* User List */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase text-gray-500">
                    <Users className="h-3 w-3" />
                    {searchQuery.length >= 2 ? 'Search Results' : 'Recent Collaborators'}
                  </div>

                  {displayedUsers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-700 p-6 text-center">
                      <Users className="mx-auto h-8 w-8 text-gray-600" />
                      <p className="mt-2 text-sm text-gray-400">
                        {searchQuery.length >= 2
                          ? 'No users found'
                          : 'No collaborators yet. Search for users above.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {displayedUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleToggleUser(user.id)}
                          className={`flex w-full items-center gap-3 rounded-lg p-2 transition-all ${
                            selectedUsers.has(user.id)
                              ? 'bg-orange-500/20 ring-1 ring-orange-500'
                              : 'hover:bg-gray-800'
                          }`}
                        >
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || user.email}
                              width={36}
                              height={36}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-white">
                              {user.name || user.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              selectedUsers.has(user.id)
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-600'
                            }`}
                          >
                            {selectedUsers.has(user.id) && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected count */}
                {selectedUsers.size > 0 && (
                  <div className="mb-4 rounded-lg bg-orange-500/10 p-2 text-center text-sm text-orange-400">
                    {selectedUsers.size} {selectedUsers.size === 1 ? 'person' : 'people'} selected
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3 rounded-lg border border-gray-800 bg-gray-800/50 p-3">
                  <p className="text-xs font-medium uppercase text-gray-500">Options</p>

                  {/* Permissions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCanDownload(!canDownload)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                        canDownload
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      Can Download
                    </button>
                    <button
                      onClick={() => setCanReshare(!canReshare)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                        canReshare
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Can Reshare
                    </button>
                  </div>

                  {/* Expiration */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <select
                      value={expiresInDays || ''}
                      onChange={(e) =>
                        setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)
                      }
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="">Never expires</option>
                      <option value="1">Expires in 1 day</option>
                      <option value="7">Expires in 1 week</option>
                      <option value="30">Expires in 30 days</option>
                      <option value="90">Expires in 90 days</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500">Optional message</span>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a note to your share..."
                      rows={2}
                      maxLength={500}
                      className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-800 p-4">
                <div className="text-xs text-gray-500">Recipients will receive a notification</div>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={sharing || selectedUsers.size === 0}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sharing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
