'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Plus, Check, ZoomIn } from '@/components/ui/custom-icons';
import { useCart, formatPrice, MerchProduct } from '@/lib/merch/cart-context';
import Image from 'next/image';

interface ProductCardProps {
  product: MerchProduct;
  onQuickView?: (product: MerchProduct) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();

  const sizes = product.variants?.filter((v) => v.type === 'size') || [];
  const needsSize = sizes.length > 0;

  const handleAddToCart = () => {
    if (needsSize && !selectedSize) {
      // Could show a toast or highlight size selector
      return;
    }

    setIsAdding(true);
    addItem(product, 1, selectedSize ? { size: selectedSize } : undefined);

    setTimeout(() => {
      setIsAdding(false);
      setSelectedSize(undefined);
    }, 1500);
  };

  const getCategoryColor = (category: MerchProduct['category']) => {
    switch (category) {
      case 'apparel':
        return 'from-orange-500/30 to-red-600/30';
      case 'accessories':
        return 'from-purple-500/30 to-indigo-600/30';
      case 'studio-gear':
        return 'from-emerald-500/30 to-teal-600/30';
      case 'limited':
        return 'from-amber-500/30 to-orange-600/30';
      default:
        return 'from-zinc-500/30 to-zinc-600/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] transition-all duration-300 hover:border-white/20"
    >
      {/* Product Image */}
      <div
        className={`relative aspect-square overflow-hidden bg-gradient-to-br ${getCategoryColor(product.category)}`}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-white/20" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium capitalize text-white">
            {product.category.replace('-', ' ')}
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover Overlay with Quick View */}
        {product.inStock && (
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100"
            onClick={() => onQuickView?.(product)}
          >
            <div className="flex scale-90 transform items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-lg transition-transform duration-200 group-hover:scale-100">
              <ZoomIn className="h-4 w-4" />
              Quick View
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="mb-1 font-semibold text-white">{product.name}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-white/50">{product.description}</p>

        {/* Size Selector (if applicable) */}
        {needsSize && product.inStock && (
          <div className="mb-3">
            <p className="mb-2 text-xs text-white/40">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.name)}
                  disabled={!size.inStock}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedSize === size.name
                      ? 'bg-orange-500 text-white'
                      : size.inStock
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'cursor-not-allowed bg-white/5 text-white/30 line-through'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-orange-400">
            {formatPrice(product.price, product.currency)}
          </span>

          {product.inStock ? (
            <motion.button
              onClick={handleAddToCart}
              disabled={isAdding || (needsSize && !selectedSize)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                isAdding
                  ? 'bg-green-500 text-white'
                  : needsSize && !selectedSize
                    ? 'cursor-not-allowed bg-white/10 text-white/50'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isAdding ? (
                <>
                  <Check className="h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add
                </>
              )}
            </motion.button>
          ) : (
            <span className="text-sm text-white/40">Sold Out</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Product Grid Component
interface ProductGridProps {
  products: MerchProduct[];
  onQuickView?: (product: MerchProduct) => void;
}

export function ProductGrid({ products, onQuickView }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-white/20" />
        <p className="text-white/50">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProductCard product={product} onQuickView={onQuickView} />
        </motion.div>
      ))}
    </div>
  );
}
