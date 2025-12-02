'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Heart,
  MapPin,
  Tag,
  Repeat,
  DollarSign,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Package,
  Loader2,
  Bell,
  Bookmark,
  ShoppingBag,
  Megaphone,
  Settings,
  Eye,
  Clock,
  AlertCircle,
  Check,
  Trash2,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { trpc as api } from '@cronkwaters/trpc/client/react';
import { useSession } from 'next-auth/react';

// Category definitions with vibrant colors
const CATEGORIES = [
  {
    id: 'all',
    name: 'All Gear',
    gradient: 'from-rose-500 via-orange-500 to-amber-500',
    glow: 'shadow-orange-500/30',
  },
  {
    id: 'guitar',
    name: 'Guitars',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    glow: 'shadow-amber-500/30',
  },
  {
    id: 'bass',
    name: 'Bass',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'shadow-purple-500/30',
  },
  {
    id: 'drums',
    name: 'Drums',
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    glow: 'shadow-rose-500/30',
  },
  {
    id: 'keys',
    name: 'Keys & Synths',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    glow: 'shadow-blue-500/30',
  },
  {
    id: 'amps',
    name: 'Amps',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    glow: 'shadow-teal-500/30',
  },
  {
    id: 'fx',
    name: 'Effects & Pedals',
    gradient: 'from-pink-400 via-fuchsia-500 to-purple-500',
    glow: 'shadow-fuchsia-500/30',
  },
  {
    id: 'mics',
    name: 'Microphones',
    gradient: 'from-sky-400 via-blue-500 to-indigo-500',
    glow: 'shadow-sky-500/30',
  },
  {
    id: 'studio',
    name: 'Studio Gear',
    gradient: 'from-indigo-400 via-violet-500 to-purple-500',
    glow: 'shadow-violet-500/30',
  },
  {
    id: 'other',
    name: 'Other',
    gradient: 'from-slate-400 via-zinc-500 to-neutral-500',
    glow: 'shadow-zinc-500/30',
  },
];

const CONDITIONS = [
  { id: 'all', name: 'Any Condition' },
  { id: 'mint', name: 'Mint' },
  { id: 'excellent', name: 'Excellent' },
  { id: 'good', name: 'Good' },
  { id: 'fair', name: 'Fair' },
  { id: 'poor', name: 'Poor' },
];

const LISTING_TYPES = [
  { id: 'all', name: 'All Listings' },
  { id: 'sell', name: 'For Sale' },
  { id: 'trade', name: 'For Trade' },
  { id: 'both', name: 'Sale or Trade' },
];

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'price_low', name: 'Price: Low to High' },
  { id: 'price_high', name: 'Price: High to Low' },
  { id: 'popular', name: 'Most Popular' },
];

// Tab definitions
const TABS = [
  { id: 'browse', name: 'Browse', icon: ShoppingBag },
  { id: 'wanted', name: 'Wanted', icon: Megaphone },
  { id: 'saved', name: 'Saved', icon: Bookmark },
  { id: 'alerts', name: 'Alerts', icon: Bell },
  { id: 'my-listings', name: 'My Listings', icon: Package },
];

function formatPrice(price: number | null | undefined, currency: string = 'USD'): string {
  if (price === null || price === undefined) return 'Trade Only';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function getConditionColor(condition: string): string {
  switch (condition) {
    case 'mint':
      return 'text-emerald-300 bg-gradient-to-r from-emerald-500/30 to-teal-500/30';
    case 'excellent':
      return 'text-sky-300 bg-gradient-to-r from-sky-500/30 to-blue-500/30';
    case 'good':
      return 'text-amber-300 bg-gradient-to-r from-amber-500/30 to-yellow-500/30';
    case 'fair':
      return 'text-orange-300 bg-gradient-to-r from-orange-500/30 to-red-500/30';
    case 'poor':
      return 'text-rose-300 bg-gradient-to-r from-rose-500/30 to-red-500/30';
    default:
      return 'text-zinc-300 bg-gradient-to-r from-zinc-500/30 to-slate-500/30';
  }
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'urgent':
      return 'text-rose-300 bg-gradient-to-r from-rose-500/20 to-red-500/20 border-rose-500/40';
    case 'normal':
      return 'text-sky-300 bg-gradient-to-r from-sky-500/20 to-blue-500/20 border-sky-500/40';
    case 'flexible':
      return 'text-emerald-300 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/40';
    default:
      return 'text-zinc-300 bg-gradient-to-r from-zinc-500/20 to-slate-500/20 border-zinc-500/40';
  }
}

function ListingCard({
  listing,
  onFavoriteToggle,
  isFavorited,
}: {
  listing: any;
  onFavoriteToggle?: () => void;
  isFavorited?: boolean;
}) {
  const categoryInfo = CATEGORIES.find((c) => c.id === listing.category) || CATEGORIES[0];
  const primaryImage = listing.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent transition-all duration-500 hover:border-white/20"
    >
      {/* Gradient glow on hover */}
      <div
        className={`pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br ${categoryInfo.gradient} opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-30`}
      />

      {/* Inner container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f1a]/80 backdrop-blur-xl">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <>
              <div
                className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient} opacity-30`}
              />
              <div className="flex h-full items-center justify-center">
                <Package className="h-16 w-16 text-white/20" />
              </div>
            </>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className={`absolute right-3 top-3 rounded-full p-2.5 backdrop-blur-md transition-all duration-300 ${
                isFavorited
                  ? 'bg-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/20'
                  : 'bg-black/40 text-white/70 hover:bg-rose-500/30 hover:text-rose-300'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Listing Type Badge */}
          {listing.listingType !== 'sell' && (
            <div className="absolute left-3 top-3">
              {listing.listingType === 'trade' ? (
                <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-500/30 backdrop-blur-sm">
                  <Repeat className="h-3.5 w-3.5" />
                  Trade
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-amber-500/30 backdrop-blur-sm">
                  <Tag className="h-3.5 w-3.5" />
                  Sale/Trade
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${getConditionColor(listing.condition)}`}
            >
              {listing.condition}
            </span>
            {listing.brand && (
              <span className="text-xs font-medium text-white/50">{listing.brand}</span>
            )}
          </div>

          <h3 className="mb-2 line-clamp-2 text-base font-bold text-white transition-colors duration-300 group-hover:text-orange-300">
            {listing.title}
          </h3>

          {listing.location && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-white/50">
              <MapPin className="h-3.5 w-3.5" />
              {listing.location}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-xl font-black text-transparent">
              {formatPrice(listing.price, listing.currency)}
            </div>
            {listing.acceptsOffers && listing.price && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                OBO
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WantedCard({ post }: { post: any }) {
  const categoryInfo = CATEGORIES.find((c) => c.id === post.category) || CATEGORIES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 transition-all duration-300 hover:border-white/20 hover:from-white/[0.12] hover:to-white/[0.04]"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${getUrgencyColor(post.urgency)}`}
          >
            {post.urgency}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize text-white/60">
            {post.category}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Eye className="h-3 w-3" />
          {post.viewCount}
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-brand-primary">
        {post.title}
      </h3>

      <p className="mb-3 line-clamp-2 text-sm text-white/60">{post.description}</p>

      {(post.budgetMin || post.budgetMax) && (
        <div className="mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-white/70">
            Budget: {post.budgetMin && formatPrice(post.budgetMin)}
            {post.budgetMin && post.budgetMax && ' - '}
            {post.budgetMax && formatPrice(post.budgetMax)}
          </span>
        </div>
      )}

      {post.hasTradeOffer && (
        <div className="mb-3 flex items-center gap-2 text-sm text-purple-400">
          <Repeat className="h-4 w-4" />
          Has trade to offer
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          {post.user?.image ? (
            <img src={post.user.image} alt="" className="h-6 w-6 rounded-full" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-medium text-brand-primary">
              {post.user?.name?.[0] || '?'}
            </div>
          )}
          <span className="text-sm text-white/60">{post.user?.name || 'Anonymous'}</span>
        </div>
        <span className="text-xs text-white/40">{post._count?.responses || 0} responses</span>
      </div>
    </motion.div>
  );
}

function AlertCard({
  alert,
  onToggle,
  onDelete,
}: {
  alert: any;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 transition-all ${
        alert.isActive
          ? 'border-brand-primary/30 bg-brand-primary/5'
          : 'border-white/10 bg-white/5 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-white">{alert.name}</h4>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/60">
            {alert.category && <span className="capitalize">{alert.category}</span>}
            {alert.brand && <span>• {alert.brand}</span>}
            {alert.keywords && <span>• "{alert.keywords}"</span>}
            {(alert.minPrice || alert.maxPrice) && (
              <span>
                • {alert.minPrice && `$${alert.minPrice}`}
                {alert.minPrice && alert.maxPrice && ' - '}
                {alert.maxPrice && `$${alert.maxPrice}`}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {alert.frequency}
            </span>
            <span>{alert.matchCount} matches</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              alert.isActive
                ? 'bg-brand-primary/20 text-brand-primary'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {alert.isActive ? 'Active' : 'Paused'}
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-white/40 transition-all hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent py-20 text-center backdrop-blur-sm"
    >
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-tl from-violet-500/10 to-transparent blur-3xl" />

      <div className="relative">
        <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5">
          <Icon className="h-12 w-12 text-white/30" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
        <p className="mb-8 max-w-md text-white/50">{description}</p>
        {action &&
          (action.href ? (
            <Link
              href={action.href}
              className="inline-flex rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40"
            >
              {action.label}
            </button>
          ))}
      </div>
    </motion.div>
  );
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [activeListingTypes, setActiveListingTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular'
  >('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlertName, setNewAlertName] = useState('');

  // Handle URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    const category = searchParams.get('category');
    const search = searchParams.get('q');

    if (tab && TABS.find((t) => t.id === tab)) setActiveTab(tab);
    if (category) setActiveCategory(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // API queries
  const listingsQuery = api.marketplace.getListings.useQuery(
    {
      category: activeCategory !== 'all' ? activeCategory : undefined,
      condition: activeConditions.length > 0 ? activeConditions : undefined,
      listingType: activeListingTypes.length > 0 ? activeListingTypes : undefined,
      search: searchQuery || undefined,
      sortBy,
      limit: 20,
    },
    {
      enabled: activeTab === 'browse',
    }
  );

  const wantedQuery = api.marketplace.getWantedPosts.useQuery(
    {
      category: activeCategory !== 'all' ? activeCategory : undefined,
      search: searchQuery || undefined,
      limit: 20,
    },
    {
      enabled: activeTab === 'wanted',
    }
  );

  const savedQuery = api.marketplace.getSavedListings.useQuery(
    {
      limit: 20,
    },
    {
      enabled: activeTab === 'saved' && !!session,
    }
  );

  const alertsQuery = api.marketplace.getMyAlerts.useQuery(undefined, {
    enabled: activeTab === 'alerts' && !!session,
  });

  const myListingsQuery = api.marketplace.getMyListings.useQuery(
    {
      limit: 20,
    },
    {
      enabled: activeTab === 'my-listings' && !!session,
    }
  );

  const statsQuery = api.marketplace.getStats.useQuery();
  const myStatsQuery = api.marketplace.getMyStats.useQuery(undefined, {
    enabled: !!session,
  });

  // Mutations
  const toggleFavoriteMutation = api.marketplace.toggleFavorite.useMutation({
    onSuccess: () => {
      listingsQuery.refetch();
      savedQuery.refetch();
    },
  });

  const toggleAlertMutation = api.marketplace.toggleAlertActive.useMutation({
    onSuccess: () => alertsQuery.refetch(),
  });

  const deleteAlertMutation = api.marketplace.deleteAlert.useMutation({
    onSuccess: () => alertsQuery.refetch(),
  });

  const createAlertMutation = api.marketplace.createAlert.useMutation({
    onSuccess: () => {
      alertsQuery.refetch();
      setShowCreateAlert(false);
      setNewAlertName('');
    },
  });

  const handleCreateAlert = () => {
    if (!newAlertName.trim()) return;

    createAlertMutation.mutate({
      name: newAlertName,
      category: activeCategory !== 'all' ? activeCategory : undefined,
      keywords: searchQuery || undefined,
      conditions: activeConditions,
      listingTypes: activeListingTypes,
    });
  };

  const isLoading =
    (activeTab === 'browse' && listingsQuery.isLoading) ||
    (activeTab === 'wanted' && wantedQuery.isLoading) ||
    (activeTab === 'saved' && savedQuery.isLoading) ||
    (activeTab === 'alerts' && alertsQuery.isLoading) ||
    (activeTab === 'my-listings' && myListingsQuery.isLoading);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
    >
      {/* Vibrant Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary warm glow - top left */}
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent blur-[120px]" />
        {/* Secondary cool glow - bottom right */}
        <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-violet-500/20 via-purple-500/10 to-transparent blur-[100px]" />
        {/* Accent glow - center */}
        <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent blur-[80px]" />
        {/* Subtle teal accent */}
        <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-teal-500/10 to-transparent blur-[60px]" />
        {/* Grid overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="mb-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              Gear <span className="text-orange-400">Marketplace</span>
            </h1>
            <p className="text-lg font-medium text-white/60">
              Buy, sell, and trade music equipment with fellow musicians
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const needsAuth = ['saved', 'alerts', 'my-listings'].includes(tab.id);

              if (needsAuth && !session) return null;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl shadow-orange-500/40'
                      : 'border border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-orange-500/40 hover:bg-white/[0.06] hover:text-white hover:shadow-lg hover:shadow-orange-500/10'
                  }`}
                >
                  <tab.icon
                    className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-orange-400'}`}
                  />
                  {tab.name}
                  {tab.id === 'saved' && myStatsQuery.data?.savedCount ? (
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
                      {myStatsQuery.data.savedCount}
                    </span>
                  ) : null}
                  {tab.id === 'alerts' && myStatsQuery.data?.alertCount ? (
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
                      {myStatsQuery.data.alertCount}
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16">
        {/* Search & Actions Bar */}
        {(activeTab === 'browse' || activeTab === 'wanted') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Search Input */}
            <div className="group relative max-w-xl flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-orange-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'browse'
                    ? 'Search guitars, amps, pedals...'
                    : 'Search wanted posts...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-12 pr-4 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/[0.08] focus:shadow-lg focus:shadow-orange-500/10"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {activeTab === 'browse' && (
                <>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                      showFilters
                        ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/10'
                        : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-orange-500/30 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>

                  {session && (
                    <button
                      onClick={() => setShowCreateAlert(true)}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white/70 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.08] hover:text-white"
                    >
                      <Bell className="h-4 w-4" />
                      Create Alert
                    </button>
                  )}
                </>
              )}

              <Link
                href={activeTab === 'wanted' ? '/marketplace/wanted/create' : '/marketplace/create'}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/40"
              >
                <Plus className="h-4 w-4" />
                {activeTab === 'wanted' ? 'Post Wanted' : 'List Item'}
              </Link>
            </div>
          </motion.div>
        )}

        {/* Category Pills - Browse & Wanted tabs */}
        {(activeTab === 'browse' || activeTab === 'wanted') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 flex flex-wrap gap-2"
          >
            {CATEGORIES.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.02 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.gradient} text-white shadow-xl ${cat.glow}`
                    : 'border border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white/90'
                }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Expanded Filters - Browse tab only */}
        <AnimatePresence>
          {showFilters && activeTab === 'browse' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Condition */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Condition
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CONDITIONS.slice(1).map((cond) => (
                        <button
                          key={cond.id}
                          onClick={() => {
                            setActiveConditions((prev) =>
                              prev.includes(cond.id)
                                ? prev.filter((c) => c !== cond.id)
                                : [...prev, cond.id]
                            );
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            activeConditions.includes(cond.id)
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                          }`}
                        >
                          {cond.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Listing Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Listing Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LISTING_TYPES.slice(1).map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setActiveListingTypes((prev) =>
                              prev.includes(type.id)
                                ? prev.filter((t) => t !== type.id)
                                : [...prev, type.id]
                            );
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            activeListingTypes.includes(type.id)
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-primary/50"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-gray-900">
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setActiveConditions([]);
                      setActiveListingTypes([]);
                      setSortBy('newest');
                      setSearchQuery('');
                    }}
                    className="text-sm text-white/50 hover:text-white"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Header - Browse tab */}
        {activeTab === 'browse' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 flex items-center justify-between"
          >
            <p className="text-sm text-white/60">
              <span className="font-semibold text-white">
                {listingsQuery.data?.listings.length || 0}
              </span>{' '}
              listings found
            </p>

            <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2.5 transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-300 shadow-lg shadow-orange-500/10'
                    : 'text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2.5 transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-300 shadow-lg shadow-orange-500/10'
                    : 'text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-50 blur-xl" />
              <Loader2 className="relative h-10 w-10 animate-spin text-orange-400" />
            </div>
            <p className="mt-4 text-sm text-white/50">Loading gear...</p>
          </div>
        )}

        {/* Browse Tab Content */}
        {activeTab === 'browse' && !isLoading && (
          <>
            {listingsQuery.data?.listings && listingsQuery.data.listings.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'space-y-4'
                }
              >
                {listingsQuery.data.listings.map((listing) => (
                  <Link key={listing.id} href={`/marketplace/${listing.id}`}>
                    <ListingCard
                      listing={listing}
                      onFavoriteToggle={
                        session
                          ? () => toggleFavoriteMutation.mutate({ listingId: listing.id })
                          : undefined
                      }
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No listings found"
                description="Be the first to list something in this category, or try adjusting your filters."
                action={{ label: 'List Your Gear', href: '/marketplace/create' }}
              />
            )}
          </>
        )}

        {/* Wanted Tab Content */}
        {activeTab === 'wanted' && !isLoading && (
          <>
            {wantedQuery.data?.posts && wantedQuery.data.posts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {wantedQuery.data.posts.map((post) => (
                  <Link key={post.id} href={`/marketplace/wanted/${post.id}`}>
                    <WantedCard post={post} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Megaphone}
                title="No wanted posts yet"
                description="Looking for something specific? Post what you're searching for and let sellers come to you."
                action={{ label: 'Post What You Need', href: '/marketplace/wanted/create' }}
              />
            )}
          </>
        )}

        {/* Saved Tab Content */}
        {activeTab === 'saved' && !isLoading && (
          <>
            {savedQuery.data?.favorites && savedQuery.data.favorites.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {savedQuery.data.favorites.map((listing: any) => (
                  <Link key={listing.id} href={`/marketplace/${listing.id}`}>
                    <ListingCard
                      listing={listing}
                      onFavoriteToggle={() =>
                        toggleFavoriteMutation.mutate({ listingId: listing.id })
                      }
                      isFavorited={true}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bookmark}
                title="No saved listings"
                description="Save listings you're interested in to easily find them later."
                action={{ label: 'Browse Listings', onClick: () => setActiveTab('browse') }}
              />
            )}
          </>
        )}

        {/* Alerts Tab Content */}
        {activeTab === 'alerts' && !isLoading && (
          <>
            {alertsQuery.data && alertsQuery.data.length > 0 ? (
              <div className="space-y-4">
                {alertsQuery.data.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onToggle={() => toggleAlertMutation.mutate({ id: alert.id })}
                    onDelete={() => deleteAlertMutation.mutate({ id: alert.id })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="No alerts set up"
                description="Create alerts to get notified when gear matching your criteria is listed."
                action={{
                  label: 'Create Your First Alert',
                  onClick: () => setShowCreateAlert(true),
                }}
              />
            )}
          </>
        )}

        {/* My Listings Tab Content */}
        {activeTab === 'my-listings' && !isLoading && (
          <>
            {myListingsQuery.data?.listings && myListingsQuery.data.listings.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myListingsQuery.data.listings.map((listing) => (
                  <Link key={listing.id} href={`/marketplace/${listing.id}`}>
                    <ListingCard listing={listing} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No listings yet"
                description="List your gear to sell or trade with other musicians."
                action={{ label: 'Create Your First Listing', href: '/marketplace/create' }}
              />
            )}
          </>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 p-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-orange-500/25 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-tl from-violet-500/25 to-transparent blur-3xl" />

          <div className="relative grid grid-cols-2 gap-10 text-center md:grid-cols-4">
            <div className="group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-5xl font-black text-orange-400"
              >
                {statsQuery.data?.totalListings ?? 0}
              </motion.div>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/70">
                Active Listings
              </div>
            </div>
            <div className="group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-5xl font-black text-violet-400"
              >
                {statsQuery.data?.totalWanted ?? 0}
              </motion.div>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/70">
                Wanted Posts
              </div>
            </div>
            <div className="group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-5xl font-black text-emerald-400"
              >
                {CATEGORIES.length - 1}
              </motion.div>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/70">
                Categories
              </div>
            </div>
            <div className="group">
              <motion.div whileHover={{ scale: 1.1 }} className="text-5xl font-black text-rose-400">
                0%
              </motion.div>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/70">
                Platform Fees
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a2e] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Create Alert</h3>
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-4 text-sm text-white/60">
                Get notified when new listings match your current search criteria.
              </p>

              <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <div className="mb-2 font-medium text-white">Alert will match:</div>
                <ul className="space-y-1 text-white/60">
                  {activeCategory !== 'all' && <li>• Category: {activeCategory}</li>}
                  {searchQuery && <li>• Keywords: "{searchQuery}"</li>}
                  {activeConditions.length > 0 && (
                    <li>• Conditions: {activeConditions.join(', ')}</li>
                  )}
                  {activeListingTypes.length > 0 && (
                    <li>• Types: {activeListingTypes.join(', ')}</li>
                  )}
                  {activeCategory === 'all' &&
                    !searchQuery &&
                    activeConditions.length === 0 &&
                    activeListingTypes.length === 0 && <li>• All new listings</li>}
                </ul>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-white/70">Alert Name</label>
                <input
                  type="text"
                  value={newAlertName}
                  onChange={(e) => setNewAlertName(e.target.value)}
                  placeholder="e.g., Vintage Fender Guitars"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={!newAlertName.trim() || createAlertMutation.isPending}
                  className="flex-1 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {createAlertMutation.isPending ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-50 blur-xl" />
              <Loader2 className="relative h-10 w-10 animate-spin text-orange-400" />
            </div>
            <div className="text-white/50">Loading marketplace...</div>
          </div>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
