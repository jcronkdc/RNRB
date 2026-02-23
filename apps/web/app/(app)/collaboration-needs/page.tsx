'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Music,
  Mic2,
  Guitar,
  Drum,
  Piano,
  Radio,
  Zap,
  ChevronRight,
  Loader2,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  MessageCircle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { EmptyState } from '@/components/empty-states';
import { ProjectsSkeleton } from '@/components/loading-skeletons';

// Need types with icons
const needTypes = [
  { id: 'all', label: 'All Needs', icon: Users },
  { id: 'musician', label: 'Musicians', icon: Guitar },
  { id: 'vocalist', label: 'Vocalists', icon: Mic2 },
  { id: 'producer', label: 'Producers', icon: Radio },
  { id: 'writer', label: 'Songwriters', icon: Music },
  { id: 'mixer', label: 'Mixers', icon: Zap },
];

// Urgency badges
const urgencyBadges: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-400' },
  high: { label: 'High Priority', color: 'bg-orange-500/20 text-orange-400' },
  normal: { label: 'Normal', color: 'bg-blue-500/20 text-blue-400' },
  low: { label: 'Flexible', color: 'bg-gray-500/20 text-gray-400' },
};

function CollaborationNeedCard({ need }: { need: any }) {
  const urgencyBadge = urgencyBadges[need.urgency] || urgencyBadges.normal;

  return (
    <Link href={`/collaboration-needs/${need.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/8 to-white/2 p-5 transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10"
      >
        {/* Glow effect */}
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/0 blur-3xl transition-all duration-500 group-hover:bg-blue-500/20" />

        <div className="relative">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${urgencyBadge.color}`}
              >
                {urgencyBadge.label}
              </span>
              {need.isPaid && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                  <DollarSign className="h-3 w-3" />
                  Paid
                </span>
              )}
            </div>
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs capitalize text-purple-400">
              {need.needType.replace('_', ' ')}
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-blue-300">
            {need.title}
          </h3>
          {need.description && (
            <p className="mb-3 line-clamp-2 text-sm text-white/60">{need.description}</p>
          )}

          {/* Skills/Genres */}
          {(need.instruments?.length > 0 || need.genres?.length > 0) && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {need.instruments?.slice(0, 3).map((inst: string) => (
                <span
                  key={inst}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"
                >
                  {inst}
                </span>
              ))}
              {need.genres?.slice(0, 2).map((genre: string) => (
                <span
                  key={genre}
                  className="rounded-full bg-pink-500/10 px-2 py-0.5 text-xs text-pink-400"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Meta info */}
          <div className="mb-4 flex flex-wrap gap-3 text-xs text-white/50">
            {need.isRemote && (
              <span className="flex items-center gap-1">
                <Radio className="h-3 w-3" />
                Remote OK
              </span>
            )}
            {need.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {need.location}
              </span>
            )}
          </div>

          {/* Posted by */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-linear-to-br from-blue-500 to-purple-600">
                {need.user?.image ? (
                  <Image
                    src={need.user.image}
                    alt={need.user.name || ''}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                    {(need.user?.name || 'U')[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{need.user?.name || 'Anonymous'}</p>
                <p className="text-xs text-white/40">Posted recently</p>
              </div>
            </div>
            <button className="flex items-center gap-1 rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all hover:bg-blue-500/30">
              Apply
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function CollaborationNeedsPage() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadNeeds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeType !== 'all') params.set('needType', activeType);
      params.set('limit', '20');

      const response = await fetch(`/api/ecosystem/collaboration-needs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNeeds(data.needs || []);
      }
    } catch (error) {
      console.error('Error loading collaboration needs:', error);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  useEffect(() => {
    loadNeeds();
  }, [loadNeeds]);

  // Filter by search
  const filteredNeeds = needs.filter(
    (need) =>
      !searchQuery ||
      need.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      need.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-64 top-0 h-[600px] w-[600px] rounded-full blur-[120px]"
          style={{ background: 'var(--accent-glow)' }}
        />
        <div
          className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: 'rgba(212, 168, 75, 0.1)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="mb-6 inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={56}
              className="transition-transform hover:scale-105"
              priority
            />
          </Link>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl" style={{ color: 'var(--text)' }}>
            Collaboration Marketplace
          </h1>
          <p className="mx-auto max-w-2xl" style={{ color: 'var(--muted)' }}>
            Musicians seeking collaborators. Find your next project partner, co-writer, or session
            musician.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collaboration needs..."
                className="w-full rounded-xl border py-3 pl-12 pr-4 outline-hidden transition-all focus:ring-2"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <Link
              href="/collaboration-needs/new"
              className="flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-white shadow-lg transition-all hover:scale-105"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 12px var(--accent-glow)' }}
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Post a Need</span>
            </Link>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {needTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all"
                style={
                  activeType === type.id
                    ? {
                        background: 'var(--accent)',
                        color: 'white',
                        boxShadow: '0 4px 12px var(--accent-glow)',
                      }
                    : {
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                      }
                }
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Needs Grid */}
        {loading ? (
          <ProjectsSkeleton count={6} />
        ) : filteredNeeds.length === 0 ? (
          <EmptyState
            type="collaborations"
            title="No collaboration needs found"
            description="Be the first to post what you're looking for!"
            actionLabel="Post What You Need"
            actionHref="/collaboration-needs/new"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredNeeds.map((need, i) => (
              <motion.div
                key={need.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <CollaborationNeedCard need={need} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Your Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 rounded-2xl border p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg-elevated) 100%)',
            borderColor: 'var(--gold)',
            borderWidth: '1px',
          }}
        >
          <Heart className="mx-auto mb-4 h-10 w-10" style={{ color: 'var(--gold)' }} />
          <h2 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
            Want collaborators to find YOU?
          </h2>
          <p className="mb-4" style={{ color: 'var(--muted)' }}>
            Complete your profile with your skills, instruments, and genres.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/settings/profile"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 12px var(--accent-glow)' }}
            >
              Complete Profile
            </Link>
            <Link
              href="/collaboration-needs/new"
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-medium transition-all hover:opacity-80"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <Plus className="h-4 w-4" />
              Post What You Need
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
