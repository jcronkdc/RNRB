'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  ShoppingBag,
  DollarSign,
  Palette,
  CheckCircle,
  ChevronRight,
  Plus,
  Minus,
  RotateCw,
  Move,
  Maximize,
  Loader2,
  X,
  Save,
  Eye,
  // Merchandise product icons
  TShirt,
  Hoodie,
  CoffeeMug,
  Poster,
  BaseballCap,
  StickerIcon,
  TankTop,
  ToteBag,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';

// Product templates with Printful variant IDs
const PRODUCT_TYPES = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    category: 'Apparel',
    basePrice: 12.95,
    suggestedRetail: 29.99,
    printfulId: 71, // Bella+Canvas 3001
    icon: TShirt,
    colors: ['Black', 'White', 'Navy', 'Red', 'Heather Grey'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    mockupAspect: '1:1.2',
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    category: 'Apparel',
    basePrice: 25.95,
    suggestedRetail: 54.99,
    printfulId: 380, // Bella+Canvas 3719
    icon: Hoodie,
    colors: ['Black', 'Navy', 'Heather Grey', 'Red'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    mockupAspect: '1:1.2',
  },
  {
    id: 'tanktop',
    name: 'Tank Top',
    category: 'Apparel',
    basePrice: 10.95,
    suggestedRetail: 24.99,
    printfulId: 195,
    icon: TankTop,
    colors: ['Black', 'White', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    mockupAspect: '1:1.2',
  },
  {
    id: 'poster',
    name: 'Poster',
    category: 'Wall Art',
    basePrice: 8.95,
    suggestedRetail: 19.99,
    printfulId: 1,
    icon: Poster,
    sizes: ['12x18"', '18x24"', '24x36"'],
    mockupAspect: '2:3',
  },
  {
    id: 'mug',
    name: 'Mug',
    category: 'Accessories',
    basePrice: 6.95,
    suggestedRetail: 14.99,
    printfulId: 19,
    icon: CoffeeMug,
    sizes: ['11oz', '15oz'],
    mockupAspect: '1:1',
  },
  {
    id: 'sticker',
    name: 'Stickers',
    category: 'Accessories',
    basePrice: 2.45,
    suggestedRetail: 4.99,
    printfulId: 358,
    icon: StickerIcon,
    sizes: ['3x3"', '4x4"', '5.5x5.5"'],
    mockupAspect: '1:1',
  },
  {
    id: 'cap',
    name: 'Dad Hat',
    category: 'Accessories',
    basePrice: 12.95,
    suggestedRetail: 29.99,
    printfulId: 206,
    icon: BaseballCap,
    colors: ['Black', 'White', 'Navy', 'Khaki'],
    mockupAspect: '1:1',
  },
  {
    id: 'tote',
    name: 'Tote Bag',
    category: 'Bags',
    basePrice: 11.95,
    suggestedRetail: 24.99,
    printfulId: 83,
    icon: ToteBag,
    colors: ['Black', 'Natural'],
    mockupAspect: '1:1',
  },
];

interface DesignState {
  designUrl: string | null;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface ProductConfig {
  productId: string;
  name: string;
  design: DesignState;
  selectedColor: string;
  selectedSizes: string[];
  retailPrice: number;
}

export default function MerchDesignerPage() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_TYPES[0]);
  const [design, setDesign] = useState<DesignState>({
    designUrl: null,
    position: { x: 50, y: 40 },
    scale: 1,
    rotation: 0,
  });
  const [selectedColor, setSelectedColor] = useState(PRODUCT_TYPES[0].colors?.[0] || '');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [retailPrice, setRetailPrice] = useState(PRODUCT_TYPES[0].suggestedRetail);
  const [productName, setProductName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setDesign((prev) => ({
        ...prev,
        designUrl: event.target?.result as string,
      }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const calculateProfit = () => {
    return (retailPrice - selectedProduct.basePrice).toFixed(2);
  };

  const calculateMargin = () => {
    return (((retailPrice - selectedProduct.basePrice) / retailPrice) * 100).toFixed(0);
  };

  const handleSelectProduct = (product: (typeof PRODUCT_TYPES)[0]) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] || '');
    setSelectedSizes([]);
    setRetailPrice(product.suggestedRetail);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSaveProduct = async () => {
    if (!design.designUrl || !productName || selectedSizes.length === 0) {
      alert('Please complete all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Upload design to cloud storage and call Printful API
      const response = await fetch('/api/merch/printful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          designUrl: design.designUrl, // Would be cloud URL in production
          productType: selectedProduct.id,
          variants: selectedSizes.map((size) => ({
            variantId: selectedProduct.printfulId,
            retailPrice: retailPrice,
            size,
            color: selectedColor,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to create product');

      // Show success
      alert('Product created successfully! It will appear in your store shortly.');
      // Reset form
      setDesign({ designUrl: null, position: { x: 50, y: 40 }, scale: 1, rotation: 0 });
      setProductName('');
      setSelectedSizes([]);
      setStep(1);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-orange-500/10 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8">
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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20">
                <Palette className="h-7 w-7 text-purple-400" />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">Merch Designer</h1>
            <p className="text-lg text-white/60">
              Create print-on-demand merchandise with your designs
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="mx-auto mb-8 flex max-w-xl items-center justify-center gap-2">
            {['Product', 'Design', 'Pricing'].map((label, i) => (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => setStep(i + 1)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    step === i + 1
                      ? 'bg-orange-500 text-white'
                      : step > i + 1
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-white/50'
                  }`}
                >
                  {step > i + 1 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                      {i + 1}
                    </span>
                  )}
                  {label}
                </button>
                {i < 2 && <ChevronRight className="mx-2 h-4 w-4 text-white/30" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16">
        {/* Step 1: Choose Product */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-white">Choose a Product</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PRODUCT_TYPES.map((product) => {
                const IconComponent = product.icon;
                return (
                  <motion.button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all ${
                      selectedProduct.id === product.id
                        ? 'border-orange-500/50 bg-orange-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5">
                      <IconComponent className="h-8 w-8 text-white/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <p className="text-sm text-white/50">{product.category}</p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-lg font-bold text-orange-400">
                        ${product.suggestedRetail.toFixed(2)}
                      </span>
                      <span className="text-sm text-white/40">retail</span>
                    </div>
                    <div className="mt-1 text-xs text-white/40">
                      Base: ${product.basePrice.toFixed(2)} • Profit: $
                      {(product.suggestedRetail - product.basePrice).toFixed(2)}
                    </div>
                    {selectedProduct.id === product.id && (
                      <div className="absolute right-4 top-4">
                        <CheckCircle className="h-5 w-5 text-orange-400" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white shadow-lg"
              >
                Continue to Design
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Upload Design */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* Design Upload */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Upload Your Design</h2>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!design.designUrl ? (
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
                        Recommended: 4500x5400px for best print quality
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img
                      src={design.designUrl}
                      alt="Your design"
                      className="h-full w-full object-contain p-4"
                    />
                    <button
                      onClick={() => setDesign({ ...design, designUrl: null })}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Design Controls */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                        <Maximize className="h-4 w-4" />
                        Scale
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setDesign((d) => ({ ...d, scale: Math.max(0.5, d.scale - 0.1) }))
                          }
                          className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
                        >
                          <Minus className="h-4 w-4 text-white" />
                        </button>
                        <span className="flex-1 text-center text-white">
                          {(design.scale * 100).toFixed(0)}%
                        </span>
                        <button
                          onClick={() =>
                            setDesign((d) => ({ ...d, scale: Math.min(2, d.scale + 0.1) }))
                          }
                          className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                        <RotateCw className="h-4 w-4" />
                        Rotate
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDesign((d) => ({ ...d, rotation: d.rotation - 15 }))}
                          className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
                        >
                          <Minus className="h-4 w-4 text-white" />
                        </button>
                        <span className="flex-1 text-center text-white">{design.rotation}°</span>
                        <button
                          onClick={() => setDesign((d) => ({ ...d, rotation: d.rotation + 15 }))}
                          className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                        <Move className="h-4 w-4" />
                        Position
                      </div>
                      <button
                        onClick={() => setDesign((d) => ({ ...d, position: { x: 50, y: 40 } }))}
                        className="w-full rounded-lg bg-white/10 py-1.5 text-sm text-white hover:bg-white/20"
                      >
                        Center
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {selectedProduct.colors && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-white/70">
                    Product Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          selectedColor === color
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

              {/* Size Selection */}
              {selectedProduct.sizes && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-white/70">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
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

            {/* Live Preview */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Preview</h2>
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                  Full Preview
                </button>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
                {/* Product mockup background - using custom SVG icons */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {(() => {
                    const IconComponent = selectedProduct.icon;
                    return <IconComponent className="h-32 w-32 text-white/20" strokeWidth={1} />;
                  })()}
                </div>
                {/* Design overlay */}
                {design.designUrl && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      top: `${design.position.y}%`,
                      left: `${design.position.x}%`,
                      transform: `translate(-50%, -50%) scale(${design.scale}) rotate(${design.rotation}deg)`,
                    }}
                  >
                    <img
                      src={design.designUrl}
                      alt="Design preview"
                      className="max-h-[60%] max-w-[60%] object-contain"
                    />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/50 p-3">
                  <p className="text-center text-sm text-white">
                    {selectedProduct.name} • {selectedColor || 'Select color'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-white/20 py-3 font-medium text-white hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!design.designUrl || selectedSizes.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
                >
                  Set Pricing
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
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
            <h2 className="text-xl font-semibold text-white">Set Your Price</h2>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              {/* Product Name */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-white/70">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Band Logo Tee"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none"
                />
              </div>

              {/* Price Slider */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-white/70">Retail Price</label>
                  <span className="text-2xl font-bold text-white">${retailPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={selectedProduct.basePrice + 5}
                  max={selectedProduct.basePrice * 4}
                  step={0.5}
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-xs text-white/40">
                  <span>${(selectedProduct.basePrice + 5).toFixed(2)}</span>
                  <span>${(selectedProduct.basePrice * 4).toFixed(2)}</span>
                </div>
              </div>

              {/* Profit Breakdown */}
              <div className="space-y-3 rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Retail Price</span>
                  <span className="text-white">${retailPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Production Cost</span>
                  <span className="text-white">-${selectedProduct.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Platform Fee (15%)</span>
                  <span className="text-white">
                    -${((retailPrice - selectedProduct.basePrice) * 0.15).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Your Profit</span>
                    <span className="text-xl font-bold text-green-400">
                      ${((retailPrice - selectedProduct.basePrice) * 0.85).toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-right text-xs text-white/40">
                    {calculateMargin()}% margin
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
              <h3 className="mb-3 font-semibold text-white">Ready to Create</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>
                  ✓ {selectedProduct.name} in {selectedColor || 'selected color'}
                </p>
                <p>
                  ✓ {selectedSizes.length} size{selectedSizes.length > 1 ? 's' : ''}:{' '}
                  {selectedSizes.join(', ')}
                </p>
                <p>
                  ✓ ${((retailPrice - selectedProduct.basePrice) * 0.85).toFixed(2)} profit per sale
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-white/20 py-3 font-medium text-white hover:bg-white/10"
              >
                Back
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={!productName || isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
