'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Sparkles,
  Music2,
  FileText,
  Info,
  ChevronRight,
  TrendingUp,
  Clock,
  Zap,
  AlertCircle,
  Palette,
} from 'lucide-react';
import Link from 'next/link';

export default function CreditsPage() {
  const { data: summary, isLoading: summaryLoading } = trpc.usage.getSummary.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: limits, isLoading: limitsLoading } = trpc.usage.getLimits.useQuery();

  const isLoading = summaryLoading || limitsLoading;

  // Calculate percentage for progress bars
  const aiPercentage = summary?.ai.limit
    ? Math.min(100, (summary.ai.used / summary.ai.limit) * 100)
    : 0;

  const videoPercentage =
    summary?.video.limit && summary.video.limit > 0
      ? Math.min(100, (summary.video.used / summary.video.limit) * 100)
      : 0;

  const storagePercentage = summary?.storage.limit
    ? Math.min(100, (summary.storage.used / summary.storage.limit) * 100)
    : 0;

  const imagePercentage =
    summary?.image?.limit && summary.image.limit > 0
      ? Math.min(100, (summary.image.used / summary.image.limit) * 100)
      : 0;

  const nearImageLimit = imagePercentage >= 80;

  // Determine tier display name
  const tierDisplay = {
    free: 'Free Plan',
    creator: 'Creator Plan',
    studio: 'Studio Plan',
  }[summary?.tier || 'free'];

  const tierDescription = {
    free: 'Perfect for getting started',
    creator: 'For serious musicians',
    studio: 'Professional-grade features',
  }[summary?.tier || 'free'];

  // Format reset date
  const resetDate = summary?.resetDate
    ? new Date(summary.resetDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  // Determine if near limit
  const nearAILimit = aiPercentage >= 80;
  const nearVideoLimit = videoPercentage >= 80;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                <CreditCard className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Features & Usage</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Credits & Billing</h1>
              </div>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Track your AI credits, video minutes, and storage usage in real-time
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-6xl space-y-8 px-4 py-12">
        {/* Current Plan & Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rnrb-card p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display mb-1 text-2xl font-bold">
                  {isLoading ? 'Loading...' : tierDisplay}
                </h2>
                <p className="text-sm text-muted-foreground">{tierDescription}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">Resets on {resetDate}</span>
                </div>
              </div>
              {summary?.tier !== 'studio' && (
                <Link href="/pricing">
                  <Button className="rnrb-button-primary rounded-xl px-6 py-2.5 font-semibold">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>

            {/* Usage Grid */}
            <div className="grid grid-cols-1 gap-6 border-t border-border pt-6 md:grid-cols-4">
              {/* AI Credits */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">AI Credits</p>
                  {nearAILimit && <AlertCircle className="h-4 w-4 text-orange-400" />}
                </div>
                <p className="text-3xl font-bold">
                  {isLoading ? '...' : summary?.ai.remaining || 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isLoading
                    ? 'Loading...'
                    : `${summary?.ai.used || 0} of ${summary?.ai.limit || 0} used`}
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aiPercentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-full rounded-full ${
                      nearAILimit
                        ? 'bg-orange-500'
                        : 'bg-gradient-to-r from-orange-500 to-orange-400'
                    }`}
                  />
                </div>
              </div>

              {/* Video Minutes */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Video Minutes</p>
                  {nearVideoLimit && <AlertCircle className="h-4 w-4 text-orange-400" />}
                </div>
                <p className="text-3xl font-bold">
                  {isLoading ? '...' : summary?.video.remaining || 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isLoading
                    ? 'Loading...'
                    : summary?.video.limit === 0
                      ? 'Not available on your plan'
                      : `${summary?.video.used || 0} of ${summary?.video.limit || 0} used`}
                </p>
                {summary?.video && summary.video.limit > 0 && (
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${videoPercentage}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className={`h-full rounded-full ${
                        nearVideoLimit
                          ? 'bg-orange-500'
                          : 'bg-gradient-to-r from-purple-500 to-purple-400'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Image Credits */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Image Credits</p>
                  {nearImageLimit && <AlertCircle className="h-4 w-4 text-orange-400" />}
                </div>
                <p className="text-3xl font-bold">
                  {isLoading ? '...' : summary?.image?.remaining || 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isLoading
                    ? 'Loading...'
                    : summary?.image?.limit === 0
                      ? 'Not available on your plan'
                      : `${summary?.image?.used || 0} of ${summary?.image?.limit || 0} used`}
                </p>
                {summary?.image && summary.image.limit > 0 && (
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${imagePercentage}%` }}
                      transition={{ duration: 0.5, delay: 0.35 }}
                      className={`h-full rounded-full ${
                        nearImageLimit
                          ? 'bg-orange-500'
                          : 'bg-gradient-to-r from-pink-500 to-pink-400'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Storage */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Storage</p>
                </div>
                <p className="text-3xl font-bold">
                  {isLoading
                    ? '...'
                    : `${(summary?.storage.limit || 0) - (summary?.storage.used || 0)}GB`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isLoading
                    ? 'Loading...'
                    : `${summary?.storage.used.toFixed(2) || 0} of ${summary?.storage.limit || 0}GB used`}
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercentage}%` }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* What Uses Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rnrb-card p-8">
            <h2 className="font-display mb-6 text-2xl font-bold">What Uses Credits?</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                    <Sparkles className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-medium">AI Music Generation</p>
                    <p className="text-sm text-muted-foreground">Create full tracks with AI</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">10 credits</span>
                  <p className="text-xs text-muted-foreground">per generation</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                    <Music2 className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="font-medium">Chord Progression AI</p>
                    <p className="text-sm text-muted-foreground">Generate chord progressions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">2 credits</span>
                  <p className="text-xs text-muted-foreground">per generation</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Lyrics Generation</p>
                    <p className="text-sm text-muted-foreground">AI-powered lyrics suggestions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">3 credits</span>
                  <p className="text-xs text-muted-foreground">per generation</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10">
                    <Palette className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="font-medium">Album Art Generation</p>
                    <p className="text-sm text-muted-foreground">AI-generated artwork for songs</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">1-5 image credits</span>
                  <p className="text-xs text-muted-foreground">per artwork (by quality)</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Info Boxes */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="rnrb-card border-blue-500/20 bg-blue-500/5 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Info className="h-5 w-5 text-blue-400" />
                Good to Know
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Credits reset monthly on your billing date</li>
                <li>• Unused credits don't roll over</li>
                <li>• Collaboration features don't use credits</li>
                <li>• Real-time collaboration uses video minutes</li>
                <li>• Storage tracks audio files and project data</li>
              </ul>
            </Card>
          </motion.div>

          {/* Optimization Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="rnrb-card border-green-500/20 bg-green-500/5 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Zap className="h-5 w-5 text-green-400" />
                Save Credits
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Review AI generations before regenerating</li>
                <li>• Use manual chord progressions when possible</li>
                <li>• Batch your AI requests for efficiency</li>
                <li>• Shorter video calls save video minutes</li>
                <li>• Delete unused projects to free storage</li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* CTA */}
        {summary?.tier !== 'studio' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <p className="mb-4 text-muted-foreground">
              Need more credits? Upgrade to unlock higher limits.
            </p>
            <Link href="/pricing">
              <Button className="rnrb-button-primary inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold">
                View Upgrade Options
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
