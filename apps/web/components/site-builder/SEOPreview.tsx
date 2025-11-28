'use client';

import { Search, Monitor, Smartphone, ExternalLink, Star, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SEOPreviewProps {
  siteTitle: string;
  metaDescription: string;
  subdomain: string;
  customDomain?: string | null;
  siteName?: string;
}

export function SEOPreview({
  siteTitle,
  metaDescription,
  subdomain,
  customDomain,
  siteName,
}: SEOPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Generate display URL
  const displayUrl = customDomain || `${subdomain}.cronkwaters.com`;

  // Truncate for display
  const truncateTitle = (text: string, max: number) => {
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  };

  const truncateDescription = (text: string, max: number) => {
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  };

  // Character limits for SEO
  const titleLimit = 60;
  const descriptionLimit = device === 'desktop' ? 160 : 120;

  const displayTitle = truncateTitle(siteTitle || siteName || 'Your Website', titleLimit);
  const displayDescription = truncateDescription(
    metaDescription || 'Official website and music hub',
    descriptionLimit
  );

  // Character count warnings
  const titleWarning = siteTitle.length > titleLimit;
  const descriptionWarning = metaDescription.length > descriptionLimit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            SEO Preview
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            How your site appears in search results
          </p>
        </div>

        {/* Device Toggle */}
        <div
          className="flex rounded-lg p-1"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
              device === 'desktop' ? 'bg-white/10' : ''
            }`}
            style={{
              color: device === 'desktop' ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            <Monitor size={14} />
            Desktop
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
              device === 'mobile' ? 'bg-white/10' : ''
            }`}
            style={{
              color: device === 'mobile' ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            <Smartphone size={14} />
            Mobile
          </button>
        </div>
      </div>

      {/* Google Search Results Mock */}
      <div
        className="rounded-xl p-6"
        style={{
          background: device === 'desktop' ? '#fff' : '#202124',
          border: device === 'desktop' ? '1px solid #ddd' : '1px solid #3c4043',
        }}
      >
        {/* Search Bar Mock */}
        <div
          className={`mb-6 flex items-center gap-3 rounded-full px-4 py-3 ${
            device === 'desktop' ? 'border border-gray-300' : ''
          }`}
          style={{
            background: device === 'desktop' ? '#fff' : '#303134',
            boxShadow: device === 'desktop' ? '0 1px 6px rgba(32,33,36,.28)' : 'none',
          }}
        >
          <Search size={20} style={{ color: device === 'desktop' ? '#9aa0a6' : '#bdc1c6' }} />
          <span
            className="flex-1 text-sm"
            style={{ color: device === 'desktop' ? '#202124' : '#e8eaed' }}
          >
            {siteName || 'musician website'}
          </span>
        </div>

        {/* Search Result Preview */}
        <div className={device === 'desktop' ? 'ml-40' : ''}>
          {/* Breadcrumb URL */}
          <div className="mb-1 flex items-center gap-2">
            {device === 'desktop' && (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: '#f1f3f4' }}
              >
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
              </div>
            )}
            <div className="flex items-center gap-1 text-sm">
              <span style={{ color: device === 'desktop' ? '#202124' : '#e8eaed' }}>
                {displayUrl}
              </span>
              {device === 'desktop' && <ChevronDown size={14} style={{ color: '#5f6368' }} />}
            </div>
          </div>

          {/* Title */}
          <h3
            className={`mb-1 cursor-pointer font-normal hover:underline ${
              device === 'desktop' ? 'text-xl' : 'text-lg'
            }`}
            style={{ color: device === 'desktop' ? '#1a0dab' : '#8ab4f8' }}
          >
            {displayTitle}
          </h3>

          {/* Description */}
          <p
            className={device === 'desktop' ? 'text-sm' : 'text-xs'}
            style={{
              color: device === 'desktop' ? '#4d5156' : '#bdc1c6',
              lineHeight: '1.6',
            }}
          >
            {displayDescription}
          </p>

          {/* Rich Snippet Elements (Optional Enhancement) */}
          {device === 'desktop' && (
            <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: '#70757a' }}>
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span>5.0</span>
              </div>
              <span>Music • Entertainment</span>
            </div>
          )}
        </div>
      </div>

      {/* Character Count Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Page Title
            </span>
            <span
              className={`text-xs font-medium ${titleWarning ? 'text-red-400' : 'text-green-400'}`}
            >
              {siteTitle.length} / {titleLimit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((siteTitle.length / titleLimit) * 100, 100)}%`,
                background: titleWarning ? '#ef4444' : '#10b981',
              }}
            />
          </div>
          {titleWarning && (
            <p className="mt-2 text-xs text-red-400">
              Title is too long and will be truncated in search results
            </p>
          )}
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Meta Description
            </span>
            <span
              className={`text-xs font-medium ${
                descriptionWarning ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {metaDescription.length} / {descriptionLimit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((metaDescription.length / descriptionLimit) * 100, 100)}%`,
                background: descriptionWarning ? '#ef4444' : '#10b981',
              }}
            />
          </div>
          {descriptionWarning && (
            <p className="mt-2 text-xs text-red-400">
              Description is too long and will be truncated in search results
            </p>
          )}
        </div>
      </div>

      {/* SEO Tips */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <h4 className="mb-4 font-semibold" style={{ color: 'var(--text)' }}>
          SEO Best Practices
        </h4>
        <div className="space-y-3 text-sm" style={{ color: 'var(--muted)' }}>
          <div className="flex gap-3">
            <div
              className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            <p>
              <strong style={{ color: 'var(--text)' }}>Title:</strong> Keep it under 60 characters.
              Include your band/artist name and what you do.
            </p>
          </div>
          <div className="flex gap-3">
            <div
              className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            <p>
              <strong style={{ color: 'var(--text)' }}>Description:</strong> Aim for 120-160
              characters. Make it compelling and include keywords naturally.
            </p>
          </div>
          <div className="flex gap-3">
            <div
              className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            <p>
              <strong style={{ color: 'var(--text)' }}>Keywords:</strong> Focus on your genre,
              location, and unique qualities (e.g., &quot;indie rock band Seattle&quot;)
            </p>
          </div>
          <div className="flex gap-3">
            <div
              className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            <p>
              <strong style={{ color: 'var(--text)' }}>Uniqueness:</strong> Make sure your title and
              description stand out from competitors.
            </p>
          </div>
        </div>

        <a
          href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          Learn more about SEO
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
