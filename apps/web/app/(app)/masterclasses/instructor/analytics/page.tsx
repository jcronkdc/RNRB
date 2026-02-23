'use client';

import { motion } from 'motion/react';
import {
  DollarSign,
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Star,
  Clock,
  Eye,
  ChevronDown,
  Download,
  Filter,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalStudents: number;
    totalCourses: number;
    averageRating: number;
    completionRate: number;
    revenueChange: number;
    studentsChange: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    enrollments: number;
  }>;
  topCourses: Array<{
    id: string;
    title: string;
    students: number;
    revenue: number;
    rating: number;
    completionRate: number;
  }>;
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    courseName: string;
    amount: number;
    enrolledAt: string;
  }>;
  studentActivity: Array<{
    date: string;
    views: number;
    enrollments: number;
  }>;
}

const TIMEFRAMES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
}: {
  title: string;
  value: number;
  change?: number;
  icon: typeof DollarSign;
  format?: 'number' | 'currency' | 'percent' | 'rating';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'rating':
        return val.toFixed(1);
      default:
        return val.toLocaleString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-(--border) bg-(--panel) p-6"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-(--accent)/10 p-3">
          <Icon className="h-6 w-6 text-(--accent)" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm ${
              change >= 0 ? 'bg-(--sage)/10 text-(--sage)' : 'bg-(--error)/10 text-(--error)'
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mb-1 text-3xl font-bold text-(--text)">{formatValue(value)}</div>
      <div className="text-sm text-(--muted)">{title}</div>
    </motion.div>
  );
}

function RevenueChart({
  data,
}: {
  data: Array<{ month: string; revenue: number; enrollments: number }>;
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="rounded-xl border border-(--border) bg-(--panel) p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-(--text)">Revenue Over Time</h3>
        <button className="flex items-center gap-2 rounded-lg bg-(--bg) px-3 py-1 text-sm text-(--muted)">
          <Calendar className="h-4 w-4" />
          Monthly
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="flex h-48 items-end gap-4">
        {data.map((item, index) => (
          <div key={item.month} className="flex flex-1 flex-col items-center">
            <div
              className="w-full rounded-t-lg bg-linear-to-t from-(--accent)/50 to-(--accent) transition-all hover:from-(--accent)/70 hover:to-(--accent-hover)"
              style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: 4 }}
            />
            <div className="mt-2 text-xs text-(--muted)">{item.month}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-(--accent)" />
          <span className="text-sm text-(--muted)">Revenue</span>
        </div>
      </div>
    </div>
  );
}

function TopCoursesTable({ courses }: { courses: AnalyticsData['topCourses'] }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--panel) p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-(--text)">Top Performing Courses</h3>
        <Link href="/masterclasses/instructor" className="text-sm text-(--accent) hover:underline">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-(--muted)">
              <th className="pb-4">Course</th>
              <th className="pb-4 text-right">Students</th>
              <th className="pb-4 text-right">Revenue</th>
              <th className="pb-4 text-right">Rating</th>
              <th className="pb-4 text-right">Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {courses.map((course) => (
              <tr key={course.id} className="group">
                <td className="py-4">
                  <Link
                    href={`/masterclasses/${course.id}`}
                    className="font-medium text-(--text) group-hover:text-(--accent)"
                  >
                    {course.title}
                  </Link>
                </td>
                <td className="py-4 text-right text-(--text)">{course.students}</td>
                <td className="py-4 text-right text-(--sage)">${course.revenue.toFixed(2)}</td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="h-4 w-4 fill-(--gold) text-(--gold)" />
                    <span className="text-(--text)">{course.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <span
                    className={`${
                      course.completionRate >= 70
                        ? 'text-(--sage)'
                        : course.completionRate >= 40
                          ? 'text-(--warning)'
                          : 'text-(--error)'
                    }`}
                  >
                    {course.completionRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentEnrollments({ enrollments }: { enrollments: AnalyticsData['recentEnrollments'] }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-xl border border-(--border) bg-(--panel) p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-white">Recent Enrollments</h3>
        <span className="text-sm text-(--muted)">Last 7 days</span>
      </div>

      <div className="space-y-4">
        {enrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="flex items-center justify-between rounded-lg bg-(--bg) p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-(--accent) to-(--gold)">
                <span className="font-medium text-(--text)">
                  {enrollment.studentName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-white">{enrollment.studentName}</div>
                <div className="text-sm text-(--muted)">{enrollment.courseName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-green-400">
                {enrollment.amount > 0 ? `+$${enrollment.amount.toFixed(2)}` : 'Free'}
              </div>
              <div className="text-xs text-(--muted)">{formatDate(enrollment.enrolledAt)}</div>
            </div>
          </div>
        ))}

        {enrollments.length === 0 && (
          <div className="py-8 text-center text-(--muted)">No recent enrollments</div>
        )}
      </div>
    </div>
  );
}

export default function InstructorAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`/api/instructors/analytics?timeframe=${timeframe}`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [timeframe]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg)">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-(--accent) border-t-transparent" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg)">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-(--muted)" />
          <h2 className="mb-2 text-xl font-bold text-white">No analytics available</h2>
          <p className="text-(--muted)">Start creating courses to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Image src="/logo-dark.png" alt="Logo" width={48} height={48} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Instructor Analytics</h1>
              <p className="text-(--muted)">Track your course performance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="rounded-lg border border-(--border) bg-(--panel) px-4 py-2 text-white"
            >
              {TIMEFRAMES.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
            <button className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--panel) px-4 py-2 text-white hover:bg-(--border)">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Revenue"
            value={analytics.overview.totalRevenue}
            change={analytics.overview.revenueChange}
            icon={DollarSign}
            format="currency"
          />
          <StatCard
            title="Total Students"
            value={analytics.overview.totalStudents}
            change={analytics.overview.studentsChange}
            icon={Users}
          />
          <StatCard
            title="Active Courses"
            value={analytics.overview.totalCourses}
            icon={BookOpen}
          />
          <StatCard
            title="Avg. Rating"
            value={analytics.overview.averageRating}
            icon={Star}
            format="rating"
          />
          <StatCard
            title="Completion Rate"
            value={analytics.overview.completionRate}
            icon={TrendingUp}
            format="percent"
          />
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={analytics.revenueByMonth} />
          </div>
          <RecentEnrollments enrollments={analytics.recentEnrollments} />
        </div>

        {/* Top Courses */}
        <TopCoursesTable courses={analytics.topCourses} />

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/masterclasses/instructor" className="text-(--accent) hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
