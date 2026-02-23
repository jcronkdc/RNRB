'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Bug,
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

interface BugCounts {
  unresolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface RecentError {
  id: string;
  severity: string;
  category: string;
  message: string;
  lastOccurredAt: string;
  occurrenceCount: number;
}

export default function AdminPage() {
  const [bugCounts, setBugCounts] = useState<BugCounts | null>(null);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/error-reports?limit=5&resolved=false');
        const data = await res.json();
        if (data.counts) {
          setBugCounts(data.counts);
        }
        if (data.reports) {
          setRecentErrors(data.reports.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch bug data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const severityColors: Record<string, string> = {
    critical: 'text-red-400 bg-red-500/20',
    high: 'text-orange-400 bg-orange-500/20',
    medium: 'text-yellow-400 bg-yellow-500/20',
    low: 'text-blue-400 bg-blue-500/20',
    info: 'text-zinc-400 bg-zinc-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-zinc-400">Welcome back! Here's an overview of your platform.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Bug Summary */}
        <Link
          href="/admin/bugs"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
              <Bug className="h-6 w-6 text-orange-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-orange-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : bugCounts?.unresolved || 0}
            </p>
            <p className="text-sm text-zinc-500">Unresolved Bugs</p>
          </div>
          {bugCounts && bugCounts.critical > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">
                {bugCounts.critical} Critical
              </span>
            </div>
          )}
        </Link>

        {/* High Priority */}
        <div className="rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
            <Zap className="h-6 w-6 text-red-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : (bugCounts?.critical || 0) + (bugCounts?.high || 0)}
            </p>
            <p className="text-sm text-zinc-500">Critical + High Priority</p>
          </div>
        </div>

        {/* Total Tracked */}
        <div className="rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
            <BarChart3 className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : bugCounts?.total || 0}
            </p>
            <p className="text-sm text-zinc-500">Total Errors Tracked</p>
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="mt-4">
            <p className="text-lg font-bold text-emerald-400">Operational</p>
            <p className="text-sm text-zinc-500">System Status</p>
          </div>
        </div>
      </div>

      {/* Recent Bugs */}
      <div className="rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Bugs</h2>
            <p className="text-sm text-zinc-500">Latest unresolved issues from users</p>
          </div>
          <Link
            href="/admin/bugs"
            className="flex items-center gap-2 rounded-lg bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/30"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        ) : recentErrors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <Bug className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">All Clear!</h3>
            <p className="text-sm text-zinc-400">No unresolved bugs at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentErrors.map((error) => (
              <Link
                key={error.id}
                href="/admin/bugs"
                className="flex items-center justify-between rounded-xl bg-zinc-800/30 p-4 transition-colors hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-lg px-2 py-1 text-xs font-medium uppercase ${
                      severityColors[error.severity] || severityColors.info
                    }`}
                  >
                    {error.severity}
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-medium text-white">
                      {error.message.slice(0, 80)}
                      {error.message.length > 80 ? '...' : ''}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {error.category} • {new Date(error.lastOccurredAt).toLocaleString()}
                      {error.occurrenceCount > 1 && ` • ${error.occurrenceCount} occurrences`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-600" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/admin/users"
          className="group rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6 transition-all hover:border-blue-500/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">User Management</h3>
              <p className="text-sm text-zinc-500">Manage users & permissions</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/analytics"
          className="group rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6 transition-all hover:border-purple-500/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Analytics</h3>
              <p className="text-sm text-zinc-500">Platform metrics & insights</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="group rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6 transition-all hover:border-emerald-500/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <Clock className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Reports</h3>
              <p className="text-sm text-zinc-500">Export data & reports</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
