'use client';

import { motion } from 'framer-motion';
import {
  Radio,
  Users,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Calendar,
  ArrowLeft,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface StreamAnalytics {
  totalStreams: number;
  totalViewers: number;
  totalWatchHours: number;
  averageViewers: number;
  peakViewers: number;
  totalReactions: number;
  totalMessages: number;
  avgWatchDuration: number;
  followerGrowth: number;
  engagementRate: number;
  streams: StreamSummary[];
}

interface StreamSummary {
  id: string;
  title: string;
  date: string;
  duration: number;
  peakViewers: number;
  avgViewers: number;
  totalReactions: number;
  totalMessages: number;
  thumbnail?: string;
}

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
] as const;

export default function LiveAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<StreamAnalytics | null>(null);
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/live/analytics?range=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  // Mock data for demo
  const mockAnalytics: StreamAnalytics = {
    totalStreams: 24,
    totalViewers: 15420,
    totalWatchHours: 4256,
    averageViewers: 642,
    peakViewers: 2847,
    totalReactions: 89430,
    totalMessages: 12847,
    avgWatchDuration: 2340,
    followerGrowth: 12.5,
    engagementRate: 8.7,
    streams: [
      {
        id: '1',
        title: 'Live Production Session - New Album Preview',
        date: '2024-01-15T20:00:00Z',
        duration: 7200,
        peakViewers: 2847,
        avgViewers: 1845,
        totalReactions: 24560,
        totalMessages: 3420,
      },
      {
        id: '2',
        title: 'Q&A with the Band',
        date: '2024-01-12T18:00:00Z',
        duration: 3600,
        peakViewers: 1256,
        avgViewers: 892,
        totalReactions: 15670,
        totalMessages: 2890,
      },
      {
        id: '3',
        title: 'Behind the Scenes - Studio Tour',
        date: '2024-01-08T21:00:00Z',
        duration: 5400,
        peakViewers: 987,
        avgViewers: 654,
        totalReactions: 12450,
        totalMessages: 1567,
      },
    ],
  };

  const displayAnalytics = analytics || mockAnalytics;

  const statCards = [
    {
      label: 'Total Streams',
      value: displayAnalytics.totalStreams,
      icon: Radio,
      color: 'from-red-500 to-orange-500',
      trend: 8,
    },
    {
      label: 'Total Viewers',
      value: formatNumber(displayAnalytics.totalViewers),
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      trend: 15,
    },
    {
      label: 'Watch Hours',
      value: formatNumber(displayAnalytics.totalWatchHours),
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      trend: 22,
    },
    {
      label: 'Peak Viewers',
      value: formatNumber(displayAnalytics.peakViewers),
      icon: TrendingUp,
      color: 'from-amber-500 to-yellow-500',
      trend: 5,
    },
    {
      label: 'Avg. Viewers',
      value: formatNumber(displayAnalytics.averageViewers),
      icon: Eye,
      color: 'from-orange-500 to-amber-500',
      trend: -3,
    },
    {
      label: 'Engagement Rate',
      value: `${displayAnalytics.engagementRate}%`,
      icon: Heart,
      color: 'from-orange-500 to-red-500',
      trend: 12,
    },
    {
      label: 'Total Reactions',
      value: formatNumber(displayAnalytics.totalReactions),
      icon: Heart,
      color: 'from-yellow-500 to-orange-500',
      trend: 18,
    },
    {
      label: 'Chat Messages',
      value: formatNumber(displayAnalytics.totalMessages),
      icon: MessageSquare,
      color: 'from-indigo-500 to-blue-500',
      trend: 25,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      {/* RR Logo */}
      <div className="flex justify-center pb-4">
        <Link href="/" className="transition-transform hover:scale-105">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            width={80}
            height={80}
            className="object-contain"
          />
        </Link>
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/live"
              className="rounded-xl bg-white/5 p-2 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5 text-white/70" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Stream Analytics</h1>
              <p className="text-white/50">Track your live streaming performance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
              >
                <Calendar className="h-4 w-4 text-white/70" />
                <span>{TIME_RANGES.find((r) => r.value === timeRange)?.label}</span>
                <ChevronDown className="h-4 w-4 text-white/50" />
              </button>

              {showTimeRangeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full z-10 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-xl"
                >
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setTimeRange(range.value);
                        setShowTimeRangeDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-colors ${
                        timeRange === range.value
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={loadAnalytics}
              disabled={isLoading}
              className="rounded-xl bg-white/5 p-2 text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export */}
            <button className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-white transition-colors hover:bg-cyan-600">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              {/* Background Gradient */}
              <div
                className={`absolute right-0 top-0 h-24 w-24 bg-gradient-to-br ${stat.color} -translate-y-1/2 translate-x-1/2 rounded-full opacity-10 blur-2xl`}
              />

              <div className="relative">
                <div
                  className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} mb-3 flex items-center justify-center`}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>

                <p className="mb-1 text-sm text-white/50">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>

                {stat.trend !== undefined && (
                  <div
                    className={`mt-2 flex items-center gap-1 text-sm ${
                      stat.trend >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stat.trend >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>{Math.abs(stat.trend)}%</span>
                    <span className="text-white/30">vs last period</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Viewers Over Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <LineChart className="h-5 w-5 text-cyan-400" />
                Viewers Over Time
              </h3>
            </div>

            {/* Placeholder Chart */}
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/20">
              <div className="text-center text-white/40">
                <BarChart3 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>Chart visualization</p>
                <p className="text-sm">Coming with real data integration</p>
              </div>
            </div>
          </motion.div>

          {/* Engagement Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Heart className="h-5 w-5 text-orange-400" />
                Engagement Distribution
              </h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: 'Reactions',
                  value: displayAnalytics.totalReactions,
                  color: 'bg-orange-500',
                },
                {
                  label: 'Chat Messages',
                  value: displayAnalytics.totalMessages,
                  color: 'bg-blue-500',
                },
                { label: 'Shares', value: 3240, color: 'bg-green-500' },
                { label: 'Follows', value: 892, color: 'bg-amber-500' },
              ].map((item) => {
                const maxValue = Math.max(
                  displayAnalytics.totalReactions,
                  displayAnalytics.totalMessages,
                  3240,
                  892
                );
                const percentage = (item.value / maxValue) * 100;

                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-white/70">{item.label}</span>
                      <span className="font-medium text-white">{formatNumber(item.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Recent Streams Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          <div className="border-b border-white/10 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Radio className="h-5 w-5 text-red-400" />
              Recent Streams
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Stream</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Peak</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Avg</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">
                    Reactions
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">
                    Messages
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayAnalytics.streams.map((stream) => (
                  <tr
                    key={stream.id}
                    className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate font-medium text-white">{stream.title}</p>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {new Date(stream.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-white/70">{formatDuration(stream.duration)}</td>
                    <td className="px-6 py-4 font-medium text-white">
                      {formatNumber(stream.peakViewers)}
                    </td>
                    <td className="px-6 py-4 text-white/70">{formatNumber(stream.avgViewers)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-orange-400">
                        <Heart className="h-4 w-4" />
                        <span>{formatNumber(stream.totalReactions)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-blue-400">
                        <MessageSquare className="h-4 w-4" />
                        <span>{formatNumber(stream.totalMessages)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
