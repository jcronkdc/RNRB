'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  ShoppingBag,
  Loader2,
} from '@/components/ui/custom-icons';

interface ProductMockup {
  variantId: number;
  mockupUrl: string;
  placement: string;
  productColor: string;
}

interface ProductPreviewProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    mockupUrl?: string;
    thumbnailUrl?: string;
    mockups?: ProductMockup[];
  };
  onClose?: () => void;
}

/**
 * Multi-Angle Product Preview Modal
 *
 * Shows product mockups from different angles/colors with zoom capability
 */
export function ProductPreviewModal({ product, onClose }: ProductPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get all available mockup images
  const mockupImages = product.mockups?.map((m) => m.mockupUrl) || [];
  if (product.mockupUrl && !mockupImages.includes(product.mockupUrl)) {
    mockupImages.unshift(product.mockupUrl);
  }
  if (product.thumbnailUrl && !mockupImages.includes(product.thumbnailUrl)) {
    mockupImages.push(product.thumbnailUrl);
  }

  const currentImage = mockupImages[currentIndex] || '/placeholder-product.png';
  const currentMockup = product.mockups?.[currentIndex];

  const nextImage = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev + 1) % mockupImages.length);
  };

  const prevImage = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev - 1 + mockupImages.length) % mockupImages.length);
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-zinc-900 to-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid gap-6 p-6 lg:grid-cols-[2fr,1fr]">
            {/* Main Image Area */}
            <div className="relative">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
                <Image
                  src={currentImage}
                  alt={`${product.name} - View ${currentIndex + 1}`}
                  fill
                  className={`object-contain transition-transform duration-500 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onLoad={() => setIsLoading(false)}
                  priority
                />

                {/* Navigation Arrows (if multiple images) */}
                {mockupImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-all hover:scale-110 hover:bg-black/70"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-all hover:scale-110 hover:bg-black/70"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Zoom Hint */}
                {!isZoomed && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
                    <ZoomIn className="h-4 w-4" />
                    Click to zoom
                  </div>
                )}

                {/* Image Counter */}
                {mockupImages.length > 1 && (
                  <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
                    {currentIndex + 1} / {mockupImages.length}
                  </div>
                )}

                {/* Color Badge */}
                {currentMockup?.productColor && (
                  <div className="absolute left-4 top-4 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
                    {currentMockup.productColor}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {mockupImages.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {mockupImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsLoading(true);
                        setCurrentIndex(idx);
                      }}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                        currentIndex === idx
                          ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-black'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <div className="mb-4">
                <h2 className="mb-2 text-2xl font-bold text-white">{product.name}</h2>
                {product.description && <p className="text-white/60">{product.description}</p>}
                <div className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-sm capitalize text-white/70">
                  {product.category}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-orange-400">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Product Features */}
              <div className="mb-6 space-y-3 rounded-xl bg-white/5 p-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                  Product Details
                </h3>
                <div className="flex items-start gap-3 text-sm text-white/70">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span>Premium quality materials</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/70">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span>Print-on-demand production</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/70">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span>Ships within 2-7 business days</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/70">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span>Free shipping on orders $50+</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30">
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Product Card with Preview
 */
export function ProductCardWithPreview({ product }: { product: ProductPreviewProps['product'] }) {
  const [showPreview, setShowPreview] = useState(false);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] transition-all duration-300 hover:border-white/20"
        onClick={() => setShowPreview(true)}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-orange-500/20 to-purple-500/20">
          {product.mockupUrl || product.thumbnailUrl ? (
            <Image
              src={product.mockupUrl || product.thumbnailUrl || ''}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-white/20" />
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
            <div className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black">
              <ZoomIn className="h-4 w-4" />
              Quick View
            </div>
          </div>

          {/* Multiple Images Badge */}
          {product.mockups && product.mockups.length > 1 && (
            <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
              {product.mockups.length} views
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="mb-1 font-semibold text-white">{product.name}</h3>
          {product.description && (
            <p className="mb-3 line-clamp-2 text-sm text-white/50">{product.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-orange-400">{formatPrice(product.price)}</span>
            <span className="text-sm capitalize text-white/50">{product.category}</span>
          </div>
        </div>
      </motion.div>

      {/* Preview Modal */}
      {showPreview && (
        <ProductPreviewModal product={product} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}
