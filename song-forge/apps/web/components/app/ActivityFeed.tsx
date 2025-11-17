'use client';

import { cn } from '@cronkwaters/ui';
import { Music, FileText, Users, FileAudio, Clock } from 'lucide-react';
import { useMemo } from 'react';

interface ActivityItem {
  id: string;
  type: 'project_created' | 'song_added' | 'asset_uploaded' | 'split_created' | 'license_created';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface ActivityFeedProps {
  items?: ActivityItem[];
  limit?: number;
  className?: string;
}

const ICON_MAP = {
  project_created: Music,
  song_added: Music,
  asset_uploaded: FileAudio,
  split_created: Users,
  license_created: FileText
} as const;

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function ActivityFeed({ items = [], limit = 5, className }: ActivityFeedProps) {
  const displayItems = useMemo(() => {
    return items.slice(0, limit);
  }, [items, limit]);

  if (displayItems.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-border/60 bg-surface/80 p-6 text-center shadow-soft', className)}>
        <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
        <p className="text-sm font-medium text-brand-foreground">No recent activity</p>
        <p className="mt-1 text-xs text-muted-foreground">Activity will appear here as you work</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-border/60 bg-surface/80 shadow-soft', className)}>
      <div className="border-b border-border/50 px-5 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">Recent Activity</h3>
      </div>
      <ul className="divide-y divide-border/50">
        {displayItems.map((item) => {
          const Icon = ICON_MAP[item.type];
          return (
            <li key={item.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground/80">{formatTimeAgo(item.timestamp)}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

