'use client';

import { motion } from 'motion/react';
import {
  Video,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  ArrowLeft,
  Download,
  RefreshCw,
  ChevronDown,
  MonitorPlay,
  FileText,
  Mic,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface MeetingAnalytics {
  totalMeetings: number;
  totalParticipants: number;
  totalMinutes: number;
  averageParticipants: number;
  averageDuration: number;
  screenShareMinutes: number;
  filesShared: number;
  recordingsCount: number;
  participationRate: number;
  meetings: MeetingSummary[];
}

interface MeetingSummary {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: number;
  hadScreenShare: boolean;
  hadRecording: boolean;
  filesShared: number;
}

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
] as const;

export default function MeetAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<MeetingAnalytics | null>(null);
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/meet/analytics?range=${timeRange}`);
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

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
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
  const mockAnalytics: MeetingAnalytics = {
    totalMeetings: 156,
    totalParticipants: 892,
    totalMinutes: 24560,
    averageParticipants: 5.7,
    averageDuration: 157,
    screenShareMinutes: 8420,
    filesShared: 324,
    recordingsCount: 48,
    participationRate: 94.2,
    meetings: [
      {
        id: '1',
        title: 'Weekly Team Sync',
        date: '2024-01-15T10:00:00Z',
        duration: 45,
        participants: 8,
        hadScreenShare: true,
        hadRecording: true,
        filesShared: 3,
      },
      {
        id: '2',
        title: 'Album Review Session',
        date: '2024-01-14T14:00:00Z',
        duration: 90,
        participants: 12,
        hadScreenShare: true,
        hadRecording: true,
        filesShared: 7,
      },
      {
        id: '3',
        title: 'Client Presentation',
        date: '2024-01-12T16:00:00Z',
        duration: 60,
        participants: 6,
        hadScreenShare: true,
        hadRecording: false,
        filesShared: 2,
      },
      {
        id: '4',
        title: 'Production Planning',
        date: '2024-01-10T11:00:00Z',
        duration: 120,
        participants: 4,
        hadScreenShare: false,
        hadRecording: true,
        filesShared: 5,
      },
    ],
  };

  const displayAnalytics = analytics || mockAnalytics;

  const statCards = [
    {
      label: 'Total Meetings',
      value: displayAnalytics.totalMeetings,
      icon: Video,
      color: 'from-purple-500 to-violet-500',
      trend: 12,
    },
    {
      label: 'Total Participants',
      value: formatNumber(displayAnalytics.totalParticipants),
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      trend: 18,
    },
    {
      label: 'Meeting Minutes',
      value: formatNumber(displayAnalytics.totalMinutes),
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      trend: 8,
    },
    {
      label: 'Avg. Participants',
      value: displayAnalytics.averageParticipants.toFixed(1),
      icon: Users,
      color: 'from-orange-500 to-amber-500',
      trend: 5,
    },
    {
      label: 'Avg. Duration',
      value: formatDuration(displayAnalytics.averageDuration),
      icon: Clock,
      color: 'from-pink-500 to-rose-500',
      trend: -3,
    },
    {
      label: 'Screen Share Time',
      value: formatDuration(displayAnalytics.screenShareMinutes),
      icon: MonitorPlay,
      color: 'from-indigo-500 to-blue-500',
      trend: 22,
    },
    {
      label: 'Files Shared',
      value: displayAnalytics.filesShared,
      icon: FileText,
      color: 'from-teal-500 to-cyan-500',
      trend: 15,
    },
    {
      label: 'Recordings',
      value: displayAnalytics.recordingsCount,
      icon: Mic,
      color: 'from-red-500 to-pink-500',
      trend: 28,
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
              href="/meet"
              className="rounded-xl bg-white/5 p-2 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5 text-white/70" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Meeting Analytics</h1>
              <p className="text-white/50">Track your video conferencing activity</p>
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
                          ? 'bg-purple-500/20 text-purple-400'
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
            <button className="flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600">
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
          {/* Meeting Frequency Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <LineChart className="h-5 w-5 text-purple-400" />
                Meeting Frequency
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

          {/* Participation Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Users className="h-5 w-5 text-blue-400" />
                Participation Overview
              </h3>
            </div>

            <div className="space-y-6">
              {/* Participation Rate */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-white/70">Attendance Rate</span>
                  <span className="font-semibold text-white">
                    {displayAnalytics.participationRate}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayAnalytics.participationRate}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  />
                </div>
              </div>

              {/* Meeting Features Usage */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <MonitorPlay className="mx-auto mb-2 h-6 w-6 text-indigo-400" />
                  <p className="text-xl font-bold text-white">78%</p>
                  <p className="text-xs text-white/50">Screen Share</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <Mic className="mx-auto mb-2 h-6 w-6 text-red-400" />
                  <p className="text-xl font-bold text-white">31%</p>
                  <p className="text-xs text-white/50">Recorded</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <FileText className="mx-auto mb-2 h-6 w-6 text-teal-400" />
                  <p className="text-xl font-bold text-white">45%</p>
                  <p className="text-xs text-white/50">Files Shared</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Meetings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          <div className="border-b border-white/10 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Video className="h-5 w-5 text-purple-400" />
              Recent Meetings
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Meeting</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">
                    Features
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Files</th>
                </tr>
              </thead>
              <tbody>
                {displayAnalytics.meetings.map((meeting) => (
                  <tr
                    key={meeting.id}
                    className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate font-medium text-white">{meeting.title}</p>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {new Date(meeting.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-white/70">{formatDuration(meeting.duration)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-blue-400">
                        <Users className="h-4 w-4" />
                        <span>{meeting.participants}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {meeting.hadScreenShare && (
                          <div className="rounded-lg bg-indigo-500/20 p-1.5" title="Screen shared">
                            <MonitorPlay className="h-3.5 w-3.5 text-indigo-400" />
                          </div>
                        )}
                        {meeting.hadRecording && (
                          <div className="rounded-lg bg-red-500/20 p-1.5" title="Recorded">
                            <Mic className="h-3.5 w-3.5 text-red-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-teal-400">
                        <FileText className="h-4 w-4" />
                        <span>{meeting.filesShared}</span>
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
