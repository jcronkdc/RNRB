'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  ListMusic,
  Plus,
  Play,
  Edit,
  Share2,
  Calendar,
  Clock,
  Lock,
  Sparkles,
  Zap,
  Music2,
  TrendingUp,
  Star,
  ChevronRight,
  Activity,
  Presentation,
  Wrench,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { EmptyState } from '@/components/empty-states';
import { UpgradeModal, useUpgradeModal } from '@/components/upgrade-modal';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useSetlistAccess } from '@/hooks/use-subscription';
import { formatDateWithDay } from '@/lib/format-date';
import { microCopy } from '@/lib/workshop-voice';
import { ProjectsSkeleton } from '@/components/loading-skeletons';

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
    if (hasAccess) {
      const fetchSetlists = async () => {
        try {
          const response = await fetch('/api/setlists');
          if (response.ok) {
            const data = await response.json();
            const mapped = (data.setlists || []).map((s: any) => ({
              id: s.id,
              name: s.name || s.show?.name || 'Untitled Setlist',
              showName: s.show?.name,
              showDate: s.show?.date ? new Date(s.show.date) : undefined,
              venue: s.show?.venue?.name,
              songCount: s._count?.items || s.items?.length || 0,
              totalDuration: 0,
              energyLevel: 'mixed' as const,
              createdAt: new Date(s.createdAt),
            }));
            setSetlists(mapped);
          }
        } catch (error) {
          console.error('Failed to fetch setlists:', error);
        } finally {
          setIsLoadingSetlists(false);
        }
      };
      fetchSetlists();
    } else {
      setIsLoadingSetlists(false);
    }
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={56}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </div>

        {/* Header */}
        <div className="relative mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl p-3" style={{ background: 'rgba(255, 99, 71, 0.15)' }}>
                <ListMusic className="h-7 w-7" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  Smart Setlists
                </h1>
                <p className="mt-1" style={{ color: 'var(--muted)' }}>
                  Craft the perfect setlist—energy, flow, and crowd connection
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
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-2"
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
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-2"
              >
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">
                  <span className="font-bold text-white">
                    {mockSetlists.reduce((sum, s) => sum + s.songCount, 0)}
                  </span>{' '}
                  Songs
                </span>
              </motion.div>

              {/* Performer Mode Tool Link */}
              <Link href="/tools?tool=performer-mode">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-pink-500/30 bg-linear-to-r from-pink-500/10 to-rose-500/10 px-4 py-2 transition-colors hover:border-pink-500/50"
                >
                  <Presentation className="h-4 w-4 text-pink-500" />
                  <span className="text-sm font-medium text-pink-400">Performer Mode</span>
                </motion.div>
              </Link>
            </div>

            {hasAccess ? (
              <Link href="/setlists/new">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-2xl hover:shadow-orange-500/40"
                >
                  <div className="group-hover:animate-shimmer absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
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
                className="group relative overflow-hidden rounded-xl border-2 border-orange-500/50 bg-linear-to-r from-orange-500/10 to-red-500/10 px-6 py-3 font-bold text-white shadow-lg transition-all hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/40"
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
            className="mb-8 overflow-hidden rounded-2xl border border-orange-500/30 bg-linear-to-br from-orange-500/10 via-red-500/5 to-orange-500/10 p-8"
          >
            {/* Animated glow effect */}
            <div className="absolute inset-0 -z-10 opacity-50">
              <motion.div
                className="absolute left-0 top-0 h-full w-1/3 bg-linear-to-r from-orange-500/20 to-transparent"
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
                className="rounded-2xl bg-linear-to-br from-orange-500 to-red-500 p-4 shadow-lg"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h2 className="mb-2 text-3xl font-black text-white">
                  Upgrade to Creator for $17.99/month
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
                  className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-gray-700"
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${benefit.color} opacity-0 transition-opacity group-hover:opacity-10`}
                  />
                  <div
                    className={`mb-3 inline-flex rounded-lg bg-linear-to-br ${benefit.color} p-3`}
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
                className="group relative overflow-hidden rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-2xl hover:shadow-orange-500/40"
              >
                <div className="group-hover:animate-shimmer absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  Upgrade to Creator
                  <span className="text-sm opacity-80">from $17.99/mo</span>
                </span>
              </motion.button>
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border-2 border-gray-700 bg-gray-900/50 px-8 py-4 font-bold text-white transition-all hover:border-gray-600 hover:bg-gray-800/50"
                >
                  Compare All Plans
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoadingSetlists && (
          <div className="mt-8">
            <ProjectsSkeleton count={6} />
          </div>
        )}

        {/* Empty State - Real Setlists */}
        {hasAccess && setlists.length === 0 && !isLoadingSetlists && (
          <EmptyState
            type="setlists"
            title="No setlists created yet"
            description="Build your first AI-powered setlist optimized for energy flow and crowd engagement"
            actionLabel="Generate Setlist"
            actionHref="/setlists/new"
          />
        )}

        {/* Setlists Grid */}
        {!isLoadingSetlists && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {(hasAccess && setlists.length > 0 ? setlists : mockSetlists).map(
                (setlist, index) => {
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
                      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-gray-900 to-black transition-all duration-300 hover:border-gray-700 hover:shadow-2xl">
                        {/* Hover glow effect */}
                        {hoveredCard === setlist.id && (
                          <motion.div
                            layoutId="card-glow"
                            className={`absolute inset-0 bg-linear-to-br ${energyColor} opacity-5`}
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
                            className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 transition-all group-hover:bg-black/80"
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
                                className="rounded-full bg-linear-to-br from-orange-500 to-red-500 p-4 shadow-lg shadow-orange-500/50"
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
                                className={`rounded-xl bg-linear-to-br ${energyColor} p-3 shadow-lg`}
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
                              className={`inline-flex items-center gap-1.5 rounded-full bg-linear-to-r ${energyColor} px-3 py-1 text-xs font-bold text-white`}
                            >
                              <Activity className="h-3 w-3" />
                              {setlist.energyLevel.toUpperCase()} ENERGY
                            </span>
                          </div>

                          {/* Actions */}
                          {hasAccess && (
                            <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Link href={`/setlists/${setlist.id}/perform`} className="flex-1">
                                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/50">
                                  <Play className="h-4 w-4" />
                                  Perform
                                </button>
                              </Link>
                              <button className="rounded-lg border border-gray-700 bg-gray-800/50 p-2.5 text-gray-400 transition-all hover:border-gray-600 hover:bg-gray-700/50 hover:text-white">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="rounded-lg border border-gray-700 bg-gray-800/50 p-2.5 text-gray-400 transition-all hover:border-gray-600 hover:bg-gray-700/50 hover:text-white">
                                <Share2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </AnimatePresence>
          </div>
        )}
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
