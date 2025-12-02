'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  DollarSign,
  Loader2,
  TShirt,
  Hoodie,
  CoffeeMug,
  Poster,
  BaseballCap,
  StickerIcon,
  TankTop,
  ToteBag,
} from '@/components/ui/custom-icons';
import { usePrintful, PRINTFUL_PRODUCTS } from '@/lib/merch/use-printful';

// Product templates with Printful details
const PRODUCT_TYPES = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    category: 'apparel',
    printfulId: PRINTFUL_PRODUCTS.BELLA_CANVAS_3001,
    basePrice: 1295,
    suggestedRetail: 2999,
    icon: TShirt,
    colors: ['Black', 'White', 'Navy', 'Red', 'Heather Grey'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    description: 'Bella+Canvas 3001 - Premium soft cotton tee',
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    category: 'apparel',
    printfulId: PRINTFUL_PRODUCTS.BELLA_CANVAS_3719,
    basePrice: 2595,
    suggestedRetail: 5499,
    icon: Hoodie,
    colors: ['Black', 'Navy', 'Heather Grey'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    description: 'Cozy sponge fleece pullover hoodie',
  },
  {
    id: 'tanktop',
    name: 'Tank Top',
    category: 'apparel',
    printfulId: 195,
    basePrice: 1095,
    suggestedRetail: 2499,
    icon: TankTop,
    colors: ['Black', 'White', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Unisex tank for summer vibes',
  },
  {
    id: 'poster',
    name: 'Poster',
    category: 'wall-art',
    printfulId: PRINTFUL_PRODUCTS.POSTER,
    basePrice: 895,
    suggestedRetail: 1999,
    icon: Poster,
    sizes: ['12×18"', '18×24"', '24×36"'],
    description: 'Enhanced matte paper poster',
  },
  {
    id: 'mug',
    name: 'Mug',
    category: 'accessories',
    printfulId: PRINTFUL_PRODUCTS.MUG_11OZ,
    basePrice: 695,
    suggestedRetail: 1499,
    icon: CoffeeMug,
    sizes: ['11oz', '15oz'],
    description: 'White glossy ceramic mug',
  },
  {
    id: 'sticker',
    name: 'Stickers',
    category: 'accessories',
    printfulId: PRINTFUL_PRODUCTS.STICKER,
    basePrice: 245,
    suggestedRetail: 499,
    icon: StickerIcon,
    sizes: ['3×3"', '4×4"', '5.5×5.5"'],
    description: 'Kiss-cut vinyl stickers',
  },
  {
    id: 'cap',
    name: 'Dad Hat',
    category: 'accessories',
    printfulId: PRINTFUL_PRODUCTS.DAD_HAT,
    basePrice: 1295,
    suggestedRetail: 2999,
    icon: BaseballCap,
    colors: ['Black', 'White', 'Navy', 'Khaki'],
    description: 'Classic embroidered dad hat',
  },
  {
    id: 'tote',
    name: 'Tote Bag',
    category: 'accessories',
    printfulId: PRINTFUL_PRODUCTS.TOTE_BAG,
    basePrice: 1195,
    suggestedRetail: 2499,
    icon: ToteBag,
    colors: ['Black', 'Natural'],
    description: 'Economy canvas tote bag',
  },
];

const PLATFORM_FEE_PERCENT = 15;

export default function CreateProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_TYPES[0]);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [retailPrice, setRetailPrice] = useState(PRODUCT_TYPES[0].suggestedRetail);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage via our API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'merch-designs');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setDesignUrl(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleSelectProduct = (product: (typeof PRODUCT_TYPES)[0]) => {
    setSelectedProduct(product);
    setRetailPrice(product.suggestedRetail);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const calculateProfit = () => {
    const grossProfit = retailPrice - selectedProduct.basePrice;
    const platformFee = Math.round(grossProfit * (PLATFORM_FEE_PERCENT / 100));
    const artistEarning = grossProfit - platformFee;
    return { grossProfit, platformFee, artistEarning };
  };

  const handleSubmit = async () => {
    if (!productName || !designUrl) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the product
      const response = await fetch('/api/artist-merch/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description,
          printfulProductId: selectedProduct.printfulId,
          designUrl,
          retailPrice,
          category: selectedProduct.category,
          colors: selectedColors.length > 0 ? selectedColors : selectedProduct.colors,
          sizes: selectedSizes.length > 0 ? selectedSizes : selectedProduct.sizes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      const createdProduct = data.product;

      // Step 2: Generate mockup in background (don't wait for it)
      if (createdProduct?.id) {
        fetch('/api/artist-merch/mockup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: createdProduct.id,
            printfulProductId: selectedProduct.printfulId,
            designUrl,
            placement: 'front',
          }),
        }).catch((err) => {
          console.error('Mockup generation failed:', err);
          // Mockup generation failure shouldn't block the flow
        });
      }

      router.push('/my-merch?created=true');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const profit = calculateProfit();
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-orange-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-4xl px-4 py-8">
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
                width={140}
                height={57}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">Create New Product</h1>
            <p className="text-white/60">Design merchandise your fans will love</p>
          </motion.div>

          {/* Progress Steps */}
          <div className="mx-auto mb-8 flex max-w-md items-center justify-center gap-2">
            {['Product', 'Design', 'Pricing'].map((label, i) => (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => setStep(i + 1)}
                  disabled={i + 1 > step}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    step === i + 1
                      ? 'bg-orange-500 text-white'
                      : step > i + 1
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-white/50'
                  }`}
                >
                  {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : <span>{i + 1}</span>}
                  {label}
                </button>
                {i < 2 && <ChevronRight className="mx-2 h-4 w-4 text-white/30" />}
              </div>
            ))}
          </div>

          {/* Step 1: Choose Product */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-white">Choose Product Type</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PRODUCT_TYPES.map((product) => {
                  const IconComponent = product.icon;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                        selectedProduct.id === product.id
                          ? 'border-orange-500/50 bg-orange-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                        <IconComponent className="h-6 w-6 text-white/60" />
                      </div>
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-xs text-white/50">{product.description}</p>
                      <div className="mt-2 text-sm font-medium text-orange-400">
                        {formatPrice(product.suggestedRetail)}
                      </div>
                      {selectedProduct.id === product.id && (
                        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-orange-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Upload Design */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-white">Upload Your Design</h2>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Upload Area */}
                <div>
                  {!designUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer rounded-2xl border-2 border-dashed border-white/20 p-12 text-center transition-colors hover:border-white/40"
                    >
                      {isUploading ? (
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-white/40" />
                      ) : (
                        <>
                          <Upload className="mx-auto mb-4 h-12 w-12 text-white/40" />
                          <p className="font-medium text-white">Click to upload design</p>
                          <p className="text-sm text-white/50">PNG, JPG up to 10MB</p>
                          <p className="mt-2 text-xs text-white/40">
                            Recommended: 4500×5400px for best print quality
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <img
                        src={designUrl}
                        alt="Your design"
                        className="h-full w-full object-contain p-4"
                      />
                      <button
                        onClick={() => setDesignUrl(null)}
                        className="absolute right-2 top-2 rounded-full bg-black/50 px-3 py-1 text-sm text-white hover:bg-black/70"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* Product Options */}
                  {selectedProduct.colors && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Colors (select which to offer)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => toggleColor(color)}
                            className={`rounded-full px-3 py-1.5 text-sm transition-all ${
                              selectedColors.includes(color)
                                ? 'bg-orange-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.sizes && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-white/70">Sizes</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                              selectedSizes.includes(size)
                                ? 'bg-orange-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 font-semibold text-white">Preview</h3>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {(() => {
                        const IconComponent = selectedProduct.icon;
                        return (
                          <IconComponent className="h-32 w-32 text-white/20" strokeWidth={1} />
                        );
                      })()}
                    </div>
                    {designUrl && (
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <img
                          src={designUrl}
                          alt="Design preview"
                          className="max-h-[50%] max-w-[50%] object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-center text-sm text-white/50">{selectedProduct.name}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!designUrl}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-xl space-y-6"
            >
              <h2 className="text-lg font-semibold text-white">Set Your Price</h2>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Tour 2025 Tee"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell your fans about this product..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none"
                  />
                </div>

                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-white/70">Retail Price</label>
                    <span className="text-2xl font-bold text-white">
                      {formatPrice(retailPrice)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={selectedProduct.basePrice + 500}
                    max={selectedProduct.basePrice * 4}
                    step={50}
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="mt-1 flex justify-between text-xs text-white/40">
                    <span>Min: {formatPrice(selectedProduct.basePrice + 500)}</span>
                    <span>Max: {formatPrice(selectedProduct.basePrice * 4)}</span>
                  </div>
                </div>

                {/* Profit Breakdown */}
                <div className="space-y-3 rounded-xl bg-white/5 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Retail Price</span>
                    <span className="text-white">{formatPrice(retailPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Production Cost</span>
                    <span className="text-white">-{formatPrice(selectedProduct.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Platform Fee (15%)</span>
                    <span className="text-white">-{formatPrice(profit.platformFee)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Your Profit</span>
                      <span className="text-xl font-bold text-emerald-400">
                        {formatPrice(profit.artistEarning)}
                      </span>
                    </div>
                    <p className="mt-1 text-right text-xs text-white/40">per sale</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!productName || isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" /> Create Product
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Back to Dashboard Link */}
          <div className="mt-8 text-center">
            <Link href="/my-merch" className="text-sm text-white/50 hover:text-white">
              ← Back to My Merch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
