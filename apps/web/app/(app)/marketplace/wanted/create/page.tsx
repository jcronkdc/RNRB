'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  MapPin,
  Repeat,
  Info,
  Check,
  Loader2,
  Megaphone,
  AlertCircle,
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
];

const URGENCY_OPTIONS = [
  { id: 'urgent', name: '🔥 Urgent', description: 'Need it ASAP' },
  { id: 'normal', name: 'Normal', description: 'No rush, but actively looking' },
  { id: 'flexible', name: 'Flexible', description: 'Will wait for the right deal' },
];

export default function CreateWantedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    yearMin: '',
    yearMax: '',
    minCondition: '',
    budgetMin: '',
    budgetMax: '',
    hasTradeOffer: false,
    tradeDescription: '',
    tradeValue: '',
    location: '',
    willingToTravel: '',
    acceptsShipping: true,
    urgency: 'normal',
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const createWantedMutation = api.marketplace.createWantedPost.useMutation({
    onSuccess: (data) => {
      router.push(`/marketplace/wanted/${data.id}`);
    },
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category) return;

    createWantedMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      subcategory: formData.subcategory || undefined,
      brand: formData.brand || undefined,
      model: formData.model || undefined,
      yearMin: formData.yearMin ? parseInt(formData.yearMin) : undefined,
      yearMax: formData.yearMax ? parseInt(formData.yearMax) : undefined,
      minCondition: formData.minCondition || undefined,
      budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
      budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
      hasTradeOffer: formData.hasTradeOffer,
      tradeDescription: formData.tradeDescription || undefined,
      tradeValue: formData.tradeValue ? parseFloat(formData.tradeValue) : undefined,
      location: formData.location || undefined,
      willingToTravel: formData.willingToTravel ? parseInt(formData.willingToTravel) : undefined,
      acceptsShipping: formData.acceptsShipping,
      urgency: formData.urgency as 'urgent' | 'normal' | 'flexible',
    });
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === formData.category);

  const canSubmit = formData.title && formData.description && formData.category;

  if (!session) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-400" />
          <h2 className="mb-2 text-xl font-semibold text-white">Sign in required</h2>
          <p className="mb-4 text-white/60">You need to be signed in to post a wanted ad.</p>
          <Link href="/auth/signin" className="text-brand-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-amber-500/10 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="mx-auto max-w-3xl px-4 py-6">
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
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/20 p-3">
              <Megaphone className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Post What You're Looking For
              </h1>
              <p className="text-white/60">Let sellers come to you</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                What are you looking for? *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., 1960s Fender Stratocaster, any color"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Details *</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe exactly what you're looking for. Be specific about must-haves vs nice-to-haves..."
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
              />
            </div>

            {/* Category */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    updateField('category', e.target.value);
                    updateField('subcategory', '');
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-primary/50"
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
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-primary/50"
                  >
                    <option value="" className="bg-gray-900">
                      Any
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

            {/* Brand & Model */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Preferred Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  placeholder="e.g., Fender, Gibson, any"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="e.g., Stratocaster"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                />
              </div>
            </div>

            {/* Year Range */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Year (from)</label>
                <input
                  type="number"
                  value={formData.yearMin}
                  onChange={(e) => updateField('yearMin', e.target.value)}
                  placeholder="e.g., 1960"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Year (to)</label>
                <input
                  type="number"
                  value={formData.yearMax}
                  onChange={(e) => updateField('yearMax', e.target.value)}
                  placeholder="e.g., 1969"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                />
              </div>
            </div>

            {/* Minimum Condition */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Minimum Condition</label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() =>
                      updateField('minCondition', formData.minCondition === cond.id ? '' : cond.id)
                    }
                    className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                      formData.minCondition === cond.id
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                    }`}
                  >
                    {cond.name}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-white/40">
                Leave empty if any condition is acceptable
              </p>
            </div>

            {/* Budget */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Budget Range</label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => updateField('budgetMin', e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => updateField('budgetMax', e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Trade Offer */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.hasTradeOffer}
                  onChange={(e) => updateField('hasTradeOffer', e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                />
                <div>
                  <span className="font-medium text-white">I have gear to trade</span>
                  <p className="text-xs text-white/50">Let sellers know you're open to trades</p>
                </div>
              </label>

              {formData.hasTradeOffer && (
                <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      What do you have to trade?
                    </label>
                    <textarea
                      value={formData.tradeDescription}
                      onChange={(e) => updateField('tradeDescription', e.target.value)}
                      placeholder="Describe the gear you're offering..."
                      rows={2}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Estimated trade value
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="number"
                        value={formData.tradeValue}
                        onChange={(e) => updateField('tradeValue', e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Your Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="City, State"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Willing to travel (miles)
                </label>
                <input
                  type="number"
                  value={formData.willingToTravel}
                  onChange={(e) => updateField('willingToTravel', e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-brand-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.acceptsShipping}
                  onChange={(e) => updateField('acceptsShipping', e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-white/5 text-brand-primary focus:ring-brand-primary/50"
                />
                <span className="text-sm text-white/70">I accept shipped items</span>
              </label>
            </div>

            {/* Urgency */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                How urgent is this?
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {URGENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('urgency', opt.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      formData.urgency === opt.id
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`font-medium ${formData.urgency === opt.id ? 'text-brand-primary' : 'text-white'}`}
                    >
                      {opt.name}
                    </div>
                    <div className="text-xs text-white/50">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || createWantedMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createWantedMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Megaphone className="h-5 w-5" />
                  Post Wanted Ad
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
