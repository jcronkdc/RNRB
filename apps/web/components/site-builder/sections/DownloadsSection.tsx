'use client';

import { Download, FileAudio, ShoppingCart, Play, Pause } from '@/components/ui/custom-icons';
import { useState } from 'react';

interface DownloadItem {
  id: string;
  title: string;
  description?: string;
  type: 'track' | 'stems' | 'sample_pack' | 'preset' | 'sheet_music' | 'other';
  price: number;
  currency?: string;
  thumbnail?: string;
  previewUrl?: string;
  // File info
  format?: string;
  fileSize?: string;
  // Access
  isFree?: boolean;
  requiresEmail?: boolean;
  isPurchased?: boolean;
  downloadUrl?: string;
}

interface DownloadsSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    items?: DownloadItem[];
    showFilters?: boolean;
    allowPreview?: boolean;
  };
  theme?: Record<string, unknown>;
  siteId?: string;
}

const TYPE_LABELS: Record<string, string> = {
  track: 'Track',
  stems: 'Stems',
  sample_pack: 'Sample Pack',
  preset: 'Preset',
  sheet_music: 'Sheet Music',
  other: 'Download',
};

export function DownloadsSection({ content, theme, siteId }: DownloadsSectionProps) {
  const {
    headline = 'Exclusive Downloads',
    subheadline = 'Get stems, samples, and more',
    items = [],
    showFilters = true,
    allowPreview = true,
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);

  // Get unique types
  const types = [...new Set(items.map((item) => item.type))];

  // Filter items
  const filteredItems = activeFilter ? items.filter((item) => item.type === activeFilter) : items;

  const formatPrice = (price: number, currency = 'USD') => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDownload = async (item: DownloadItem) => {
    if (item.isFree && item.requiresEmail && !email) {
      setShowEmailModal(item.id);
      return;
    }

    if (!item.isFree && !item.isPurchased) {
      // Redirect to purchase
      handlePurchase(item);
      return;
    }

    // Direct download
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank');
    }
  };

  const handlePurchase = async (item: DownloadItem) => {
    setProcessingId(item.id);

    try {
      // In production, this would create a Stripe/PayPal checkout session
      const response = await fetch('/api/sites/downloads/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          itemId: item.id,
          price: item.price,
        }),
      });

      if (response.ok) {
        const { checkoutUrl } = await response.json();
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFreeDownload = async (itemId: string) => {
    if (!email) return;

    try {
      await fetch('/api/sites/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          email,
          source: 'download',
        }),
      });

      const item = items.find((i) => i.id === itemId);
      if (item?.downloadUrl) {
        window.open(item.downloadUrl, '_blank');
      }
      setShowEmailModal(null);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const togglePreview = (itemId: string) => {
    setPlayingId(playingId === itemId ? null : itemId);
  };

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        {/* Filters */}
        {showFilters && types.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveFilter(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                !activeFilter ? 'scale-105' : 'hover:bg-white/5'
              }`}
              style={{
                background: !activeFilter ? accentColor : 'var(--panel)',
                color: !activeFilter ? '#fff' : 'var(--text)',
              }}
            >
              All
            </button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeFilter === type ? 'scale-105' : 'hover:bg-white/5'
                }`}
                style={{
                  background: activeFilter === type ? accentColor : 'var(--panel)',
                  color: activeFilter === type ? '#fff' : 'var(--text)',
                }}
              >
                {TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>
        )}

        {/* Items Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ background: 'var(--bg)' }}
                  >
                    <FileAudio size={64} style={{ color: 'var(--muted)' }} />
                  </div>
                )}

                {/* Type Badge */}
                <div
                  className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  {TYPE_LABELS[item.type] || item.type}
                </div>

                {/* Price Badge */}
                <div
                  className="absolute top-3 right-3 rounded-full px-3 py-1 text-sm font-bold"
                  style={{
                    background: item.isFree ? 'rgba(34, 197, 94, 0.9)' : 'rgba(0,0,0,0.8)',
                    color: '#fff',
                  }}
                >
                  {formatPrice(item.price, item.currency)}
                </div>

                {/* Preview Button */}
                {allowPreview && item.previewUrl && (
                  <button
                    onClick={() => togglePreview(item.id)}
                    className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.8)' }}
                  >
                    {playingId === item.id ? (
                      <Pause size={20} className="text-white" />
                    ) : (
                      <Play size={20} className="ml-0.5 text-white" />
                    )}
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mb-3 line-clamp-2 text-sm" style={{ color: 'var(--muted)' }}>
                    {item.description}
                  </p>
                )}

                {/* File Info */}
                <div
                  className="mb-4 flex flex-wrap gap-2 text-xs"
                  style={{ color: 'var(--muted)' }}
                >
                  {item.format && (
                    <span className="rounded bg-white/5 px-2 py-1">{item.format}</span>
                  )}
                  {item.fileSize && (
                    <span className="rounded bg-white/5 px-2 py-1">{item.fileSize}</span>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleDownload(item)}
                  disabled={processingId === item.id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: item.isPurchased || item.isFree ? accentColor : 'var(--bg)',
                    color: item.isPurchased || item.isFree ? '#fff' : 'var(--text)',
                  }}
                >
                  {processingId === item.id ? (
                    'Processing...'
                  ) : item.isPurchased ? (
                    <>
                      <Download size={18} />
                      Download
                    </>
                  ) : item.isFree ? (
                    <>
                      <Download size={18} />
                      {item.requiresEmail ? 'Get Free Download' : 'Download Free'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Download size={48} className="mx-auto mb-4 opacity-50" />
            {activeFilter ? (
              <p>No {TYPE_LABELS[activeFilter] || activeFilter}s available</p>
            ) : (
              <p>No downloads available yet</p>
            )}
          </div>
        )}

        {/* Email Modal for Free Downloads */}
        {showEmailModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="presentation"
            onClick={() => setShowEmailModal(null)}
          >
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: 'var(--panel)' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="email-modal-title"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === 'Escape' && setShowEmailModal(null)}
            >
              <h3
                id="email-modal-title"
                className="mb-4 text-xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                Get Your Free Download
              </h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>
                Enter your email to receive the download link and stay updated on new releases.
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEmailModal(null)}
                    className="flex-1 rounded-xl py-3 font-medium"
                    style={{ background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleFreeDownload(showEmailModal)}
                    disabled={!email}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold disabled:opacity-50"
                    style={{ background: accentColor, color: '#fff' }}
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Player */}
        {playingId && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio
            src={items.find((i) => i.id === playingId)?.previewUrl}
            autoPlay
            onEnded={() => setPlayingId(null)}
            className="hidden"
          />
        )}
      </div>
    </section>
  );
}
