'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Eye,
  Lock,
  FileText,
  Music,
  Image as ImageIcon,
  File,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { FileViewer } from '@/components/file-viewer';

interface SharedFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: string;
  url: string;
  duration?: number;
  ownerName: string;
}

interface ShareData {
  file: SharedFile;
  canDownload: boolean;
  expiresAt: string | null;
  linkName: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadShareData();
  }, [token]);

  const loadShareData = async (pwd?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/share/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });

      if (response.status === 401) {
        setNeedsPassword(true);
        setPasswordError(pwd ? 'Incorrect password' : null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load shared file');
      }

      const data = await response.json();
      setShareData(data);
      setNeedsPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadShareData(password);
  };

  const handleDownload = async () => {
    if (!shareData || !shareData.canDownload) return;

    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = shareData.file.url;
      link.download = shareData.file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytesStr: string): string => {
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'Unknown';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, mimeType: string) => {
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('text/') || mimeType === 'application/pdf') return FileText;
    return File;
  };

  const isViewable = (mimeType: string, fileName: string) =>
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/') ||
    fileName.match(/\.(txt|md|rtf|chordpro|cho|crd)$/i);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">Link Not Found</h1>
          <p className="mb-6 text-gray-400">{error}</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600"
          >
            Go Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // Password required state
  if (needsPassword) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">Password Protected</h1>
            <p className="text-gray-400">This file requires a password to access</p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mb-4 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none"
              autoFocus
            />

            {passwordError && (
              <p className="mb-4 text-center text-sm text-red-400">{passwordError}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-orange-500 py-3 font-medium text-white hover:bg-orange-600"
            >
              Unlock File
            </button>
          </form>
        </motion.div>

        {/* Logo */}
        <Link href="/" className="mt-8">
          <Image src="/logo-light.png" alt="Rock N' Roll Basement" width={120} height={48} />
        </Link>
      </div>
    );
  }

  // File view state
  if (!shareData) return null;

  const FileIcon = getFileIcon(shareData.file.type, shareData.file.mimeType);

  return (
    <>
      {/* File Viewer Modal */}
      {viewing && (
        <FileViewer
          url={shareData.file.url}
          name={shareData.file.originalName}
          mimeType={shareData.file.mimeType}
          onClose={() => setViewing(false)}
        />
      )}

      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-8"
        >
          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
              <FileIcon className="h-8 w-8 text-orange-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-white">
                {shareData.linkName || shareData.file.name}
              </h1>
              <p className="mt-1 text-sm text-gray-400">Shared by {shareData.file.ownerName}</p>
            </div>
          </div>

          {/* File Info */}
          <div className="mb-6 space-y-3 rounded-xl border border-gray-800 bg-gray-800/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">File name</span>
              <span className="truncate pl-4 text-white">{shareData.file.originalName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Type</span>
              <span className="capitalize text-white">{shareData.file.type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Size</span>
              <span className="text-white">{formatFileSize(shareData.file.size)}</span>
            </div>
            {shareData.expiresAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Expires</span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <Clock className="h-4 w-4" />
                  {new Date(shareData.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isViewable(shareData.file.mimeType, shareData.file.originalName) && (
              <button
                onClick={() => setViewing(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
              >
                <Eye className="h-5 w-5" />
                View
              </button>
            )}

            {shareData.canDownload && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                Download
              </button>
            )}
          </div>

          {/* Success indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-500">
            <CheckCircle className="h-4 w-4" />
            <span>Secure share link</span>
          </div>
        </motion.div>

        {/* Logo */}
        <Link href="/" className="mt-8">
          <Image src="/logo-light.png" alt="Rock N' Roll Basement" width={120} height={48} />
        </Link>

        {/* Footer */}
        <p className="mt-4 text-xs text-gray-500">
          Powered by Rock N' Roll Basement •{' '}
          <Link href="/signup" className="text-orange-500 hover:underline">
            Create your own
          </Link>
        </p>
      </div>
    </>
  );
}
