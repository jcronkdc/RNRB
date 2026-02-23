'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  X,
  DollarSign,
  MapPin,
  Package,
  Tag,
  Repeat,
  Check,
  Loader2,
  Camera,
  Trash2,
  AlertTriangle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc as api } from '@cronkwaters/trpc/client/react';

const CATEGORIES = [
  { id: 'guitar', name: 'Guitars', subcategories: ['Electric', 'Acoustic', 'Bass', 'Classical'] },
  { id: 'bass', name: 'Bass', subcategories: ['Electric', 'Acoustic', 'Upright'] },
  {
    id: 'drums',
    name: 'Drums',
    subcategories: ['Acoustic Kits', 'Electronic', 'Cymbals', 'Hardware', 'Snares'],
  },
  {
    id: 'keys',
    name: 'Keys & Synths',
    subcategories: ['Synthesizers', 'Keyboards', 'Pianos', 'Organs', 'MIDI Controllers'],
  },
  {
    id: 'amps',
    name: 'Amps',
    subcategories: ['Guitar Amps', 'Bass Amps', 'Heads', 'Cabinets', 'Combos'],
  },
  {
    id: 'fx',
    name: 'Effects & Pedals',
    subcategories: ['Overdrive/Distortion', 'Delay', 'Reverb', 'Modulation', 'Multi-FX'],
  },
  {
    id: 'mics',
    name: 'Microphones',
    subcategories: ['Dynamic', 'Condenser', 'Ribbon', 'USB', 'Wireless'],
  },
  {
    id: 'studio',
    name: 'Studio Gear',
    subcategories: ['Interfaces', 'Preamps', 'Monitors', 'Headphones', 'Outboard'],
  },
  {
    id: 'other',
    name: 'Other',
    subcategories: ['Cases', 'Cables', 'Accessories', 'Merchandise', 'Misc'],
  },
];

const CONDITIONS = [
  { id: 'mint', name: 'Mint', description: 'Like new, barely used' },
  { id: 'excellent', name: 'Excellent', description: 'Minor cosmetic wear only' },
  { id: 'good', name: 'Good', description: 'Normal wear, fully functional' },
  { id: 'fair', name: 'Fair', description: 'Shows wear, works fine' },
  { id: 'poor', name: 'Poor', description: 'Needs work/repair' },
  { id: 'parts', name: 'For Parts', description: 'For parts only' },
];

const LISTING_TYPES = [
  { id: 'sell', name: 'For Sale', icon: DollarSign, description: 'Sell for cash' },
  { id: 'trade', name: 'For Trade', icon: Repeat, description: 'Trade for other gear' },
  { id: 'both', name: 'Sale or Trade', icon: Tag, description: 'Open to either' },
];

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const listingId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch listing data
  const {
    data: listing,
    isLoading,
    error,
  } = api.marketplace.getListing.useQuery({ id: listingId }, { enabled: !!listingId });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    year: '',
    serialNumber: '',
    condition: 'good',
    conditionNotes: '',
    listingType: 'sell',
    price: '',
    acceptsOffers: true,
    tradeFor: '',
    tradeValue: '',
    location: '',
    shipsTo: ['US'],
    localPickup: true,
    shippingCost: '',
  });

  // Populate form when listing loads
  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || '',
        subcategory: listing.subcategory || '',
        brand: listing.brand || '',
        model: listing.model || '',
        year: listing.year?.toString() || '',
        serialNumber: listing.serialNumber || '',
        condition: listing.condition || 'good',
        conditionNotes: listing.conditionNotes || '',
        listingType: listing.listingType || 'sell',
        price: listing.price?.toString() || '',
        acceptsOffers: listing.acceptsOffers ?? true,
        tradeFor: listing.tradeFor || '',
        tradeValue: listing.tradeValue?.toString() || '',
        location: listing.location || '',
        shipsTo: listing.shipsTo || ['US'],
        localPickup: listing.localPickup ?? true,
        shippingCost: listing.shippingCost?.toString() || '',
      });
    }
  }, [listing]);

  const utils = api.useUtils();

  const updateMutation = api.marketplace.updateListing.useMutation({
    onSuccess: () => {
      utils.marketplace.getListing.invalidate({ id: listingId });
      router.push(`/marketplace/${listingId}`);
    },
    onError: (error) => {
      console.error('Failed to update listing:', error);
      setIsSubmitting(false);
    },
  });

  const deleteMutation = api.marketplace.deleteListing.useMutation({
    onSuccess: () => {
      router.push('/marketplace/my-listings');
    },
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    updateMutation.mutate({
      id: listingId,
      data: {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        serialNumber: formData.serialNumber || undefined,
        condition: formData.condition as any,
        conditionNotes: formData.conditionNotes || undefined,
        listingType: formData.listingType as any,
        price: formData.price ? parseFloat(formData.price) : undefined,
        acceptsOffers: formData.acceptsOffers,
        tradeFor: formData.tradeFor || undefined,
        tradeValue: formData.tradeValue ? parseFloat(formData.tradeValue) : undefined,
        location: formData.location || undefined,
        shipsTo: formData.shipsTo,
        localPickup: formData.localPickup,
        shippingCost: formData.shippingCost ? parseFloat(formData.shippingCost) : undefined,
      },
    });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate({ id: listingId });
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === formData.category);

  // Check ownership
  const isOwner = session?.user?.id === listing?.sellerId;

  if (sessionStatus === 'loading' || isLoading) {
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

  if (error || !listing) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
      >
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-white/20" />
          <h2 className="mb-2 text-xl font-semibold text-white">Listing not found</h2>
          <Link href="/marketplace" className="text-orange-400 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
      >
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-rose-400" />
          <h2 className="mb-2 text-xl font-semibold text-white">Access Denied</h2>
          <p className="mb-4 text-white/60">You can only edit your own listings</p>
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
        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-orange-500/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tl from-violet-500/15 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8">
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
            Back to Listing
          </button>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Listing</h1>
          <p className="mt-1 text-white/60">Update your listing details</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      updateField('category', e.target.value);
                      updateField('subcategory', '');
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-orange-500/50"
                    required
                  >
                    <option value="" className="bg-gray-900">
                      Select category
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-gray-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Subcategory</label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => updateField('subcategory', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-orange-500/50"
                    >
                      <option value="" className="bg-gray-900">
                        Select subcategory
                      </option>
                      {selectedCategory.subcategories.map((sub) => (
                        <option key={sub} value={sub.toLowerCase()} className="bg-gray-900">
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => updateField('brand', e.target.value)}
                    placeholder="e.g., Fender"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => updateField('model', e.target.value)}
                    placeholder="e.g., Stratocaster"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => updateField('year', e.target.value)}
                    placeholder="e.g., 1965"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Condition</label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => updateField('condition', cond.id)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        formData.condition === cond.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`font-medium ${formData.condition === cond.id ? 'text-orange-400' : 'text-white'}`}
                      >
                        {cond.name}
                      </div>
                      <div className="text-xs text-white/50">{cond.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your item in detail..."
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Pricing</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Listing Type</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {LISTING_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateField('listingType', type.id)}
                      className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                        formData.listingType === type.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <type.icon
                        className={`h-5 w-5 ${formData.listingType === type.id ? 'text-orange-400' : 'text-white/60'}`}
                      />
                      <div className="text-left">
                        <div
                          className={`font-medium ${formData.listingType === type.id ? 'text-orange-400' : 'text-white'}`}
                        >
                          {type.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {(formData.listingType === 'sell' || formData.listingType === 'both') && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateField('price', e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.acceptsOffers}
                        onChange={(e) => updateField('acceptsOffers', e.target.checked)}
                        className="h-5 w-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50"
                      />
                      <span className="text-sm text-white/70">Accept offers</span>
                    </label>
                  </div>
                </div>
              )}

              {(formData.listingType === 'trade' || formData.listingType === 'both') && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    What would you trade for?
                  </label>
                  <textarea
                    value={formData.tradeFor}
                    onChange={(e) => updateField('tradeFor', e.target.value)}
                    placeholder="Describe what you're looking for in a trade..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location & Shipping */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Location & Shipping</h2>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="City, State"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Shipping Cost</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <input
                      type="number"
                      value={formData.shippingCost}
                      onChange={(e) => updateField('shippingCost', e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.localPickup}
                    onChange={(e) => updateField('localPickup', e.target.checked)}
                    className="h-5 w-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50"
                  />
                  <span className="text-sm text-white/70">Local pickup available</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-all ${
                showDeleteConfirm
                  ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-rose-500/50 hover:text-rose-400'
              }`}
            >
              <Trash2 className="h-5 w-5" />
              {deleteMutation.isPending
                ? 'Deleting...'
                : showDeleteConfirm
                  ? 'Click again to confirm'
                  : 'Delete Listing'}
            </button>

            <div className="flex gap-3">
              <Link
                href={`/marketplace/${listingId}`}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white hover:bg-white/10"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
