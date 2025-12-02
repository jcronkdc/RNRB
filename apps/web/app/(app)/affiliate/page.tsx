'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign,
  Users,
  MousePointer,
  TrendingUp,
  Copy,
  Check,
  Download,
  Calendar,
  Crown,
  Shield,
  Star,
  Zap,
  ExternalLink,
  Gift,
  Clock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

// Tier configuration
const tiers = [
  { name: 'Starter', minReferrals: 0, commission: 10, color: 'var(--muted)', icon: Star },
  { name: 'Bronze', minReferrals: 10, commission: 12, color: '#CD7F32', icon: Shield },
  { name: 'Silver', minReferrals: 25, commission: 15, color: '#C0C0C0', icon: Shield },
  { name: 'Gold', minReferrals: 50, commission: 18, color: 'var(--gold)', icon: Crown },
  { name: 'Platinum', minReferrals: 100, commission: 22, color: '#E5E4E2', icon: Crown },
  { name: 'Ambassador', minReferrals: 250, commission: 25, color: 'var(--accent)', icon: Zap },
];

interface AffiliateStats {
  totalEarnings: number;
  pendingEarnings: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  activeReferrals: number;
  currentTier: string;
  affiliateCode: string;
  monthlyEarnings: { month: string; amount: number }[];
  recentReferrals: { email: string; date: string; plan: string; commission: number }[];
}

export default function AffiliateDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAffiliateStats();
  }, [selectedPeriod]);

  const fetchAffiliateStats = async () => {
    try {
      const response = await fetch(`/api/affiliates/stats?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Demo data for now
        setStats({
          totalEarnings: 1247.5,
          pendingEarnings: 234.0,
          totalClicks: 2341,
          totalConversions: 47,
          conversionRate: 2.01,
          activeReferrals: 42,
          currentTier: 'Gold',
          affiliateCode: 'ROCK2024',
          monthlyEarnings: [
            { month: 'Jul', amount: 890 },
            { month: 'Aug', amount: 1120 },
            { month: 'Sep', amount: 980 },
            { month: 'Oct', amount: 1340 },
            { month: 'Nov', amount: 1247.5 },
          ],
          recentReferrals: [
            { email: 'j***@gmail.com', date: '2024-11-28', plan: 'Studio', commission: 49.5 },
            { email: 'm***@outlook.com', date: '2024-11-25', plan: 'Creator', commission: 19.8 },
            { email: 's***@yahoo.com', date: '2024-11-22', plan: 'Studio', commission: 49.5 },
            { email: 'r***@gmail.com', date: '2024-11-20', plan: 'Creator', commission: 19.8 },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentTier = () => {
    if (!stats) return tiers[0];
    return tiers.find((t) => t.name === stats.currentTier) || tiers[0];
  };

  const getNextTier = () => {
    const currentIndex = tiers.findIndex((t) => t.name === stats?.currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getTierProgress = () => {
    if (!stats) return 0;
    const current = getCurrentTier();
    const next = getNextTier();
    if (!next) return 100;
    const progress =
      ((stats.activeReferrals - current.minReferrals) /
        (next.minReferrals - current.minReferrals)) *
      100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const referralLink = `https://rocknrollbasement.com?ref=${stats?.affiliateCode}`;

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      {/* Header with Logo */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
            <p style={{ color: 'var(--muted)' }}>Track your earnings and performance</p>
          </div>
        </div>

        {/* Tier Badge */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2"
          style={{ background: `${currentTier.color}20`, border: `1px solid ${currentTier.color}` }}
        >
          <currentTier.icon className="h-5 w-5" style={{ color: currentTier.color }} />
          <span className="font-semibold" style={{ color: currentTier.color }}>
            {currentTier.name} Partner
          </span>
        </div>
      </div>

      {/* Referral Link Card */}
      <div
        className="mb-8 rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Your Referral Link</h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Share this link to earn {currentTier.commission}% commission on every conversion
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <code className="text-sm" style={{ color: 'var(--accent)' }}>
                {referralLink}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(referralLink)}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Affiliate Code */}
        <div
          className="mt-4 flex items-center gap-4 border-t pt-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              Your Code:
            </span>
            <span className="ml-2 font-mono font-bold" style={{ color: 'var(--accent)' }}>
              {stats?.affiliateCode}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(stats?.affiliateCode || '')}
            className="text-sm underline"
            style={{ color: 'var(--muted)' }}
          >
            Copy code
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Earnings',
            value: `$${stats?.totalEarnings.toFixed(2)}`,
            icon: DollarSign,
            change: '+23%',
            color: 'var(--sage)',
          },
          {
            label: 'Pending Payout',
            value: `$${stats?.pendingEarnings.toFixed(2)}`,
            icon: Clock,
            sublabel: 'Next payout: Dec 1',
            color: 'var(--gold)',
          },
          {
            label: 'Total Clicks',
            value: stats?.totalClicks.toLocaleString(),
            icon: MousePointer,
            change: '+45%',
            color: 'var(--accent)',
          },
          {
            label: 'Conversions',
            value: stats?.totalConversions,
            icon: Users,
            sublabel: `${stats?.conversionRate}% rate`,
            color: 'var(--accent)',
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-xl p-5"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: `${stat.color}20` }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              {stat.change && (
                <span className="text-sm font-medium" style={{ color: 'var(--sage)' }}>
                  {stat.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {stat.sublabel || stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex items-center gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: selectedPeriod === period ? 'var(--accent)' : 'var(--panel)',
              color: selectedPeriod === period ? '#000' : 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            {period === '7d'
              ? '7 Days'
              : period === '30d'
                ? '30 Days'
                : period === '90d'
                  ? '90 Days'
                  : 'All Time'}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Earnings Chart */}
        <div
          className="rounded-xl p-6 lg:col-span-2"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Earnings Over Time</h2>
            <button className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex h-48 items-end justify-between gap-2">
            {stats?.monthlyEarnings.map((month, index) => {
              const maxAmount = Math.max(...(stats?.monthlyEarnings.map((m) => m.amount) || [1]));
              const height = (month.amount / maxAmount) * 100;
              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${height}%`,
                      background:
                        index === stats.monthlyEarnings.length - 1
                          ? 'var(--accent)'
                          : 'var(--accent-dim)',
                    }}
                  />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier Progress */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <h2 className="mb-4 text-lg font-semibold">Tier Progress</h2>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium" style={{ color: currentTier.color }}>
                {currentTier.name}
              </span>
              {nextTier && (
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                  {nextTier.name}
                </span>
              )}
            </div>
            <div className="h-3 overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${getTierProgress()}%`,
                  background: `linear-gradient(to right, ${currentTier.color}, ${nextTier?.color || currentTier.color})`,
                }}
              />
            </div>
            {nextTier && (
              <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                {nextTier.minReferrals - (stats?.activeReferrals || 0)} more referrals to{' '}
                {nextTier.name}
              </p>
            )}
          </div>

          {/* Current Benefits */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="mb-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Your Benefits
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4" style={{ color: 'var(--sage)' }} />
                {currentTier.commission}% commission rate
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4" style={{ color: 'var(--sage)' }} />
                Priority support
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4" style={{ color: 'var(--sage)' }} />
                Custom branded materials
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      <div
        className="mt-6 rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Referrals</h2>
          <Link
            href="/affiliate/referrals"
            className="flex items-center gap-1 text-sm"
            style={{ color: 'var(--accent)' }}
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th
                  className="pb-3 text-left text-sm font-medium"
                  style={{ color: 'var(--muted)' }}
                >
                  User
                </th>
                <th
                  className="pb-3 text-left text-sm font-medium"
                  style={{ color: 'var(--muted)' }}
                >
                  Date
                </th>
                <th
                  className="pb-3 text-left text-sm font-medium"
                  style={{ color: 'var(--muted)' }}
                >
                  Plan
                </th>
                <th
                  className="pb-3 text-right text-sm font-medium"
                  style={{ color: 'var(--muted)' }}
                >
                  Commission
                </th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentReferrals.map((referral, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom:
                      index < stats.recentReferrals.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <td className="py-3 font-mono text-sm">{referral.email}</td>
                  <td className="py-3 text-sm" style={{ color: 'var(--muted)' }}>
                    {referral.date}
                  </td>
                  <td className="py-3">
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium"
                      style={{
                        background:
                          referral.plan === 'Studio' ? 'var(--gold)20' : 'var(--accent-dim)',
                        color: referral.plan === 'Studio' ? 'var(--gold)' : 'var(--accent)',
                      }}
                    >
                      {referral.plan}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium" style={{ color: 'var(--sage)' }}>
                    +${referral.commission.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotional Materials */}
      <div
        className="mt-6 rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <h2 className="mb-4 text-lg font-semibold">Promotional Materials</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Stream Overlays', count: 5, icon: '🎬' },
            { name: 'Social Banners', count: 12, icon: '📱' },
            { name: 'Video Clips', count: 3, icon: '🎥' },
            { name: 'Email Templates', count: 4, icon: '📧' },
          ].map((material, index) => (
            <Link
              key={index}
              href={`/affiliate/materials/${material.name.toLowerCase().replace(' ', '-')}`}
              className="flex items-center gap-3 rounded-lg p-4 transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <span className="text-2xl">{material.icon}</span>
              <div>
                <div className="font-medium">{material.name}</div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  {material.count} assets
                </div>
              </div>
              <ChevronRight className="ml-auto h-5 w-5" style={{ color: 'var(--muted)' }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="mt-6 rounded-xl p-6"
        style={{
          background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--panel) 100%)',
          border: '1px solid var(--accent)',
        }}
      >
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Ready to Stream?</h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Get your one-click stream setup with room codes and overlays
            </p>
          </div>
          <Link
            href="/affiliate/stream-setup"
            className="flex items-center gap-2 rounded-lg px-6 py-3 font-medium"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            <Gift className="h-5 w-5" />
            Stream Setup
          </Link>
        </div>
      </div>
    </div>
  );
}
