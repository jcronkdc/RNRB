'use client';

/**
 * R&R Labs Research Dashboard
 *
 * Shows the current state of research:
 * - Model training progress
 * - Data collection stats
 * - Volunteer contributions
 * - Research milestones
 */

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  Database,
  Cpu,
  BarChart3,
  Users,
  FileAudio,
  Music,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  ArrowLeft,
  Activity,
  Zap,
  Globe,
  Shield,
  CircuitBoard,
  Layers,
  RefreshCcw,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';

// Default research stats (will be updated from API)
const DEFAULT_STATS = {
  volunteers: {
    total: 0,
    pending: 0,
    active: 0,
    contributing: 0,
    betaTesters: 0,
  },
  contributions: {
    totalAudioFiles: 0,
    totalMidiFiles: 0,
    totalAudioHours: 0,
    pendingReview: 0,
    approved: 0,
  },
  feedback: {
    total: 0,
    generatedAudio: 0,
    ui: 0,
    featureRequests: 0,
    bugs: 0,
    averageRating: 0,
  },
  phases: {
    current: 1,
    dataCollection: 15,
    modelArchitecture: 0,
    training: 0,
    betaRelease: 0,
  },
  milestones: {
    volunteersTarget: 100,
    audioHoursTarget: 1000,
    midiFilesTarget: 500,
    feedbackTarget: 200,
  },
};

// Research milestones
const MILESTONES = [
  {
    id: 1,
    title: 'R&R Labs Launch',
    description: 'Launched volunteer program and research initiative',
    date: 'Nov 2024',
    status: 'complete',
    icon: FlaskConical,
  },
  {
    id: 2,
    title: 'First 100 Volunteers',
    description: 'Reached our first volunteer recruitment milestone',
    date: 'Target: Jan 2025',
    status: 'in_progress',
    icon: Users,
  },
  {
    id: 3,
    title: '1,000 Hours of Audio',
    description: 'Collected enough training data to begin model experiments',
    date: 'Target: Mar 2025',
    status: 'upcoming',
    icon: FileAudio,
  },
  {
    id: 4,
    title: 'First Model Training',
    description: 'Initial training run on volunteer-contributed data',
    date: 'Target: Q2 2025',
    status: 'upcoming',
    icon: Cpu,
  },
  {
    id: 5,
    title: 'Alpha Testing',
    description: 'First volunteers test AI-generated stems',
    date: 'Target: Q3 2025',
    status: 'upcoming',
    icon: Zap,
  },
  {
    id: 6,
    title: 'Beta Release',
    description: 'Public beta of AI Music Together',
    date: 'Target: Q4 2025',
    status: 'upcoming',
    icon: Globe,
  },
];

// Model architecture details
const MODEL_ARCHITECTURE = {
  name: 'R&R Stem Transformer',
  version: '0.1.0-research',
  parameters: 'TBD',
  features: [
    'Multi-stem generation',
    'Prompt conditioning',
    'Style transfer',
    'Real-time collaboration hooks',
    'Copyright tracking integration',
  ],
};

export default function ResearchDashboardPage() {
  const { user, loading } = useRequireAuth();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real stats from the stats API
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/labs/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Activity className="mx-auto mb-4 h-12 w-12 animate-pulse text-purple-400" />
          <p className="text-gray-400">Loading research dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="group mb-6 inline-block">
            <Image
              src="/logo-light.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={57}
              priority
              className="transition-transform group-hover:scale-105"
              style={{ filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.3))' }}
            />
          </Link>

          <div className="mb-4 flex items-center justify-center gap-2">
            <Link
              href="/labs"
              className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Labs
            </Link>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-blue-400">RESEARCH DASHBOARD</span>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Research Progress</h1>
          <p className="mx-auto max-w-2xl text-gray-400">
            Track our journey building the first truly collaborative AI music model. Full
            transparency into our data collection, training progress, and milestones.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              label: 'Volunteers',
              value: stats.volunteers.total,
              icon: Users,
              color: 'purple',
              suffix: '',
            },
            {
              label: 'Audio Collected',
              value: stats.contributions.totalAudioHours,
              icon: FileAudio,
              color: 'orange',
              suffix: ' hrs',
            },
            {
              label: 'MIDI Files',
              value: stats.contributions.totalMidiFiles,
              icon: Music,
              color: 'green',
              suffix: '',
            },
            {
              label: 'Feedback Items',
              value: stats.feedback.total,
              icon: CheckCircle,
              color: 'blue',
              suffix: '',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.05 }}
            >
              <Card
                className={`rounded-xl border border-${stat.color}-500/30 bg-${stat.color}-500/10 p-4`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                  <span className="text-xs text-gray-500">LIVE</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {stat.value.toLocaleString()}
                  <span className="text-lg text-gray-400">{stat.suffix}</span>
                </p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Milestones Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <Target className="h-5 w-5 text-purple-400" />
                  Research Milestones
                </h2>
                <Button
                  onClick={fetchStats}
                  disabled={isRefreshing}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                >
                  <RefreshCcw className={`mr-1.5 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-white/10" />

                <div className="space-y-6">
                  {MILESTONES.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="relative flex gap-4 pl-12"
                    >
                      {/* Icon */}
                      <div
                        className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full ${
                          milestone.status === 'complete'
                            ? 'bg-green-500'
                            : milestone.status === 'in_progress'
                              ? 'bg-purple-500 ring-4 ring-purple-500/30'
                              : 'bg-gray-700'
                        }`}
                      >
                        <milestone.icon className="h-5 w-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-medium text-white">{milestone.title}</h3>
                          {milestone.status === 'complete' && (
                            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-400">
                              COMPLETE
                            </span>
                          )}
                          {milestone.status === 'in_progress' && (
                            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-400">
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <p className="mb-1 text-sm text-gray-400">{milestone.description}</p>
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {milestone.date}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Model Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Model Architecture */}
            <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                <CircuitBoard className="h-5 w-5 text-blue-400" />
                Model Architecture
              </h2>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="font-mono text-white">{MODEL_ARCHITECTURE.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Version</span>
                  <span className="font-mono text-orange-400">{MODEL_ARCHITECTURE.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Parameters</span>
                  <span className="font-mono text-gray-400">{MODEL_ARCHITECTURE.parameters}</span>
                </div>
              </div>

              <h3 className="mb-2 text-sm font-medium text-gray-400">Planned Features</h3>
              <ul className="space-y-2">
                {MODEL_ARCHITECTURE.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Layers className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Training Progress */}
            <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                <Cpu className="h-5 w-5 text-green-400" />
                Training Status
              </h2>

              <div className="mb-4 rounded-xl bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-300">
                  <strong>Phase 1: Data Collection</strong>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  We're currently gathering training data from volunteers. Model training will begin
                  once we reach our data targets.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-400">Data Collection</span>
                    <span className="text-white">{stats.phases.dataCollection}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                      style={{ width: `${stats.phases.dataCollection}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-400">Model Training</span>
                    <span className="text-white">{stats.phases.training}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                      style={{ width: `${stats.phases.training}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-400">Overall Progress</span>
                    <span className="text-white">
                      {Math.round(
                        (stats.phases.dataCollection +
                          stats.phases.modelArchitecture +
                          stats.phases.training +
                          stats.phases.betaRelease) /
                          4
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                      style={{
                        width: `${Math.round((stats.phases.dataCollection + stats.phases.modelArchitecture + stats.phases.training + stats.phases.betaRelease) / 4)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* CTA */}
            <Card className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6">
              <h3 className="mb-2 font-bold text-white">Help Us Reach Our Goals</h3>
              <p className="mb-4 text-sm text-gray-400">
                Your contributions directly impact our research progress.
              </p>
              <Link href="/labs/volunteer">
                <Button className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-orange-500 py-3 font-semibold text-white hover:from-purple-600 hover:to-orange-600">
                  <Users className="mr-2 h-4 w-4" />
                  Become a Volunteer
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>

        {/* Data Transparency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/20">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  Our Commitment to Transparency
                </h3>
                <p className="mb-4 text-gray-400">
                  Unlike other AI music companies, we're open about exactly what data we collect,
                  how we use it, and what our model can and can't do. Volunteers can see precisely
                  how their contributions are used in training.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    No hidden training data
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Volunteer opt-out anytime
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Clear contribution licensing
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Public research updates
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
