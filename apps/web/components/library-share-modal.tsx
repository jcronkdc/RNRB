'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LibraryShareModal({
  fileIds,
  fileNames,
  onClose,
  onShareComplete,
}: LibraryShareModalProps) {
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

  const handleCopyLink = async () => {
    // For now, create a simple shareable message
    const filesText = fileNames.join(', ');
    const text = `Check out these files I shared: ${filesText}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  // Get displayed users (search results or collaborators)
  const displayedUsers = searchQuery.length >= 2 ? searchResults || [] : collaborators || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
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
          ) : (
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
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </button>

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
