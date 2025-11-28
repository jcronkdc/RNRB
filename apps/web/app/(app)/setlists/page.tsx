'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateWithDay } from '@/lib/format-date';
import {
  ListMusic,
  Plus,
  Play,
  Edit,
  Trash2,
  Download,
  Share2,
  Calendar,
  Clock,
  Lock,
  Sparkles,
  Zap,
  Music2,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  Shuffle,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useSetlistAccess } from '@/hooks/use-subscription';
import { UpgradeModal, useUpgradeModal } from '@/components/upgrade-modal';

interface Setlist {
  id: string;
  name: string;
  showName?: string;
  showDate?: Date;
  venue?: string;
  songCount: number;
  totalDuration: number;
  energyLevel: 'high' | 'mixed' | 'mellow';
  createdAt: Date;
}

export default function SetlistsPage() {
  const { user, loading } = useRequireAuth();
  const { isOpen, showUpgradeModal, hideUpgradeModal, modalProps } = useUpgradeModal();
  const { hasAccess, isLoading: isLoadingSubscription } = useSetlistAccess();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [isLoadingSetlists, setIsLoadingSetlists] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // Fetch user's setlists if they have access
    if (hasAccess) {
      // TODO: Fetch actual setlists from API
      setSetlists([]);
    }
    setIsLoadingSetlists(false);
  }, [user, hasAccess]);

  // Mock data for preview
  const mockSetlists: Setlist[] = [
    {
      id: '1',
      name: 'Summer Festival 2024',
      showName: 'Sunset Main Stage',
      showDate: new Date('2024-07-15'),
      venue: 'Central Park, NYC',
      songCount: 16,
      totalDuration: 4800,
      energyLevel: 'high',
      createdAt: new Date('2024-06-01'),
    },
    {
      id: '2',
      name: 'Club Tour Setlist',
      showName: 'Intimate Evening',
      showDate: new Date('2024-06-20'),
      venue: 'The Underground, LA',
      songCount: 12,
      totalDuration: 3200,
      energyLevel: 'mixed',
      createdAt: new Date('2024-05-15'),
    },
    {
      id: '3',
      name: 'Acoustic Evening',
      showName: 'Unplugged Sessions',
      showDate: new Date('2024-08-01'),
      venue: 'Coffee House, Portland',
      songCount: 8,
      totalDuration: 2400,
      energyLevel: 'mellow',
      createdAt: new Date('2024-07-01'),
    },
  ];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) return `${hours}h ${remainingMinutes}m`;
    return `${minutes}m`;
  };

  const getEnergyColor = (level: Setlist['energyLevel']) => {
    switch (level) {
      case 'high':
        return 'from-red-500 to-orange-500';
      case 'mixed':
        return 'from-purple-500 to-pink-500';
      case 'mellow':
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getEnergyIcon = (level: Setlist['energyLevel']) => {
    switch (level) {
      case 'high':
        return Zap;
      case 'mixed':
        return Activity;
      case 'mellow':
        return Music2;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Animated background elements */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <motion.div
            className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-red-500/5 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Header */}
        <div className="relative mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-4 shadow-lg shadow-orange-500/20">
                <ListMusic className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-5xl font-black text-transparent">
                  Smart Setlists
                </h1>
                <p className="mt-2 text-lg text-gray-400">
                  AI-powered setlist generation • Performance mode • Real-time sync
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-2 backdrop-blur-sm"
              >
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-300">
                  <span className="font-bold text-white">{mockSetlists.length}</span> Setlists
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-2 backdrop-blur-sm"
              >
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">
                  <span className="font-bold text-white">
                    {mockSetlists.reduce((sum, s) => sum + s.songCount, 0)}
                  </span>{' '}
                  Songs
                </span>
              </motion.div>
            </div>

            {hasAccess ? (
              <Link href="/setlists/new">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-2xl hover:shadow-orange-500/40"
                >
                  <div className="group-hover:animate-shimmer absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>Generate Setlist</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                </motion.button>
              </Link>
            ) : (
              <motion.button
                onClick={() =>
                  showUpgradeModal({
                    feature: 'setlistManagement',
                    requiredTier: 'creator',
                  })
                }
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden rounded-xl border-2 border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-6 py-3 font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/40"
              >
                <div className="relative flex items-center gap-2">
                  <Lock className="h-5 w-5 text-orange-500" />
                  <span>Unlock Smart Setlists</span>
                  <ChevronRight className="h-5 w-5 text-orange-500 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.button>
            )}
          </div>
        </div>

        {/* Feature Benefits Banner */}
        {!hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-orange-500/10 p-8 backdrop-blur-sm"
          >
            {/* Animated glow effect */}
            <div className="absolute inset-0 -z-10 opacity-50">
              <motion.div
                className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-orange-500/20 to-transparent"
                animate={{
                  x: ['-100%', '300%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            <div className="mb-6 flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-4 shadow-lg"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h2 className="mb-2 text-3xl font-black text-white">
                  Upgrade to Creator for $9.99/month
                </h2>
                <p className="text-lg text-orange-200">
                  Join thousands of musicians using AI-powered setlist generation
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  icon: Sparkles,
                  title: 'AI Generation',
                  description: 'Perfect setlists by energy, key, tempo, and crowd flow',
                  color: 'from-orange-500 to-red-500',
                },
                {
                  icon: Play,
                  title: 'Performance Mode',
                  description: 'Full-screen lyrics, chords, and notes during your show',
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  icon: Share2,
                  title: 'Share & Sync',
                  description: 'Real-time collaboration with your band across all devices',
                  color: 'from-blue-500 to-cyan-500',
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:border-gray-700"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 transition-opacity group-hover:opacity-10`}
                  />
                  <div
                    className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${benefit.color} p-3`}
                  >
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 font-bold text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() =>
                  showUpgradeModal({
                    feature: 'setlistManagement',
                    requiredTier: 'creator',
                  })
                }
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-2xl hover:shadow-orange-500/40"
              >
                <div className="group-hover:animate-shimmer absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  Upgrade to Creator
                  <span className="text-sm opacity-80">from $9.99/mo</span>
                </span>
              </motion.button>
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border-2 border-gray-700 bg-gray-900/50 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all hover:border-gray-600 hover:bg-gray-800/50"
                >
                  Compare All Plans
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Setlists Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {mockSetlists.map((setlist, index) => {
              const EnergyIcon = getEnergyIcon(setlist.energyLevel);
              const energyColor = getEnergyColor(setlist.energyLevel);

              return (
                <motion.div
                  key={setlist.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  onHoverStart={() => setHoveredCard(setlist.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black transition-all duration-300 hover:border-gray-700 hover:shadow-2xl">
                    {/* Hover glow effect */}
                    {hoveredCard === setlist.id && (
                      <motion.div
                        layoutId="card-glow"
                        className={`absolute inset-0 bg-gradient-to-br ${energyColor} opacity-5`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}

                    {/* Locked Overlay */}
                    {!hasAccess && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all group-hover:bg-black/80"
                      >
                        <motion.button
                          onClick={() =>
                            showUpgradeModal({
                              feature: 'setlistManagement',
                              requiredTier: 'creator',
                            })
                          }
                          whileHover={{ scale: 1.1, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-3 text-white"
                        >
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-4 shadow-lg shadow-orange-500/50"
                          >
                            <Lock className="h-8 w-8" />
                          </motion.div>
                          <div className="text-center">
                            <div className="mb-1 text-lg font-bold">Unlock to View</div>
                            <div className="text-sm text-gray-400">Upgrade to Creator</div>
                          </div>
                        </motion.button>
                      </motion.div>
                    )}

                    <div className="relative p-6">
                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-xl bg-gradient-to-br ${energyColor} p-3 shadow-lg`}
                          >
                            <EnergyIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{setlist.name}</h3>
                            {setlist.showName && (
                              <p className="text-sm text-gray-400">{setlist.showName}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mb-4 space-y-3">
                        {setlist.showDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span>{formatDateWithDay(setlist.showDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>
                            {setlist.songCount} songs • {formatDuration(setlist.totalDuration)}
                          </span>
                        </div>
                        {setlist.venue && (
                          <div className="truncate text-sm text-gray-500">{setlist.venue}</div>
                        )}
                      </div>

                      {/* Energy Badge */}
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${energyColor} px-3 py-1 text-xs font-bold text-white`}
                        >
                          <Activity className="h-3 w-3" />
                          {setlist.energyLevel.toUpperCase()} ENERGY
                        </span>
                      </div>

                      {/* Actions */}
                      {hasAccess && (
                        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Link href={`/setlists/${setlist.id}/perform`} className="flex-1">
                            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/50">
                              <Play className="h-4 w-4" />
                              Perform
                            </button>
                          </Link>
                          <button className="rounded-lg border border-gray-700 bg-gray-800/50 p-2.5 text-gray-400 backdrop-blur-sm transition-all hover:border-gray-600 hover:bg-gray-700/50 hover:text-white">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg border border-gray-700 bg-gray-800/50 p-2.5 text-gray-400 backdrop-blur-sm transition-all hover:border-gray-600 hover:bg-gray-700/50 hover:text-white">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={isOpen} onClose={hideUpgradeModal} {...modalProps} />

      {/* Add custom shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
