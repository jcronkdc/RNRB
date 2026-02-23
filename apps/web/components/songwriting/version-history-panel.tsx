'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  Clock,
  Download,
  GitBranch,
  MoreVertical,
  RotateCcw,
  Star,
  Trash2,
  X,
} from '@/components/ui/custom-icons';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SongVersion = {
  id: string;
  versionNum: number;
  label: string | null;
  description: string | null;
  title: string;
  lyrics?: string | null;
  chords?: string | null;
  key?: string | null;
  tempo?: number | null;
  timeSignature?: string | null;
  hasAudio: boolean;
  isPublished: boolean;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: string;
};

type VersionHistoryPanelProps = {
  songId: string | undefined;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (version: SongVersion) => void;
  onVersionCreated?: () => void;
};

export function VersionHistoryPanel({
  songId,
  isOpen,
  onClose,
  onRestore,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<SongVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<SongVersion | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch versions
  const fetchVersions = useCallback(async () => {
    if (!songId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/songs/${songId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');

      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  }, [songId]);

  useEffect(() => {
    if (isOpen && songId) {
      fetchVersions();
    }
  }, [isOpen, songId, fetchVersions]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actionMenuOpen]);

  // Handle restore
  const handleRestore = async (version: SongVersion) => {
    if (!songId) return;

    setRestoring(true);
    try {
      const response = await fetch(`/api/songs/${songId}/versions/${version.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });

      if (!response.ok) throw new Error('Failed to restore version');

      onRestore(version);
      setSelectedVersion(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore');
    } finally {
      setRestoring(false);
    }
  };

  // Handle publish (mark as official version)
  const handlePublish = async (version: SongVersion) => {
    if (!songId) return;

    try {
      const response = await fetch(`/api/songs/${songId}/versions/${version.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });

      if (!response.ok) throw new Error('Failed to publish version');

      await fetchVersions();
      setActionMenuOpen(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  // Handle delete
  const handleDelete = async (versionId: string) => {
    if (!songId) return;

    try {
      const response = await fetch(`/api/songs/${songId}/versions/${versionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete version');

      await fetchVersions();
      setConfirmDelete(null);
      setActionMenuOpen(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-end"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <motion.div
          ref={panelRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="h-full w-full max-w-md overflow-hidden shadow-2xl"
          style={{ background: 'var(--background)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b p-6"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.1))',
                }}
              >
                <GitBranch className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                  Version History
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {versions.length} version{versions.length !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition hover:opacity-80"
              style={{ background: 'var(--panel)' }}
            >
              <X className="h-5 w-5" style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          {/* Content */}
          <div className="h-[calc(100%-88px)] overflow-y-auto p-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div
                  className="mb-4 h-8 w-8 animate-spin rounded-full border-2"
                  style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
                />
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Loading versions...
                </p>
              </div>
            )}

            {error && (
              <div
                className="mb-4 rounded-xl p-4"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}
              >
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {!loading && versions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--panel)' }}
                >
                  <Clock className="h-8 w-8" style={{ color: 'var(--muted)' }} />
                </div>
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                  No versions yet
                </h3>
                <p className="max-w-xs text-sm" style={{ color: 'var(--muted)' }}>
                  Save your first version to create a snapshot of your song that you can restore
                  anytime.
                </p>
              </div>
            )}

            {!loading && versions.length > 0 && (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative rounded-xl p-4 transition"
                    style={{
                      background: version.isPublished
                        ? 'linear-gradient(135deg, rgba(255, 99, 71, 0.1), rgba(255, 215, 0, 0.05))'
                        : 'var(--panel)',
                      border: `1px solid ${version.isPublished ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className="rounded-lg px-2 py-0.5 text-xs font-bold"
                            style={{
                              background: 'var(--background)',
                              color: 'var(--accent)',
                            }}
                          >
                            v{version.versionNum}
                          </span>
                          {version.isPublished && (
                            <span
                              className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs"
                              style={{ background: 'var(--accent)', color: 'white' }}
                            >
                              <Star className="h-3 w-3" />
                              Published
                            </span>
                          )}
                          {version.hasAudio && (
                            <span
                              className="rounded-lg px-2 py-0.5 text-xs"
                              style={{ background: 'var(--background)', color: 'var(--muted)' }}
                            >
                              Has Audio
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                          {version.label || `Version ${version.versionNum}`}
                        </h4>
                        {version.description && (
                          <p
                            className="mt-1 line-clamp-2 text-sm"
                            style={{ color: 'var(--muted)' }}
                          >
                            {version.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          {version.createdBy.image && (
                            <img
                              src={version.createdBy.image}
                              alt=""
                              className="h-4 w-4 rounded-full"
                            />
                          )}
                          <span style={{ color: 'var(--muted)' }}>
                            {version.createdBy.name || version.createdBy.email.split('@')[0]}
                          </span>
                          <span style={{ color: 'var(--border)' }}>•</span>
                          <span style={{ color: 'var(--muted)' }}>
                            {formatDate(version.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActionMenuOpen(actionMenuOpen === version.id ? null : version.id)
                          }
                          className="rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100"
                          style={{ background: 'var(--background)' }}
                        >
                          <MoreVertical className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                        </button>

                        <AnimatePresence>
                          {actionMenuOpen === version.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute top-8 right-0 z-10 w-44 overflow-hidden rounded-xl shadow-lg"
                              style={{
                                background: 'var(--panel)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              <button
                                onClick={() => {
                                  setSelectedVersion(version);
                                  setActionMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:opacity-80"
                                style={{ color: 'var(--text)' }}
                              >
                                <RotateCcw className="h-4 w-4" />
                                Restore
                              </button>
                              {!version.isPublished && (
                                <button
                                  onClick={() => handlePublish(version)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:opacity-80"
                                  style={{ color: 'var(--text)' }}
                                >
                                  <Star className="h-4 w-4" />
                                  Set as Published
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  // TODO: Implement export
                                  setActionMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:opacity-80"
                                style={{ color: 'var(--text)' }}
                              >
                                <Download className="h-4 w-4" />
                                Export
                              </button>
                              <div style={{ borderTop: '1px solid var(--border)' }}>
                                <button
                                  onClick={() => {
                                    setConfirmDelete(version.id);
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Restore Confirmation Modal */}
          <AnimatePresence>
            {selectedVersion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-6"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                onClick={() => setSelectedVersion(null)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="w-full max-w-sm rounded-2xl p-6"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: 'rgba(255, 99, 71, 0.2)' }}
                    >
                      <RotateCcw className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                        Restore Version?
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        v{selectedVersion.versionNum} -{' '}
                        {selectedVersion.label || `Version ${selectedVersion.versionNum}`}
                      </p>
                    </div>
                  </div>
                  <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                    This will replace your current song with this version. You may want to save a
                    new version first to preserve your current work.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedVersion(null)}
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition"
                      style={{ background: 'var(--background)', color: 'var(--text)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRestore(selectedVersion)}
                      disabled={restoring}
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50"
                      style={{ background: 'var(--accent)' }}
                    >
                      {restoring ? 'Restoring...' : 'Restore'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-6"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                onClick={() => setConfirmDelete(null)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="w-full max-w-sm rounded-2xl p-6"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                      Delete Version?
                    </h3>
                  </div>
                  <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                    This action cannot be undone. The version will be permanently deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition"
                      style={{ background: 'var(--background)', color: 'var(--text)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(confirmDelete)}
                      className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
