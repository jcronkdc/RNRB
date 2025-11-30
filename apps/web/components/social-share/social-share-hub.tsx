'use client';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Loader2,
  Music,
  Calendar,
  Disc3,
  Video,
  Image as ImageIcon,
  FileText,
  Globe,
  ChevronRight,
  RefreshCw,
  Zap,
  Hash,
  Clock,
  Send,
  Eye,
  Settings2,
  Wand2,
  Upload,
  X,
  Link2,
  QrCode,
  CalendarDays,
  TrendingUp,
  Bookmark,
  LayoutTemplate,
  Layers,
  Download,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  BarChart3,
  Target,
  Users,
  MessageCircle,
  Heart,
  Repeat,
  BookmarkPlus,
  Timer,
  Palette,
  Type,
  ImagePlus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback, useRef, useEffect } from 'react';

import { PLATFORMS, PLATFORM_GROUPS, type Platform } from './platforms';
import { formatForPlatform, generateHashtags, getCharacterLimit } from './formatters';

// Content types for musicians
const CONTENT_TYPES = [
  {
    id: 'new-release',
    label: 'New Release',
    icon: Disc3,
    description: 'Single, EP, Album drop',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'tour-dates',
    label: 'Tour Dates',
    icon: Calendar,
    description: 'Upcoming shows & dates',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'behind-scenes',
    label: 'Behind the Scenes',
    icon: Video,
    description: 'Studio, rehearsal footage',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'music-video',
    label: 'Music Video',
    icon: Video,
    description: 'Video premiere or teaser',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'merch',
    label: 'Merch Drop',
    icon: FileText,
    description: 'New merchandise',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'live-stream',
    label: 'Live Stream',
    icon: Globe,
    description: 'Announce live performance',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    icon: Music,
    description: 'Feature announcement',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'milestone',
    label: 'Milestone',
    icon: Sparkles,
    description: 'Achievement celebration',
    color: 'from-yellow-500 to-orange-500',
  },
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]['id'];

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  aspectRatio?: string;
}

interface ScheduledPost {
  platform: string;
  scheduledTime: Date;
  content: string;
}

interface ThreadPost {
  id: string;
  content: string;
  media?: MediaFile[];
}

interface ShareContent {
  title: string;
  description: string;
  url?: string;
  hashtags: string[];
  mentions: string[];
  releaseDate?: string;
}

// Optimal posting times by platform (in user's local time)
const OPTIMAL_TIMES: Record<string, { day: string; time: string; engagement: string }[]> = {
  instagram: [
    { day: 'Wednesday', time: '11:00 AM', engagement: 'Highest' },
    { day: 'Friday', time: '10:00 AM', engagement: 'High' },
    { day: 'Tuesday', time: '2:00 PM', engagement: 'Good' },
  ],
  twitter: [
    { day: 'Wednesday', time: '9:00 AM', engagement: 'Highest' },
    { day: 'Tuesday', time: '10:00 AM', engagement: 'High' },
    { day: 'Thursday', time: '12:00 PM', engagement: 'Good' },
  ],
  tiktok: [
    { day: 'Tuesday', time: '9:00 AM', engagement: 'Highest' },
    { day: 'Thursday', time: '12:00 PM', engagement: 'High' },
    { day: 'Friday', time: '5:00 PM', engagement: 'Good' },
  ],
  facebook: [
    { day: 'Wednesday', time: '1:00 PM', engagement: 'Highest' },
    { day: 'Friday', time: '11:00 AM', engagement: 'High' },
    { day: 'Monday', time: '9:00 AM', engagement: 'Good' },
  ],
  youtube: [
    { day: 'Friday', time: '3:00 PM', engagement: 'Highest' },
    { day: 'Saturday', time: '9:00 AM', engagement: 'High' },
    { day: 'Thursday', time: '5:00 PM', engagement: 'Good' },
  ],
  linkedin: [
    { day: 'Tuesday', time: '10:00 AM', engagement: 'Highest' },
    { day: 'Wednesday', time: '12:00 PM', engagement: 'High' },
    { day: 'Thursday', time: '9:00 AM', engagement: 'Good' },
  ],
};

// Trending hashtags by content type
const TRENDING_HASHTAGS: Record<string, string[]> = {
  'new-release': [
    '#NewMusicFriday',
    '#OutNow',
    '#StreamNow',
    '#LinkInBio',
    '#NewSingle',
    '#MusicMonday',
    '#NowPlaying',
    '#Spotify',
    '#AppleMusic',
  ],
  'tour-dates': [
    '#OnTour',
    '#LiveMusic',
    '#ConcertLife',
    '#TourLife',
    '#ShowAnnouncement',
    '#Tickets',
    '#ComingSoon',
  ],
  'behind-scenes': [
    '#StudioLife',
    '#RecordingSession',
    '#BTS',
    '#MakingMusic',
    '#InTheStudio',
    '#CreativeProcess',
  ],
  'music-video': [
    '#MusicVideo',
    '#Premiere',
    '#WatchNow',
    '#NewVideo',
    '#VideoRelease',
    '#YouTube',
  ],
  merch: ['#Merch', '#NewMerch', '#BandMerch', '#MerchDrop', '#LimitedEdition', '#ShopNow'],
  'live-stream': [
    '#LiveStream',
    '#GoingLive',
    '#LivePerformance',
    '#VirtualConcert',
    '#StreamingLive',
  ],
  collaboration: ['#Collab', '#Feature', '#NewCollab', '#Collaboration', '#Featuring'],
  milestone: ['#ThankYou', '#Milestone', '#Grateful', '#Achievement', '#Blessed'],
};

export function SocialShareHub() {
  // Core state
  const [selectedType, setSelectedType] = useState<ContentType>('new-release');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // View state
  const [activeTab, setActiveTab] = useState<'compose' | 'schedule' | 'templates' | 'analytics'>(
    'compose'
  );
  const [showPreview, setShowPreview] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState<string>('instagram');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Content state
  const [content, setContent] = useState<ShareContent>({
    title: '',
    description: '',
    url: '',
    hashtags: [],
    mentions: [],
  });
  const [customHashtags, setCustomHashtags] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [smartLinkUrl, setSmartLinkUrl] = useState('');
  const [utmParams, setUtmParams] = useState({ source: '', medium: 'social', campaign: '' });

  // Thread/Carousel state
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadPosts, setThreadPosts] = useState<ThreadPost[]>([{ id: '1', content: '' }]);

  // Scheduling state
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Template state
  const [savedTemplates, setSavedTemplates] = useState<
    Array<{ id: string; name: string; content: ShareContent; type: ContentType }>
  >([]);
  const [templateName, setTemplateName] = useState('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('social-share-templates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  // Platform selection
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const selectPlatformGroup = (groupKey: keyof typeof PLATFORM_GROUPS) => {
    setSelectedPlatforms(PLATFORM_GROUPS[groupKey]);
  };

  // Media handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const newMedia: MediaFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: event.target?.result as string,
          type: isImage ? 'image' : 'video',
        };
        setMediaFiles((prev) => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (id: string) => {
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
  };

  // Smart link generation
  const generateSmartLink = () => {
    if (!content.url) return;

    let finalUrl = content.url;

    // Add UTM parameters
    const params = new URLSearchParams();
    if (utmParams.source) params.set('utm_source', utmParams.source);
    if (utmParams.medium) params.set('utm_medium', utmParams.medium);
    if (utmParams.campaign) params.set('utm_campaign', utmParams.campaign);

    if (params.toString()) {
      finalUrl += (content.url.includes('?') ? '&' : '?') + params.toString();
    }

    setSmartLinkUrl(finalUrl);
  };

  // QR Code generation (base64 data URL)
  const generateQRCode = async () => {
    const urlToEncode = smartLinkUrl || content.url;
    if (!urlToEncode) return null;

    // Using QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(urlToEncode)}`;
  };

  // Content generation
  const generateContent = async () => {
    if (!content.title && !content.description) return;

    setGenerating(true);
    setGeneratedContent({});

    try {
      const platformsToGenerate =
        selectedPlatforms.length > 0 ? selectedPlatforms : PLATFORMS.map((p) => p.id);

      // Combine all hashtags
      const allHashtags = [
        ...content.hashtags,
        ...customHashtags
          .split(/[\s,]+/)
          .filter((tag) => tag.length > 0)
          .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)),
        ...generateHashtags(selectedType, content.title),
      ].filter((tag, index, self) => self.indexOf(tag) === index);

      const generated: Record<string, string> = {};

      for (const platformId of platformsToGenerate) {
        const platform = PLATFORMS.find((p) => p.id === platformId);
        if (!platform) continue;

        generated[platformId] = formatForPlatform(platform, {
          ...content,
          hashtags: allHashtags,
          contentType: selectedType,
          url: smartLinkUrl || content.url,
        });
      }

      setGeneratedContent(generated);
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setGenerating(false);
    }
  };

  // AI-enhanced generation
  const generateWithAI = async () => {
    if (!content.title) return;

    setGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'social-multi-platform',
          context: {
            contentType: selectedType,
            title: content.title,
            description: content.description,
            url: smartLinkUrl || content.url,
            platforms:
              selectedPlatforms.length > 0 ? selectedPlatforms : PLATFORMS.map((p) => p.id),
            tone: 'engaging',
            includeEmojis: true,
            includeHashtags: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();

      if (data.content && typeof data.content === 'object') {
        setGeneratedContent(data.content);
      } else {
        await generateContent();
      }
    } catch (error) {
      console.error('AI generation failed, using standard formatter:', error);
      await generateContent();
    } finally {
      setGenerating(false);
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
      console.error('Failed to copy:', error);
    }
  };

  // Share to platform
  const shareToPlatform = (platform: Platform) => {
    const text = generatedContent[platform.id] || content.description;
    const url = smartLinkUrl || content.url || '';

    let shareUrl = '';

    switch (platform.id) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(content.title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`;
        break;
      case 'threads':
        shareUrl = `https://threads.net/intent/post?text=${encodeURIComponent(text)}`;
        break;
      default:
        copyToClipboard(platform.id);
        if (platform.shareUrl) {
          window.open(platform.shareUrl, '_blank');
        }
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  // Template management
  const saveTemplate = () => {
    if (!templateName) return;

    const newTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: templateName,
      content: { ...content },
      type: selectedType,
    };

    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('social-share-templates', JSON.stringify(updated));
    setTemplateName('');
  };

  const loadTemplate = (template: (typeof savedTemplates)[0]) => {
    setContent(template.content);
    setSelectedType(template.type);
  };

  const deleteTemplate = (id: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('social-share-templates', JSON.stringify(updated));
  };

  // Schedule post
  const schedulePost = () => {
    if (!scheduleDate || !scheduleTime) return;

    const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`);

    selectedPlatforms.forEach((platformId) => {
      setScheduledPosts((prev) => [
        ...prev,
        {
          platform: platformId,
          scheduledTime,
          content: generatedContent[platformId] || content.description,
        },
      ]);
    });
  };

  // Thread management
  const addThreadPost = () => {
    setThreadPosts((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), content: '' },
    ]);
  };

  const updateThreadPost = (id: string, newContent: string) => {
    setThreadPosts((prev) => prev.map((p) => (p.id === id ? { ...p, content: newContent } : p)));
  };

  const removeThreadPost = (id: string) => {
    if (threadPosts.length <= 1) return;
    setThreadPosts((prev) => prev.filter((p) => p.id !== id));
  };

  // Get content type info
  const getContentTypeInfo = () => CONTENT_TYPES.find((t) => t.id === selectedType);

  // Platform preview component
  const PlatformPreview = ({ platformId }: { platformId: string }) => {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return null;

    const previewContent =
      generatedContent[platformId] ||
      content.description ||
      'Your post preview will appear here...';
    const charLimit = getCharacterLimit(platformId);

    // Platform-specific preview styles
    const previewStyles: Record<string, { bg: string; text: string; border: string }> = {
      instagram: {
        bg: 'bg-gradient-to-b from-purple-900 to-pink-900',
        text: 'text-white',
        border: 'border-pink-500',
      },
      twitter: { bg: 'bg-black', text: 'text-white', border: 'border-blue-500' },
      facebook: { bg: 'bg-[#1877F2]/10', text: 'text-white', border: 'border-[#1877F2]' },
      tiktok: { bg: 'bg-black', text: 'text-white', border: 'border-pink-500' },
      youtube: { bg: 'bg-black', text: 'text-white', border: 'border-red-500' },
      linkedin: { bg: 'bg-[#0A66C2]/10', text: 'text-white', border: 'border-[#0A66C2]' },
    };

    const style = previewStyles[platformId] || {
      bg: 'bg-zinc-900',
      text: 'text-white',
      border: 'border-zinc-700',
    };

    return (
      <div className={`overflow-hidden rounded-2xl border ${style.border} ${style.bg}`}>
        {/* Platform header */}
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: platform.color }}
          >
            {platform.icon}
          </span>
          <div>
            <p className="font-semibold">{platform.name}</p>
            <p className="text-xs text-zinc-400">@yourusername</p>
          </div>
        </div>

        {/* Media preview */}
        {mediaFiles.length > 0 && (
          <div className="aspect-square bg-zinc-800">
            {mediaFiles[0].type === 'image' ? (
              <img
                src={mediaFiles[0].preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <video src={mediaFiles[0].preview} className="h-full w-full object-cover" />
            )}
          </div>
        )}

        {/* Content preview */}
        <div className="p-4">
          {/* Engagement buttons (platform specific) */}
          <div className="mb-3 flex items-center gap-4 text-zinc-400">
            <Heart className="h-5 w-5" />
            <MessageCircle className="h-5 w-5" />
            <Send className="h-5 w-5" />
            <BookmarkPlus className="ml-auto h-5 w-5" />
          </div>

          {/* Caption */}
          <p className={`whitespace-pre-wrap text-sm leading-relaxed ${style.text}`}>
            {previewContent.slice(0, 300)}
            {previewContent.length > 300 && '...'}
          </p>

          {/* Character count */}
          {charLimit && (
            <p
              className={`mt-2 text-xs ${previewContent.length > charLimit ? 'text-red-400' : 'text-zinc-500'}`}
            >
              {previewContent.length}/{charLimit} characters
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <Link href="/" className="group relative inline-block">
              <Image
                src="/logo-light.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-all duration-300 group-hover:scale-105"
                style={{
                  filter:
                    'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 40px rgba(255, 99, 71, 0.3))',
                }}
              />
            </Link>
            <h1 className="hero-title mt-3 text-center">
              <span className="hero-text-gradient text-xl font-bold md:text-2xl">
                Social Share Hub
              </span>
            </h1>
            <p className="mt-1 max-w-lg text-center text-sm text-muted-foreground">
              World-class social media management for musicians
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-xl bg-white/5 p-1">
              {[
                { id: 'compose', label: 'Compose', icon: FileText },
                { id: 'schedule', label: 'Schedule', icon: CalendarDays },
                { id: 'templates', label: 'Templates', icon: LayoutTemplate },
                { id: 'analytics', label: 'Insights', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'compose' && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6 lg:grid-cols-3"
            >
              {/* Left Column - Content Creation */}
              <div className="space-y-4 lg:col-span-2">
                {/* Content Type Selection */}
                <div className="rnrb-card p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <FileText className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    Content Type
                  </h2>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {CONTENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`group relative flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-all ${
                          selectedType === type.id
                            ? `bg-gradient-to-br ${type.color} text-white shadow-lg`
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <type.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium leading-tight">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media Upload */}
                <div className="rnrb-card p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <ImagePlus className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    Media
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    {/* Upload button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-700 bg-white/5 text-sm text-muted-foreground transition-all hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-xs">Upload</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Media previews */}
                    {mediaFiles.map((media) => (
                      <div
                        key={media.id}
                        className="group relative h-24 w-24 overflow-hidden rounded-xl"
                      >
                        {media.type === 'image' ? (
                          <img
                            src={media.preview}
                            alt="Upload"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <video src={media.preview} className="h-full w-full object-cover" />
                        )}
                        <button
                          onClick={() => removeMedia(media.id)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase">
                          {media.type}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Supports images & videos. Media will be optimized for each platform's
                    requirements.
                  </p>
                </div>

                {/* Content Details */}
                <div className="rnrb-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Settings2 className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      Content
                    </h2>
                    <button
                      onClick={() => setIsThreadMode(!isThreadMode)}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        isThreadMode
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-white/5 text-muted-foreground hover:text-white'
                      }`}
                    >
                      <Layers className="h-3 w-3" />
                      {isThreadMode ? 'Thread Mode ON' : 'Thread/Carousel'}
                    </button>
                  </div>

                  {!isThreadMode ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Title / Song Name
                        </label>
                        <input
                          type="text"
                          value={content.title}
                          onChange={(e) => setContent({ ...content, title: e.target.value })}
                          placeholder="Enter your release title, song name, or announcement"
                          className="w-full rounded-xl bg-white/5 p-3 text-sm transition focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Description / Caption
                        </label>
                        <textarea
                          value={content.description}
                          onChange={(e) => setContent({ ...content, description: e.target.value })}
                          placeholder="Write your main message. AI will adapt this for each platform."
                          rows={4}
                          className="w-full rounded-xl bg-white/5 p-3 text-sm transition focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                        <p className="mt-1 text-right text-xs text-muted-foreground">
                          {content.description.length} characters
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Thread/Carousel Mode */
                    <div className="space-y-3">
                      <Reorder.Group
                        axis="y"
                        values={threadPosts}
                        onReorder={setThreadPosts}
                        className="space-y-2"
                      >
                        {threadPosts.map((post, index) => (
                          <Reorder.Item key={post.id} value={post}>
                            <div className="group flex gap-2">
                              <div className="flex flex-col items-center">
                                <GripVertical className="h-4 w-4 cursor-grab text-zinc-600 active:cursor-grabbing" />
                                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
                                  {index + 1}
                                </div>
                              </div>
                              <div className="flex-1">
                                <textarea
                                  value={post.content}
                                  onChange={(e) => updateThreadPost(post.id, e.target.value)}
                                  placeholder={`Thread post ${index + 1}...`}
                                  rows={3}
                                  className="w-full rounded-xl bg-white/5 p-3 text-sm transition focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                              </div>
                              {threadPosts.length > 1 && (
                                <button
                                  onClick={() => removeThreadPost(post.id)}
                                  className="rounded-lg p-2 text-zinc-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                      <button
                        onClick={addThreadPost}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-muted-foreground transition hover:border-orange-500 hover:text-orange-400"
                      >
                        <Plus className="h-4 w-4" />
                        Add Thread Post
                      </button>
                    </div>
                  )}
                </div>

                {/* Link & Tracking */}
                <div className="rnrb-card p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <Link2 className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    Link & Tracking
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Destination URL
                      </label>
                      <input
                        type="url"
                        value={content.url}
                        onChange={(e) => setContent({ ...content, url: e.target.value })}
                        placeholder="https://your-link.com"
                        className="w-full rounded-xl bg-white/5 p-3 text-sm transition focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>

                    {/* UTM Parameters */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
                          Source
                        </label>
                        <input
                          type="text"
                          value={utmParams.source}
                          onChange={(e) => setUtmParams({ ...utmParams, source: e.target.value })}
                          placeholder="instagram"
                          className="w-full rounded-lg bg-white/5 px-3 py-2 text-xs transition focus:bg-white/10 focus:outline-none"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
                          Medium
                        </label>
                        <input
                          type="text"
                          value={utmParams.medium}
                          onChange={(e) => setUtmParams({ ...utmParams, medium: e.target.value })}
                          placeholder="social"
                          className="w-full rounded-lg bg-white/5 px-3 py-2 text-xs transition focus:bg-white/10 focus:outline-none"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
                          Campaign
                        </label>
                        <input
                          type="text"
                          value={utmParams.campaign}
                          onChange={(e) => setUtmParams({ ...utmParams, campaign: e.target.value })}
                          placeholder="new-single"
                          className="w-full rounded-lg bg-white/5 px-3 py-2 text-xs transition focus:bg-white/10 focus:outline-none"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={generateSmartLink}
                        disabled={!content.url}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
                      >
                        <Link2 className="h-4 w-4" />
                        Generate Smart Link
                      </button>
                      <button
                        onClick={async () => {
                          const qr = await generateQRCode();
                          if (qr) window.open(qr, '_blank');
                        }}
                        disabled={!content.url && !smartLinkUrl}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
                      >
                        <QrCode className="h-4 w-4" />
                        QR
                      </button>
                    </div>

                    {smartLinkUrl && (
                      <div className="rounded-lg bg-green-500/10 p-3">
                        <p className="text-xs font-medium text-green-400">Smart Link Generated:</p>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          {smartLinkUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hashtags */}
                <div className="rnrb-card p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <Hash className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    Hashtags
                  </h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customHashtags}
                      onChange={(e) => setCustomHashtags(e.target.value)}
                      placeholder="Add custom hashtags (separated by spaces or commas)"
                      className="w-full rounded-xl bg-white/5 p-3 text-sm transition focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    />

                    {/* Trending hashtags for selected content type */}
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Trending for {getContentTypeInfo()?.label}:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_HASHTAGS[selectedType]?.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              if (!customHashtags.includes(tag)) {
                                setCustomHashtags((prev) => (prev ? `${prev} ${tag}` : tag));
                              }
                            }}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                              customHashtags.includes(tag)
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="rnrb-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Share2 className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      Platforms
                    </h2>
                    <div className="flex gap-1">
                      {Object.keys(PLATFORM_GROUPS)
                        .filter((k) => k !== 'all')
                        .slice(0, 4)
                        .map((group) => (
                          <button
                            key={group}
                            onClick={() =>
                              selectPlatformGroup(group as keyof typeof PLATFORM_GROUPS)
                            }
                            className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium uppercase text-muted-foreground transition hover:bg-white/10 hover:text-white"
                          >
                            {group}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Platform grid */}
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`group relative flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                          selectedPlatforms.includes(platform.id)
                            ? 'ring-2 ring-offset-1 ring-offset-black'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        style={{
                          background: selectedPlatforms.includes(platform.id)
                            ? `${platform.color}20`
                            : undefined,
                          ringColor: selectedPlatforms.includes(platform.id)
                            ? platform.color
                            : undefined,
                        }}
                        title={platform.name}
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                          style={{ background: platform.color }}
                        >
                          {platform.icon}
                        </span>
                        <span className="text-[9px] font-medium leading-tight">
                          {platform.name.split(' ')[0]}
                        </span>
                        {selectedPlatforms.includes(platform.id) && (
                          <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-green-500 p-0.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {selectedPlatforms.length === 0
                      ? 'No platforms selected - content will be generated for all platforms'
                      : `${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''} selected`}
                  </p>
                </div>

                {/* Generate Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={generateContent}
                    disabled={generating || (!content.title && !content.description)}
                    className="rnrb-button-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Generate for All Platforms
                      </>
                    )}
                  </button>
                  <button
                    onClick={generateWithAI}
                    disabled={generating || !content.title}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 font-semibold text-white transition-all hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                  >
                    <Wand2 className="h-5 w-5" />
                    AI Enhance
                  </button>
                </div>
              </div>

              {/* Right Column - Preview & Generated Content */}
              <div className="space-y-4">
                {/* Preview Toggle */}
                <div className="rnrb-card p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Eye className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      Live Preview
                    </h2>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`rounded-lg p-1.5 ${previewDevice === 'mobile' ? 'bg-white/10' : ''}`}
                      >
                        <Smartphone className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`rounded-lg p-1.5 ${previewDevice === 'desktop' ? 'bg-white/10' : ''}`}
                      >
                        <Monitor className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Platform selector for preview */}
                  <div className="mt-3 flex gap-1 overflow-x-auto pb-2">
                    {['instagram', 'twitter', 'tiktok', 'facebook', 'youtube', 'linkedin'].map(
                      (pid) => {
                        const p = PLATFORMS.find((x) => x.id === pid);
                        if (!p) return null;
                        return (
                          <button
                            key={pid}
                            onClick={() => setPreviewPlatform(pid)}
                            className={`flex-shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                              previewPlatform === pid
                                ? 'bg-white/10 text-white'
                                : 'text-muted-foreground hover:text-white'
                            }`}
                          >
                            {p.name.split(' ')[0]}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Preview */}
                  <div
                    className={`mt-3 ${previewDevice === 'mobile' ? 'mx-auto max-w-[280px]' : ''}`}
                  >
                    <PlatformPreview platformId={previewPlatform} />
                  </div>
                </div>

                {/* Optimal Posting Times */}
                {selectedPlatforms.length > 0 && (
                  <div className="rnrb-card p-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      Best Times to Post
                    </h2>
                    <div className="space-y-2">
                      {selectedPlatforms.slice(0, 3).map((pid) => {
                        const times = OPTIMAL_TIMES[pid];
                        const platform = PLATFORMS.find((p) => p.id === pid);
                        if (!times || !platform) return null;
                        return (
                          <div key={pid} className="rounded-lg bg-white/5 p-3">
                            <p
                              className="mb-1.5 text-xs font-medium"
                              style={{ color: platform.color }}
                            >
                              {platform.name}
                            </p>
                            <div className="flex gap-2">
                              {times.map((t, i) => (
                                <div
                                  key={i}
                                  className={`rounded-lg px-2 py-1 text-[10px] ${
                                    i === 0
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-white/5 text-muted-foreground'
                                  }`}
                                >
                                  {t.day.slice(0, 3)} {t.time}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Generated Content */}
                <AnimatePresence>
                  {Object.keys(generatedContent).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Generated Content
                        </h2>
                        <button
                          onClick={generateContent}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Regenerate
                        </button>
                      </div>

                      <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
                        {Object.entries(generatedContent).map(([platformId, text]) => {
                          const platform = PLATFORMS.find((p) => p.id === platformId);
                          if (!platform) return null;

                          const charLimit = getCharacterLimit(platformId);
                          const isOverLimit = charLimit && text.length > charLimit;

                          return (
                            <div
                              key={platformId}
                              className="group overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            >
                              <div
                                className="flex items-center justify-between px-3 py-2"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
                                    style={{ background: platform.color }}
                                  >
                                    {platform.icon}
                                  </span>
                                  <span className="text-xs font-medium">{platform.name}</span>
                                  {charLimit && (
                                    <span
                                      className={`text-[10px] ${isOverLimit ? 'text-red-400' : 'text-muted-foreground'}`}
                                    >
                                      {text.length}/{charLimit}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                  <button
                                    onClick={() => copyToClipboard(platformId)}
                                    className="rounded-lg p-1.5 hover:bg-white/10"
                                    title="Copy"
                                  >
                                    {copiedPlatform === platformId ? (
                                      <Check className="h-3 w-3 text-green-400" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => shareToPlatform(platform)}
                                    className="rounded-lg p-1.5 hover:bg-white/10"
                                    title="Share"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="p-3">
                                <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
                                  {text.slice(0, 200)}
                                  {text.length > 200 && '...'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            Object.keys(generatedContent).forEach((platformId) => {
                              const platform = PLATFORMS.find((p) => p.id === platformId);
                              if (platform) {
                                setTimeout(() => shareToPlatform(platform), 100);
                              }
                            });
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-sm font-semibold text-white transition-all hover:from-green-500 hover:to-emerald-500"
                        >
                          <Send className="h-4 w-4" />
                          Open All
                        </button>
                        <button
                          onClick={() => setActiveTab('schedule')}
                          className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
                        >
                          <CalendarDays className="h-4 w-4" />
                          Schedule
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save Template */}
                {(content.title || content.description) && (
                  <div className="rnrb-card p-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <BookmarkPlus className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      Save as Template
                    </h2>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Template name..."
                        className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm transition focus:bg-white/10 focus:outline-none"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <button
                        onClick={saveTemplate}
                        disabled={!templateName}
                        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <div className="rnrb-card p-6">
                <h2 className="mb-6 text-xl font-bold">Schedule Posts</h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full rounded-xl bg-white/5 p-3 text-sm transition focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full rounded-xl bg-white/5 p-3 text-sm transition focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                </div>

                <button
                  onClick={schedulePost}
                  disabled={!scheduleDate || !scheduleTime || selectedPlatforms.length === 0}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-4 font-semibold text-white transition-all hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50"
                >
                  <CalendarDays className="h-5 w-5" />
                  Schedule for {selectedPlatforms.length} Platform
                  {selectedPlatforms.length !== 1 ? 's' : ''}
                </button>

                {/* Scheduled posts list */}
                {scheduledPosts.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">Upcoming Posts</h3>
                    <div className="space-y-3">
                      {scheduledPosts.map((post, index) => {
                        const platform = PLATFORMS.find((p) => p.id === post.platform);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                                style={{ background: platform?.color }}
                              >
                                {platform?.icon}
                              </span>
                              <div>
                                <p className="font-medium">{platform?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {post.scheduledTime.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setScheduledPosts((prev) => prev.filter((_, i) => i !== index))
                              }
                              className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <div className="rnrb-card p-6">
                <h2 className="mb-6 text-xl font-bold">Saved Templates</h2>

                {savedTemplates.length === 0 ? (
                  <div className="py-12 text-center">
                    <LayoutTemplate className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No templates saved yet</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Save your content as a template from the Compose tab
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {savedTemplates.map((template) => {
                      const typeInfo = CONTENT_TYPES.find((t) => t.id === template.type);
                      return (
                        <div
                          key={template.id}
                          className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-orange-500/50"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {typeInfo && (
                                <typeInfo.icon
                                  className="h-4 w-4"
                                  style={{ color: 'var(--accent)' }}
                                />
                              )}
                              <h3 className="font-medium">{template.name}</h3>
                            </div>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="rounded-lg p-1.5 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                            {template.content.title || template.content.description || 'No content'}
                          </p>
                          <button
                            onClick={() => {
                              loadTemplate(template);
                              setActiveTab('compose');
                            }}
                            className="w-full rounded-lg bg-white/10 py-2 text-sm font-medium transition hover:bg-white/20"
                          >
                            Use Template
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <div className="rnrb-card p-6">
                <h2 className="mb-6 text-xl font-bold">Platform Insights</h2>

                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Analytics coming soon</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Connect your social accounts to see performance metrics
                  </p>
                </div>

                {/* Placeholder insights */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-4 text-center">
                    <p className="text-3xl font-bold">--</p>
                    <p className="text-sm text-muted-foreground">Total Reach</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 text-center">
                    <p className="text-3xl font-bold">--</p>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 text-center">
                    <p className="text-3xl font-bold">--</p>
                    <p className="text-sm text-muted-foreground">Link Clicks</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
