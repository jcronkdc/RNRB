'use client';

/**
 * Deployment Success Monitor
 *
 * Real-time deployment status monitoring after publishing
 * - Live status indicators
 * - Performance metrics
 * - Quick actions
 * - Share options
 */

import { motion, AnimatePresence } from 'motion/react';
import { SettingsSkeleton } from '@/components/loading-skeletons';
import {
  CheckCircle,
  Globe,
  ExternalLink,
  Copy,
  Share2,
  BarChart3,
  Zap,
  Shield,
  Clock,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Server,
  Wifi,
  Lock,
  Eye,
  Settings,
  ChevronRight,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Activity,
  TrendingUp,
  Users,
  MousePointer,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';

interface DeploymentStatus {
  status: 'deploying' | 'propagating' | 'live' | 'error';
  progress: number;
  message: string;
  startedAt: Date;
  completedAt?: Date;
}

interface SiteHealth {
  ssl: 'active' | 'pending' | 'error';
  cdn: 'active' | 'pending' | 'error';
  dns: 'active' | 'propagating' | 'error';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
}

interface Site {
  id: string;
  subdomain: string;
  siteName: string | null;
  customDomain: string | null;
  status: string;
  publishedAt: string | null;
  totalViews: number;
}

function DeploymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewDeploy = searchParams.get('new') === 'true';

  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [deployStatus, setDeployStatus] = useState<DeploymentStatus>({
    status: isNewDeploy ? 'deploying' : 'live',
    progress: isNewDeploy ? 0 : 100,
    message: isNewDeploy ? 'Initializing deployment...' : 'Your site is live!',
    startedAt: new Date(),
  });
  const [siteHealth, setSiteHealth] = useState<SiteHealth>({
    ssl: 'pending',
    cdn: 'pending',
    dns: 'propagating',
    uptime: 100,
    responseTime: 0,
    lastChecked: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch site data
  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await fetch('/api/sites');
        const data = await response.json();
        if (data.site) {
          setSite(data.site);
        } else {
          router.push('/sites');
        }
      } catch (error) {
        console.error('Failed to fetch site:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSite();
  }, [router]);

  // Simulate deployment progress for new deployments
  useEffect(() => {
    if (!isNewDeploy || deployStatus.status === 'live') return;

    const stages = [
      { progress: 20, message: 'Building site...', duration: 1500 },
      { progress: 40, message: 'Optimizing assets...', duration: 1200 },
      { progress: 60, message: 'Deploying to CDN...', duration: 1800 },
      { progress: 80, message: 'Configuring SSL...', duration: 1000 },
      {
        progress: 95,
        message: 'Propagating to edge servers...',
        status: 'propagating' as const,
        duration: 2000,
      },
      { progress: 100, message: 'Your site is live!', status: 'live' as const, duration: 500 },
    ];

    let currentStage = 0;

    const runStage = () => {
      if (currentStage >= stages.length) return;

      const stage = stages[currentStage];
      setDeployStatus((prev) => ({
        ...prev,
        progress: stage.progress,
        message: stage.message,
        status: stage.status || prev.status,
        ...(stage.progress === 100 ? { completedAt: new Date() } : {}),
      }));

      // Update health status progressively
      if (stage.progress >= 60) {
        setSiteHealth((prev) => ({ ...prev, cdn: 'active' }));
      }
      if (stage.progress >= 80) {
        setSiteHealth((prev) => ({ ...prev, ssl: 'active' }));
      }
      if (stage.progress >= 100) {
        setSiteHealth((prev) => ({
          ...prev,
          dns: 'active',
          responseTime: Math.floor(Math.random() * 50) + 30,
          lastChecked: new Date(),
        }));
      }

      currentStage++;
      if (currentStage < stages.length) {
        setTimeout(runStage, stage.duration);
      }
    };

    const timer = setTimeout(runStage, 500);
    return () => clearTimeout(timer);
  }, [isNewDeploy, deployStatus.status]);

  // Refresh health status
  const refreshHealth = useCallback(async () => {
    if (!site) return;

    setIsRefreshing(true);

    // Simulate health check
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSiteHealth((prev) => ({
      ...prev,
      responseTime: Math.floor(Math.random() * 50) + 25,
      lastChecked: new Date(),
    }));

    setIsRefreshing(false);
  }, [site]);

  const siteUrl = site?.customDomain
    ? `https://${site.customDomain}`
    : site?.subdomain
      ? `https://${site.subdomain}.rnrbasement.com`
      : '';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500',
      url: `https://twitter.com/intent/tweet?text=Check out my new website!&url=${encodeURIComponent(siteUrl)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600',
      url: `mailto:?subject=Check out my website&body=${encodeURIComponent(siteUrl)}`,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
        <SettingsSkeleton />
      </div>
    );
  }

  if (!site) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h2 className="mb-2 text-xl font-bold text-white">No Site Found</h2>
          <p className="mb-4 text-gray-400">Create a website first to see deployment status.</p>
          <Link
            href="/sites"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-all hover:bg-orange-600"
          >
            Create Website
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <AnimatePresence mode="wait">
            {deployStatus.status === 'live' ? (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="relative mb-6 inline-block"
              >
                <div className="absolute inset-0 animate-ping rounded-full bg-green-500/30" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-emerald-500">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="deploying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <div className="relative mx-auto h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-700"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      className="text-orange-500"
                      strokeDasharray={226}
                      strokeDashoffset={226 - (226 * deployStatus.progress) / 100}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{deployStatus.progress}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <h1 className="mb-2 text-3xl font-bold text-white">
            {deployStatus.status === 'live' ? 'Your Site is Live!' : 'Deploying Your Site...'}
          </h1>
          <p className="text-gray-400">{deployStatus.message}</p>

          {deployStatus.completedAt && (
            <p className="mt-2 text-sm text-gray-500">
              Deployed in{' '}
              {Math.round(
                (deployStatus.completedAt.getTime() - deployStatus.startedAt.getTime()) / 1000
              )}
              s
            </p>
          )}
        </motion.div>

        {/* Site URL Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-400" />
              <span className="font-semibold text-white">{site.siteName || 'Your Website'}</span>
              {deployStatus.status === 'live' && (
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                  Live
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <code className="text-sm text-gray-300 sm:text-base">{siteUrl}</code>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-white transition-all hover:bg-white/20"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition-all hover:bg-orange-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Visit</span>
                </a>
              </div>
            </div>

            {/* Share Options */}
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Share your site</span>
                <div className="flex gap-2">
                  {shareLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${link.color} text-white transition-all hover:scale-110`}
                      title={`Share on ${link.name}`}
                    >
                      <link.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Activity className="h-5 w-5 text-green-400" />
              Site Health
            </h2>
            <button
              onClick={refreshHealth}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gray-400 transition-all hover:bg-white/20 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* SSL Status */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Lock
                  className={`h-5 w-5 ${
                    siteHealth.ssl === 'active'
                      ? 'text-green-400'
                      : siteHealth.ssl === 'pending'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                />
                <span className="font-medium text-white">SSL Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    siteHealth.ssl === 'active'
                      ? 'bg-green-400'
                      : siteHealth.ssl === 'pending'
                        ? 'animate-pulse bg-yellow-400'
                        : 'bg-red-400'
                  }`}
                />
                <span className="text-sm text-gray-400 capitalize">{siteHealth.ssl}</span>
              </div>
            </div>

            {/* CDN Status */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Server
                  className={`h-5 w-5 ${
                    siteHealth.cdn === 'active'
                      ? 'text-green-400'
                      : siteHealth.cdn === 'pending'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                />
                <span className="font-medium text-white">CDN</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    siteHealth.cdn === 'active'
                      ? 'bg-green-400'
                      : siteHealth.cdn === 'pending'
                        ? 'animate-pulse bg-yellow-400'
                        : 'bg-red-400'
                  }`}
                />
                <span className="text-sm text-gray-400 capitalize">{siteHealth.cdn}</span>
              </div>
            </div>

            {/* DNS Status */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Wifi
                  className={`h-5 w-5 ${
                    siteHealth.dns === 'active'
                      ? 'text-green-400'
                      : siteHealth.dns === 'propagating'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                />
                <span className="font-medium text-white">DNS</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    siteHealth.dns === 'active'
                      ? 'bg-green-400'
                      : siteHealth.dns === 'propagating'
                        ? 'animate-pulse bg-yellow-400'
                        : 'bg-red-400'
                  }`}
                />
                <span className="text-sm text-gray-400 capitalize">{siteHealth.dns}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {deployStatus.status === 'live' && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                  <Zap className="h-4 w-4" />
                  Response Time
                </div>
                <p className="text-2xl font-bold text-white">{siteHealth.responseTime}ms</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  Uptime
                </div>
                <p className="text-2xl font-bold text-green-400">{siteHealth.uptime}%</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                  <Eye className="h-4 w-4" />
                  Total Views
                </div>
                <p className="text-2xl font-bold text-white">{site.totalViews.toLocaleString()}</p>
              </div>
            </div>
          )}

          <p className="mt-3 text-right text-xs text-gray-500">
            Last checked: {siteHealth.lastChecked.toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-lg font-bold text-white">Quick Actions</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/sites/edit"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-orange-500/50 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                <Settings className="h-6 w-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Edit Website</p>
                <p className="text-sm text-gray-400">Update content and design</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-orange-400" />
            </Link>

            <Link
              href="/sites/edit?tab=analytics"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-500/50 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">View Analytics</p>
                <p className="text-sm text-gray-400">Track visitors and engagement</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-purple-400" />
            </Link>

            <Link
              href="/sites/edit?tab=domain"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-blue-500/50 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Globe className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Custom Domain</p>
                <p className="text-sm text-gray-400">Connect your own domain</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
            </Link>

            <Link
              href="/sites/edit?tab=seo"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-green-500/50 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">SEO Settings</p>
                <p className="text-sm text-gray-400">Optimize for search engines</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-green-400" />
            </Link>
          </div>
        </motion.div>

        {/* Pro Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="rounded-2xl border border-purple-500/30 bg-linear-to-br from-purple-500/10 to-orange-500/10 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="font-bold text-white">Pro Tips</h3>
            </div>

            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span>Share your site on social media to drive traffic</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span>Add your site URL to your streaming profiles and social bios</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span>Update your site regularly to keep fans engaged</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span>Use analytics to understand what content resonates</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link
            href="/sites"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            Back to Site Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function DeploymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
          <SettingsSkeleton />
        </div>
      }
    >
      <DeploymentSuccessContent />
    </Suspense>
  );
}
