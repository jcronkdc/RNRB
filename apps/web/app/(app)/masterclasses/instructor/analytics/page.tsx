'use client';

import { motion } from 'framer-motion';
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
      className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="bg-[var(--accent)]/10 rounded-xl p-3">
          <Icon className="h-6 w-6 text-[var(--accent)]" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm ${
              change >= 0
                ? 'bg-[var(--sage)]/10 text-[var(--sage)]'
                : 'bg-[var(--error)]/10 text-[var(--error)]'
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
      <div className="mb-1 text-3xl font-bold text-[var(--text)]">{formatValue(value)}</div>
      <div className="text-sm text-[var(--muted)]">{title}</div>
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-[var(--text)]">Revenue Over Time</h3>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--bg)] px-3 py-1 text-sm text-[var(--muted)]">
          <Calendar className="h-4 w-4" />
          Monthly
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="flex h-48 items-end gap-4">
        {data.map((item, index) => (
          <div key={item.month} className="flex flex-1 flex-col items-center">
            <div
              className="from-[var(--accent)]/50 hover:from-[var(--accent)]/70 w-full rounded-t-lg bg-gradient-to-t to-[var(--accent)] transition-all hover:to-[var(--accent-hover)]"
              style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: 4 }}
            />
            <div className="mt-2 text-xs text-[var(--muted)]">{item.month}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
          <span className="text-sm text-[var(--muted)]">Revenue</span>
        </div>
      </div>
    </div>
  );
}

function TopCoursesTable({ courses }: { courses: AnalyticsData['topCourses'] }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-[var(--text)]">Top Performing Courses</h3>
        <Link
          href="/masterclasses/instructor"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-[var(--muted)]">
              <th className="pb-4">Course</th>
              <th className="pb-4 text-right">Students</th>
              <th className="pb-4 text-right">Revenue</th>
              <th className="pb-4 text-right">Rating</th>
              <th className="pb-4 text-right">Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {courses.map((course) => (
              <tr key={course.id} className="group">
                <td className="py-4">
                  <Link
                    href={`/masterclasses/${course.id}`}
                    className="font-medium text-[var(--text)] group-hover:text-[var(--accent)]"
                  >
                    {course.title}
                  </Link>
                </td>
                <td className="py-4 text-right text-[var(--text)]">{course.students}</td>
                <td className="py-4 text-right text-[var(--sage)]">${course.revenue.toFixed(2)}</td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                    <span className="text-[var(--text)]">{course.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <span
                    className={`${
                      course.completionRate >= 70
                        ? 'text-[var(--sage)]'
                        : course.completionRate >= 40
                          ? 'text-[var(--warning)]'
                          : 'text-[var(--error)]'
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-white">Recent Enrollments</h3>
        <span className="text-sm text-[var(--muted)]">Last 7 days</span>
      </div>

      <div className="space-y-4">
        {enrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="flex items-center justify-between rounded-lg bg-[var(--bg)] p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--gold)]">
                <span className="font-medium text-[var(--text)]">
                  {enrollment.studentName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-white">{enrollment.studentName}</div>
                <div className="text-sm text-[var(--muted)]">{enrollment.courseName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-green-400">
                {enrollment.amount > 0 ? `+$${enrollment.amount.toFixed(2)}` : 'Free'}
              </div>
              <div className="text-xs text-[var(--muted)]">{formatDate(enrollment.enrolledAt)}</div>
            </div>
          </div>
        ))}

        {enrollments.length === 0 && (
          <div className="py-8 text-center text-[var(--muted)]">No recent enrollments</div>
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

    // For demo, use mock data if API doesn't return
    const mockData: AnalyticsData = {
      overview: {
        totalRevenue: 12450.0,
        totalStudents: 347,
        totalCourses: 5,
        averageRating: 4.8,
        completionRate: 68.5,
        revenueChange: 23.5,
        studentsChange: 15.2,
      },
      revenueByMonth: [
        { month: 'Jul', revenue: 1200, enrollments: 28 },
        { month: 'Aug', revenue: 1850, enrollments: 42 },
        { month: 'Sep', revenue: 2100, enrollments: 51 },
        { month: 'Oct', revenue: 1750, enrollments: 38 },
        { month: 'Nov', revenue: 2400, enrollments: 56 },
        { month: 'Dec', revenue: 3150, enrollments: 72 },
      ],
      topCourses: [
        {
          id: '1',
          title: 'Complete Guitar Mastery',
          students: 156,
          revenue: 4680,
          rating: 4.9,
          completionRate: 72,
        },
        {
          id: '2',
          title: 'Music Theory Fundamentals',
          students: 98,
          revenue: 2940,
          rating: 4.7,
          completionRate: 65,
        },
        {
          id: '3',
          title: 'Pro Mixing Techniques',
          students: 45,
          revenue: 2250,
          rating: 4.8,
          completionRate: 58,
        },
        {
          id: '4',
          title: 'Songwriting Workshop',
          students: 32,
          revenue: 1600,
          rating: 4.6,
          completionRate: 81,
        },
        {
          id: '5',
          title: 'Voice Training Basics',
          students: 16,
          revenue: 480,
          rating: 4.5,
          completionRate: 44,
        },
      ],
      recentEnrollments: [
        {
          id: '1',
          studentName: 'Alex Johnson',
          courseName: 'Complete Guitar Mastery',
          amount: 49.0,
          enrolledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          studentName: 'Sarah Williams',
          courseName: 'Music Theory Fundamentals',
          amount: 39.0,
          enrolledAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          studentName: 'Mike Chen',
          courseName: 'Pro Mixing Techniques',
          amount: 59.0,
          enrolledAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          studentName: 'Emma Davis',
          courseName: 'Complete Guitar Mastery',
          amount: 49.0,
          enrolledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          studentName: 'James Brown',
          courseName: 'Songwriting Workshop',
          amount: 0,
          enrolledAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        },
      ],
      studentActivity: [],
    };

    fetchAnalytics();

    // Set mock data for demo
    setTimeout(() => {
      if (!analytics) {
        setAnalytics(mockData);
      }
      setIsLoading(false);
    }, 1000);
  }, [timeframe]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-[var(--muted)]" />
          <h2 className="mb-2 text-xl font-bold text-white">No analytics available</h2>
          <p className="text-[var(--muted)]">Start creating courses to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Image src="/logo-dark.png" alt="Logo" width={48} height={48} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Instructor Analytics</h1>
              <p className="text-[var(--muted)]">Track your course performance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-white"
            >
              {TIMEFRAMES.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
            <button className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-white hover:bg-[var(--border)]">
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
          <Link href="/masterclasses/instructor" className="text-[var(--accent)] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
