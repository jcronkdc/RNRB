'use client';

/**
 * Activity Feed Component - FULLY WIRED
 * Real-time activity stream with Ably integration
 */

import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle } from 'lucide-react';

import {
  useActivityFeed,
  getActivityMessage,
  getActivityIcon,
  getActivityColor,
} from '@/hooks/use-activity-feed';

interface ActivityFeedProps {
  channelName: string;
  showHeader?: boolean;
  maxHeight?: string;
  limit?: number;
}

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
        <p className="text-muted-foreground mt-1 text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <Activity className="text-primary h-5 w-5" />
            Activity Stream
          </h3>
          <div className="flex items-center gap-2">
            <motion.div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
              animate={isConnected ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-muted-foreground text-xs">
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
            <Activity className="text-muted-foreground/30 mb-3 h-12 w-12" />
            <p className="text-muted-foreground text-sm">No activity yet</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Start collaborating to see updates here
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="border-border/50 bg-surface/50 hover:bg-surface flex items-start gap-3 rounded-2xl border p-3 transition-colors"
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
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="border-border/50 border-t pt-2">
          <p className="text-muted-foreground text-center text-xs">
            Showing {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      )}
    </div>
  );
}

export function CompactActivityFeed({
  channelName,
  limit = 5,
}: {
  channelName: string;
  limit?: number;
}) {
  const { activities, isConnected } = useActivityFeed({ channelName, limit });

  return (
    <div className="space-y-2">
      {activities.length === 0 ? (
        <p className="text-muted-foreground text-xs">No recent activity</p>
      ) : (
        <AnimatePresence mode="popLayout">
          {activities.slice(0, limit).map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground flex items-center gap-2 text-xs"
            >
              <span>{getActivityIcon(activity.type)}</span>
              <span className="truncate">{getActivityMessage(activity)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      {isConnected && <p className="text-muted-foreground/60 text-xs">🍄 Live updates active</p>}
    </div>
  );
}
