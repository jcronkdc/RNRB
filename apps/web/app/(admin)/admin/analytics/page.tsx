'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CreditCard,
  Loader2,
  MessageSquare,
  Music4,
  RefreshCw,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import { useState } from 'react';

// Simple chart component for growth visualization
function GrowthChart({
  data,
  height = 200,
}: {
  data: { date: string; total: number; free: number; creator: number; studio: number }[];
  height?: number;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-zinc-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.total));
  const minValue = Math.min(...data.map((d) => d.total));
  const range = maxValue - minValue || 1;

  return (
    <div className="relative" style={{ height }}>
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="border-t border-white/5" />
        ))}
      </div>

      {/* Bars */}
      <div className="relative flex h-full items-end justify-between gap-1">
        {data.map((day, index) => {
          const heightPercent = ((day.total - minValue) / range) * 100;
          return (
            <div
              key={day.date}
              style={{ height: `${Math.max(heightPercent, 5)}%` }}
              className="group relative flex-1 cursor-pointer rounded-t-sm bg-linear-to-t from-orange-500/50 to-orange-500 transition-all hover:from-orange-400/50 hover:to-orange-400"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-2 text-xs shadow-xl group-hover:block">
                <p className="font-medium text-white">{day.total} signups</p>
                <p className="text-zinc-400">{new Date(day.date).toLocaleDateString()}</p>
                <div className="mt-1 space-y-0.5 border-t border-white/10 pt-1">
                  <p className="text-zinc-500">Free: {day.free}</p>
                  <p className="text-orange-400">Creator: {day.creator}</p>
                  <p className="text-emerald-400">Studio: {day.studio}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex justify-between text-xs text-zinc-500">
        <span>
          {data[0] &&
            new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span>
          {data[data.length - 1] &&
            new Date(data[data.length - 1].date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
        </span>
      </div>
    </div>
  );
}

// Metric card component
function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  subtext,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  subtext?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {subtext && <p className="mt-1 text-xs text-zinc-500">{subtext}</p>}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1">
          {changeType === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-400" />}
          {changeType === 'down' && <ArrowDownRight className="h-4 w-4 text-red-400" />}
          <span
            className={`text-sm ${
              changeType === 'up'
                ? 'text-emerald-400'
                : changeType === 'down'
                  ? 'text-red-400'
                  : 'text-zinc-400'
            }`}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

// Top users table component
function TopUsersTable({
  users,
  metric,
  title,
}: {
  users: any[];
  metric: 'aiRequestsUsed' | 'storageUsedGB';
  title: string;
}) {
  return (
    <div
      className="rounded-2xl border"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="border-b border-white/5 px-5 py-4">
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="divide-y divide-white/5">
        {users.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? 'bg-amber-500 text-black'
                    : index === 1
                      ? 'bg-zinc-400 text-black'
                      : index === 2
                        ? 'bg-orange-700 text-white'
                        : 'bg-white/10 text-zinc-400'
                }`}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                <p className="text-xs text-zinc-500">{user.subscriptionTier}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-white">
              {metric === 'aiRequestsUsed'
                ? `${user.aiRequestsUsed || 0} requests`
                : `${Number(user.storageUsedGB || 0).toFixed(2)} GB`}
            </span>
          </div>
        ))}
        {users.length === 0 && (
          <div className="py-8 text-center text-zinc-500">No data available</div>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30);

  const {
    data: growthData,
    isLoading: growthLoading,
    refetch: refetchGrowth,
  } = trpc.admin.getUserGrowthAnalytics.useQuery({ days: timeRange });
  const { data: revenueData, isLoading: revenueLoading } = trpc.admin.getRevenueAnalytics.useQuery({
    days: timeRange,
  });
  const { data: contentData, isLoading: contentLoading } =
    trpc.admin.getContentAnalytics.useQuery();
  const { data: usageData, isLoading: usageLoading } = trpc.admin.getUsageAnalytics.useQuery();

  const isLoading = growthLoading || revenueLoading || contentLoading || usageLoading;

  const handleRefresh = () => {
    refetchGrowth();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Deep Analytics</h1>
          <p className="text-sm text-zinc-500">Advanced insights and growth metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="rounded-xl border bg-white/5 px-4 py-2 text-sm text-white focus:border-orange-500/50 focus:outline-hidden"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {/* User Growth Section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">User Growth</h2>
            <div
              className="rounded-2xl border p-6"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Daily Signups</p>
                  <p className="text-xl font-bold text-white">
                    {growthData?.reduce((acc, d) => acc + d.total, 0) || 0} total in {timeRange}{' '}
                    days
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-zinc-500" />
                    Free
                  </span>
                  <span className="flex items-center gap-2 text-orange-400">
                    <div className="h-3 w-3 rounded-sm bg-orange-500" />
                    Creator
                  </span>
                  <span className="flex items-center gap-2 text-emerald-400">
                    <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                    Studio
                  </span>
                </div>
              </div>
              <GrowthChart data={growthData || []} height={200} />
            </div>
          </section>

          {/* Revenue Metrics */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Revenue Metrics</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Monthly Recurring Revenue"
                value={`$${(revenueData?.mrr || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                icon={CreditCard}
                color="#22c55e"
                subtext="Active subscriptions"
              />
              <MetricCard
                title="Annual Recurring Revenue"
                value={`$${(revenueData?.arr || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                icon={TrendingUp}
                color="#8b5cf6"
                subtext="Projected yearly"
              />
              <MetricCard
                title="New Subscriptions"
                value={revenueData?.newSubscriptions || 0}
                change={`in last ${timeRange} days`}
                changeType="neutral"
                icon={Users}
                color="#f97316"
              />
              <MetricCard
                title="Churn Rate"
                value={`${(revenueData?.churnRate || 0).toFixed(1)}%`}
                change={`${revenueData?.canceledSubscriptions || 0} canceled`}
                changeType={revenueData?.churnRate && revenueData.churnRate > 5 ? 'down' : 'up'}
                icon={Activity}
                color="#ef4444"
              />
            </div>
          </section>

          {/* Content Analytics */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Content Created (Last 30 Days)
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <MetricCard
                title="Songs"
                value={contentData?.last30Days.songs || 0}
                icon={Music4}
                color="#f97316"
              />
              <MetricCard
                title="Projects"
                value={contentData?.last30Days.projects || 0}
                icon={BarChart3}
                color="#8b5cf6"
              />
              <MetricCard
                title="Posts"
                value={contentData?.last30Days.posts || 0}
                icon={MessageSquare}
                color="#3b82f6"
              />
              <MetricCard
                title="Forum Posts"
                value={contentData?.last30Days.forumPosts || 0}
                icon={Video}
                color="#ef4444"
              />
              <MetricCard
                title="Events"
                value={contentData?.last30Days.events || 0}
                icon={Calendar}
                color="#22c55e"
              />
            </div>
          </section>

          {/* Usage Analytics */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Platform Usage by Tier</h2>
            <div
              className="overflow-x-auto rounded-2xl border"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Tier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      AI Requests
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Video Minutes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Image Credits
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Avg Storage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usageData?.usageByTier.map((tier) => (
                    <tr key={tier.subscriptionTier} className="hover:bg-white/2">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            tier.subscriptionTier === 'studio'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : tier.subscriptionTier === 'creator'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-zinc-500/20 text-zinc-400'
                          }`}
                        >
                          {tier.subscriptionTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {(tier._sum.aiRequestsUsed || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {(tier._sum.videoMinutesUsed || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {(tier._sum.imageCreditsUsed || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {Number(tier._avg.storageUsedGB || 0).toFixed(2)} GB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top Users */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Top Users</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TopUsersTable
                users={usageData?.topAiUsers || []}
                metric="aiRequestsUsed"
                title="Top AI Users"
              />
              <TopUsersTable
                users={usageData?.topStorageUsers || []}
                metric="storageUsedGB"
                title="Top Storage Users"
              />
            </div>
          </section>

          {/* Top Creators */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Top Content Creators</h2>
            <div
              className="rounded-2xl border"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="divide-y divide-white/5">
                {contentData?.topCreators.map((creator, index) => (
                  <div key={creator.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0
                            ? 'bg-amber-500 text-black'
                            : index === 1
                              ? 'bg-zinc-400 text-black'
                              : index === 2
                                ? 'bg-orange-700 text-white'
                                : 'bg-white/10 text-zinc-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      {creator.image ? (
                        <img
                          src={creator.image}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-red-500 text-sm font-medium text-white">
                          {creator.name?.[0] || creator.email?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{creator.name || 'Unnamed User'}</p>
                        <p className="text-sm text-zinc-500">{creator.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-1 text-orange-400">
                        <Music4 className="h-4 w-4" />
                        {creator._count.songs} songs
                      </span>
                      <span className="flex items-center gap-1 text-purple-400">
                        <MessageSquare className="h-4 w-4" />
                        {creator._count.authoredPosts} posts
                      </span>
                    </div>
                  </div>
                ))}
                {(!contentData?.topCreators || contentData.topCreators.length === 0) && (
                  <div className="py-8 text-center text-zinc-500">No creators found</div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
