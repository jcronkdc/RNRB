'use client';

import {
  Eye,
  Users,
  Mail,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  BarChart3,
  PieChart,
} from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

interface AnalyticsData {
  period: string;
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    subscriberCount: number;
    contactCount: number;
    orderCount: number;
    totalRevenue: number;
    avgSessionDuration: number;
  };
  viewsByDay: Array<{ date: string; views: number }>;
  topPages: Array<{ path: string; views: number }>;
  devices: Record<string, number>;
  topCountries: Array<{ country: string; views: number }>;
  topReferrers: Array<{ source: string; views: number }>;
  events: Record<string, number>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('7d');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/sites/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <BarChart3 size={48} style={{ color: 'var(--muted)', margin: '0 auto 1rem' }} />
        <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>
          {error || 'No analytics data available'}
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          Analytics will appear once your site starts receiving traffic
        </p>
      </div>
    );
  }

  const { overview } = data;

  // Calculate trends (mock for now - would need historical data)
  const viewsTrend = 12.5;
  const visitorsTrend = 8.3;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Analytics
        </h2>
        <div
          className="flex rounded-lg p-1"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                period === p ? 'bg-white/10' : ''
              }`}
              style={{
                color: period === p ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {p === '7d'
                ? 'Last 7 days'
                : p === '30d'
                  ? 'Last 30 days'
                  : p === '90d'
                    ? 'Last 90 days'
                    : 'All time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Eye}
          label="Total Views"
          value={overview.totalViews.toLocaleString()}
          trend={viewsTrend}
          color="var(--accent)"
        />
        <MetricCard
          icon={Users}
          label="Unique Visitors"
          value={overview.uniqueVisitors.toLocaleString()}
          trend={visitorsTrend}
          color="#10b981"
        />
        <MetricCard
          icon={Mail}
          label="Subscribers"
          value={overview.subscriberCount.toLocaleString()}
          color="#3b82f6"
        />
        <MetricCard
          icon={Clock}
          label="Avg. Session"
          value={formatDuration(overview.avgSessionDuration)}
          color="#f59e0b"
        />
      </div>

      {/* Revenue Metrics (if applicable) */}
      {(overview.orderCount > 0 || overview.contactCount > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon={ShoppingCart}
            label="Orders"
            value={overview.orderCount.toLocaleString()}
            color="#8b5cf6"
          />
          <MetricCard
            icon={DollarSign}
            label="Revenue"
            value={`$${overview.totalRevenue.toLocaleString()}`}
            color="#10b981"
          />
          <MetricCard
            icon={Mail}
            label="Contact Forms"
            value={overview.contactCount.toLocaleString()}
            color="#ec4899"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Views Over Time */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              Views Over Time
            </h3>
          </div>
          <ViewsChart data={data.viewsByDay} />
        </div>

        {/* Device Breakdown */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="mb-4 flex items-center gap-2">
            <PieChart size={18} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              Devices
            </h3>
          </div>
          <DeviceBreakdown devices={data.devices} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <h3 className="mb-4 font-semibold" style={{ color: 'var(--text)' }}>
            Top Pages
          </h3>
          <div className="space-y-2">
            {data.topPages.slice(0, 5).map((page, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'var(--bg)' }}
              >
                <span className="truncate text-sm" style={{ color: 'var(--text)' }}>
                  {page.path}
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  {page.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <h3 className="mb-4 font-semibold" style={{ color: 'var(--text)' }}>
            Top Referrers
          </h3>
          <div className="space-y-2">
            {data.topReferrers.slice(0, 5).map((ref, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'var(--bg)' }}
              >
                <div className="flex items-center gap-2">
                  <Globe size={14} style={{ color: 'var(--muted)' }} />
                  <span className="truncate text-sm" style={{ color: 'var(--text)' }}>
                    {ref.source}
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  {ref.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries */}
      {data.topCountries.length > 0 && (
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <h3 className="mb-4 font-semibold" style={{ color: 'var(--text)' }}>
            Geographic Distribution
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {data.topCountries.slice(0, 10).map((country, i) => (
              <div
                key={i}
                className="rounded-lg p-3 text-center"
                style={{ background: 'var(--bg)' }}
              >
                <div className="mb-1 text-2xl">{getCountryFlag(country.country)}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  {country.country}
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {country.views.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  trend?: number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: color + '20' }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
    </div>
  );
}

// Views Chart Component
function ViewsChart({ data }: { data: Array<{ date: string; views: number }> }) {
  if (data.length === 0) {
    return (
      <div
        className="flex h-48 items-center justify-center text-sm"
        style={{ color: 'var(--muted)' }}
      >
        No data available
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2" style={{ height: '200px' }}>
        {data.map((day, i) => {
          const height = (day.views / maxViews) * 100;
          return (
            <div key={i} className="group relative flex flex-1 flex-col justify-end">
              <div
                className="rounded-t transition-all group-hover:opacity-80"
                style={{
                  height: `${height}%`,
                  background: `linear-gradient(to top, var(--accent), ${(i / data.length) * 100}% transparent)`,
                  minHeight: day.views > 0 ? '4px' : '0',
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 group-hover:block">
                <div
                  className="whitespace-nowrap rounded px-2 py-1 text-xs"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <div style={{ color: 'var(--text)' }}>{day.views} views</div>
                  <div style={{ color: 'var(--muted)' }}>
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
        <span>
          {new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span>
          {new Date(data[data.length - 1].date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}

// Device Breakdown Component
function DeviceBreakdown({ devices }: { devices: Record<string, number> }) {
  const total = Object.values(devices).reduce((sum, count) => sum + count, 0);

  const deviceConfig = {
    desktop: { icon: Monitor, color: '#3b82f6', label: 'Desktop' },
    mobile: { icon: Smartphone, color: '#10b981', label: 'Mobile' },
    tablet: { icon: Tablet, color: '#f59e0b', label: 'Tablet' },
  };

  return (
    <div className="space-y-4">
      {Object.entries(devices).map(([device, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const config = deviceConfig[device as keyof typeof deviceConfig];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <div key={device}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon size={16} style={{ color: config.color }} />
                <span style={{ color: 'var(--text)' }}>{config.label}</span>
              </div>
              <span style={{ color: 'var(--muted)' }}>
                {count.toLocaleString()} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${percentage}%`,
                  background: config.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper Functions
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getCountryFlag(countryCode: string): string {
  // Map common country names to flag emojis
  const flagMap: Record<string, string> = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    Canada: '🇨🇦',
    Australia: '🇦🇺',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Spain: '🇪🇸',
    Italy: '🇮🇹',
    Japan: '🇯🇵',
    China: '🇨🇳',
    India: '🇮🇳',
    Brazil: '🇧🇷',
    Mexico: '🇲🇽',
    Unknown: '🌐',
  };
  return flagMap[countryCode] || '🌐';
}
