'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Heart,
  MessageSquare,
  RefreshCw,
  MoreVertical,
  Check,
  Clock,
  Package,
  Tag,
  DollarSign,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc as api } from '@cronkwaters/trpc/client/react';

import { EmptyState } from '@/components/empty-states';
import { ProjectsSkeleton } from '@/components/loading-skeletons';

type ListingStatus = 'active' | 'pending' | 'sold' | 'traded' | 'expired' | 'removed' | 'draft';

const STATUS_CONFIG: Record<ListingStatus, { label: string; color: string; icon: typeof Check }> = {
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-500/20', icon: Check },
  pending: { label: 'Pending Sale', color: 'text-amber-400 bg-amber-500/20', icon: Clock },
  sold: { label: 'Sold', color: 'text-sky-400 bg-sky-500/20', icon: DollarSign },
  traded: { label: 'Traded', color: 'text-violet-400 bg-violet-500/20', icon: RefreshCw },
  expired: { label: 'Expired', color: 'text-orange-400 bg-orange-500/20', icon: Clock },
  removed: { label: 'Removed', color: 'text-rose-400 bg-rose-500/20', icon: Trash2 },
  draft: { label: 'Draft', color: 'text-zinc-400 bg-zinc-500/20', icon: Edit },
};

const TABS = [
  { id: 'all', label: 'All Listings' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'sold', label: 'Sold' },
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

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ListingCard({
  listing,
  onStatusChange,
  onRenew,
  onDelete,
}: {
  listing: any;
  onStatusChange: (id: string, status: string) => void;
  onRenew: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusConfig = STATUS_CONFIG[listing.status as ListingStatus] || STATUS_CONFIG.active;
  const StatusIcon = statusConfig.icon;

  const canRenew = () => {
    if (listing.status !== 'active' && listing.status !== 'expired') return false;
    const publishedAt = new Date(listing.publishedAt);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return publishedAt < oneWeekAgo;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
          {listing.images?.[0]?.url ? (
            <img
              src={listing.images[0].url}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-8 w-8 text-white/20" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <Link
              href={`/marketplace/${listing.id}`}
              className="truncate font-semibold text-white transition-colors hover:text-orange-400"
            >
              {listing.title}
            </Link>

            {/* Actions Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e] py-1 shadow-xl"
                  >
                    <Link
                      href={`/marketplace/${listing.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                      View Listing
                    </Link>
                    <Link
                      href={`/marketplace/${listing.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    {canRenew() && (
                      <button
                        onClick={() => {
                          onRenew(listing.id);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-white/5"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Renew Listing
                      </button>
                    )}
                    <div className="my-1 border-t border-white/10" />
                    <button
                      onClick={() => {
                        onDelete(listing.id);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-white/5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mb-2 text-lg font-bold text-orange-400">
            {formatPrice(listing.price, listing.currency)}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {listing._count?.favorites || 0} saves
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {listing._count?.offers || 0} offers
            </span>
          </div>
        </div>
      </div>

      {/* Status & Actions Row */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${statusConfig.color}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
            <ChevronDown className="h-3 w-3" />
          </button>

          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e] py-1 shadow-xl"
              >
                {(['active', 'pending', 'sold', 'traded', 'removed'] as const).map((status) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        onStatusChange(listing.id, status);
                        setShowStatusMenu(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 ${
                        listing.status === status ? 'bg-white/5' : ''
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${config.color.split(' ')[0]}`} />
                      <span className="text-white/70">{config.label}</span>
                      {listing.status === status && (
                        <Check className="ml-auto h-4 w-4 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            Listed {formatDate(listing.publishedAt || listing.createdAt)}
          </span>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showMenu || showStatusMenu) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowMenu(false);
            setShowStatusMenu(false);
          }}
        />
      )}
    </motion.div>
  );
}

export default function MyListingsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const utils = api.useUtils();

  const { data, isLoading, error } = api.marketplace.getMyListings.useQuery(
    { status: activeTab === 'all' ? undefined : activeTab },
    { enabled: !!session }
  );

  const updateStatusMutation = api.marketplace.updateListingStatus.useMutation({
    onSuccess: () => {
      utils.marketplace.getMyListings.invalidate();
    },
  });

  const renewMutation = api.marketplace.renewListing.useMutation({
    onSuccess: () => {
      utils.marketplace.getMyListings.invalidate();
    },
  });

  const deleteMutation = api.marketplace.deleteListing.useMutation({
    onSuccess: () => {
      utils.marketplace.getMyListings.invalidate();
      setDeleteConfirm(null);
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status: status as any });
  };

  const handleRenew = (id: string) => {
    renewMutation.mutate({ id });
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate({ id });
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-orange-500/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tl from-violet-500/15 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex flex-col items-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={120}
              height={49}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </button>
        </motion.div>

        {/* Title & Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">My Listings</h1>
            <p className="mt-1 text-white/60">Manage your gear for sale</p>
          </div>
          <Link
            href="/marketplace/create"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30"
          >
            <Plus className="h-5 w-5" />
            New Listing
          </Link>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                  : 'border border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Listings */}
        {isLoading ? (
          <ProjectsSkeleton count={4} />
        ) : error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-rose-400" />
            <p className="text-white/70">Failed to load listings. Please try again.</p>
          </div>
        ) : data?.listings?.length === 0 ? (
          <EmptyState
            type={activeTab === 'all' ? 'marketplace' : 'search'}
            title="No listings yet"
            description={
              activeTab === 'all'
                ? 'Start selling your gear to fellow musicians'
                : `No ${activeTab} listings`
            }
            actionLabel={activeTab === 'all' ? 'Create Your First Listing' : 'View All'}
            actionHref={activeTab === 'all' ? '/marketplace/create' : undefined}
            onAction={activeTab !== 'all' ? () => setActiveTab('all') : undefined}
          />
        ) : (
          <div className="space-y-4">
            {data?.listings?.map((listing: any) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onStatusChange={handleStatusChange}
                onRenew={handleRenew}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Toast */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 backdrop-blur-sm"
            >
              <p className="text-sm text-white">Click delete again to confirm</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
