'use client';

/**
 * Activity Feed Component
 * 
 * Real-time activity stream - the nervous system of the mycelial network
 * Shows all pulses of activity across the project
 * 
 * Features:
 * - Real-time updates via Ably
 * - Scrollable feed with animations
 * - Click activity to jump to location (Tokyo Subway flow)
 * - Grouped by time (Today, Yesterday, This Week)
 */

import { useActivityFeed, getActivityMessage, getActivityIcon, getActivityColor, type ActivityEvent } from '@/hooks/use-activity-feed';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ActivityFeedProps = {
  channelName: string;
  showHeader?: boolean;
  maxHeight?: string;
  onActivityClick?: (activity: ActivityEvent) => void;
};

export function ActivityFeed({ 
  channelName, 
  showHeader = true,
  maxHeight = '600px',
  onActivityClick
}: ActivityFeedProps) {
  const { activities, isConnected, error } = useActivityFeed({ channelName, limit: 50 });
  const router = useRouter();

  // Group activities by time period
  const groupedActivities = groupActivitiesByTime(activities);

  const handleActivityClick = (activity: ActivityEvent) => {
    if (onActivityClick) {
      onActivityClick(activity);
      return;
    }

    // Default navigation logic (Tokyo Subway - jump to location)
    if (activity.songId && activity.projectId) {
      router.push(`/projects/${activity.projectId}/songs/${activity.songId}`);
    } else if (activity.projectId) {
      router.push(`/projects/${activity.projectId}/collaborate`);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load activity feed: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold text-lg">Activity Feed</h3>
            {isConnected && (
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {activities.length} {activities.length === 1 ? 'event' : 'events'}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div 
        className="overflow-y-auto space-y-6 pr-2"
        style={{ maxHeight }}
      >
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm mt-1">Start collaborating to see updates here</p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([period, items]) => (
            <div key={period} className="space-y-3">
              {/* Period Header */}
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Clock className="w-3 h-3" />
                {period}
              </div>

              {/* Activities in this period */}
              <AnimatePresence mode="popLayout">
                {items.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleActivityClick(activity)}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg
                      ${activity.projectId || activity.songId ? 'cursor-pointer hover:bg-muted/50' : ''}
                      transition-colors
                      border border-transparent hover:border-border
                    `}
                  >
                    {/* Icon */}
                    <div 
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        ${getActivityColor(activity.type).replace('text-', 'bg-').replace('400', '500/20')}
                      `}
                    >
                      <span className="text-base">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">
                        {getActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>

                    {/* User Avatar (if available) */}
                    {activity.userAvatar && (
                      <img
                        src={activity.userAvatar}
                        alt={activity.userName}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Compact Activity Feed
 * Shows just the latest 5 activities in a small widget
 */
export function CompactActivityFeed({ channelName }: { channelName: string }) {
  const { activities, isConnected } = useActivityFeed({ channelName, limit: 5 });

  return (
    <div className="space-y-2">
      {activities.slice(0, 5).map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-base shrink-0">
            {getActivityIcon(activity.type)}
          </span>
          <p className="text-muted-foreground truncate flex-1">
            {getActivityMessage(activity)}
          </p>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </motion.div>
      ))}

      {activities.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No recent activity
        </p>
      )}

      {isConnected && (
        <div className="flex items-center justify-center gap-1 text-xs text-green-500 pt-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Live
        </div>
      )}
    </div>
  );
}

// Helper functions

function groupActivitiesByTime(activities: ActivityEvent[]): Record<string, ActivityEvent[]> {
  const now = Date.now();
  const groups: Record<string, ActivityEvent[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Earlier': [],
  };

  activities.forEach(activity => {
    const diff = now - activity.timestamp;
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 24) {
      groups['Today'].push(activity);
    } else if (hours < 48) {
      groups['Yesterday'].push(activity);
    } else if (days < 7) {
      groups['This Week'].push(activity);
    } else {
      groups['Earlier'].push(activity);
    }
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, items]) => items.length > 0)
  );
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return '1w+';
}

