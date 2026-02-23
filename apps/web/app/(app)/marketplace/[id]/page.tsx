'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  Tag,
  Repeat,
  DollarSign,
  Shield,
  Package,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Check,
  AlertTriangle,
  Loader2,
  Flag,
  X,
  Star,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc as api } from '@cronkwaters/trpc/client/react';

function formatPrice(price: number | { toNumber?: () => number } | null | undefined, currency: string = 'USD'): string {
  if (price && typeof price === 'object' && 'toNumber' in price) price = price.toNumber?.() ?? null;
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
      return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    case 'excellent':
      return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    case 'good':
      return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'fair':
      return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'poor':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
}

function getConditionDescription(condition: string): string {
  switch (condition) {
    case 'mint':
      return 'Like new, barely used';
    case 'excellent':
      return 'Minor cosmetic wear only';
    case 'good':
      return 'Normal wear, fully functional';
    case 'fair':
      return 'Shows wear, works fine';
    case 'poor':
      return 'Needs work/repair';
    default:
      return '';
  }
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const listingId = params.id as string;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerType, setOfferType] = useState<'cash' | 'trade' | 'cash_plus_trade'>('cash');
  const [tradeItems, setTradeItems] = useState('');
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState('');

  // Fetch listing data
  const {
    data: listing,
    isLoading,
    error,
  } = api.marketplace.getListing.useQuery({ id: listingId }, { enabled: !!listingId });

  // Check if favorited
  const { data: favoriteStatus } = api.marketplace.isFavorited.useQuery(
    { listingId },
    { enabled: !!listingId && !!session }
  );

  // Mutations
  const toggleFavoriteMutation = api.marketplace.toggleFavorite.useMutation();
  const makeOfferMutation = api.marketplace.makeOffer.useMutation({
    onSuccess: () => {
      setShowOfferModal(false);
      setOfferAmount('');
      setOfferMessage('');
    },
  });
  const reportMutation = api.marketplace.reportListing.useMutation({
    onSuccess: () => {
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
      alert('Report submitted. Thank you for helping keep our marketplace safe.');
    },
    onError: (error) => {
      alert(error.message || 'Failed to submit report');
    },
  });

  const handleToggleFavorite = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    toggleFavoriteMutation.mutate({ listingId });
  };

  const handleMakeOffer = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    makeOfferMutation.mutate({
      listingId,
      offerType,
      amount: offerAmount ? parseFloat(offerAmount) : undefined,
      tradeItems: tradeItems || undefined,
      message: offerMessage || undefined,
    });
  };

  const handleReport = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!reportReason || reportDescription.length < 10) {
      alert('Please select a reason and provide a description (at least 10 characters)');
      return;
    }

    reportMutation.mutate({
      listingId,
      reason: reportReason as any,
      description: reportDescription,
    });
  };

  const isFavorited = favoriteStatus?.favorited || toggleFavoriteMutation.data?.favorited;

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          <div className="text-white/60">Loading listing...</div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-white/20" />
          <h2 className="mb-2 text-xl font-semibold text-white">Listing not found</h2>
          <p className="mb-4 text-white/60">This listing may have been removed or doesn't exist.</p>
          <Link href="/marketplace" className="text-brand-primary hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const isOwner = session?.user?.id === listing.sellerId;

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-purple-500/10 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Back Button */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {listing.images.length > 0 ? (
                <img
                  src={listing.images[currentImageIndex]?.url}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent" />
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-24 w-24 text-white/20" />
                  </div>
                </>
              )}

              {/* Image Navigation */}
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {listing.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-brand-primary'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title & Actions */}
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-medium capitalize ${getConditionColor(listing.condition)}`}
                >
                  {listing.condition}
                </span>
                {listing.listingType === 'trade' && (
                  <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-400">
                    <Repeat className="h-3 w-3" />
                    Trade Only
                  </span>
                )}
                {listing.listingType === 'both' && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
                    <Tag className="h-3 w-3" />
                    Sale or Trade
                  </span>
                )}
              </div>

              <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">{listing.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.viewCount} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {listing._count?.favorites || 0} saves
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <div className="text-3xl font-bold text-white">
                  {formatPrice(listing.price, listing.currency)}
                </div>
                {listing.acceptsOffers && (
                  <span className="text-sm text-emerald-400">or best offer</span>
                )}
              </div>

              {!isOwner && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 py-3 text-center font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:shadow-xl hover:shadow-brand-primary/30"
                  >
                    {listing.acceptsOffers ? 'Make an Offer' : 'Contact Seller'}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleToggleFavorite}
                      disabled={toggleFavoriteMutation.isPending}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 font-medium transition-all ${
                        isFavorited
                          ? 'border-red-500/50 bg-red-500/10 text-red-400'
                          : 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                      {isFavorited ? 'Saved' : 'Save'}
                    </button>
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-white transition-all hover:border-white/20 hover:bg-white/10">
                      <Share2 className="h-5 w-5" />
                      Share
                    </button>
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="space-y-3">
                  <Link
                    href={`/marketplace/${listing.id}/edit`}
                    className="block w-full rounded-xl bg-white/10 py-3 text-center font-medium text-white hover:bg-white/20"
                  >
                    Edit Listing
                  </Link>
                  <Link
                    href="/marketplace/my-listings"
                    className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center font-medium text-white hover:bg-white/10"
                  >
                    Manage All Listings
                  </Link>
                  <p className="text-center text-sm text-white/50">This is your listing</p>
                </div>
              )}
            </div>

            {/* Shipping & Pickup */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-3 font-semibold text-white">Shipping & Pickup</h3>
              <div className="space-y-2 text-sm">
                {listing.localPickup && (
                  <div className="flex items-center gap-2 text-white/70">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Local pickup available{listing.location && ` in ${listing.location}`}
                  </div>
                )}
                {listing.shipsTo && listing.shipsTo.length > 0 && (
                  <div className="flex items-center gap-2 text-white/70">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Ships to: {listing.shipsTo.join(', ')}
                    {listing.shippingCost && (
                      <span className="text-white/50">
                        (+{formatPrice(listing.shippingCost)} shipping)
                      </span>
                    )}
                  </div>
                )}
                {!listing.localPickup && (!listing.shipsTo || listing.shipsTo.length === 0) && (
                  <div className="text-white/50">Contact seller for shipping options</div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-4 font-semibold text-white">Seller</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-orange-500">
                  {listing.seller?.image ? (
                    <img
                      src={listing.seller.image}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-white" />
                  )}
                  {(listing.seller as any)?.isVerified && (
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {listing.seller?.name || 'Anonymous'}
                    </span>
                    {(listing.seller as any)?.isVerified && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-medium text-emerald-400">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    {(listing.seller as any)?.marketplaceSellerRating && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {Number((listing.seller as any).marketplaceSellerRating).toFixed(1)}
                        <span className="text-white/40">
                          ({(listing.seller as any).marketplaceReviewCount || 0})
                        </span>
                      </span>
                    )}
                    <span>•</span>
                    <span>{listing.seller?._count?.marketplaceListings || 0} listings</span>
                  </div>
                  <div className="text-xs text-white/40">
                    Member since {listing.seller?.createdAt && formatDate(listing.seller.createdAt)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                {!isOwner && (
                  <>
                    <Link
                      href={`/marketplace/messages?listing=${listing.id}&to=${listing.sellerId}`}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-center text-sm font-medium text-white hover:border-white/20 hover:bg-white/10"
                    >
                      Message
                    </Link>
                    <Link
                      href={`/marketplace/seller/${listing.sellerId}`}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-center text-sm font-medium text-white hover:border-white/20 hover:bg-white/10"
                    >
                      View Profile
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Description & Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid gap-8 lg:grid-cols-3"
        >
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Description</h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-white/70">{listing.description}</div>
              </div>

              {listing.tradeFor && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-purple-400">
                    <Repeat className="h-4 w-4" />
                    Open to trade for:
                  </h4>
                  <p className="text-white/70">{listing.tradeFor}</p>
                </div>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Specifications</h3>
              <dl className="space-y-3 text-sm">
                {listing.brand && (
                  <div className="flex justify-between">
                    <dt className="text-white/50">Brand</dt>
                    <dd className="font-medium text-white">{listing.brand}</dd>
                  </div>
                )}
                {listing.model && (
                  <div className="flex justify-between">
                    <dt className="text-white/50">Model</dt>
                    <dd className="font-medium text-white">{listing.model}</dd>
                  </div>
                )}
                {listing.year && (
                  <div className="flex justify-between">
                    <dt className="text-white/50">Year</dt>
                    <dd className="font-medium text-white">{listing.year}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-white/50">Category</dt>
                  <dd className="font-medium capitalize text-white">{listing.category}</dd>
                </div>
                {listing.serialNumber && (
                  <div className="flex justify-between">
                    <dt className="text-white/50">Serial</dt>
                    <dd className="font-medium text-white">{listing.serialNumber}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Condition</h3>
              <div
                className={`mb-3 inline-block rounded-full border px-3 py-1 text-sm font-medium capitalize ${getConditionColor(listing.condition)}`}
              >
                {listing.condition}
              </div>
              <p className="mb-2 text-sm text-white/60">
                {getConditionDescription(listing.condition)}
              </p>
              {listing.conditionNotes && (
                <p className="text-sm text-white/70">{listing.conditionNotes}</p>
              )}
            </div>

            {/* Safety Tips */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-amber-400">
                <Shield className="h-5 w-5" />
                <h3 className="font-semibold">Safety Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/60" />
                  Meet in public places for local transactions
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/60" />
                  Use secure payment methods
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/60" />
                  Verify item condition before completing purchase
                </li>
              </ul>

              {/* Report Button */}
              {!isOwner && session && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-white/50 transition-colors hover:border-rose-500/30 hover:text-rose-400"
                >
                  <Flag className="h-4 w-4" />
                  Report this listing
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--surface)] p-6"
          >
            <h3 className="mb-4 text-xl font-semibold text-white">Make an Offer</h3>

            {/* Offer Type */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-white/70">Offer Type</label>
              <div className="flex gap-2">
                {(['cash', 'trade', 'cash_plus_trade'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOfferType(type)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      offerType === type
                        ? 'bg-brand-primary/20 text-brand-primary'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {type === 'cash' ? 'Cash' : type === 'trade' ? 'Trade' : 'Cash + Trade'}
                  </button>
                ))}
              </div>
            </div>

            {(offerType === 'cash' || offerType === 'cash_plus_trade') && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-white/70">Your Offer</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                {listing.price && (
                  <p className="mt-1 text-xs text-white/50">
                    Asking price: {formatPrice(listing.price)}
                  </p>
                )}
              </div>
            )}

            {(offerType === 'trade' || offerType === 'cash_plus_trade') && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-white/70">Trade Items</label>
                <textarea
                  value={tradeItems}
                  onChange={(e) => setTradeItems(e.target.value)}
                  placeholder="Describe what you're offering to trade..."
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-white/70">
                Message (optional)
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Add a message to the seller..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleMakeOffer}
                disabled={makeOfferMutation.isPending || (offerType !== 'trade' && !offerAmount)}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                {makeOfferMutation.isPending ? 'Sending...' : 'Send Offer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--surface)] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Report Listing</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-white/60">
              Help keep our marketplace safe. Reports are reviewed by our team and kept
              confidential.
            </p>

            {/* Report Reason */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-white/70">
                Reason for report
              </label>
              <div className="grid gap-2">
                {[
                  { id: 'scam', label: 'Suspected scam or fraud' },
                  { id: 'fake_item', label: 'Counterfeit or fake item' },
                  { id: 'inappropriate', label: 'Inappropriate content' },
                  { id: 'harassment', label: 'Harassment or abuse' },
                  { id: 'spam', label: 'Spam or duplicate listing' },
                  { id: 'other', label: 'Other concern' },
                ].map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setReportReason(reason.id)}
                    className={`rounded-lg border p-3 text-left text-sm transition-all ${
                      reportReason === reason.id
                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-white/70">
                Please describe the issue (required)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide details about why you're reporting this listing..."
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 outline-none focus:border-rose-500/50"
              />
              <p className="mt-1 text-xs text-white/40">
                Minimum 10 characters. {reportDescription.length}/10
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={
                  reportMutation.isPending || !reportReason || reportDescription.length < 10
                }
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
