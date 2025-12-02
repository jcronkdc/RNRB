'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Eye,
  Clock,
  User,
  Loader2,
  Folder,
  FileText,
  Music,
  Image as ImageIcon,
  File,
  FileAudio,
  Disc,
  Mic2,
  Radio,
  ScrollText,
  Piano,
  Calendar,
  Share2,
  RefreshCw,
  AlertCircle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import useSWR from 'swr';

import { FileViewer } from '@/components/file-viewer';
import type { LibraryFileType } from '@/hooks/use-library';

interface SharedFile {
  id: string;
  fileId: string;
  canDownload: boolean;
  canReshare: boolean;
  message: string | null;
  viewedAt: string | null;
  downloadedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  file: {
    id: string;
    name: string;
    type: LibraryFileType;
    mimeType: string;
    size: string;
    url: string;
    duration?: number;
    bpm?: number;
    musicalKey?: string;
  };
  sharedBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface SharedFilesResponse {
  shares: SharedFile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// File type icons
const FILE_TYPE_ICONS: Record<LibraryFileType, any> = {
  stem: Disc,
  demo: Music,
  sample: Mic2,
  loop: Radio,
  lyrics: ScrollText,
  chords: FileText,
  sheet_music: Piano,
  midi: FileAudio,
  image: ImageIcon,
  document: FileText,
  project: Folder,
  other: File,
};

export function SharedFilesView() {
  const [viewingFile, setViewingFile] = useState<{
    url: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<SharedFilesResponse>(
    '/api/library/share?type=received',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const formatFileSize = (bytesStr: string): string => {
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'Unknown';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = useCallback(
    async (share: SharedFile) => {
      if (!share.canDownload) return;

      setDownloading(share.id);
      try {
        // Track download via API
        const response = await fetch(
          `/api/library/export?fileId=${share.file.id}&shareId=${share.id}`
        );

        if (!response.ok) {
          throw new Error('Download failed');
        }

        const data = await response.json();

        // Trigger actual download
        const link = document.createElement('a');
        link.href = data.url;
        link.download = data.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Refresh to update download timestamp
        mutate();
      } catch (err) {
        alert('Failed to download file');
      } finally {
        setDownloading(null);
      }
    },
    [mutate]
  );

  const isViewable = (mimeType: string, fileName: string) =>
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/') ||
    fileName.match(/\.(txt|md|rtf|chordpro|cho|crd)$/i);

  const getTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <p className="text-red-400">Failed to load shared files</p>
        <button
          onClick={() => mutate()}
          className="mt-4 flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!data?.shares.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-800 bg-gray-900/50 p-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
          <Share2 className="h-10 w-10 text-blue-500" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">No Shared Files Yet</h2>
        <p className="mx-auto max-w-md text-gray-400">
          When other users share files with you, they'll appear here. You can view, download, and
          organize shared content.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          url={viewingFile.url}
          name={viewingFile.name}
          mimeType={viewingFile.mimeType}
          onClose={() => setViewingFile(null)}
        />
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Shared With Me</h2>
            <p className="text-sm text-gray-400">
              {data.pagination.total} file{data.pagination.total !== 1 ? 's' : ''} shared by others
            </p>
          </div>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Shared Files Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {data.shares.map((share, index) => {
              const Icon = FILE_TYPE_ICONS[share.file.type] || File;

              return (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
                  className="group rounded-xl border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-blue-500/50"
                >
                  {/* Shared By Badge */}
                  <div className="mb-3 flex items-center gap-2">
                    {share.sharedBy.image ? (
                      <Image
                        src={share.sharedBy.image}
                        alt={share.sharedBy.name || share.sharedBy.email}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white">
                        {(share.sharedBy.name || share.sharedBy.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">
                      {share.sharedBy.name || share.sharedBy.email.split('@')[0]}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      {getTimeAgo(share.createdAt)}
                    </span>
                  </div>

                  {/* File Icon */}
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>

                  {/* File Info */}
                  <h3 className="truncate text-sm font-semibold text-white group-hover:text-blue-400">
                    {share.file.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span className="capitalize">{share.file.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{formatFileSize(share.file.size)}</span>
                    {share.file.duration && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(share.file.duration)}</span>
                      </>
                    )}
                    {share.file.bpm && (
                      <>
                        <span>•</span>
                        <span>{share.file.bpm} BPM</span>
                      </>
                    )}
                  </div>

                  {/* Message */}
                  {share.message && (
                    <div className="mt-3 rounded-lg bg-gray-800/50 p-2 text-xs italic text-gray-300">
                      "{share.message}"
                    </div>
                  )}

                  {/* Expiration Warning */}
                  {share.expiresAt && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
                      <Clock className="h-3 w-3" />
                      Expires {formatDate(share.expiresAt)}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-800 pt-3">
                    {/* View */}
                    {isViewable(share.file.mimeType, share.file.name) && (
                      <button
                        onClick={() =>
                          setViewingFile({
                            url: share.file.url,
                            name: share.file.name,
                            mimeType: share.file.mimeType,
                          })
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 transition-all hover:bg-blue-500/20 hover:text-blue-400"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    )}

                    {/* Download */}
                    {share.canDownload && (
                      <button
                        onClick={() => handleDownload(share)}
                        disabled={downloading === share.id}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-400 disabled:opacity-50"
                      >
                        {downloading === share.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Download
                      </button>
                    )}

                    {/* Reshare indicator */}
                    {share.canReshare && (
                      <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                        <Share2 className="h-3 w-3" />
                        Can share
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Load More */}
        {data.pagination.hasMore && (
          <div className="flex justify-center pt-4">
            <button className="rounded-lg border border-gray-800 bg-gray-900 px-6 py-2 text-sm text-white hover:border-blue-500 hover:bg-gray-800">
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
}
