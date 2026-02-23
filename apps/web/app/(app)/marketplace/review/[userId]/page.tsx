'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Star,
  User,
  Check,
  Plus,
  X,
  Loader2,
  Package,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc as api } from '@cronkwaters/trpc/client/react';

function StarInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hover || value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-white/20 hover:text-white/40'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WriteReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const revieweeId = params.userId as string;
  const listingId = searchParams.get('listing') || undefined;
  const urlTransactionType = (searchParams.get('type') || 'buyer_to_seller') as
    | 'buyer_to_seller'
    | 'seller_to_buyer';
  // Map URL types to Prisma enum values
  const transactionType: 'sale' | 'purchase' | 'trade' =
    urlTransactionType === 'buyer_to_seller' ? 'sale' : 'purchase';

  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [shippingRating, setShippingRating] = useState(0);
  const [paymentRating, setPaymentRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  // Fetch reviewee info
  const { data: reviewee } = api.marketplace.getUserMarketplaceProfile.useQuery(
    { userId: revieweeId },
    { enabled: !!revieweeId }
  );

  // Fetch listing info if provided
  const { data: listing } = api.marketplace.getListing.useQuery(
    { id: listingId || '' },
    { enabled: !!listingId }
  );

  const submitMutation = api.marketplace.submitReview.useMutation({
    onSuccess: () => {
      router.push(`/marketplace/seller/${revieweeId}`);
    },
  });

  const handleAddPro = () => {
    if (newPro.trim() && pros.length < 5) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const handleAddCon = () => {
    if (newCon.trim() && cons.length < 5) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0) {
      alert('Please select an overall rating');
      return;
    }

    if (content.length < 10) {
      alert('Please write at least 10 characters in your review');
      return;
    }

    submitMutation.mutate({
      revieweeId,
      listingId,
      transactionType,
      overallRating,
      communicationRating: communicationRating || undefined,
      accuracyRating:
        urlTransactionType === 'buyer_to_seller' ? accuracyRating || undefined : undefined,
      shippingRating: shippingRating || undefined,
      paymentRating:
        urlTransactionType === 'seller_to_buyer' ? paymentRating || undefined : undefined,
      title: title || undefined,
      content,
      pros: pros.length > 0 ? pros : undefined,
      cons: cons.length > 0 ? cons : undefined,
    });
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

  if (session.user?.id === revieweeId) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
      >
        <div className="text-center">
          <Star className="mx-auto mb-4 h-16 w-16 text-white/20" />
          <h2 className="mb-2 text-xl font-semibold text-white">Cannot review yourself</h2>
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
        <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-linear-to-br from-amber-500/15 to-transparent blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-linear-to-tl from-violet-500/15 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
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

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {urlTransactionType === 'buyer_to_seller' ? 'Review Seller' : 'Review Buyer'}
          </h1>
          <p className="mt-1 text-white/60">Share your experience to help the community</p>
        </motion.div>

        {/* Reviewee Card */}
        {reviewee && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 rounded-xl border border-white/10 bg-white/3 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-orange-500 to-amber-500">
                {reviewee.image ? (
                  <img src={reviewee.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-white">{reviewee.name}</div>
                {listing && (
                  <Link
                    href={`/marketplace/${listing.id}`}
                    className="flex items-center gap-1.5 text-sm text-orange-400 hover:underline"
                  >
                    <Package className="h-3.5 w-3.5" />
                    {listing.title}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Review Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Overall Rating */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <h2 className="mb-4 font-semibold text-white">Overall Rating</h2>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= overallRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 text-center text-sm text-white/50">
              {overallRating === 0 && 'Select a rating'}
              {overallRating === 1 && 'Poor'}
              {overallRating === 2 && 'Fair'}
              {overallRating === 3 && 'Good'}
              {overallRating === 4 && 'Very Good'}
              {overallRating === 5 && 'Excellent'}
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <h2 className="mb-4 font-semibold text-white">Detailed Ratings (Optional)</h2>
            <div className="space-y-4">
              <StarInput
                value={communicationRating}
                onChange={setCommunicationRating}
                label="Communication"
              />
              {urlTransactionType === 'buyer_to_seller' && (
                <StarInput
                  value={accuracyRating}
                  onChange={setAccuracyRating}
                  label="Item as Described"
                />
              )}
              <StarInput
                value={shippingRating}
                onChange={setShippingRating}
                label="Shipping / Packaging"
              />
              {urlTransactionType === 'seller_to_buyer' && (
                <StarInput
                  value={paymentRating}
                  onChange={setPaymentRating}
                  label="Payment Promptness"
                />
              )}
            </div>
          </div>

          {/* Written Review */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <h2 className="mb-4 font-semibold text-white">Your Review</h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-white/70">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={100}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-orange-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Review</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with this transaction..."
                rows={5}
                maxLength={2000}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-orange-500/50"
                required
              />
              <div className="mt-1 text-right text-xs text-white/40">{content.length}/2000</div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <h2 className="mb-4 font-semibold text-white">Pros & Cons (Optional)</h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Pros */}
              <div>
                <label className="mb-2 block text-sm text-emerald-400">Pros</label>
                <div className="space-y-2">
                  {pros.map((pro, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400"
                    >
                      <Check className="h-4 w-4" />
                      <span className="flex-1">{pro}</span>
                      <button type="button" onClick={() => setPros(pros.filter((_, j) => j !== i))}>
                        <X className="h-4 w-4 text-emerald-400/50 hover:text-emerald-400" />
                      </button>
                    </div>
                  ))}
                  {pros.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPro}
                        onChange={(e) => setNewPro(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
                        placeholder="Add a pro"
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-hidden focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={handleAddPro}
                        className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400 hover:bg-emerald-500/30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cons */}
              <div>
                <label className="mb-2 block text-sm text-rose-400">Cons</label>
                <div className="space-y-2">
                  {cons.map((con, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400"
                    >
                      <span className="h-4 w-4 text-center">-</span>
                      <span className="flex-1">{con}</span>
                      <button type="button" onClick={() => setCons(cons.filter((_, j) => j !== i))}>
                        <X className="h-4 w-4 text-rose-400/50 hover:text-rose-400" />
                      </button>
                    </div>
                  ))}
                  {cons.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCon}
                        onChange={(e) => setNewCon(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
                        placeholder="Add a con"
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-hidden focus:border-rose-500/50"
                      />
                      <button
                        type="button"
                        onClick={handleAddCon}
                        className="rounded-lg bg-rose-500/20 p-2 text-rose-400 hover:bg-rose-500/30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending || overallRating === 0 || content.length < 10}
              className="flex-1 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>

          {submitMutation.error && (
            <div className="rounded-lg bg-rose-500/10 p-3 text-center text-sm text-rose-400">
              {submitMutation.error.message}
            </div>
          )}
        </motion.form>
      </div>
    </div>
  );
}
