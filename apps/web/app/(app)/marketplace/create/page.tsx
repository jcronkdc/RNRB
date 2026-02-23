'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Upload,
  X,
  DollarSign,
  MapPin,
  Package,
  Tag,
  Repeat,
  Info,
  Check,
  Loader2,
  Camera,
  Plus,
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

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [images, setImages] = useState<{ id: string; url: string; file?: File }[]>([]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), url: e.target?.result as string, file },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const createListingMutation = api.marketplace.createListing.useMutation({
    onSuccess: (data) => {
      router.push(`/marketplace/${data.id}`);
    },
    onError: (error) => {
      console.error('Failed to create listing:', error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);

    createListingMutation.mutate({
      title: formData.title,
      description: formData.description || 'No description provided',
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
    });
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === formData.category);

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.category && formData.condition;
      case 2:
        return images.length > 0;
      case 3:
        return formData.listingType === 'trade' || formData.price;
      default:
        return true;
    }
  };

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-linear-to-br from-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-linear-to-tl from-purple-500/10 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* RR Logo */}
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
          <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">List Your Gear</h1>
          <p className="mb-8 text-white/60">
            Create a listing to sell or trade your music equipment
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {['Details', 'Photos', 'Pricing', 'Review'].map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = step === stepNum;
              const isComplete = step > stepNum;

              return (
                <div key={label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isComplete
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isActive
                            ? 'border-brand-primary bg-brand-primary/20 text-brand-primary'
                            : 'border-white/20 bg-white/5 text-white/40'
                      }`}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : stepNum}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${isActive ? 'text-white' : 'text-white/40'}`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        isComplete ? 'bg-emerald-500' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Steps */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., 1965 Fender Stratocaster Sunburst"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      updateField('category', e.target.value);
                      updateField('subcategory', '');
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-hidden focus:border-brand-primary/50"
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
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-hidden focus:border-brand-primary/50"
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
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => updateField('model', e.target.value)}
                    placeholder="e.g., Stratocaster"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => updateField('year', e.target.value)}
                    placeholder="e.g., 1965"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Condition *</label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => updateField('condition', cond.id)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        formData.condition === cond.id
                          ? 'border-brand-primary bg-brand-primary/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`font-medium ${formData.condition === cond.id ? 'text-brand-primary' : 'text-white'}`}
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
                  placeholder="Describe your item in detail. Include any modifications, history, or issues..."
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50"
                />
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Photos *</label>
                <p className="mb-4 text-sm text-white/60">
                  Add up to 10 photos. The first photo will be your main listing image.
                </p>

                <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-xl border border-white/10"
                    >
                      <img
                        src={img.url}
                        alt={`Photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute left-2 top-2 rounded bg-brand-primary px-2 py-0.5 text-xs font-medium text-white">
                          Main
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {images.length < 10 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 transition-all hover:border-white/40 hover:bg-white/10">
                      <Camera className="mb-2 h-8 w-8 text-white/40" />
                      <span className="text-sm text-white/60">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                  <div className="text-sm text-white/70">
                    <p className="mb-1 font-medium text-blue-400">Photo Tips</p>
                    <ul className="list-disc space-y-1 pl-4 text-white/60">
                      <li>Use good lighting and a clean background</li>
                      <li>Show all angles and any wear or damage</li>
                      <li>Include photos of serial numbers if applicable</li>
                      <li>Higher quality photos get more views</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Listing Type *</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {LISTING_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateField('listingType', type.id)}
                      className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                        formData.listingType === type.id
                          ? 'border-brand-primary bg-brand-primary/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${formData.listingType === type.id ? 'bg-brand-primary/20' : 'bg-white/10'}`}
                      >
                        <type.icon
                          className={`h-5 w-5 ${formData.listingType === type.id ? 'text-brand-primary' : 'text-white/60'}`}
                        />
                      </div>
                      <div className="text-left">
                        <div
                          className={`font-medium ${formData.listingType === type.id ? 'text-brand-primary' : 'text-white'}`}
                        >
                          {type.name}
                        </div>
                        <div className="text-xs text-white/50">{type.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {(formData.listingType === 'sell' || formData.listingType === 'both') && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Price *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateField('price', e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.acceptsOffers}
                        onChange={(e) => updateField('acceptsOffers', e.target.checked)}
                        className="h-5 w-5 rounded border-white/20 bg-white/5 text-brand-primary focus:ring-brand-primary/50"
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
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50"
                  />
                </div>
              )}

              <div className="border-t border-white/10 pt-6">
                <h3 className="mb-4 font-medium text-white">Location & Shipping</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        placeholder="City, State"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Shipping Cost
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="number"
                        value={formData.shippingCost}
                        onChange={(e) => updateField('shippingCost', e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-hidden focus:border-brand-primary/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.localPickup}
                      onChange={(e) => updateField('localPickup', e.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-white/5 text-brand-primary focus:ring-brand-primary/50"
                    />
                    <span className="text-sm text-white/70">Local pickup available</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-4 font-medium text-white">Review Your Listing</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Preview Image */}
                  <div>
                    {images.length > 0 ? (
                      <img
                        src={images[0].url}
                        alt="Listing preview"
                        className="aspect-square w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-xl bg-white/5">
                        <Package className="h-16 w-16 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-white/50">Title</div>
                      <div className="text-lg font-semibold text-white">
                        {formData.title || 'Untitled'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-white/50">Category</div>
                        <div className="capitalize text-white">{formData.category || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/50">Condition</div>
                        <div className="capitalize text-white">{formData.condition}</div>
                      </div>
                    </div>

                    {formData.brand && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-white/50">Brand</div>
                          <div className="text-white">{formData.brand}</div>
                        </div>
                        {formData.model && (
                          <div>
                            <div className="text-sm text-white/50">Model</div>
                            <div className="text-white">{formData.model}</div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-white/50">Listing Type</div>
                      <div className="capitalize text-white">
                        {formData.listingType.replace('_', ' ')}
                      </div>
                    </div>

                    {formData.price && (
                      <div>
                        <div className="text-sm text-white/50">Price</div>
                        <div className="text-2xl font-bold text-white">
                          ${parseFloat(formData.price).toLocaleString()}
                          {formData.acceptsOffers && (
                            <span className="ml-2 text-sm font-normal text-emerald-400">OBO</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-white/50">Location</div>
                      <div className="text-white">{formData.location || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <div className="text-sm">
                    <p className="font-medium text-emerald-400">Ready to publish!</p>
                    <p className="text-white/60">
                      Your listing will be visible to all musicians on the platform. You can edit or
                      remove it at any time from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white hover:bg-white/10"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="rounded-xl bg-linear-to-r from-brand-primary to-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Publish Listing
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
