'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import { motion } from 'framer-motion';
import { Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@cronkwaters/ui';

interface UsageHistoryProps {
  type?: 'aiRequests' | 'videoMinutes';
  days?: number;
  showChart?: boolean;
}

export function UsageHistory({ 
  type = 'aiRequests', 
  days = 30,
  showChart = true 
}: UsageHistoryProps) {
  const { data: usageData, isLoading } = trpc.usage.getSummary.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Card className="rnrb-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-gray-800" />
          <div className="h-32 rounded bg-gray-800" />
        </div>
      </Card>
    );
  }

  const data = type === 'aiRequests' ? usageData?.ai : usageData?.video;
  const typeLabel = type === 'aiRequests' ? 'AI Credits' : 'Video Minutes';
  const icon = type === 'aiRequests' ? Zap : Clock;
  const IconComponent = icon;

  const percentageUsed = data?.limit && data.limit > 0 
    ? Math.min(100, (data.used / data.limit) * 100) 
    : 0;

  const isHealthy = percentageUsed < 70;
  const statusColor = isHealthy 
    ? 'text-green-400' 
    : percentageUsed < 90 
      ? 'text-orange-400' 
      : 'text-red-400';

  const TrendIcon = isHealthy ? TrendingDown : TrendingUp;

  return (
    <Card className="rnrb-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            type === 'aiRequests' ? 'bg-orange-500/10' : 'bg-purple-500/10'
          }`}>
            <IconComponent className={`h-5 w-5 ${
              type === 'aiRequests' ? 'text-orange-400' : 'text-purple-400'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold">{typeLabel} Usage</h3>
            <p className="text-muted-foreground text-xs">Last {days} days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`h-4 w-4 ${statusColor}`} />
          <span className={`text-sm font-medium ${statusColor}`}>
            {percentageUsed.toFixed(0)}% used
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {data && !data.unlimited && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.used} / {data.limit === -1 ? '∞' : data.limit}
            </span>
            <span className={statusColor}>
              {data.remaining} remaining
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentageUsed}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isHealthy 
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : percentageUsed < 90
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
            />
          </div>
        </div>
      )}

      {data?.unlimited && (
        <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-400">
            ∞ Unlimited {typeLabel}
          </p>
        </div>
      )}

      {/* Reset Info */}
      {usageData?.resetDate && (
        <div className="border-border mt-4 flex items-center justify-between border-t pt-4 text-xs">
          <span className="text-muted-foreground">Resets on</span>
          <span className="font-medium text-white">
            {new Date(usageData.resetDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="border-border mt-4 grid grid-cols-3 gap-4 border-t pt-4">
        <div>
          <p className="text-muted-foreground mb-1 text-xs">Used</p>
          <p className="text-lg font-bold">{data?.used || 0}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-xs">Limit</p>
          <p className="text-lg font-bold">{data?.limit === -1 ? '∞' : data?.limit || 0}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-xs">Available</p>
          <p className={`text-lg font-bold ${statusColor}`}>
            {data?.unlimited ? '∞' : data?.remaining || 0}
          </p>
        </div>
      </div>

      {/* Usage Insights */}
      {data && !data.unlimited && data.limit > 0 && (
        <div className="mt-4 rounded-lg bg-blue-500/5 p-3">
          <p className="text-xs text-blue-400">
            {percentageUsed < 50 
              ? '✓ You\'re on track with your usage'
              : percentageUsed < 80
                ? '⚠️ Monitor your usage to avoid running out'
                : '🔴 Consider upgrading to avoid service interruption'
            }
          </p>
        </div>
      )}
    </Card>
  );
}

interface CreditsWidgetProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function CreditsWidget({ compact = false, showDetails = true }: CreditsWidgetProps) {
  const { data: creditsData, isLoading } = trpc.usage.getCredits.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  if (isLoading) {
    return (
      <Card className="rnrb-card p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-20 rounded bg-gray-800" />
          <div className="h-8 w-16 rounded bg-gray-800" />
        </div>
      </Card>
    );
  }

  const creditsColor = creditsData?.unlimited
    ? 'text-purple-400' // Unlimited = purple
    : !creditsData || creditsData.remaining === undefined
      ? 'text-gray-400' // Loading or no data = gray
      : creditsData.remaining < 20
        ? 'text-red-400' // Critical = red
        : creditsData.remaining < 50
          ? 'text-orange-400' // Low = orange
          : 'text-green-400'; // Healthy = green

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-2">
        <Zap className={`h-4 w-4 ${creditsColor}`} />
        <span className={`text-sm font-medium ${creditsColor}`}>
          {creditsData?.unlimited ? '∞' : creditsData?.remaining ?? '...'}
        </span>
        <span className="text-xs text-gray-400">credits</span>
      </div>
    );
  }

  return (
    <Card className="rnrb-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
          <Zap className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm">AI Credits</p>
          <p className={`text-2xl font-bold ${creditsColor}`}>
            {creditsData?.unlimited ? '∞' : creditsData?.remaining ?? '...'}
          </p>
        </div>
      </div>

      {showDetails && creditsData && !creditsData.unlimited && (
        <>
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${creditsData.limit > 0 ? ((creditsData.used / creditsData.limit) * 100) : 0}%` 
              }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                creditsData.remaining < 20
                  ? 'bg-red-500'
                  : creditsData.remaining < 50
                    ? 'bg-orange-500'
                    : 'bg-green-500'
              }`}
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium">{creditsData.used}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{creditsData.limit}</span>
            </div>
            {creditsData.resetDate && (
              <div className="border-border flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Resets</span>
                <span className="font-medium">
                  {new Date(creditsData.resetDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {creditsData?.unlimited && (
        <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-3">
          <p className="text-sm font-medium text-green-400">Unlimited Credits</p>
        </div>
      )}
    </Card>
  );
}

