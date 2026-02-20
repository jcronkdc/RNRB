'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import {
  Activity,
  AlertTriangle,
  Clock,
  CreditCard,
  Edit,
  Eye,
  FileText,
  Loader2,
  Music4,
  Radio,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';

type ActivityType = 'all' | 'users' | 'content' | 'billing' | 'system';

interface ActivityItemProps {
  activity: {
    type: string;
    description: string;
    timestamp: Date;
    userId?: string;
    metadata?: any;
  };
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'user_signup':
      return { icon: UserPlus, color: '#22c55e', bg: 'bg-emerald-500/20' };
    case 'song_created':
      return { icon: Music4, color: '#f97316', bg: 'bg-orange-500/20' };
    case 'post_created':
      return { icon: FileText, color: '#8b5cf6', bg: 'bg-purple-500/20' };
    case 'stream_started':
      return { icon: Radio, color: '#ef4444', bg: 'bg-red-500/20' };
    case 'stream_ended':
      return { icon: Radio, color: '#71717a', bg: 'bg-zinc-500/20' };
    case 'subscription_created':
      return { icon: CreditCard, color: '#22c55e', bg: 'bg-emerald-500/20' };
    case 'subscription_canceled':
      return { icon: CreditCard, color: '#ef4444', bg: 'bg-red-500/20' };
    case 'user_updated':
      return { icon: Edit, color: '#06b6d4', bg: 'bg-cyan-500/20' };
    case 'user_deleted':
      return { icon: Trash2, color: '#ef4444', bg: 'bg-red-500/20' };
    case 'login':
      return { icon: Eye, color: '#3b82f6', bg: 'bg-blue-500/20' };
    case 'security_alert':
      return { icon: AlertTriangle, color: '#f59e0b', bg: 'bg-amber-500/20' };
    default:
      return { icon: Activity, color: '#71717a', bg: 'bg-zinc-500/20' };
  }
}

// Uses shared formatRelativeTime from @/lib/format-date
import { formatRelativeTime as formatTimeAgo } from '@/lib/format-date';

function ActivityItem({ activity }: ActivityItemProps) {
  const { icon: Icon, color, bg } = getActivityIcon(activity.type);

  return (
    <div className="group flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-white/[0.02]">
      {/* Timeline indicator */}
      <div className="relative flex flex-col items-center">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="absolute top-12 h-full w-px bg-white/5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{activity.description}</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(activity.timestamp)}
          </span>
          <span className="rounded bg-white/5 px-2 py-0.5 text-xs capitalize text-zinc-500">
            {activity.type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Time */}
      <span className="text-xs text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
        {new Date(activity.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

export default function ActivityPage() {
  const [activityType, setActivityType] = useState<ActivityType>('all');
  const [limit, setLimit] = useState(50);
  const [isLive, setIsLive] = useState(true);

  const {
    data: activities,
    isLoading,
    refetch,
    isFetching,
  } = trpc.admin.getRecentActivity.useQuery(
    { limit, type: activityType },
    { refetchInterval: isLive ? 10000 : false }
  );

  const filterOptions: { value: ActivityType; label: string; icon: any }[] = [
    { value: 'all', label: 'All Activity', icon: Activity },
    { value: 'users', label: 'User Events', icon: Users },
    { value: 'content', label: 'Content', icon: Music4 },
    { value: 'billing', label: 'Billing', icon: CreditCard },
    { value: 'system', label: 'System', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
          <p className="text-sm text-zinc-500">Real-time platform activity and event monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              isLive
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                : 'border-white/10 text-zinc-400 hover:bg-white/5'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-emerald-400' : 'bg-zinc-500'}`}
            />
            {isLive ? 'Live' : 'Paused'}
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setActivityType(option.value)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activityType === option.value
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="text-sm text-zinc-500">Events Loaded</p>
          <p className="text-2xl font-bold text-white">{activities?.length || 0}</p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="text-sm text-zinc-500">User Events</p>
          <p className="text-2xl font-bold text-white">
            {activities?.filter((a) => a.type.includes('user')).length || 0}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="text-sm text-zinc-500">Content Events</p>
          <p className="text-2xl font-bold text-white">
            {activities?.filter((a) => a.type.includes('song') || a.type.includes('post')).length ||
              0}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="text-sm text-zinc-500">Update Status</p>
          <p className="text-2xl font-bold text-emerald-400">{isLive ? 'Live' : 'Manual'}</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div
        className="rounded-2xl border"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Feed Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="font-semibold text-white">Activity Timeline</h2>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-lg border bg-white/5 px-3 py-1.5 text-sm text-white focus:border-orange-500/50 focus:outline-none"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <option value={25}>25 events</option>
            <option value={50}>50 events</option>
            <option value={100}>100 events</option>
          </select>
        </div>

        {/* Activity List */}
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : activities && activities.length > 0 ? (
            <>
              {activities.map((activity, index) => (
                <ActivityItem key={`${activity.timestamp}-${index}`} activity={activity} />
              ))}
            </>
          ) : (
            <div className="py-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-zinc-600" />
              <p className="mt-2 text-zinc-500">No activity found</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {activities && activities.length >= limit && (
          <div className="border-t border-white/5 p-4 text-center">
            <button
              onClick={() => setLimit(limit + 50)}
              className="text-sm text-orange-400 hover:underline"
            >
              Load more events
            </button>
          </div>
        )}
      </div>

      {/* Activity Legend */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <h3 className="mb-4 font-semibold text-white">Event Types</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { type: 'user_signup', label: 'User Signup' },
            { type: 'song_created', label: 'Song Created' },
            { type: 'post_created', label: 'Post Created' },
            { type: 'stream_started', label: 'Stream Started' },
            { type: 'subscription_created', label: 'Subscription' },
            { type: 'login', label: 'Login' },
            { type: 'security_alert', label: 'Security Alert' },
            { type: 'user_updated', label: 'Profile Update' },
          ].map((item) => {
            const { icon: Icon, color, bg } = getActivityIcon(item.type);
            return (
              <div key={item.type} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <span className="text-sm text-zinc-400">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
