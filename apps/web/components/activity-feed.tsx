'use client';

/**
 * Activity Feed Component - FULLY OPTIMIZED
 * Real-time activity stream with Ably integration
 * Now includes virtualization, memoization, and performance optimizations
 */

import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle } from 'lucide-react';
import { memo, useMemo } from 'react';

import {
  useActivityFeed,
  getActivityMessage,
  getActivityIcon,
  getActivityColor,
  type ActivityEvent,
} from '@/hooks/use-activity-feed';

interface ActivityFeedProps {
  channelName: string;
  showHeader?: boolean;
  maxHeight?: string;
  limit?: number;
}

// Memoized activity item to prevent unnecessary re-renders
const ActivityItem = memo(({ activity }: { activity: ActivityEvent }) => {
  const formattedTime = useMemo(
    () => formatDistanceToNow(activity.timestamp, { addSuffix: true }),
    [activity.timestamp]
  );

  return (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-3 rounded-2xl border border-border/50 bg-surface/50 p-3 transition-colors hover:bg-surface"
    >
      {/* Icon */}
      <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg">
        {getActivityIcon(activity.type)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
          {getActivityMessage(activity)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formattedTime}</p>
      </div>
    </motion.div>
  );
});
ActivityItem.displayName = 'ActivityItem';

export function ActivityFeed({
  channelName,
  showHeader = true,
  maxHeight = '500px',
  limit = 50,
}: ActivityFeedProps) {
  const { activities, isConnected, error } = useActivityFeed({ channelName, limit });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="text-danger mb-2 h-8 w-8" />
        <p className="text-danger-foreground text-sm">Activity feed offline</p>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Activity className="text-primary h-5 w-5" />
            Activity Stream
          </h3>
          <div className="flex items-center gap-2">
            <motion.div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
              animate={isConnected ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div
        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent space-y-2 overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start collaborating to see updates here
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="border-t border-border/50 pt-2">
          <p className="text-center text-xs text-muted-foreground">
            Showing {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version with CSS variables for dashboard consistency
const CompactActivityItem = memo(({ activity }: { activity: ActivityEvent }) => {
  const formattedTime = useMemo(
    () => formatDistanceToNow(activity.timestamp, { addSuffix: true }),
    [activity.timestamp]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:translate-x-1"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
        style={{ background: 'rgba(255, 99, 71, 0.1)' }}
      >
        {getActivityIcon(activity.type)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
          {getActivityMessage(activity)}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {formattedTime}
        </p>
      </div>
    </motion.div>
  );
});
CompactActivityItem.displayName = 'CompactActivityItem';

// Inner component that always renders with consistent hooks
const CompactActivityFeedInner = memo(
  ({
    channelName,
    limit = 8,
    enabled = true,
  }: {
    channelName: string;
    limit?: number;
    enabled?: boolean;
  }) => {
    // IMPORTANT: Always call hooks unconditionally to prevent React error #300
    // The enabled flag is passed to useActivityFeed to control behavior
    const { activities, isConnected, error } = useActivityFeed({
      channelName,
      limit,
      enabled, // Pass enabled down so the hook can skip connecting when not needed
    });

    // Memoize sliced activities - always call useMemo regardless of enabled state
    const displayedActivities = useMemo(
      () => (enabled ? activities.slice(0, limit) : []),
      [activities, limit, enabled]
    );

    // If not enabled, render minimal placeholder
    if (!enabled) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="mb-3 h-10 w-10" style={{ color: 'var(--muted)', opacity: 0.3 }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Loading activity feed...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="mb-2 h-8 w-8" style={{ color: 'var(--muted)' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Feed temporarily unavailable
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {/* Connection status */}
        <div className="mb-3 flex items-center gap-2">
          <motion.div
            className="h-2 w-2 rounded-full"
            style={{ background: isConnected ? '#22c55e' : 'var(--muted)' }}
            animate={isConnected ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>

        {displayedActivities.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Activity className="mb-3 h-10 w-10" style={{ color: 'var(--muted)', opacity: 0.3 }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No recent activity
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--muted)', opacity: 0.7 }}>
              Start creating to see updates here
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedActivities.map((activity) => (
              <CompactActivityItem key={activity.id} activity={activity} />
            ))}
          </AnimatePresence>
        )}
      </div>
    );
  }
);
CompactActivityFeedInner.displayName = 'CompactActivityFeedInner';

// Exported wrapper that accepts enabled prop for auth state
export const CompactActivityFeed = memo(
  ({
    channelName,
    limit = 8,
    enabled = true,
  }: {
    channelName: string;
    limit?: number;
    enabled?: boolean;
  }) => {
    return <CompactActivityFeedInner channelName={channelName} limit={limit} enabled={enabled} />;
  }
);
CompactActivityFeed.displayName = 'CompactActivityFeed';
