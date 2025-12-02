'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, Calendar, Zap, BarChart3 } from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BuyCreditsButton } from '@/components/billing/BuyCreditsButton';

interface UsageSummary {
  tier: 'free' | 'creator' | 'studio';
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
  storage: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    bonus: number;
  };
  resetDate: string;
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Usage & Limits</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-1/3 rounded bg-muted"></div>
                <div className="mt-2 h-4 w-1/2 rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Usage Data
            </CardTitle>
            <CardDescription>{error || 'Could not load your usage information.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierDisplayName =
    usage.tier === 'free' ? 'Free' : usage.tier === 'creator' ? 'Creator' : 'Studio';

  const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return 'text-destructive';
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-primary';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return '[&>div]:bg-destructive';
    if (percentage >= 80) return '[&>div]:bg-yellow-500';
    return '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const showUpgradePrompt =
    usage.ai.percentage > 80 || usage.video.percentage > 80 || usage.storage.percentage > 80;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Hero Section */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* White RR Logo [[memory:11700420]] */}
          <div className="mb-8 flex justify-center">
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </div>

          {/* Accent bar */}
          <div
            style={{
              marginBottom: '24px',
              height: '4px',
              width: '48px',
              borderRadius: '2px',
              backgroundColor: 'var(--accent)',
            }}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                style={{
                  display: 'flex',
                  height: '56px',
                  width: '56px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                }}
              >
                <BarChart3 style={{ height: '28px', width: '28px', color: 'var(--accent)' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                  Usage & Limits
                </h1>
                <p style={{ marginTop: '4px', color: 'var(--muted)' }}>
                  Current plan:{' '}
                  <span style={{ fontWeight: '600', color: 'var(--accent)' }}>
                    {tierDisplayName}
                  </span>
                </p>
              </div>
            </div>
            <Link href="/settings/billing">
              <Button
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--text)',
                  fontWeight: '600',
                }}
              >
                Manage Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl space-y-6 p-6">
        {/* Upgrade Prompt */}
        {showUpgradePrompt && usage.tier !== 'studio' && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                <TrendingUp className="h-5 w-5" />
                Approaching Limits
              </CardTitle>
              <CardDescription>
                You're using{' '}
                {Math.max(
                  usage.ai.percentage,
                  usage.video.percentage,
                  usage.storage.percentage
                ).toFixed(0)}
                % of your monthly allowance.{' '}
                {usage.tier === 'free' &&
                  'Upgrade to Creator for 100 AI requests and 10 GB storage.'}
                {usage.tier === 'creator' &&
                  'Upgrade to Studio for 500 AI requests, video calls, and 100 GB storage.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/billing">
                <Button variant="default">
                  {usage.tier === 'free' ? 'Upgrade to Creator' : 'Upgrade to Studio'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Reset Date Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Usage Period
            </CardTitle>
            <CardDescription>Your limits reset on {formatDate(usage.resetDate)}</CardDescription>
          </CardHeader>
        </Card>

        {/* AI Requests Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Requests
            </CardTitle>
            <CardDescription>
              {usage.ai.used.toLocaleString()} of {usage.ai.limit.toLocaleString()} requests used
              this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress
              value={usage.ai.percentage}
              className={getProgressColor(usage.ai.percentage)}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={getUsageColor(usage.ai.percentage)}>
                {usage.ai.percentage.toFixed(1)}% used
              </span>
              <span className="text-[color:var(--muted)]">{usage.ai.remaining} remaining</span>
            </div>
            {usage.ai.percentage >= 95 && (
              <div className="bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-lg border p-3">
                <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-destructive text-sm">
                  <p className="font-medium">AI quota almost depleted</p>
                  <p className="text-destructive/80">
                    Upgrade your plan or wait until {formatDate(usage.resetDate)} for reset.
                  </p>
                </div>
              </div>
            )}
            {usage.ai.bonus > 0 && (
              <p className="text-xs text-[color:var(--muted)]">
                Includes {usage.ai.bonus.toLocaleString()} purchased requests active this cycle.
              </p>
            )}
            <div className="space-y-2 border-t pt-3">
              <div className="text-sm text-[color:var(--muted)]">
                Need more this month? +100 requests for $5 (expires at period reset).
              </div>
              <BuyCreditsButton product="ai_100" className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Video Minutes Usage (Studio only) */}
        {usage.tier === 'studio' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Video Call Minutes
              </CardTitle>
              <CardDescription>
                {usage.video.used.toLocaleString()} of {usage.video.limit.toLocaleString()} minutes
                used this month ({(usage.video.used / 60).toFixed(1)} hours)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress
                value={usage.video.percentage}
                className={getProgressColor(usage.video.percentage)}
              />
              <div className="flex items-center justify-between text-sm">
                <span className={getUsageColor(usage.video.percentage)}>
                  {usage.video.percentage.toFixed(1)}% used
                </span>
                <span className="text-[color:var(--muted)]">
                  {usage.video.remaining} minutes ({(usage.video.remaining / 60).toFixed(1)} hours)
                  remaining
                </span>
              </div>
              {usage.video.percentage >= 95 && (
                <div className="bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-lg border p-3">
                  <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                  <div className="text-destructive text-sm">
                    <p className="font-medium">Video quota almost depleted</p>
                    <p className="text-destructive/80">
                      Calls will be disconnected when limit is reached. Resets{' '}
                      {formatDate(usage.resetDate)}.
                    </p>
                  </div>
                </div>
              )}
              {usage.video.bonus > 0 && (
                <p className="text-xs text-[color:var(--muted)]">
                  Includes {(usage.video.bonus / 60).toFixed(1)} bonus hours purchased this cycle.
                </p>
              )}
              <div className="space-y-2 border-t pt-3">
                <div className="text-sm text-[color:var(--muted)]">
                  Add +10 hours for $8. Credits expire at period reset.
                </div>
                <BuyCreditsButton product="video_600" className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Credits (Creator & Studio) */}
        {usage.image && usage.image.limit > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Album Art Credits
              </CardTitle>
              <CardDescription>
                {usage.image.used.toLocaleString()} of {usage.image.limit.toLocaleString()}{' '}
                AI-generated artworks used this month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress
                value={usage.image.percentage}
                className={getProgressColor(usage.image.percentage)}
              />
              <div className="flex items-center justify-between text-sm">
                <span className={getUsageColor(usage.image.percentage)}>
                  {usage.image.percentage.toFixed(1)}% used
                </span>
                <span className="text-[color:var(--muted)]">
                  {usage.image.remaining} artworks remaining
                </span>
              </div>
              {usage.image.percentage >= 95 && (
                <div className="bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-lg border p-3">
                  <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                  <div className="text-destructive text-sm">
                    <p className="font-medium">Image credits almost depleted</p>
                    <p className="text-destructive/80">
                      Purchase more to continue generating album artwork.
                    </p>
                  </div>
                </div>
              )}
              {usage.image.bonus > 0 && (
                <p className="text-xs text-[color:var(--muted)]">
                  Includes {usage.image.bonus} bonus image credits purchased this cycle.
                </p>
              )}
              <div className="space-y-2 border-t pt-3">
                <div className="text-sm text-[color:var(--muted)]">
                  Need more album artwork? Purchase additional image credits.
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <BuyCreditsButton product="image_25" className="w-full" />
                  <BuyCreditsButton product="image_100" className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
              Storage
            </CardTitle>
            <CardDescription>
              {usage.storage.used.toFixed(2)} GB of {usage.storage.limit} GB used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress
              value={usage.storage.percentage}
              className={getProgressColor(usage.storage.percentage)}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={getUsageColor(usage.storage.percentage)}>
                {usage.storage.percentage.toFixed(1)}% used
              </span>
              <span className="text-[color:var(--muted)]">
                {usage.storage.remaining.toFixed(2)} GB remaining
              </span>
            </div>
            {usage.storage.percentage >= 95 && (
              <div className="bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-lg border p-3">
                <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-destructive text-sm">
                  <p className="font-medium">Storage almost full</p>
                  <p className="text-destructive/80">
                    New uploads will be blocked. Upgrade your plan or delete old files.
                  </p>
                </div>
              </div>
            )}
            {usage.storage.bonus > 0 && (
              <p className="text-xs text-[color:var(--muted)]">
                You have an extra {usage.storage.bonus} GB of permanent storage capacity.
              </p>
            )}
            <div className="space-y-2 border-t pt-3">
              <div className="text-sm text-[color:var(--muted)]">
                Storage top-ups now start at $5 for +25 GB (permanent capacity boost).
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <BuyCreditsButton product="storage_25" className="w-full" />
                <BuyCreditsButton product="storage_100" className="w-full" />
                <BuyCreditsButton product="storage_250" className="w-full sm:col-span-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Comparison */}
        {usage.tier !== 'studio' && (
          <Card>
            <CardHeader>
              <CardTitle>Need More?</CardTitle>
              <CardDescription>
                {usage.tier === 'free' && 'Upgrade to Creator or Studio for higher limits'}
                {usage.tier === 'creator' && 'Upgrade to Studio for the highest limits'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {usage.tier === 'free' && (
                  <div className="space-y-2 rounded-lg border p-4">
                    <div className="font-semibold">Creator ($17.99/mo)</div>
                    <ul className="space-y-1 text-sm text-[color:var(--muted)]">
                      <li>✅ 100 AI requests/month</li>
                      <li>✅ 10 GB storage</li>
                      <li>✅ Unlimited projects</li>
                      <li>✅ Advanced analytics</li>
                    </ul>
                    <Link href="/settings/billing">
                      <Button className="mt-2 w-full" variant="outline">
                        Upgrade to Creator
                      </Button>
                    </Link>
                  </div>
                )}
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="font-semibold">Studio ($34.99/mo)</div>
                  <ul className="space-y-1 text-sm text-[color:var(--muted)]">
                    <li>✅ 500 AI requests/month</li>
                    <li>✅ 20 hours video calls/month</li>
                    <li>✅ 100 GB storage</li>
                    <li>✅ Priority support</li>
                  </ul>
                  <Link href="/settings/billing">
                    <Button className="mt-2 w-full">Upgrade to Studio</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
