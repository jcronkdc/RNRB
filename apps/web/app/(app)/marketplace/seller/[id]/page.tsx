'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  User,
  Check,
  Shield,
  Package,
  MessageSquare,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Flag,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc as api } from '@cronkwaters/trpc/client/react';

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-right text-sm text-white/60">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-400 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-sm text-white/40">{count}</span>
    </div>
  );
}

function ReviewCard({
  review,
  onVote,
}: {
  review: any;
  onVote: (reviewId: string, isHelpful: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-orange-500 to-amber-500">
            {review.reviewer?.image ? (
              <img src={review.reviewer.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <div className="font-medium text-white">{review.reviewer?.name || 'Anonymous'}</div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="capitalize">{review.transactionType.replace('_', ' ')}</span>
              <span>•</span>
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        <StarRating rating={review.overallRating} />
      </div>

      {review.title && <h4 className="mb-2 font-semibold text-white">{review.title}</h4>}

      <p className="whitespace-pre-wrap text-sm text-white/70">{review.content}</p>

      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {review.pros?.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-emerald-400">Pros</div>
              <ul className="space-y-1">
                {review.pros.map((pro: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-white/60">
                    <Check className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons?.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-rose-400">Cons</div>
              <ul className="space-y-1">
                {review.cons.map((con: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-white/60">
                    <span className="mt-0.5 h-3.5 w-3.5 text-rose-400">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {review.listing && (
        <Link
          href={`/marketplace/${review.listing.id}`}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-orange-400 hover:underline"
        >
          <Package className="h-3.5 w-3.5" />
          {review.listing.title}
        </Link>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="text-xs text-white/40">{review.helpfulCount || 0} found this helpful</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Helpful?</span>
          <button
            onClick={() => onVote(review.id, true)}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-emerald-400"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onVote(review.id, false)}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-rose-400"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const sellerId = params.id as string;

  const [reviewType, setReviewType] = useState<'received' | 'given'>('received');

  // Fetch seller profile
  const { data: profile, isLoading: loadingProfile } =
    api.marketplace.getUserMarketplaceProfile.useQuery(
      { userId: sellerId },
      { enabled: !!sellerId }
    );

  // Fetch reviews
  const { data: reviewsData, isLoading: loadingReviews } = api.marketplace.getUserReviews.useQuery(
    { userId: sellerId, type: reviewType },
    { enabled: !!sellerId }
  );

  // Fetch user's listings
  const { data: listingsData } = api.marketplace.getListings.useQuery(
    { limit: 6 },
    { enabled: !!sellerId }
  );

  const utils = api.useUtils();

  const voteMutation = api.marketplace.voteReview.useMutation({
    onSuccess: () => {
      utils.marketplace.getUserReviews.invalidate();
    },
  });

  const handleVote = (reviewId: string, isHelpful: boolean) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    voteMutation.mutate({ reviewId, isHelpful });
  };

  const totalReviews = profile?.sellerRatingCount || 0;
  const avgRating = profile?.sellerRating ? Number(profile.sellerRating) : 0;

  if (loadingProfile) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
      >
        <div className="text-center">
          <User className="mx-auto mb-4 h-16 w-16 text-white/20" />
          <h2 className="mb-2 text-xl font-semibold text-white">User not found</h2>
          <Link href="/marketplace" className="text-orange-400 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-linear-to-br from-orange-500/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-linear-to-tl from-violet-500/15 to-transparent blur-3xl" />
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
            Back
          </button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/3 p-6"
        >
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-orange-500 to-amber-500">
                {profile.image ? (
                  <img src={profile.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1.5">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                {profile.verificationLevel !== 'none' && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    <Shield className="h-3.5 w-3.5" />
                    Verified Seller
                  </span>
                )}
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-sm text-white/60 sm:justify-start">
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={Math.round(avgRating)} size="sm" />
                    <span className="font-medium text-white">{avgRating.toFixed(1)}</span>
                    <span>({totalReviews} reviews)</span>
                  </div>
                )}
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {(profile as any).successfulSales || 0} successful sales
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {formatDate(profile.createdAt)}
                </span>
              </div>

              {/* Actions */}
              {session?.user?.id !== sellerId && (
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Link
                    href={`/marketplace/messages?to=${sellerId}`}
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 px-5 py-2.5 font-medium text-white"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </Link>
                  <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-white/70 hover:bg-white/10">
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Rating Breakdown */}
        {totalReviews > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-2xl border border-white/10 bg-white/3 p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">Rating Breakdown</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-2 text-5xl font-bold text-white">{avgRating.toFixed(1)}</div>
                <StarRating rating={Math.round(avgRating)} size="lg" />
                <div className="mt-2 text-sm text-white/50">{totalReviews} total reviews</div>
              </div>
              <div className="space-y-2">
                <RatingBar
                  label="5"
                  count={profile.ratingBreakdown?.[5] || 0}
                  total={totalReviews}
                />
                <RatingBar
                  label="4"
                  count={profile.ratingBreakdown?.[4] || 0}
                  total={totalReviews}
                />
                <RatingBar
                  label="3"
                  count={profile.ratingBreakdown?.[3] || 0}
                  total={totalReviews}
                />
                <RatingBar
                  label="2"
                  count={profile.ratingBreakdown?.[2] || 0}
                  total={totalReviews}
                />
                <RatingBar
                  label="1"
                  count={profile.ratingBreakdown?.[1] || 0}
                  total={totalReviews}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Reviews</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setReviewType('received')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  reviewType === 'received'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Received
              </button>
              <button
                onClick={() => setReviewType('given')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  reviewType === 'given'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Given
              </button>
            </div>
          </div>

          {loadingReviews ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
            </div>
          ) : reviewsData?.reviews?.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/3 p-12 text-center">
              <Star className="mx-auto mb-3 h-12 w-12 text-white/20" />
              <p className="text-white/50">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsData?.reviews?.map((review: any) => (
                <ReviewCard key={review.id} review={review} onVote={handleVote} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
