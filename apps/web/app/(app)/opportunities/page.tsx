'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  Plus,
  Music,
  Mic2,
  Guitar,
  Users,
  Globe,
  Clock,
  ChevronRight,
  Loader2,
  Star,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { microCopy } from '@/lib/workshop-voice';

// Opportunity types with icons
const opportunityTypes = [
  { id: 'all', label: 'All', icon: Briefcase },
  { id: 'gig', label: 'Gigs', icon: Mic2 },
  { id: 'session', label: 'Sessions', icon: Music },
  { id: 'sync_license', label: 'Sync', icon: Star },
  { id: 'tour', label: 'Tours', icon: Globe },
  { id: 'teaching', label: 'Teaching', icon: Users },
];

// Compensation badges
const compensationBadges: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-400' },
  royalty_share: { label: 'Royalty Share', color: 'bg-purple-500/20 text-purple-400' },
  door_split: { label: 'Door Split', color: 'bg-blue-500/20 text-blue-400' },
  tips: { label: 'Tips', color: 'bg-yellow-500/20 text-yellow-400' },
  unpaid: { label: 'Unpaid', color: 'bg-gray-500/20 text-gray-400' },
};

function OpportunityCard({ opportunity }: { opportunity: any }) {
  const compBadge = compensationBadges[opportunity.compensation] || compensationBadges.paid;

  return (
    <Link href={`/opportunities/${opportunity.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative overflow-hidden rounded-2xl p-5 transition-all"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Glow effect on hover */}
        <div
          className="absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-100"
          style={{ background: 'var(--accent-glow)' }}
        />

        <div className="relative">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${compBadge.color}`}>
                {compBadge.label}
              </span>
              {opportunity.payAmount && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                  <DollarSign className="h-3 w-3" />
                  {opportunity.payAmount.toLocaleString()}
                </span>
              )}
            </div>
            <span className="rounded-full bg-[var(--panel-hover)] px-2 py-0.5 text-xs capitalize text-[var(--text-secondary)]">
              {opportunity.type.replace('_', ' ')}
            </span>
          </div>

          {/* Title & Description */}
          <h3
            className="mb-2 text-lg font-semibold transition-colors"
            style={{ color: 'var(--text)' }}
          >
            {opportunity.title}
          </h3>
          {opportunity.description && (
            <p className="mb-3 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {opportunity.description}
            </p>
          )}

          {/* Meta info */}
          <div className="mb-4 flex flex-wrap gap-3 text-xs" style={{ color: 'var(--muted)' }}>
            {opportunity.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {opportunity.location}
              </span>
            )}
            {opportunity.date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(opportunity.date).toLocaleDateString()}
              </span>
            )}
            {opportunity.instruments?.length > 0 && (
              <span className="flex items-center gap-1">
                <Guitar className="h-3 w-3" />
                {opportunity.instruments.slice(0, 2).join(', ')}
                {opportunity.instruments.length > 2 && ` +${opportunity.instruments.length - 2}`}
              </span>
            )}
          </div>

          {/* Posted by */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7 overflow-hidden rounded-full"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--clay))' }}
              >
                {opportunity.postedBy?.image ? (
                  <Image
                    src={opportunity.postedBy.image}
                    alt={opportunity.postedBy.name || ''}
                    width={28}
                    height={28}
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-xs font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    {(opportunity.postedBy?.name || 'U')[0]}
                  </div>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {opportunity.postedBy?.name || 'Anonymous'}
              </span>
            </div>
            <ChevronRight
              className="h-4 w-4 transition-all group-hover:translate-x-1"
              style={{ color: 'var(--muted-soft)' }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeType !== 'all') params.set('type', activeType);
      if (location) params.set('city', location);
      params.set('limit', '20');

      const response = await fetch(`/api/ecosystem/opportunities?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  }, [activeType, location]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  // Filter opportunities by search query
  const filteredOpportunities = opportunities.filter(
    (opp) =>
      !searchQuery ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient background - workshop feel */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-64 top-0 h-[600px] w-[600px] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'var(--accent-glow)' }}
        />
        <div
          className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'var(--gold-dim)' }}
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
            Opportunity Hub
          </h1>
          <p className="mx-auto max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Find gigs, session work, sync licensing opportunities, and more. Get paid for your
            talent.
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
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search opportunities..."
                className="w-full rounded-xl py-3 pl-12 pr-4 outline-none transition-all"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-48 rounded-xl py-3 pl-12 pr-4 outline-none transition-all"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <Link
              href="/opportunities/post"
              className="flex items-center gap-2 rounded-xl px-5 py-3 font-medium shadow-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--clay))',
                color: 'var(--text)',
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Post Opportunity</span>
            </Link>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {opportunityTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeType === type.id ? '' : ''
                }`}
                style={
                  activeType === type.id
                    ? {
                        background: 'linear-gradient(135deg, var(--accent), var(--clay))',
                        color: 'var(--text)',
                        boxShadow: '0 4px 12px var(--accent-glow)',
                      }
                    : {
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                      }
                }
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            { label: 'Total Opportunities', value: opportunities.length, icon: Briefcase },
            {
              label: 'Paid Gigs',
              value: opportunities.filter((o) => o.compensation === 'paid').length,
              icon: DollarSign,
            },
            {
              label: 'Remote Friendly',
              value: opportunities.filter((o) => o.isRemote).length,
              icon: Globe,
            },
            {
              label: 'Posted This Week',
              value: opportunities.filter((o) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(o.createdAt) > weekAgo;
              }).length,
              icon: Clock,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)]">
                  <stat.icon className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text)]">{stat.value}</p>
                  <p className="text-xs text-[var(--muted)]">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
            <p className="text-sm text-[var(--muted)]">{microCopy.loading.opportunities}</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-12 text-center"
          >
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-[var(--muted-soft)]" />
            <h3 className="mb-2 text-lg font-semibold text-[var(--text)]">
              Opportunities are everywhere
            </h3>
            <p className="mb-4 text-sm text-[var(--muted)]">
              {activeType !== 'all'
                ? `No ${activeType.replace('_', ' ')} opportunities available right now—but that could change any moment.`
                : 'Be the first to post an opportunity and help fellow musicians get paid!'}
            </p>
            <Link
              href="/opportunities/post"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--clay)] px-5 py-2.5 font-medium text-[var(--text)]"
            >
              <Plus className="h-4 w-4" />
              Post an Opportunity
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredOpportunities.map((opportunity, i) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <OpportunityCard opportunity={opportunity} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 rounded-2xl border border-[var(--border-strong)] bg-gradient-to-br from-green-500/10 to-[var(--gold-dim)] p-8 text-center"
        >
          <Zap className="mx-auto mb-4 h-10 w-10 text-[var(--accent)]" />
          <h2 className="mb-2 text-xl font-bold text-[var(--text)]">Looking to hire musicians?</h2>
          <p className="mb-4 text-[var(--text-secondary)]">
            Post your opportunity and reach thousands of talented artists.
          </p>
          <Link
            href="/opportunities/post"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--clay)] px-6 py-3 font-medium text-[var(--text)] shadow-lg shadow-[var(--accent-glow)] transition-all hover:from-green-600 hover:to-emerald-700"
          >
            <Plus className="h-5 w-5" />
            Post an Opportunity
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
