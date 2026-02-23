'use client';

/**
 * SETLIST SHARE MODAL
 *
 * VIRAL LOOP: Generate QR codes and share links for setlists
 * Bands display QR at gigs → fans scan → discover RNRB
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Download,
  Eye,
  Users,
  Loader2,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface SetlistShareModalProps {
  setlistId: string;
  setlistName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareData {
  isPublic: boolean;
  shareToken: string | null;
  shareUrl: string | null;
  publicTitle: string | null;
  qrCodeUrl: string | null;
  viewCount: number;
  totalShares: number;
}

export function SetlistShareModal({
  setlistId,
  setlistName,
  isOpen,
  onClose,
}: SetlistShareModalProps) {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadShareData();
    }
  }, [isOpen, setlistId]);

  const loadShareData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/setlists/${setlistId}/share`);
      if (response.ok) {
        const data = await response.json();
        setShareData(data);
        setCustomTitle(data.publicTitle || setlistName);
      }
    } catch (error) {
      console.error('Failed to load share data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableSharing = async () => {
    setEnabling(true);
    try {
      const response = await fetch(`/api/setlists/${setlistId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicTitle: customTitle,
          isPublic: true,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setShareData({
          isPublic: data.isPublic,
          shareToken: data.shareToken,
          shareUrl: data.shareUrl,
          publicTitle: data.publicTitle,
          qrCodeUrl: data.qrCodeUrl,
          viewCount: shareData?.viewCount || 0,
          totalShares: shareData?.totalShares || 0,
        });
      }
    } catch (error) {
      console.error('Failed to enable sharing:', error);
    } finally {
      setEnabling(false);
    }
  };

  const disableSharing = async () => {
    try {
      await fetch(`/api/setlists/${setlistId}/share`, { method: 'DELETE' });
      setShareData((prev) => (prev ? { ...prev, isPublic: false } : null));
    } catch (error) {
      console.error('Failed to disable sharing:', error);
    }
  };

  const copyLink = async () => {
    if (shareData?.shareUrl) {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (shareData?.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = shareData.qrCodeUrl;
      link.download = `setlist-qr-${setlistId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
                <Share2 className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Share Setlist</h2>
                <p className="text-sm text-gray-400">Let fans see tonight&apos;s lineup</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : shareData?.isPublic && shareData.shareUrl ? (
              /* Sharing Enabled */
              <div className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <div className="mx-auto mb-4 inline-block rounded-2xl bg-white p-4">
                    {shareData.qrCodeUrl ? (
                      <Image
                        src={shareData.qrCodeUrl}
                        alt="Setlist QR Code"
                        width={200}
                        height={200}
                        className="h-[200px] w-[200px]"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-[200px] w-[200px] items-center justify-center">
                        <QrCode className="h-24 w-24 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Display this QR code at your gig for fans to scan
                  </p>
                </div>

                {/* Share URL */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
                    Share Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareData.shareUrl}
                      readOnly
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    <Button onClick={copyLink} variant="ghost" className="shrink-0">
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <a href={shareData.shareUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" className="shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-8 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xl font-bold text-white">
                      <Eye className="h-5 w-5 text-orange-500" />
                      {shareData.viewCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xl font-bold text-white">
                      <Users className="h-5 w-5 text-purple-500" />
                      {shareData.totalShares.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Scans</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={downloadQR}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR
                  </Button>
                  <Button
                    onClick={disableSharing}
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Disable
                  </Button>
                </div>
              </div>
            ) : (
              /* Enable Sharing */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/20">
                    <QrCode className="h-10 w-10 text-orange-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Share with fans</h3>
                  <p className="text-sm text-gray-400">
                    Generate a QR code and link that fans can scan to see your setlist. Great for
                    displaying at gigs!
                  </p>
                </div>

                {/* Title Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Public Title
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Friday Night at The Roxy"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <Button
                  onClick={enableSharing}
                  disabled={enabling}
                  className="w-full bg-orange-500 py-3 hover:bg-orange-600"
                >
                  {enabling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Enable Public Sharing
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Your setlist will be viewable by anyone with the link. Song lyrics and chords
                  remain private.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
