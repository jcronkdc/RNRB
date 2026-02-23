'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  ExternalLink,
  Loader2,
  ChevronRight,
  ChevronDown,
  Zap,
  Link2,
  Send,
  Upload,
  X,
  ArrowRight,
  CheckCircle2,
  Settings,
  Unplug,
  AlertCircle,
  RefreshCw,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';

import { PLATFORMS, type Platform } from './platforms';
import { formatForPlatform, generateHashtags, getCharacterLimit } from './formatters';

// Content types - typography only, no emojis
const CONTENT_TYPES = [
  { id: 'new-release', label: 'NEW RELEASE' },
  { id: 'tour-dates', label: 'TOUR / SHOWS' },
  { id: 'behind-scenes', label: 'BEHIND THE SCENES' },
  { id: 'music-video', label: 'MUSIC VIDEO' },
  { id: 'merch', label: 'MERCH DROP' },
  { id: 'announcement', label: 'ANNOUNCEMENT' },
  { id: 'milestone', label: 'MILESTONE' },
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]['id'];

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface SocialConnection {
  id: string;
  platform: string;
  platform_username: string;
  platform_display_name: string;
  platform_avatar_url: string;
  account_type: string;
  page_name?: string;
  is_active: boolean;
}

interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

// Quick hashtag suggestions
const QUICK_HASHTAGS: Record<string, string[]> = {
  'new-release': ['#NewMusic', '#OutNow', '#NewSingle', '#StreamNow'],
  'tour-dates': ['#OnTour', '#LiveMusic', '#Tickets', '#TourLife'],
  'behind-scenes': ['#BTS', '#StudioLife', '#MakingMusic'],
  'music-video': ['#MusicVideo', '#NewVideo', '#Premiere'],
  merch: ['#Merch', '#NewMerch', '#ShopNow'],
  announcement: ['#Announcement', '#BigNews', '#StayTuned'],
  milestone: ['#ThankYou', '#Grateful', '#Milestone'],
};

// Platforms that support direct posting via API
const DIRECT_POST_PLATFORMS = ['twitter', 'facebook', 'linkedin', 'instagram'];

export function SocialShareHub() {
  const searchParams = useSearchParams();

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Content state
  const [selectedType, setSelectedType] = useState<ContentType>('new-release');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [link, setLink] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // Platform state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'instagram',
    'twitter',
    'facebook',
    'tiktok',
  ]);

  // Connected accounts
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Generation/posting state
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch connected accounts
  const fetchConnections = useCallback(async () => {
    try {
      setLoadingConnections(true);
      const res = await fetch('/api/social/connections');
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Check for connection success from OAuth redirect
  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      fetchConnections();
      // Clear the URL param
      window.history.replaceState({}, '', '/share');
    }
  }, [searchParams, fetchConnections]);

  // Disconnect an account
  const disconnectAccount = async (connectionId: string) => {
    try {
      const res = await fetch('/api/social/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  // Check if platform is connected
  const isPlatformConnected = (platformId: string) => {
    return connections.some((c) => c.platform === platformId && c.is_active);
  };

  // Toggle platform selection
  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: event.target?.result as string,
            type: isImage ? 'image' : 'video',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Generate content for all platforms
  const generateContent = async () => {
    if (!title && !caption) return;

    setGenerating(true);
    setGeneratedContent({});

    try {
      const allHashtags = [
        ...hashtags
          .split(/[\s,]+/)
          .filter((t) => t.length > 0)
          .map((t) => (t.startsWith('#') ? t : `#${t}`)),
        ...generateHashtags(selectedType, title),
      ].filter((tag, i, arr) => arr.indexOf(tag) === i);

      const generated: Record<string, string> = {};

      for (const platformId of selectedPlatforms) {
        const platform = PLATFORMS.find((p) => p.id === platformId);
        if (!platform) continue;

        generated[platformId] = formatForPlatform(platform, {
          title,
          description: caption,
          url: link,
          hashtags: allHashtags,
          mentions: [],
          contentType: selectedType,
        });
      }

      setGeneratedContent(generated);
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Post to all connected platforms
  const postToAllPlatforms = async () => {
    setPosting(true);
    setPostResults([]);

    try {
      // Get platforms that are both selected and connected
      const connectedSelected = selectedPlatforms.filter(
        (p) => isPlatformConnected(p) && DIRECT_POST_PLATFORMS.includes(p)
      );

      if (connectedSelected.length === 0) {
        // Fall back to copy/share intent if no connected accounts
        alert('No connected accounts. Content copied to clipboard - paste on each platform.');
        return;
      }

      // Build platform-specific content
      const platformContent: Record<string, { text: string }> = {};
      for (const platformId of connectedSelected) {
        if (generatedContent[platformId]) {
          platformContent[platformId] = { text: generatedContent[platformId] };
        }
      }

      const res = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: connectedSelected,
          content: {
            text: caption || title,
            link: link || undefined,
          },
          platformContent,
        }),
      });

      const data = await res.json();
      setPostResults(data.results || []);
    } catch (error) {
      console.error('Post failed:', error);
    } finally {
      setPosting(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (platformId: string) => {
    const text = generatedContent[platformId];
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platformId);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Share to platform (fallback for non-connected)
  const shareToPlatform = (platform: Platform) => {
    const text = generatedContent[platform.id] || caption;
    const url = link || '';

    let shareUrl = '';
    switch (platform.id) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      default:
        copyToClipboard(platform.id);
        if (platform.shareUrl) window.open(platform.shareUrl, '_blank');
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  // Check if ready for next step
  const canProceed = title.length > 0 || caption.length > 0;

  // Count connected vs selected
  const connectedCount = selectedPlatforms.filter((p) => isPlatformConnected(p)).length;

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="relative z-10 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-col items-center">
            <Link href="/" className="mb-6">
              <Image
                src="/logo-light.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))',
                }}
              />
            </Link>
            <div className="flex items-center gap-4">
              <h1
                className="font-mono text-sm uppercase tracking-[0.3em]"
                style={{ color: 'var(--muted)' }}
              >
                Social Share Hub
              </h1>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 rounded-none px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition hover:bg-white/10"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                <Settings className="h-3 w-3" />
                {connections.length > 0 && (
                  <span className="ml-1 text-green-500">{connections.length}</span>
                )}
              </button>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
              One post. Every platform.
            </p>
          </div>

          {/* Connected Accounts Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="rounded-none p-4" style={{ border: '1px solid var(--border)' }}>
                  <h3
                    className="mb-4 font-mono text-xs uppercase tracking-widest"
                    style={{ color: 'var(--muted)' }}
                  >
                    Connected Accounts
                  </h3>

                  {loadingConnections ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span style={{ color: 'var(--muted)' }}>Loading...</span>
                    </div>
                  ) : connections.length === 0 ? (
                    <p className="py-4 text-sm" style={{ color: 'var(--muted)' }}>
                      No accounts connected. Connect your social accounts to post directly.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {connections.map((conn) => (
                        <div
                          key={conn.id}
                          className="flex items-center justify-between p-3"
                          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                        >
                          <div className="flex items-center gap-3">
                            {conn.platform_avatar_url && (
                              <img
                                src={conn.platform_avatar_url}
                                alt=""
                                className="h-8 w-8 rounded-full"
                              />
                            )}
                            <div>
                              <p
                                className="font-mono text-xs uppercase"
                                style={{ color: 'var(--text)' }}
                              >
                                {conn.platform}
                                {conn.page_name && ` - ${conn.page_name}`}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                @{conn.platform_username}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => disconnectAccount(conn.id)}
                            className="flex items-center gap-1 px-2 py-1 text-red-500 transition hover:bg-red-500/10"
                          >
                            <Unplug className="h-3 w-3" />
                            <span className="font-mono text-[10px] uppercase">Disconnect</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Connect buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!isPlatformConnected('twitter') && (
                      <a
                        href="/api/social/connect/twitter"
                        className="flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition hover:bg-white/10"
                        style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
                      >
                        Connect Twitter/X
                      </a>
                    )}
                    {!isPlatformConnected('facebook') && (
                      <a
                        href="/api/social/connect/facebook"
                        className="flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition hover:bg-white/10"
                        style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
                      >
                        Connect Facebook/Instagram
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'CREATE' },
              { num: 2, label: 'PLATFORMS' },
              { num: 3, label: 'SHARE' },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => step.num < currentStep && setCurrentStep(step.num)}
                  className={`flex items-center gap-2 rounded-none px-4 py-2 font-mono text-xs uppercase tracking-wider transition ${
                    currentStep === step.num
                      ? 'text-white'
                      : currentStep > step.num
                        ? 'text-green-500'
                        : 'text-zinc-600'
                  }`}
                  style={{
                    borderBottom:
                      currentStep === step.num
                        ? '2px solid var(--accent)'
                        : '2px solid transparent',
                  }}
                >
                  {currentStep > step.num ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        background: currentStep === step.num ? 'var(--accent)' : 'var(--card)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {step.num}
                    </span>
                  )}
                  {step.label}
                </button>
                {i < 2 && (
                  <ChevronRight className="mx-2 h-4 w-4" style={{ color: 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Create Content */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Content Type */}
              <div>
                <h2
                  className="mb-4 font-mono text-xs uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Content Type
                </h2>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`rounded-none px-4 py-2 font-mono text-xs uppercase tracking-wider transition ${
                        selectedType === type.id
                          ? 'bg-white text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        border:
                          selectedType === type.id ? '1px solid white' : '1px solid var(--border)',
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <h2
                  className="mb-4 font-mono text-xs uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Media{' '}
                  <span className="font-normal normal-case tracking-normal text-zinc-600">
                    (optional)
                  </span>
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-2 transition"
                    style={{
                      border: '1px dashed var(--border)',
                      color: 'var(--muted)',
                    }}
                  >
                    <Upload className="h-5 w-5" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">Upload</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {mediaFiles.map((media) => (
                    <div key={media.id} className="group relative h-24 w-24 overflow-hidden">
                      {media.type === 'image' ? (
                        <img src={media.preview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <video src={media.preview} className="h-full w-full object-cover" />
                      )}
                      <button
                        onClick={() =>
                          setMediaFiles((prev) => prev.filter((m) => m.id !== media.id))
                        }
                        className="absolute right-1 top-1 rounded-full p-1 opacity-0 transition group-hover:opacity-100"
                        style={{ background: 'rgba(0,0,0,0.8)' }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Caption */}
              <div>
                <h2
                  className="mb-4 font-mono text-xs uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Message
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="mb-2 block font-mono text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--muted)' }}
                    >
                      Title / Headline
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's the headline?"
                      className="w-full rounded-none p-4 text-lg font-medium transition focus:outline-hidden"
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block font-mono text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--muted)' }}
                    >
                      Caption
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Tell your story..."
                      rows={5}
                      className="w-full rounded-none p-4 transition focus:outline-hidden"
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                    />
                    <p
                      className="mt-1 text-right font-mono text-xs"
                      style={{ color: 'var(--muted)' }}
                    >
                      {caption.length} characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Link & Hashtags - Collapsible */}
              <div style={{ border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex w-full items-center justify-between p-4 font-mono text-xs uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  <span>Link & Hashtags</span>
                  <ChevronDown
                    className={`h-4 w-4 transition ${showAdvanced ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="space-y-4 p-4"
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        <div>
                          <label
                            className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider"
                            style={{ color: 'var(--muted)' }}
                          >
                            <Link2 className="h-3 w-3" />
                            URL
                          </label>
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded-none p-3 font-mono text-sm transition focus:outline-hidden"
                            style={{
                              background: 'var(--card)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-2 font-mono text-[10px] uppercase tracking-wider"
                            style={{ color: 'var(--muted)' }}
                          >
                            Hashtags
                          </label>
                          <input
                            type="text"
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            placeholder="#newmusic #indie..."
                            className="w-full rounded-none p-3 font-mono text-sm transition focus:outline-hidden"
                            style={{
                              background: 'var(--card)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                            }}
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            {QUICK_HASHTAGS[selectedType]?.map((tag) => (
                              <button
                                key={tag}
                                onClick={() =>
                                  setHashtags((prev) =>
                                    prev.includes(tag) ? prev : prev ? `${prev} ${tag}` : tag
                                  )
                                }
                                className={`rounded-none px-2 py-1 font-mono text-[10px] transition ${
                                  hashtags.includes(tag)
                                    ? 'bg-white/10 text-white'
                                    : 'text-zinc-500 hover:text-white'
                                }`}
                                style={{ border: '1px solid var(--border)' }}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceed}
                className="flex w-full items-center justify-center gap-3 py-4 font-mono text-sm uppercase tracking-widest transition disabled:opacity-30"
                style={{
                  background: canProceed ? 'white' : 'var(--card)',
                  color: canProceed ? 'black' : 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                Choose Platforms
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Select Platforms */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2
                    className="font-mono text-xs uppercase tracking-widest"
                    style={{ color: 'var(--muted)' }}
                  >
                    Select Platforms
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPlatforms(PLATFORMS.map((p) => p.id))}
                      className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition hover:text-white"
                    >
                      All
                    </button>
                    <span style={{ color: 'var(--border)' }}>|</span>
                    <button
                      onClick={() => setSelectedPlatforms([])}
                      className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition hover:text-white"
                    >
                      None
                    </button>
                  </div>
                </div>

                {/* Platform Groups */}
                {['Social', 'Music', 'Video', 'Messaging'].map((category) => {
                  const categoryLower = category.toLowerCase();
                  const platforms = PLATFORMS.filter((p) => p.category === categoryLower);
                  if (platforms.length === 0) return null;

                  return (
                    <div key={category} className="mb-8 last:mb-0">
                      <h3
                        className="mb-3 font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: 'var(--muted)' }}
                      >
                        {category}
                      </h3>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {platforms.map((platform) => {
                          const isConnected = isPlatformConnected(platform.id);
                          const isSelected = selectedPlatforms.includes(platform.id);

                          return (
                            <button
                              key={platform.id}
                              onClick={() => togglePlatform(platform.id)}
                              className="relative flex flex-col items-center gap-2 p-4 transition"
                              style={{
                                background: isSelected ? 'var(--card)' : 'transparent',
                                border: isSelected
                                  ? `1px solid ${platform.color}`
                                  : '1px solid var(--border)',
                              }}
                            >
                              {/* Connected indicator */}
                              {isConnected && (
                                <div
                                  className="absolute right-1 top-1 h-2 w-2 rounded-full"
                                  style={{ background: '#22c55e' }}
                                  title="Connected"
                                />
                              )}
                              <span
                                className="flex h-10 w-10 items-center justify-center font-mono text-xs font-bold"
                                style={{
                                  background: isSelected ? platform.color : 'transparent',
                                  border: isSelected ? 'none' : `1px solid ${platform.color}`,
                                  color: isSelected ? 'white' : platform.color,
                                }}
                              >
                                {platform.icon}
                              </span>
                              <span
                                className="font-mono text-[10px] uppercase tracking-wider"
                                style={{
                                  color: isSelected ? 'var(--text)' : 'var(--muted)',
                                }}
                              >
                                {platform.name.split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 flex items-center justify-between">
                  <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                    {selectedPlatforms.length} selected
                  </p>
                  {connectedCount > 0 && (
                    <p className="flex items-center gap-1 font-mono text-xs text-green-500">
                      <CheckCircle2 className="h-3 w-3" />
                      {connectedCount} connected for direct posting
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-4 font-mono text-xs uppercase tracking-widest transition"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--muted)',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={generateContent}
                  disabled={generating || selectedPlatforms.length === 0}
                  className="flex flex-2 items-center justify-center gap-2 py-4 font-mono text-xs uppercase tracking-widest transition disabled:opacity-30"
                  style={{
                    background: 'white',
                    color: 'black',
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Generate Posts
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Share */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Status Banner */}
              <div
                className="p-4 text-center"
                style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
              >
                {postResults.length > 0 ? (
                  <>
                    <p
                      className="font-mono text-xs uppercase tracking-widest"
                      style={{
                        color: postResults.every((r) => r.success) ? '#22c55e' : '#f59e0b',
                      }}
                    >
                      {postResults.every((r) => r.success)
                        ? 'All posts published!'
                        : 'Partially posted'}
                    </p>
                    <p className="mt-1 text-lg" style={{ color: 'var(--text)' }}>
                      {postResults.filter((r) => r.success).length}/{postResults.length} successful
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="font-mono text-xs uppercase tracking-widest"
                      style={{ color: 'var(--accent)' }}
                    >
                      Ready to share
                    </p>
                    <p className="mt-1 text-lg" style={{ color: 'var(--text)' }}>
                      {Object.keys(generatedContent).length} posts generated
                    </p>
                    {connectedCount > 0 && (
                      <p className="mt-2 flex items-center justify-center gap-1 text-xs text-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        {connectedCount} platforms ready for direct posting
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Generated Posts */}
              <div className="space-y-4">
                {Object.entries(generatedContent).map(([platformId, text]) => {
                  const platform = PLATFORMS.find((p) => p.id === platformId);
                  if (!platform) return null;

                  const charLimit = getCharacterLimit(platformId);
                  const isOverLimit = charLimit && text.length > charLimit;
                  const isConnected = isPlatformConnected(platformId);
                  const result = postResults.find((r) => r.platform === platformId);

                  return (
                    <div
                      key={platformId}
                      className="overflow-hidden"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      {/* Platform Header */}
                      <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-8 w-8 items-center justify-center font-mono text-xs font-bold"
                            style={{ background: platform.color }}
                          >
                            {platform.icon}
                          </span>
                          <span
                            className="font-mono text-xs uppercase tracking-wider"
                            style={{ color: 'var(--text)' }}
                          >
                            {platform.name}
                          </span>
                          {isConnected && (
                            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] text-green-500">
                              <CheckCircle2 className="h-2 w-2" />
                              Connected
                            </span>
                          )}
                          {result && (
                            <span
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                                result.success
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}
                            >
                              {result.success ? (
                                <>
                                  <CheckCircle2 className="h-2 w-2" />
                                  Posted
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-2 w-2" />
                                  {result.error}
                                </>
                              )}
                            </span>
                          )}
                          {charLimit && (
                            <span
                              className="font-mono text-[10px]"
                              style={{ color: isOverLimit ? '#ef4444' : 'var(--muted)' }}
                            >
                              {text.length}/{charLimit}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(platformId)}
                            className="flex items-center gap-1 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition"
                            style={{
                              border: '1px solid var(--border)',
                              color: copiedPlatform === platformId ? '#22c55e' : 'var(--muted)',
                            }}
                          >
                            {copiedPlatform === platformId ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                          {result?.postUrl ? (
                            <a
                              href={result.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white transition"
                              style={{ background: '#22c55e' }}
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          ) : (
                            <button
                              onClick={() => shareToPlatform(platform)}
                              className="flex items-center gap-1 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white transition"
                              style={{ background: platform.color }}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Share
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4" style={{ background: 'var(--card)' }}>
                        <p
                          className="whitespace-pre-wrap text-sm leading-relaxed"
                          style={{ color: 'var(--text)' }}
                        >
                          {text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setGeneratedContent({});
                    setPostResults([]);
                  }}
                  className="flex-1 py-4 font-mono text-xs uppercase tracking-widest transition"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--muted)',
                  }}
                >
                  New Post
                </button>
                {connectedCount > 0 && postResults.length === 0 && (
                  <button
                    onClick={postToAllPlatforms}
                    disabled={posting}
                    className="flex flex-2 items-center justify-center gap-2 py-4 font-mono text-xs uppercase tracking-widest text-white transition disabled:opacity-50"
                    style={{ background: '#22c55e' }}
                  >
                    {posting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Post to {connectedCount} Connected
                      </>
                    )}
                  </button>
                )}
                {(connectedCount === 0 || postResults.length > 0) && (
                  <button
                    onClick={() => {
                      Object.keys(generatedContent).forEach((platformId, i) => {
                        const platform = PLATFORMS.find((p) => p.id === platformId);
                        if (platform) {
                          setTimeout(() => shareToPlatform(platform), i * 300);
                        }
                      });
                    }}
                    className="flex flex-2 items-center justify-center gap-2 py-4 font-mono text-xs uppercase tracking-widest transition"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open All Platforms
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
