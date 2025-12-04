'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Copy,
  Check,
  Settings,
  Eye,
  EyeOff,
  MessageSquare,
  Heart,
  ChevronDown,
  Users,
  Clock,
  RefreshCw,
  StopCircle,
  Video,
  Info,
  ExternalLink,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { useStreamManager } from '@/hooks/use-live-stream';

const CATEGORIES = [
  'Music',
  'Jam Session',
  'Production',
  'Behind the Scenes',
  'Q&A',
  'Practice',
  'Listening Party',
  'Other',
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Anyone can watch', icon: Eye },
  {
    value: 'followers',
    label: 'Followers Only',
    description: 'Only your followers can watch',
    icon: Users,
  },
  {
    value: 'unlisted',
    label: 'Unlisted',
    description: 'Only people with the link can watch',
    icon: EyeOff,
  },
];

export default function GoLivePage() {
  const router = useRouter();
  const { stream, isCreating, error, createStream, updateStatus, updateSettings, endStream } =
    useStreamManager();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Music');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private' | 'unlisted'>(
    'public'
  );
  const [chatEnabled, setChatEnabled] = useState(true);
  const [reactionsEnabled, setReactionsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Duration timer
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (stream?.status === 'live') {
      const interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stream?.status]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreateStream = async () => {
    if (!title.trim()) return;

    try {
      await createStream({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        visibility,
      });
    } catch (err) {
      console.error('Failed to create stream:', err);
    }
  };

  const handleGoLive = async () => {
    if (!stream) return;
    try {
      await updateStatus(stream.id, 'live');
      setDuration(0);
    } catch (err) {
      console.error('Failed to go live:', err);
    }
  };

  const handleEndStream = async () => {
    if (!stream) return;
    if (!confirm('Are you sure you want to end the stream?')) return;

    try {
      await endStream(stream.id);
      router.push('/live');
    } catch (err) {
      console.error('Failed to end stream:', err);
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/80">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <Radio className="h-5 w-5 text-red-500" />
              Go Live
            </h1>
            <Link href="/live" className="text-sm text-white/70 hover:text-white">
              Back to Live
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Create Stream */}
          {!stream && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                <h2 className="mb-6 text-xl font-bold text-white">Stream Details</h2>

                {/* Title */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-white/70">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What are you streaming today?"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:border-orange-500/50 focus:outline-none"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers what to expect..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:border-orange-500/50 focus:outline-none"
                    maxLength={500}
                  />
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-white/70">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          category === cat
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        } `}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Who can watch?
                  </label>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {VISIBILITY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setVisibility(opt.value as any)}
                          className={`rounded-xl border p-4 text-left transition-all ${
                            visibility === opt.value
                              ? 'border-orange-500 bg-orange-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/30'
                          } `}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <Icon className="h-4 w-4 text-white" />
                            <span className="font-medium text-white">{opt.label}</span>
                          </div>
                          <p className="text-xs text-white/50">{opt.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stream options */}
                <div className="mb-6 flex items-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={chatEnabled}
                      onChange={(e) => setChatEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`h-6 w-10 rounded-full transition-colors ${chatEnabled ? 'bg-orange-500' : 'bg-white/20'}`}
                    >
                      <div
                        className={`mt-0.5 h-5 w-5 transform rounded-full bg-white transition-transform ${chatEnabled ? 'ml-0.5 translate-x-4' : 'translate-x-0.5'}`}
                      />
                    </div>
                    <span className="flex items-center gap-1 text-white/70">
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reactionsEnabled}
                      onChange={(e) => setReactionsEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`h-6 w-10 rounded-full transition-colors ${reactionsEnabled ? 'bg-orange-500' : 'bg-white/20'}`}
                    >
                      <div
                        className={`mt-0.5 h-5 w-5 transform rounded-full bg-white transition-transform ${reactionsEnabled ? 'ml-0.5 translate-x-4' : 'translate-x-0.5'}`}
                      />
                    </div>
                    <span className="flex items-center gap-1 text-white/70">
                      <Heart className="h-4 w-4" />
                      Reactions
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/20 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Create button */}
                <motion.button
                  onClick={handleCreateStream}
                  disabled={!title.trim() || isCreating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Creating Stream...
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5" />
                      Create Stream
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Setup/Go Live */}
          {stream && stream.status !== 'live' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                <h2 className="mb-4 text-xl font-bold text-white">Stream Setup</h2>

                <div className="mb-6 rounded-xl border border-blue-500/50 bg-blue-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <div>
                      <p className="mb-1 font-medium text-blue-400">Ready to stream!</p>
                      <p className="text-sm text-blue-300/70">
                        Use the stream key and URL below with your broadcasting software (OBS,
                        Streamlabs, etc.)
                      </p>
                    </div>
                  </div>
                </div>

                {/* RTMP URL */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-white/70">RTMP URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={stream.rtmpUrl || ''}
                      readOnly
                      className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(stream.rtmpUrl || '', 'url')}
                      className="rounded-xl bg-white/10 px-4 transition-colors hover:bg-white/20"
                    >
                      {copiedUrl ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Stream Key */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Stream Key (keep this secret!)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={stream.streamKey || ''}
                      readOnly
                      className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(stream.streamKey || '', 'key')}
                      className="rounded-xl bg-white/10 px-4 transition-colors hover:bg-white/20"
                    >
                      {copiedKey ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    onClick={handleGoLive}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-4 font-bold text-white shadow-lg shadow-red-500/30"
                  >
                    <Radio className="h-5 w-5" />
                    Go Live Now
                  </motion.button>

                  <Link
                    href={`/live/${stream.id}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-4 font-bold text-white transition-colors hover:bg-white/20"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Preview Stream
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Live! */}
          {stream && stream.status === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-red-500/50 bg-zinc-900/50 p-6">
                {/* Live indicator */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
                      </span>
                      <span className="font-bold text-white">LIVE</span>
                    </div>
                    <div className="font-mono text-white/70">
                      <Clock className="mr-1 inline h-4 w-4" />
                      {formatDuration(duration)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/70">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {stream.viewerCount || 0} watching
                    </span>
                  </div>
                </div>

                {/* Stream title */}
                <h2 className="mb-2 text-2xl font-bold text-white">{stream.title}</h2>
                {stream.description && <p className="mb-6 text-white/60">{stream.description}</p>}

                {/* View stream link */}
                <Link
                  href={`/live/${stream.id}`}
                  target="_blank"
                  className="mb-4 block w-full rounded-xl bg-white/10 py-3 text-center font-medium text-white transition-colors hover:bg-white/20"
                >
                  <ExternalLink className="mr-2 inline h-4 w-4" />
                  View Your Stream
                </Link>

                {/* End stream button */}
                <motion.button
                  onClick={handleEndStream}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/20 py-4 font-bold text-red-400 transition-colors hover:bg-red-500/30"
                >
                  <StopCircle className="h-5 w-5" />
                  End Stream
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
