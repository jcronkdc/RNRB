'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  TrendingUp,
  X,
  Sparkles,
  HardDrive,
  Video,
  ImageIcon,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@cronkwaters/ui';

interface UsageData {
  ai: { used: number; limit: number; percentage: number };
  video: { used: number; limit: number; percentage: number };
  image: { used: number; limit: number; percentage: number };
  storage: { used: number; limit: number; percentage: number };
  tier: 'free' | 'creator' | 'studio';
}

interface AlertConfig {
  type: 'ai' | 'video' | 'image' | 'storage';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  buyLink?: string;
  upgradeMessage: string;
}

const ALERT_CONFIGS: AlertConfig[] = [
  {
    type: 'ai',
    icon: Sparkles,
    label: 'AI Credits',
    buyLink: '/settings/usage',
    upgradeMessage: 'Buy more AI credits or upgrade your plan',
  },
  {
    type: 'video',
    icon: Video,
    label: 'Video Minutes',
    buyLink: '/settings/usage',
    upgradeMessage: 'Buy more video time or upgrade your plan',
  },
  {
    type: 'image',
    icon: ImageIcon,
    label: 'Image Credits',
    buyLink: '/settings/usage',
    upgradeMessage: 'Buy more image credits to continue creating album art',
  },
  {
    type: 'storage',
    icon: HardDrive,
    label: 'Storage Space',
    buyLink: '/settings/usage',
    upgradeMessage: 'Buy more storage or delete unused files',
  },
];

// Thresholds for alerts
const WARNING_THRESHOLD = 80; // 80% used
const CRITICAL_THRESHOLD = 95; // 95% used

export function UsageAlerts() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dismissed alerts from localStorage
    try {
      const stored = localStorage.getItem('dismissedUsageAlerts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only restore dismissals from today
        const today = new Date().toDateString();
        if (parsed.date === today && Array.isArray(parsed.alerts)) {
          setDismissedAlerts(new Set(parsed.alerts));
        }
      }
    } catch (e) {
      console.warn('Failed to load dismissed alerts:', e);
    }

    // Fetch usage data
    async function fetchUsage() {
      try {
        const response = await fetch('/api/usage/summary');
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
    // Refresh every 5 minutes
    const interval = setInterval(fetchUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (type: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(type);
    setDismissedAlerts(newDismissed);

    // Store in localStorage with today's date
    localStorage.setItem(
      'dismissedUsageAlerts',
      JSON.stringify({
        date: new Date().toDateString(),
        alerts: Array.from(newDismissed),
      })
    );
  };

  if (loading || !usage) return null;

  // Filter alerts that should be shown
  const activeAlerts = ALERT_CONFIGS.filter((config) => {
    const data = usage[config.type];
    if (!data || data.limit === 0) return false;
    if (dismissedAlerts.has(config.type)) return false;

    // Show if above warning threshold
    return data.percentage >= WARNING_THRESHOLD;
  });

  if (activeAlerts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
      >
        {activeAlerts.map((config) => {
          const data = usage[config.type];
          const isCritical = data.percentage >= CRITICAL_THRESHOLD;
          const Icon = config.icon;

          return (
            <motion.div
              key={config.type}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`rounded-xl border p-4 shadow-lg ${
                isCritical
                  ? 'border-red-500/50 bg-red-950/90'
                  : 'border-orange-500/50 bg-orange-950/90'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isCritical ? 'bg-red-500/20' : 'bg-orange-500/20'
                  }`}
                >
                  {isCritical ? (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  ) : (
                    <Icon className="h-5 w-5 text-orange-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">
                      {isCritical ? `${config.label} Almost Gone!` : `Low ${config.label}`}
                    </h4>
                    <button
                      onClick={() => dismissAlert(config.type)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-1 text-sm text-gray-300">
                    {data.percentage >= 100
                      ? `You've used all your ${config.label.toLowerCase()}.`
                      : `You've used ${data.percentage.toFixed(0)}% of your ${config.label.toLowerCase()}.`}
                  </p>

                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(data.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex gap-2">
                    {config.buyLink && (
                      <Link href={config.buyLink}>
                        <Button size="sm" className="bg-white/10 hover:bg-white/20">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Buy More
                        </Button>
                      </Link>
                    )}
                    {usage.tier !== 'studio' && (
                      <Link href="/settings/billing">
                        <Button
                          size="sm"
                          className={
                            isCritical
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-orange-500 hover:bg-orange-600'
                          }
                        >
                          Upgrade Plan
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to check if user should see usage warnings
 * Can be used in individual components to show inline warnings
 */
export function useUsageWarnings() {
  const [warnings, setWarnings] = useState<{
    ai: boolean;
    video: boolean;
    image: boolean;
    storage: boolean;
    critical: boolean;
  }>({
    ai: false,
    video: false,
    image: false,
    storage: false,
    critical: false,
  });

  useEffect(() => {
    async function checkUsage() {
      try {
        const response = await fetch('/api/usage/summary');
        if (response.ok) {
          const data: UsageData = await response.json();

          setWarnings({
            ai: data.ai?.percentage >= WARNING_THRESHOLD,
            video: data.video?.percentage >= WARNING_THRESHOLD,
            image: data.image?.percentage >= WARNING_THRESHOLD,
            storage: data.storage?.percentage >= WARNING_THRESHOLD,
            critical:
              data.ai?.percentage >= CRITICAL_THRESHOLD ||
              data.video?.percentage >= CRITICAL_THRESHOLD ||
              data.image?.percentage >= CRITICAL_THRESHOLD ||
              data.storage?.percentage >= CRITICAL_THRESHOLD,
          });
        }
      } catch (error) {
        console.error('Failed to check usage:', error);
      }
    }

    checkUsage();
  }, []);

  return warnings;
}
