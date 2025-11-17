'use client';

import { 
  Music, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  FileText,
  Mic,
  Award,
  MessageSquare,
  Play,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Activity,
  Folder,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { RealtimeLobbyPanel } from '../../../components/ably/realtime-lobby-panel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Premium metric cards data
const metrics = [
  { 
    label: 'Total Revenue', 
    value: '$24,827', 
    change: 12.5, 
    period: 'vs last month',
    icon: DollarSign,
    color: 'brand-primary' 
  },
  { 
    label: 'Active Projects', 
    value: '12', 
    change: 2, 
    period: 'this week',
    icon: Folder,
    color: 'blue' 
  },
  { 
    label: 'Total Plays', 
    value: '1.2M', 
    change: 8.3, 
    period: 'vs last month',
    icon: Play,
    color: 'green' 
  },
  { 
    label: 'Collaborators', 
    value: '24', 
    change: 3, 
    period: 'new this month',
    icon: Users,
    color: 'purple' 
  }
];

// Chart data
const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Revenue',
    data: [12500, 15800, 14200, 18900, 22100, 24827],
    borderColor: 'hsl(38 45% 60%)',
    backgroundColor: 'hsl(38 45% 60% / 0.1)',
    fill: true,
    tension: 0.4
  }]
};

const playsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Plays',
    data: [145000, 162000, 158000, 189000, 195000, 178000, 182000],
    backgroundColor: 'hsl(38 45% 60% / 0.8)',
  }]
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'hsl(0 0% 11%)',
      borderColor: 'hsl(0 0% 35%)',
      borderWidth: 1,
      titleFont: {
        size: 12
      },
      bodyFont: {
        size: 14,
        weight: 'bold' as const
      },
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: 'hsl(0 0% 75%)'
      }
    },
    y: {
      grid: {
        color: 'hsl(0 0% 18%)'
      },
      ticks: {
        color: 'hsl(0 0% 75%)'
      }
    }
  }
};

// Recent activity
const recentActivity = [
  { 
    type: 'revenue', 
    title: 'Spotify Royalties', 
    description: 'Q3 2024 payment received', 
    amount: '+$2,847.32',
    time: '2 hours ago', 
    icon: DollarSign 
  },
  { 
    type: 'project', 
    title: 'Summer EP', 
    description: 'New mix uploaded by Sarah Chen', 
    time: '5 hours ago', 
    icon: Music 
  },
  { 
    type: 'collab', 
    title: 'Marcus Thompson', 
    description: 'Joined "Midnight Sessions"', 
    time: '1 day ago', 
    icon: Users 
  },
  { 
    type: 'show', 
    title: 'Blue Note Jazz Club', 
    description: 'Tickets now on sale', 
    time: '2 days ago', 
    icon: Mic 
  }
];

// Top projects
const topProjects = [
  { name: 'Summer EP', songs: 6, plays: 458000, revenue: '$8,234', trend: 12.5 },
  { name: 'Midnight Sessions', songs: 12, plays: 892000, revenue: '$14,827', trend: -3.2 },
  { name: 'Acoustic Collection', songs: 8, plays: 267000, revenue: '$4,921', trend: 8.7 }
];

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display mb-2">{greeting}</h1>
        <p className="text-muted-foreground">
          Here's your music business at a glance
        </p>
      </div>

      {/* Realtime Lobby Monitor */}
      <div className="mb-8">
        <RealtimeLobbyPanel />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="rnrb-metric-card">
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  bg-${metric.color}-500/10
                `}>
                  <metric.icon className={`w-6 h-6 text-${metric.color}-500`} />
                </div>
                <button className="p-1 hover:bg-surface-muted rounded">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              
              <div className="rnrb-metric-value">{metric.value}</div>
              <div className="rnrb-metric-label">{metric.label}</div>
              
              <div className={`
                rnrb-metric-change 
                ${metric.change > 0 ? 'positive' : 'negative'}
              `}>
                {metric.change > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(metric.change)}%</span>
                <span className="text-muted-foreground">{metric.period}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rnrb-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Revenue Overview</h2>
                <p className="text-sm text-muted-foreground">Last 6 months</p>
              </div>
              <select className="rnrb-select text-sm">
                <option>All Sources</option>
                <option>Streaming</option>
                <option>Downloads</option>
                <option>Live Shows</option>
              </select>
            </div>
            <div className="h-64">
              <Line data={revenueData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Weekly Plays Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rnrb-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Weekly Plays</h2>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">+8.3%</span>
              </div>
            </div>
            <div className="h-48">
              <Bar data={playsData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Top Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rnrb-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Top Projects</h2>
              <Link 
                href="/projects" 
                className="text-sm text-brand-primary hover:text-brand-primary/80 transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {topProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 flex items-center justify-center">
                      <Music className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.songs} songs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{project.revenue}</p>
                    <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                      {project.trend > 0 ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-500" />
                      )}
                      <span className={project.trend > 0 ? 'text-green-500' : 'text-red-500'}>
                        {Math.abs(project.trend)}%
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rnrb-card p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/projects/new" 
                className="rnrb-button-primary w-full justify-center py-3 rounded-lg"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                New Project
              </Link>
              <Link 
                href="/songs/upload" 
                className="rnrb-button-secondary w-full justify-center py-3 rounded-lg"
              >
                <Music className="w-5 h-5 mr-2" />
                Upload Song
              </Link>
              <Link 
                href="/shows/schedule" 
                className="rnrb-button-secondary w-full justify-center py-3 rounded-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Show
              </Link>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rnrb-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <Link 
                href="/activity" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${activity.type === 'revenue' ? 'bg-green-500/10' : 'bg-surface-muted'}
                  `}>
                    <activity.icon className={`
                      w-4 h-4 
                      ${activity.type === 'revenue' ? 'text-green-500' : 'text-muted-foreground'}
                    `} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    {activity.amount && (
                      <p className="text-sm font-semibold text-green-500 mt-1">{activity.amount}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pro Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-xl rnrb-gold-gradient p-6 text-white"
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10">
              <Award className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-sm text-white/80 mb-4">
                Unlock advanced analytics, unlimited projects, and priority support.
              </p>
              <Link 
                href="/pricing" 
                className="inline-flex items-center text-sm font-medium hover:underline"
              >
                Learn more
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}