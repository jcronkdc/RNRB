'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Palette,
  Ruler,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Eye,
  Package,
  DollarSign,
  Info,
  X,
  Save,
  Maximize,
  RefreshCw,
} from '@/components/ui/custom-icons';

interface PrintfulProductDetails {
  product: {
    id: number;
    main_category_id: number;
    type: string;
    type_name: string;
    brand: string | null;
    model: string;
    image: string;
    variant_count: number;
    currency: string;
    files: { id: string; type: string; title: string; additional_price: string }[];
    options: { id: string; title: string; type: string; values: Record<string, string> }[];
    is_discontinued: boolean;
    avg_fulfillment_time: number | null;
    description: string;
    techniques: { key: string; display_name: string; is_default: boolean }[];
  };
  variants: PrintfulVariant[];
}

interface PrintfulVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string | null;
  color_code2: string | null;
  image: string;
  price: string;
  in_stock: boolean;
  availability_regions: Record<string, string>;
  availability_status: { region: string; status: string }[];
}

interface PrintfileInfo {
  variant_ids: number[];
  placement: string;
  printfiles: {
    printfile_id: number;
    width: number;
    height: number;
    dpi: number;
    fill_mode: string;
    can_rotate: boolean;
  }[];
}

interface MockupTemplate {
  template_id: number;
  image_url: string;
  background_url: string | null;
  background_color: string | null;
  printfile_id: number;
  template_positions: {
    area_width: number;
    area_height: number;
    width: number;
    height: number;
    top: number;
    left: number;
    limit_to_print_area: boolean;
  }[];
  variant_mapping: { variant_id: number; templates: number[] }[];
}

interface DesignState {
  url: string | null;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export default function ProductCustomizerPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product state
  const [productDetails, setProductDetails] = useState<PrintfulProductDetails | null>(null);
  const [printfiles, setPrintfiles] = useState<PrintfileInfo | null>(null);
  const [mockupTemplates, setMockupTemplates] = useState<MockupTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<string>('front');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('');

  // Design state
  const [design, setDesign] = useState<DesignState>({
    url: null,
    position: { x: 50, y: 50 },
    scale: 1,
    rotation: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  // Mockup state
  const [generatedMockups, setGeneratedMockups] = useState<string[]>([]);
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [mockupTaskKey, setMockupTaskKey] = useState<string | null>(null);

  // Product creation state
  const [productName, setProductName] = useState('');
  const [retailPrice, setRetailPrice] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch product details
        const detailsRes = await fetch(
          `/api/merch/printful?action=product-details&id=${productId}`
        );
        const detailsData = await detailsRes.json();

        if (!detailsData.success) {
          throw new Error(detailsData.error || 'Failed to fetch product details');
        }

        setProductDetails(detailsData.product);

        // Set initial selections
        if (detailsData.product.variants.length > 0) {
          const firstVariant = detailsData.product.variants[0];
          setSelectedColor(firstVariant.color);

          // Set default technique
          const defaultTech = detailsData.product.product.techniques?.find(
            (t: any) => t.is_default
          );
          if (defaultTech) {
            setSelectedTechnique(defaultTech.key);
          }

          // Calculate suggested retail price (2x production cost)
          const basePrice = parseFloat(firstVariant.price);
          setRetailPrice(Math.ceil(basePrice * 2 * 100)); // In cents
        }

        // Fetch printfile info for mockup generation
        const printfilesRes = await fetch(`/api/merch/printful?action=printfiles&id=${productId}`);
        const printfilesData = await printfilesRes.json();
        if (printfilesData.success) {
          setPrintfiles(printfilesData.printfiles);
        }

        // Fetch mockup templates
        const templatesRes = await fetch(
          `/api/merch/printful?action=mockup-templates&id=${productId}`
        );
        const templatesData = await templatesRes.json();
        if (templatesData.success) {
          setMockupTemplates(templatesData.templates);
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  // Get unique colors and sizes
  const colors = productDetails
    ? [...new Map(productDetails.variants.map((v) => [v.color, v])).values()]
    : [];

  const sizes = productDetails
    ? [
        ...new Set(
          productDetails.variants.filter((v) => v.color === selectedColor).map((v) => v.size)
        ),
      ]
    : [];

  // Get selected variant
  const selectedVariant = productDetails?.variants.find(
    (v) => v.color === selectedColor && selectedSizes.includes(v.size)
  );

  // Get variants for selected color
  const colorVariants = productDetails?.variants.filter((v) => v.color === selectedColor) || [];

  // Handle file upload
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

      setDesign((prev) => ({
        ...prev,
        url: data.url,
      }));

      // Auto-generate mockup after upload
      setTimeout(() => generateMockup(data.url), 500);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Generate mockup
  const generateMockup = async (designUrl?: string) => {
    const url = designUrl || design.url;
    if (!url || !productDetails) return;

    setIsGeneratingMockup(true);
    setGeneratedMockups([]);

    try {
      // Get variant IDs for selected color
      const variantIds = colorVariants.slice(0, 3).map((v) => v.id);

      const response = await fetch('/api/merch/printful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-mockup',
          productId: parseInt(productId),
          variantIds,
          designUrl: url,
          placement: selectedPlacement,
        }),
      });

      const data = await response.json();

      if (data.success && data.taskKey) {
        setMockupTaskKey(data.taskKey);
        // Poll for completion
        pollMockupTask(data.taskKey);
      } else {
        throw new Error(data.error || 'Failed to generate mockup');
      }
    } catch (err) {
      console.error('Mockup generation error:', err);
      setIsGeneratingMockup(false);
    }
  };

  // Poll mockup task status
  const pollMockupTask = async (taskKey: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/merch/printful?action=mockup-task&task_key=${taskKey}`);
        const data = await response.json();

        if (data.success && data.task) {
          if (data.task.status === 'completed') {
            setGeneratedMockups(data.task.mockups?.map((m: any) => m.mockup_url) || []);
            setIsGeneratingMockup(false);
            return;
          } else if (data.task.status === 'failed') {
            throw new Error('Mockup generation failed');
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1500);
        } else {
          throw new Error('Mockup generation timed out');
        }
      } catch (err) {
        console.error('Poll error:', err);
        setIsGeneratingMockup(false);
      }
    };

    poll();
  };

  // Toggle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Calculate profit
  const calculateProfit = () => {
    if (!selectedVariant) return { basePrice: 0, profit: 0, margin: 0 };
    const basePrice = parseFloat(selectedVariant.price) * 100; // Convert to cents
    const profit = retailPrice - basePrice;
    const platformFee = Math.round(profit * 0.15);
    const artistProfit = profit - platformFee;
    return {
      basePrice,
      profit: artistProfit,
      margin: retailPrice > 0 ? Math.round((artistProfit / retailPrice) * 100) : 0,
    };
  };

  const profitInfo = calculateProfit();
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // Create product
  const handleCreateProduct = async () => {
    if (!design.url || !productName || selectedSizes.length === 0) {
      alert('Please complete all required fields');
      return;
    }

    setIsCreating(true);

    try {
      // Get selected variant IDs
      const selectedVariantIds =
        productDetails?.variants
          .filter((v) => v.color === selectedColor && selectedSizes.includes(v.size))
          .map((v) => v.id) || [];

      const response = await fetch('/api/artist-merch/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description: productDetails?.product.description,
          printfulProductId: parseInt(productId),
          designUrl: design.url,
          retailPrice,
          category: productDetails?.product.type || 'apparel',
          colors: [selectedColor],
          sizes: selectedSizes,
          mockupUrl: generatedMockups[0],
          placement: selectedPlacement,
          technique: selectedTechnique,
          variants: selectedVariantIds.map((id) => ({
            printfulVariantId: id,
            retailPrice,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/my-merch?created=true');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-400" />
          <p className="mt-4 text-white/60">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !productDetails) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-white/20" />
          <p className="mt-4 text-lg font-semibold text-white">Failed to load product</p>
          <p className="mt-2 text-white/60">{error}</p>
          <Link
            href="/my-merch/printful-catalog"
            className="mt-6 inline-block rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const product = productDetails.product;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-orange-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8">
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

          {/* Back Link */}
          <Link
            href="/my-merch/printful-catalog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>

          {/* Product Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {product.brand && (
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-purple-400">
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl font-bold text-white md:text-3xl">{product.model}</h1>
            <p className="mt-2 text-white/60">{product.type_name}</p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Main Preview */}
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900">
                {/* Generated Mockup or Product Image */}
                {generatedMockups.length > 0 ? (
                  <>
                    <Image
                      src={generatedMockups[currentMockupIndex]}
                      alt="Product mockup"
                      fill
                      className="object-contain"
                      priority
                    />
                    {/* Mockup Navigation */}
                    {generatedMockups.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentMockupIndex(
                              (prev) =>
                                (prev - 1 + generatedMockups.length) % generatedMockups.length
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentMockupIndex((prev) => (prev + 1) % generatedMockups.length)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
                          {currentMockupIndex + 1} / {generatedMockups.length}
                        </div>
                      </>
                    )}
                  </>
                ) : design.url ? (
                  <div className="relative h-full">
                    {/* Base product image */}
                    <Image
                      src={colors.find((c) => c.color === selectedColor)?.image || product.image}
                      alt={product.model}
                      fill
                      className="object-contain"
                    />
                    {/* Design overlay preview */}
                    <div
                      className="absolute flex items-center justify-center"
                      style={{
                        top: `${design.position.y}%`,
                        left: `${design.position.x}%`,
                        transform: `translate(-50%, -50%) scale(${design.scale}) rotate(${design.rotation}deg)`,
                        width: '40%',
                        height: '40%',
                      }}
                    >
                      <img
                        src={design.url}
                        alt="Your design"
                        className="max-h-full max-w-full object-contain"
                        style={{ opacity: 0.9 }}
                      />
                    </div>
                  </div>
                ) : (
                  <Image
                    src={colors.find((c) => c.color === selectedColor)?.image || product.image}
                    alt={product.model}
                    fill
                    className="object-contain"
                  />
                )}

                {/* Loading overlay */}
                {isGeneratingMockup && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-400" />
                      <p className="mt-3 text-sm text-white">Generating mockup...</p>
                    </div>
                  </div>
                )}

                {/* Color indicator */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2">
                  <div
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{
                      backgroundColor:
                        colors.find((c) => c.color === selectedColor)?.color_code || '#333',
                    }}
                  />
                  <span className="text-sm text-white">{selectedColor}</span>
                </div>
              </div>

              {/* Color Variants Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {colors.map((variant) => (
                  <button
                    key={variant.color}
                    onClick={() => setSelectedColor(variant.color)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl transition-all ${
                      selectedColor === variant.color
                        ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={variant.image}
                      alt={variant.color}
                      fill
                      className="bg-zinc-800 object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Regenerate Mockup Button */}
              {design.url && (
                <button
                  onClick={() => generateMockup()}
                  disabled={isGeneratingMockup}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-purple-400 transition-colors hover:bg-purple-500/20 disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 ${isGeneratingMockup ? 'animate-spin' : ''}`} />
                  {isGeneratingMockup ? 'Generating...' : 'Regenerate Mockup'}
                </button>
              )}
            </motion.div>

            {/* Right Column - Options */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Upload Design */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <Upload className="h-5 w-5 text-purple-400" />
                  Upload Your Design
                </h3>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!design.url ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-xl border-2 border-dashed border-white/20 p-8 text-center transition-colors hover:border-purple-500/50"
                  >
                    {isUploading ? (
                      <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-400" />
                    ) : (
                      <>
                        <Upload className="mx-auto mb-3 h-10 w-10 text-white/40" />
                        <p className="font-medium text-white">Click to upload</p>
                        <p className="mt-1 text-sm text-white/50">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="aspect-square overflow-hidden rounded-xl bg-zinc-800">
                      <img
                        src={design.url}
                        alt="Your design"
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setDesign({ url: null, position: { x: 50, y: 50 }, scale: 1, rotation: 0 });
                        setGeneratedMockups([]);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Print files info */}
                {printfiles && (
                  <p className="mt-3 text-xs text-white/40">
                    Recommended: {printfiles.printfiles?.[0]?.width}×
                    {printfiles.printfiles?.[0]?.height}px @ {printfiles.printfiles?.[0]?.dpi}dpi
                  </p>
                )}
              </div>

              {/* Color Selection */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <Palette className="h-5 w-5 text-purple-400" />
                  Select Color
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((variant) => (
                    <button
                      key={variant.color}
                      onClick={() => setSelectedColor(variant.color)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all ${
                        selectedColor === variant.color
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <div
                        className="h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: variant.color_code || '#333' }}
                      />
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <Ruler className="h-5 w-5 text-purple-400" />
                  Select Sizes to Offer
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const variant = colorVariants.find((v) => v.size === size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        disabled={!variant?.in_stock}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                          selectedSizes.includes(size)
                            ? 'bg-purple-500 text-white'
                            : variant?.in_stock
                              ? 'bg-white/10 text-white/70 hover:bg-white/20'
                              : 'cursor-not-allowed bg-white/5 text-white/30'
                        }`}
                      >
                        {size}
                        {!variant?.in_stock && ' (Out)'}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-white/40">
                  {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Print Technique (if available) */}
              {product.techniques && product.techniques.length > 1 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                    <Info className="h-5 w-5 text-purple-400" />
                    Print Technique
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.techniques.map((tech) => (
                      <button
                        key={tech.key}
                        onClick={() => setSelectedTechnique(tech.key)}
                        className={`rounded-lg px-4 py-2 text-sm transition-all ${
                          selectedTechnique === tech.key
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {tech.display_name}
                        {tech.is_default && ' ✓'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  Set Your Price
                </h3>

                <div className="mb-4">
                  <label className="mb-2 block text-sm text-white/70">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Tour 2025 Tee"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm text-white/70">Retail Price</label>
                    <span className="text-2xl font-bold text-white">
                      {formatPrice(retailPrice)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={Math.ceil(profitInfo.basePrice) + 500}
                    max={Math.ceil(profitInfo.basePrice) * 4}
                    step={50}
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Profit Breakdown */}
                <div className="space-y-2 rounded-xl bg-black/20 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Production Cost</span>
                    <span className="text-white">{formatPrice(profitInfo.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Your Retail Price</span>
                    <span className="text-white">{formatPrice(retailPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Platform Fee (15%)</span>
                    <span className="text-white">
                      -{formatPrice(Math.round((retailPrice - profitInfo.basePrice) * 0.15))}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Your Profit</span>
                      <span className="text-xl font-bold text-green-400">
                        {formatPrice(profitInfo.profit)}
                      </span>
                    </div>
                    <p className="mt-1 text-right text-xs text-white/40">
                      {profitInfo.margin}% margin
                    </p>
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateProduct}
                disabled={!design.url || !productName || selectedSizes.length === 0 || isCreating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-orange-500 px-6 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Create Product
                  </>
                )}
              </button>

              {/* Requirements List */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm font-medium text-white/70">Requirements:</p>
                <ul className="space-y-2 text-sm">
                  <li
                    className={`flex items-center gap-2 ${design.url ? 'text-green-400' : 'text-white/50'}`}
                  >
                    {design.url ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-current" />
                    )}
                    Upload design image
                  </li>
                  <li
                    className={`flex items-center gap-2 ${productName ? 'text-green-400' : 'text-white/50'}`}
                  >
                    {productName ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-current" />
                    )}
                    Enter product name
                  </li>
                  <li
                    className={`flex items-center gap-2 ${selectedSizes.length > 0 ? 'text-green-400' : 'text-white/50'}`}
                  >
                    {selectedSizes.length > 0 ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-current" />
                    )}
                    Select at least one size
                  </li>
                </ul>
              </div>

              {/* Product Info */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/70">
                  <strong>Fulfillment:</strong> ~{product.avg_fulfillment_time || 3} business days
                </p>
                {product.description && (
                  <p className="mt-2 text-sm text-white/50">{product.description}</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Back Link */}
          <div className="mt-12 text-center">
            <Link
              href="/my-merch/printful-catalog"
              className="text-sm text-white/50 hover:text-white"
            >
              ← Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
