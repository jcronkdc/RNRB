'use client';

import { Button, Progress } from '@cronkwaters/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BuyCreditsButton } from '@/components/billing/BuyCreditsButton';

interface UsageSummary {
  tier: 'free' | 'creator' | 'studio';
  features: {
    videoCalls: boolean;
    aiAlbumArt: boolean;
    stemSeparation: boolean;
  };
  ai: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    bonus: number;
  };
  video: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    bonus: number;
  };
  image: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    bonus: number;
  };
  stems: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    bonus: number;
  };
  storage: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    bonus: number;
  };
  resetDate: string;
}

// Credit card component
function CreditCard({
  title,
  icon,
  used,
  limit,
  remaining,
  percentage,
  bonus,
  color,
  buyButtons,
  description,
  unavailable,
}: {
  title: string;
  icon: React.ReactNode;
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  bonus: number;
  color: string;
  buyButtons?: React.ReactNode;
  description?: string;
  unavailable?: boolean;
}) {
  const isLow = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-950/95 p-6 transition-all hover:border-white/20 hover:shadow-lg">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            {description && <p className="text-sm text-gray-400">{description}</p>}
          </div>
        </div>

        {!unavailable && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              isCritical
                ? 'bg-red-500/20 text-red-400'
                : isLow
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isCritical ? 'Critical' : isLow ? 'Low' : 'Healthy'}
          </span>
        )}
      </div>

      {unavailable ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <span className="mb-2 text-3xl opacity-30">🔒</span>
          <p className="text-gray-500">Not available on your plan</p>
          <Link href="/settings/billing">
            <Button variant="outline" className="mt-3" size="sm">
              Upgrade to Unlock
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold" style={{ color }}>
                {remaining.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">remaining</span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${
                isCritical
                  ? '[&>div]:bg-red-500'
                  : isLow
                    ? '[&>div]:bg-orange-500'
                    : '[&>div]:bg-green-500'
              }`}
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Used: {used.toLocaleString()}</span>
              <span>Limit: {limit.toLocaleString()}</span>
            </div>
            {bonus > 0 && (
              <span className="mt-2 inline-block rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                ✨ +{bonus} bonus
              </span>
            )}
          </div>

          {/* Warning */}
          {isCritical && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-400">
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Running low! Top up to avoid interruption.</span>
            </div>
          )}

          {/* Buy buttons */}
          {buyButtons && (
            <div className="border-t border-white/5 pt-4">
              <p className="mb-2 text-xs text-gray-500">⚡ Power Up</p>
              {buyButtons}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch('/api/usage/summary');
        if (!response.ok) throw new Error('Failed to load usage data');
        const data = await response.json();
        setUsage(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilReset = (dateString: string) => {
    const reset = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <span className="text-5xl">⚠️</span>
        <h2 className="text-xl font-bold text-white">Failed to Load Usage</h2>
        <p className="text-gray-400">{error || 'Please try again'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const tierConfig = {
    free: { name: 'Explorer', color: '#94a3b8', emoji: '🎸' },
    creator: { name: 'Creator', color: '#f97316', emoji: '🎤' },
    studio: { name: 'Studio', color: '#a855f7', emoji: '🎛️' },
  };

  const tier = tierConfig[usage.tier];
  const daysUntilReset = getDaysUntilReset(usage.resetDate);

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative border-b border-white/5 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="mx-auto max-w-5xl px-6 py-10">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
              />
            </Link>
          </div>

          {/* Title */}
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm">
              <span>{tier.emoji}</span>
              <span style={{ color: tier.color }}>{tier.name} Plan</span>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              Usage & <span className="text-orange-500">Credits</span>
            </h1>
            <p className="text-gray-400">Track your power. Fuel your creativity.</p>

            {/* Stats bar */}
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 rounded-xl bg-white/5 px-4 py-3 md:gap-6 md:px-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{daysUntilReset}</p>
                <p className="text-xs text-gray-400">days left</p>
              </div>
              <div className="hidden h-8 w-px bg-white/10 md:block" />
              <div className="text-center">
                <p className="font-semibold text-white">{formatDate(usage.resetDate)}</p>
                <p className="text-xs text-gray-400">resets on</p>
              </div>
              <div className="hidden h-8 w-px bg-white/10 md:block" />
              <Link href="/settings/billing">
                <Button
                  size="sm"
                  className="font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}99 100%)`,
                  }}
                >
                  Manage Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Grid */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {/* AI Credits */}
          <CreditCard
            title="AI Credits"
            description="Songwriting, lyrics & more"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#f97316">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            used={usage.ai.used}
            limit={usage.ai.limit}
            remaining={usage.ai.remaining}
            percentage={usage.ai.percentage}
            bonus={usage.ai.bonus}
            color="#f97316"
            buyButtons={<BuyCreditsButton product="ai_100" className="w-full" />}
          />

          {/* Video Minutes */}
          <CreditCard
            title="Video Minutes"
            description="Real-time collaboration"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#a855f7">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            }
            used={usage.video.used}
            limit={usage.video.limit}
            remaining={usage.video.remaining}
            percentage={usage.video.percentage}
            bonus={usage.video.bonus}
            color="#a855f7"
            unavailable={!usage.features.videoCalls}
            buyButtons={
              <div className="space-y-2">
                <p className="text-xs text-gray-400">🎬 Video Packs - Buy what you need:</p>
                <div className="grid grid-cols-3 gap-2">
                  <BuyCreditsButton product="video_120" compact className="w-full text-xs" />
                  <BuyCreditsButton product="video_600" compact className="w-full text-xs" />
                  <BuyCreditsButton product="video_1800" compact className="w-full text-xs" />
                </div>
                <p className="text-center text-xs text-gray-500">
                  Usage-based • No monthly commitment
                </p>
              </div>
            }
          />

          {/* Image Credits */}
          <CreditCard
            title="Image Credits"
            description="AI album art"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#ec4899">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            used={usage.image.used}
            limit={usage.image.limit}
            remaining={usage.image.remaining}
            percentage={usage.image.percentage}
            bonus={usage.image.bonus}
            color="#ec4899"
            unavailable={!usage.features.aiAlbumArt}
            buyButtons={
              <div className="space-y-2">
                <p className="text-xs text-gray-400">🎨 Image Packs - Buy what you need:</p>
                <div className="grid grid-cols-2 gap-2">
                  <BuyCreditsButton product="image_25" compact className="w-full text-xs" />
                  <BuyCreditsButton product="image_100" compact className="w-full text-xs" />
                </div>
                <p className="text-center text-xs text-gray-500">
                  Usage-based • No monthly commitment
                </p>
              </div>
            }
          />

          {/* Stem Separation Credits */}
          <CreditCard
            title="Stem Credits"
            description="AI vocal & instrument isolation"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#10b981">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            }
            used={usage.stems?.used ?? 0}
            limit={usage.stems?.limit ?? 0}
            remaining={usage.stems?.remaining ?? 0}
            percentage={usage.stems?.percentage ?? 0}
            bonus={usage.stems?.bonus ?? 0}
            color="#10b981"
            unavailable={!usage.features.stemSeparation}
            buyButtons={
              <div className="space-y-2">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  Stem Packs - Isolate any track:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <BuyCreditsButton product="stems_10" compact className="w-full text-xs" />
                  <BuyCreditsButton product="stems_25" compact className="w-full text-xs" />
                  <BuyCreditsButton product="stems_50" compact className="w-full text-xs" />
                </div>
                <p className="text-center text-xs text-gray-500">
                  2 credits = karaoke • 5 = full band • 8 = pro
                </p>
              </div>
            }
          />

          {/* Storage */}
          <CreditCard
            title="Storage"
            description="Projects & files"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#3b82f6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            }
            used={Number(usage.storage.used.toFixed(1))}
            limit={usage.storage.limit}
            remaining={Number(usage.storage.remaining.toFixed(1))}
            percentage={usage.storage.percentage}
            bonus={usage.storage.bonus}
            color="#3b82f6"
            buyButtons={
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <BuyCreditsButton product="storage_25" className="w-full" />
                  <BuyCreditsButton product="storage_100" className="w-full" />
                </div>
                <BuyCreditsButton product="storage_250" className="w-full" />
                <p className="mt-1 text-center text-xs text-gray-500">
                  💎 Storage is permanent - never expires!
                </p>
              </div>
            }
          />
        </div>

        {/* Upgrade CTA */}
        {usage.tier !== 'studio' && (
          <div className="mt-8 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-orange-500/10 p-6 text-center">
            <span className="text-4xl">🚀</span>
            <h2 className="mt-2 text-xl font-bold text-white">
              Unlock {usage.tier === 'free' ? 'More Power' : 'Maximum Power'}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {usage.tier === 'free'
                ? 'Upgrade to Creator for 10x more AI credits and pro features.'
                : 'Go Studio for unlimited video calls and 100GB storage.'}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {usage.tier === 'free' && (
                <Link href="/settings/billing">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 font-semibold">
                    Creator - $17.99/mo
                  </Button>
                </Link>
              )}
              <Link href="/settings/billing">
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 font-semibold">
                  {usage.tier === 'free' ? 'Studio' : 'Upgrade'} - $34.99/mo
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-4">
            <span className="text-xl">💡</span>
            <h4 className="mt-1 font-semibold text-white">Pro Tip</h4>
            <p className="mt-1 text-xs text-gray-400">
              Storage purchases are permanent - they never reset!
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <span className="text-xl">🔄</span>
            <h4 className="mt-1 font-semibold text-white">Monthly Reset</h4>
            <p className="mt-1 text-xs text-gray-400">
              AI, Video & Image credits reset every billing cycle.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <span className="text-xl">✨</span>
            <h4 className="mt-1 font-semibold text-white">Bonus Credits</h4>
            <p className="mt-1 text-xs text-gray-400">Purchased packs add to your monthly limit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
