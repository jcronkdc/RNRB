'use client';

import { motion } from 'motion/react';
import {
  DollarSign,
  TrendingUp,
  Plus,
  Calendar,
  Music,
  Mic2,
  Radio,
  Film,
  ShoppingBag,
  GraduationCap,
  Banknote,
  MoreVertical,
  Download,
  Filter,
  ChevronRight,
  Loader2,
  PiggyBank,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { microCopy } from '@/lib/workshop-voice';
import { EmptyState } from '@/components/empty-states';
import { ChartSkeleton, RevenueListSkeleton } from '@/components/loading-skeletons';

// Revenue source icons
const sourceIcons: Record<string, any> = {
  gig: Mic2,
  streaming: Music,
  sync: Film,
  merch: ShoppingBag,
  teaching: GraduationCap,
  session: Radio,
  royalty: Banknote,
  tip: DollarSign,
  other: MoreVertical,
};

// Source colors
const sourceColors: Record<string, string> = {
  gig: 'from-orange-500 to-red-600',
  streaming: 'from-green-500 to-emerald-600',
  sync: 'from-purple-500 to-violet-600',
  merch: 'from-pink-500 to-rose-600',
  teaching: 'from-blue-500 to-indigo-600',
  session: 'from-yellow-500 to-amber-600',
  royalty: 'from-cyan-500 to-blue-600',
  tip: 'from-lime-500 to-green-600',
  other: 'from-gray-500 to-slate-600',
};

function RevenueCard({ revenue }: { revenue: any }) {
  const Icon = sourceIcons[revenue.source] || DollarSign;
  const color = sourceColors[revenue.source] || 'from-gray-500 to-slate-600';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/4 p-4 transition-all hover:bg-white/6"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${color}`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white capitalize">
            {revenue.source.replace('_', ' ')}
          </h4>
          <span className="text-lg font-bold text-emerald-400">+${revenue.amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/50">
          {revenue.description && <span className="truncate">{revenue.description}</span>}
          {revenue.platform && (
            <span className="rounded-full bg-white/10 px-2 py-0.5">{revenue.platform}</span>
          )}
          <span>{new Date(revenue.earnedDate).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Simple chart component
function RevenueChart({ data }: { data: { month: string; amount: number }[] }) {
  if (data.length === 0) return null;

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {data.slice(-12).map((item, i) => {
        const height = (item.amount / maxAmount) * 100;
        const monthLabel = new Date(item.month + '-01').toLocaleDateString('en', {
          month: 'short',
        });

        return (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="w-full rounded-t-lg bg-linear-to-t from-emerald-600 to-emerald-400"
              title={`$${item.amount.toFixed(2)}`}
            />
            <span className="text-[10px] text-white/40">{monthLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function RevenuePage() {
  const [revenues, setRevenues] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ total: 0, bySource: {}, byMonth: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('year');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadRevenue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ecosystem/revenue?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setRevenues(data.revenues || []);
        setTotals(data.totals || { total: 0, bySource: {}, byMonth: [] });
      }
    } catch (error) {
      console.error('Error loading revenue:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadRevenue();
  }, [loadRevenue]);

  // Calculate stats
  const thisMonth = totals.byMonth[totals.byMonth.length - 1]?.amount || 0;
  const lastMonth = totals.byMonth[totals.byMonth.length - 2]?.amount || 0;
  const monthChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  const topSources = Object.entries(totals.bySource || {})
    .sort(([, a]: any, [, b]: any) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-gray-950 to-black">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 -left-64 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-green-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="group">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  width={140}
                  height={56}
                  className="transition-transform group-hover:scale-105"
                  priority
                />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Revenue Dashboard</h1>
                <p className="text-sm text-white/50">Track all your music income</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-hidden focus:border-emerald-500/50"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-green-700"
              >
                <Plus className="h-4 w-4" />
                Log Income
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 md:grid-cols-4"
        >
          {/* Total */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-emerald-500/20 to-green-500/10 p-6">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
            <div className="relative">
              <div className="mb-2 flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-white/60">Total Earnings</span>
              </div>
              <p className="text-3xl font-bold text-white">
                ${totals.total.toLocaleString('en', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* This Month */}
          <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-white/60">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">${thisMonth.toFixed(2)}</p>
            {monthChange !== 0 && (
              <div
                className={`mt-1 flex items-center gap-1 text-xs ${monthChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {monthChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(monthChange).toFixed(1)}% from last month
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-white/60">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white">{revenues.length}</p>
          </div>

          {/* Top Source */}
          <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <span className="text-sm text-white/60">Top Source</span>
            </div>
            <p className="text-2xl font-bold text-white capitalize">
              {topSources[0]?.[0]?.replace('_', ' ') || '-'}
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/4 p-6 lg:col-span-8"
          >
            <h3 className="mb-4 font-semibold text-white">Revenue Over Time</h3>
            {loading ? (
              <ChartSkeleton />
            ) : totals.byMonth.length > 0 ? (
              <RevenueChart data={totals.byMonth} />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-white/40">
                No revenue data yet
              </div>
            )}
          </motion.div>

          {/* By Source */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/10 bg-white/4 p-6 lg:col-span-4"
          >
            <h3 className="mb-4 font-semibold text-white">By Source</h3>
            {topSources.length > 0 ? (
              <div className="space-y-3">
                {topSources.map(([source, data]: any) => {
                  const Icon = sourceIcons[source] || DollarSign;
                  const color = sourceColors[source] || 'from-gray-500 to-slate-600';
                  const percentage = (data.total / totals.total) * 100;

                  return (
                    <div key={source} className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${color}`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70 capitalize">
                            {source.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-medium text-white">
                            ${data.total.toFixed(0)}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full bg-linear-to-r ${color}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-sm text-white/40">No revenue data yet</div>
            )}
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Transactions</h3>
            <button className="text-sm text-white/50 hover:text-white">Export CSV</button>
          </div>

          {loading ? (
            <RevenueListSkeleton count={5} />
          ) : revenues.length > 0 ? (
            <div className="space-y-2">
              {revenues.slice(0, 10).map((revenue) => (
                <RevenueCard key={revenue.id} revenue={revenue} />
              ))}
            </div>
          ) : (
            <EmptyState type="revenue" onAction={() => setShowAddModal(true)} />
          )}
        </motion.div>
      </div>

      {/* Add Revenue Modal - Would need to be implemented */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">Log Income</h3>
            <p className="mb-4 text-sm text-white/50">
              Coming soon! For now, income will be automatically tracked from shows and
              opportunities.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
