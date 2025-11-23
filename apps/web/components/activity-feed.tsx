'use client';

/**
 * Activity Feed Component - FULLY WIRED
 * Real-time activity stream with Ably integration
 */

import { useActivityFeed, getActivityMessage, getActivityIcon, getActivityColor } from '@/hooks/use-activity-feed';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
        <AlertCircle className="w-8 h-8 text-danger mb-2" />
        <p className="text-sm text-danger-foreground">Activity feed offline</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Activity Stream
          </h3>
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
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
        className="space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        style={{ maxHeight }}
      >
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
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
                className="flex items-start gap-3 p-3 rounded-2xl bg-surface/50 border border-border/50 hover:bg-surface transition-colors"
              >
                {/* Icon */}
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                    {getActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
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
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Showing {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      )}
    </div>
  );
}

export function CompactActivityFeed({ channelName, limit = 5 }: { channelName: string; limit?: number }) {
  const { activities, isConnected } = useActivityFeed({ channelName, limit });

  return (
    <div className="space-y-2">
      {activities.length === 0 ? (
        <p className="text-xs text-muted-foreground">No recent activity</p>
      ) : (
        <AnimatePresence mode="popLayout">
          {activities.slice(0, limit).map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground flex items-center gap-2"
            >
              <span>{getActivityIcon(activity.type)}</span>
              <span className="truncate">{getActivityMessage(activity)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      {isConnected && (
        <p className="text-xs text-muted-foreground/60">🍄 Live updates active</p>
      )}
    </div>
  );
}
