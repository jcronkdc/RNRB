'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Palette,
  Monitor,
  Smartphone,
  Video,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  ChevronRight,
  Play,
  Sparkles,
  Settings,
  Eye,
} from 'lucide-react';

// Overlay themes
const overlayThemes = [
  {
    id: 'dark',
    name: 'Dark Mode',
    preview: '/overlays/dark-preview.png',
    colors: ['#0a0a0a', '#D4A84B', '#ffffff'],
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    preview: '/overlays/neon-preview.png',
    colors: ['#1a0a2e', '#ff00ff', '#00ffff'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    preview: '/overlays/minimal-preview.png',
    colors: ['#ffffff', '#000000', '#D4A84B'],
  },
  {
    id: 'retro',
    name: 'Retro Rock',
    preview: '/overlays/retro-preview.png',
    colors: ['#2d1b00', '#ff6b35', '#f7c59f'],
  },
  {
    id: 'gradient',
    name: 'Gradient',
    preview: '/overlays/gradient-preview.png',
    colors: ['#667eea', '#764ba2', '#ffffff'],
  },
];

// Overlay types
const overlayTypes = [
  { id: 'banner', name: 'Stream Banner', size: '1920x1080', icon: Monitor },
  { id: 'camera', name: 'Camera Frame', size: '400x400', icon: Video },
  { id: 'chat', name: 'Chat Overlay', size: '400x600', icon: FileText },
  { id: 'alert', name: 'Alert Box', size: '600x400', icon: Sparkles },
  { id: 'social', name: 'Social Banner', size: '1200x630', icon: ImageIcon },
];

export default function StreamSetupPage() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [generatingRoom, setGeneratingRoom] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('ROCK2024');

  useEffect(() => {
    // Fetch affiliate code
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch('/api/affiliates/stats');
      if (response.ok) {
        const data = await response.json();
        setAffiliateCode(data.affiliateCode);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    }
  };

  const generateRoomCode = async () => {
    setGeneratingRoom(true);
    try {
      const response = await fetch('/api/daily/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `affiliate-${affiliateCode}-${Date.now()}`,
          privacy: 'public',
          properties: {
            exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
            enable_chat: true,
            enable_screenshare: true,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoomCode(data.name || data.room?.name);
      }
    } catch (error) {
      console.error('Error generating room:', error);
    } finally {
      setGeneratingRoom(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadOverlay = (type: string, theme: string) => {
    // In production, this would download actual overlay files
    const link = document.createElement('a');
    link.href = `/api/affiliates/overlays?type=${type}&theme=${theme}&code=${affiliateCode}`;
    link.download = `rnrb-${type}-${theme}.png`;
    link.click();
  };

  const roomUrl = roomCode ? `https://rocknrollbasement.com/live/${roomCode}` : null;
  const referralLink = `https://rocknrollbasement.com?ref=${affiliateCode}`;

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      {/* Header with Logo */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/affiliate" className="transition-transform hover:scale-105">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            width={48}
            height={48}
            className="rounded-lg"
          />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Stream Setup</h1>
          <p style={{ color: 'var(--muted)' }}>Everything you need to start streaming</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Your Referral Code', value: affiliateCode, id: 'code' },
          { label: 'Referral Link', value: referralLink, id: 'link' },
          { label: 'Stream Room', value: roomUrl || 'Generate a room below', id: 'room' },
        ].map((item) => (
          <div
            key={item.id}
            className="rounded-xl p-4"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <div className="mb-2 text-sm" style={{ color: 'var(--muted)' }}>
              {item.label}
            </div>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 truncate rounded px-2 py-1 text-sm"
                style={{ background: 'var(--bg)', color: 'var(--accent)' }}
              >
                {item.value}
              </code>
              {item.value && item.id !== 'room' && (
                <button
                  onClick={() => copyToClipboard(item.value, item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ background: 'var(--accent)', color: '#000' }}
                >
                  {copied === item.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stream Room Generator */}
      <div
        className="mb-8 rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="mb-2 text-xl font-semibold">One-Click Stream Room</h2>
            <p className="mb-4" style={{ color: 'var(--muted)' }}>
              Generate a unique stream room for your audience. Room links are valid for 7 days.
            </p>
          </div>
          <button
            onClick={generateRoomCode}
            disabled={generatingRoom}
            className="flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            {generatingRoom ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Video className="h-5 w-5" />
            )}
            {generatingRoom ? 'Generating...' : 'Generate Room'}
          </button>
        </div>

        {roomCode && (
          <div
            className="mt-4 rounded-lg p-4"
            style={{ background: 'var(--bg)', border: '1px solid var(--accent)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Your Stream Room URL
                </div>
                <code className="font-mono text-lg" style={{ color: 'var(--accent)' }}>
                  {roomUrl}
                </code>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(roomUrl!, 'room-url')}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium"
                  style={{ background: 'var(--accent)', color: '#000' }}
                >
                  {copied === 'room-url' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </button>
                <Link
                  href={`/live/${roomCode}`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay Theme Selector */}
      <div
        className="mb-8 rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Stream Overlays</h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Download branded overlays with your affiliate code
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" style={{ color: 'var(--muted)' }} />
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              Select Theme:
            </span>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="mb-6 flex flex-wrap gap-3">
          {overlayThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                selectedTheme === theme.id ? 'ring-2 ring-[var(--accent)]' : ''
              }`}
              style={{
                background: selectedTheme === theme.id ? 'var(--accent-dim)' : 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex gap-1">
                {theme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full"
                    style={{ background: color, border: '1px solid var(--border)' }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{theme.name}</span>
            </button>
          ))}
        </div>

        {/* Overlay Downloads */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {overlayTypes.map((overlay) => (
            <div
              key={overlay.id}
              className="group rounded-lg p-4 transition-colors"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: 'var(--accent-dim)' }}
                >
                  <overlay.icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div className="font-medium">{overlay.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {overlay.size}
                  </div>
                </div>
              </div>

              {/* Preview placeholder */}
              <div
                className="mb-3 flex aspect-video items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${overlayThemes.find((t) => t.id === selectedTheme)?.colors[0]} 0%, ${overlayThemes.find((t) => t.id === selectedTheme)?.colors[1]} 100%)`,
                }}
              >
                <div className="text-center text-white">
                  <Eye className="mx-auto mb-1 h-6 w-6 opacity-50" />
                  <span className="text-xs opacity-50">Preview</span>
                </div>
              </div>

              <button
                onClick={() => downloadOverlay(overlay.id, selectedTheme)}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2 font-medium transition-colors"
                style={{ background: 'var(--accent)', color: '#000' }}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Talking Points */}
      <div
        className="mb-8 rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <h2 className="mb-4 text-xl font-semibold">Key Talking Points</h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
          Use these points when discussing Rock N' Roll Basement with your audience:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: 'All-in-One Platform',
              points: [
                'Songwriting tools with AI assistance',
                'Professional studio recording features',
                'Tour management and setlist builder',
                'Band collaboration in real-time',
              ],
            },
            {
              title: 'Affordable Pricing',
              points: [
                'Free tier with core features',
                'Creator plan at $11/month',
                'Studio plan at $27.50/month',
                'No hidden fees or contracts',
              ],
            },
            {
              title: 'Built for Musicians',
              points: [
                'Created by musicians, for musicians',
                'Integrates with existing workflows',
                'Works on desktop and mobile',
                'Privacy-focused - you own your music',
              ],
            },
            {
              title: 'Community Features',
              points: [
                'Connect with other musicians',
                'Share and discover new music',
                'Find collaboration opportunities',
                'Live streaming capabilities',
              ],
            },
          ].map((section, index) => (
            <div
              key={index}
              className="rounded-lg p-4"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <h3 className="mb-2 font-semibold" style={{ color: 'var(--accent)' }}>
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      style={{ color: 'var(--sage)' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Kit */}
      <div
        className="mb-8 rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <h2 className="mb-4 text-xl font-semibold">Social Media Kit</h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
          Ready-to-use graphics and copy for your social channels
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              platform: 'Twitter/X',
              icon: '𝕏',
              formats: ['Header', 'Post Image', 'Thread Template'],
            },
            { platform: 'Instagram', icon: '📸', formats: ['Story', 'Post', 'Reel Cover'] },
            { platform: 'YouTube', icon: '▶️', formats: ['Thumbnail', 'End Screen', 'Banner'] },
            { platform: 'TikTok', icon: '🎵', formats: ['Profile', 'Video Cover', 'Bio Link'] },
          ].map((social, index) => (
            <div
              key={index}
              className="rounded-lg p-4"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">{social.icon}</span>
                <span className="font-medium">{social.platform}</span>
              </div>
              <ul className="space-y-1 text-sm" style={{ color: 'var(--muted)' }}>
                {social.formats.map((format, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    {format}
                  </li>
                ))}
              </ul>
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                <Download className="h-4 w-4" />
                Download All
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--panel) 100%)',
          border: '1px solid var(--accent)',
        }}
      >
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Need Help?</h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Join our affiliate Discord or contact your account manager
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://discord.gg/rocknrollbasement"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium"
              style={{ background: '#5865F2', color: '#fff' }}
            >
              Join Discord
            </a>
            <Link
              href="/affiliate"
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
