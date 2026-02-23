'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  ShoppingBag,
  Package,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from '@/components/ui/custom-icons';

import { EmptyState } from '@/components/empty-states';

interface Earning {
  id: string;
  productName: string;
  productSlug: string;
  orderDate: string;
  quantity: number;
  retailPrice: number;
  basePrice: number;
  profit: number;
  yourShare: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING';
}

interface EarningsSummary {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  totalOrders: number;
  averageOrderValue: number;
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/artist-merch/earnings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch earnings');
      }

      setEarnings(data.earnings);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEarnings = earnings.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return e.status === 'PENDING' || e.status === 'PROCESSING';
    if (filter === 'paid') return e.status === 'PAID';
    return true;
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
            Pending
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            Processing
          </span>
        );
      default:
        return null;
    }
  };

  const getMonthChange = () => {
    if (!summary) return null;
    const change = summary.thisMonthEarnings - summary.lastMonthEarnings;
    const percentChange =
      summary.lastMonthEarnings > 0 ? ((change / summary.lastMonthEarnings) * 100).toFixed(1) : '0';
    const isPositive = change >= 0;

    return (
      <div
        className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}
      >
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {percentChange}% vs last month
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-64 -left-64 h-[500px] w-[500px] rounded-full bg-linear-to-br from-green-500/10 to-transparent blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-linear-to-tl from-emerald-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex flex-col items-center"
          >
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </motion.div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">Earnings Dashboard</h1>
              </div>
              <p className="text-white/60">Track your merchandise earnings and payouts</p>
            </div>
            <Link
              href="/my-merch"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition-all hover:bg-white/20"
            >
              Back to Store
            </Link>
          </motion.div>

          {/* Summary Cards */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-white/50">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatPrice(summary.totalEarnings)}
                </p>
                <p className="text-xs text-white/40">All-time</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20">
                  <Calendar className="h-5 w-5 text-yellow-400" />
                </div>
                <p className="text-sm text-white/50">This Month</p>
                <p className="text-2xl font-bold text-white">
                  {formatPrice(summary.thisMonthEarnings)}
                </p>
                {getMonthChange()}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-sm text-white/50">Total Orders</p>
                <p className="text-2xl font-bold text-white">{summary.totalOrders}</p>
                <p className="text-xs text-white/40">
                  Avg: {formatPrice(summary.averageOrderValue)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <p className="text-sm text-white/50">Pending</p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatPrice(summary.pendingEarnings)}
                </p>
                <p className="text-xs text-white/40">Awaiting payout</p>
              </div>
            </motion.div>
          )}

          {/* Filter & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-2">
              {(['all', 'pending', 'paid'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                    filter === f
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </motion.div>

          {/* Earnings Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredEarnings.length === 0 ? (
            <EmptyState
              type="analytics"
              title="No earnings yet"
              description="Start selling merchandise to see your earnings here"
              actionLabel="Create Product"
              actionHref="/my-merch/create"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">
                        Date
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white/60">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white/60">
                        Sale Price
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white/60">
                        Cost
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white/60">
                        Your Earnings
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white/60">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEarnings.map((earning, index) => (
                      <motion.tr
                        key={earning.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="border-b border-white/5 transition-colors hover:bg-white/5"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/u/your-username/merch/${earning.productSlug}`}
                            className="font-medium text-white hover:text-emerald-400"
                          >
                            {earning.productName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-white/60">{formatDate(earning.orderDate)}</td>
                        <td className="px-6 py-4 text-center text-white">{earning.quantity}</td>
                        <td className="px-6 py-4 text-right text-white">
                          {formatPrice(earning.retailPrice * earning.quantity)}
                        </td>
                        <td className="px-6 py-4 text-right text-white/60">
                          {formatPrice(earning.basePrice * earning.quantity)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                          {formatPrice(earning.yourShare)}
                        </td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(earning.status)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Payout Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 to-transparent p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  Payout Information
                </h3>
                <p className="text-sm text-white/60">
                  Earnings are paid monthly on the 15th via Stripe Connect. Minimum payout: $50.
                </p>
              </div>
              <Link
                href="/settings/billing"
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Payment Settings
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
