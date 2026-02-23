'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

// Donut chart component
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 36 36" className="h-40 w-40">
        {data.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          const dashArray = `${percentage} ${100 - percentage}`;
          const dashOffset = 25 - cumulativePercentage;
          cumulativePercentage += percentage;

          return (
            <circle
              key={segment.label}
              cx="18"
              cy="18"
              r="15.91549430918954"
              fill="none"
              stroke={segment.color}
              strokeWidth="3"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-white">{total}</p>
        <p className="text-xs text-zinc-500">Total</p>
      </div>
    </div>
  );
}

// Metric card
function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm ${
              changeType === 'up'
                ? 'text-emerald-400'
                : changeType === 'down'
                  ? 'text-red-400'
                  : 'text-zinc-400'
            }`}
          >
            {changeType === 'up' && <ArrowUpRight className="h-4 w-4" />}
            {changeType === 'down' && <ArrowDownRight className="h-4 w-4" />}
            {change}
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-zinc-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function BillingPage() {
  const [timeRange, setTimeRange] = useState(30);

  const {
    data: revenueData,
    isLoading,
    refetch,
  } = trpc.admin.getRevenueAnalytics.useQuery({ days: timeRange });
  const { data: overviewData } = trpc.admin.getOverviewStats.useQuery();

  const subscriptionBreakdown = [
    { label: 'Free', value: overviewData?.users.breakdown.free || 0, color: '#71717a' },
    { label: 'Creator', value: overviewData?.users.breakdown.creator || 0, color: '#f97316' },
    { label: 'Studio', value: overviewData?.users.breakdown.studio || 0, color: '#22c55e' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing & Revenue</h1>
          <p className="text-sm text-zinc-500">Subscription metrics and financial overview</p>
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
            onClick={() => refetch()}
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
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Monthly Recurring Revenue"
              value={`$${(revenueData?.mrr || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              color="#22c55e"
            />
            <MetricCard
              title="Annual Run Rate"
              value={`$${(revenueData?.arr || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              color="#8b5cf6"
            />
            <MetricCard
              title="New Subscriptions"
              value={revenueData?.newSubscriptions || 0}
              change={`${timeRange}d period`}
              changeType="neutral"
              icon={Users}
              color="#f97316"
            />
            <MetricCard
              title="Churn Rate"
              value={`${(revenueData?.churnRate || 0).toFixed(1)}%`}
              change={`${revenueData?.canceledSubscriptions || 0} canceled`}
              changeType={revenueData?.churnRate && revenueData.churnRate > 5 ? 'down' : 'up'}
              icon={TrendingDown}
              color="#ef4444"
            />
          </div>

          {/* Subscription Distribution */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Donut Chart */}
            <div
              className="rounded-2xl border p-6"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <h2 className="mb-6 text-lg font-semibold text-white">Subscription Distribution</h2>
              <div className="flex items-center justify-center gap-8">
                <DonutChart data={subscriptionBreakdown} />
                <div className="space-y-4">
                  {subscriptionBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-zinc-500">
                          {item.value} users (
                          {((item.value / (overviewData?.users.total || 1)) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue by Tier */}
            <div
              className="rounded-2xl border p-6"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <h2 className="mb-6 text-lg font-semibold text-white">Revenue by Tier</h2>
              <div className="space-y-6">
                {[
                  {
                    tier: 'Free',
                    price: 0,
                    users: overviewData?.users.breakdown.free || 0,
                    color: '#71717a',
                  },
                  {
                    tier: 'Creator',
                    price: 19.99,
                    users: overviewData?.users.breakdown.creator || 0,
                    color: '#f97316',
                  },
                  {
                    tier: 'Studio',
                    price: 49.99,
                    users: overviewData?.users.breakdown.studio || 0,
                    color: '#22c55e',
                  },
                ].map((item) => {
                  const revenue = item.price * item.users;
                  const maxRevenue =
                    49.99 *
                    Math.max(
                      overviewData?.users.breakdown.free || 0,
                      overviewData?.users.breakdown.creator || 0,
                      overviewData?.users.breakdown.studio || 0
                    );
                  const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={item.tier}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ background: item.color }}
                          />
                          <span className="text-sm text-white">{item.tier}</span>
                          <span className="text-xs text-zinc-500">${item.price}/mo</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          style={{ width: `${percentage}%`, background: item.color }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <h2 className="mb-6 text-lg font-semibold text-white">Subscription Health</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-emerald-500/10 p-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Check className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {overviewData?.users.activeSubscriptions || 0}
                </p>
                <p className="text-sm text-zinc-500">Active</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {revenueData?.newSubscriptions || 0}
                </p>
                <p className="text-sm text-zinc-500">New ({timeRange}d)</p>
              </div>
              <div className="rounded-xl bg-red-500/10 p-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {revenueData?.canceledSubscriptions || 0}
                </p>
                <p className="text-sm text-zinc-500">Canceled ({timeRange}d)</p>
              </div>
              <div className="rounded-xl bg-purple-500/10 p-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {(
                    ((overviewData?.users.proUsers || 0) / (overviewData?.users.total || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-sm text-zinc-500">Conversion Rate</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              className="flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-white/5"
              style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                <CreditCard className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">View in Stripe</p>
                <p className="text-sm text-zinc-500">Open Stripe Dashboard</p>
              </div>
            </button>
            <button
              className="flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-white/5"
              style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">Export Revenue Data</p>
                <p className="text-sm text-zinc-500">Download detailed report</p>
              </div>
            </button>
            <button
              className="flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-white/5"
              style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                <Calendar className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="font-medium text-white">Scheduled Renewals</p>
                <p className="text-sm text-zinc-500">View upcoming charges</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
