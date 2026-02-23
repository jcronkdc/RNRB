'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  Package,
  ArrowLeft,
  Filter,
  User,
  ExternalLink,
} from '@/components/ui/custom-icons';
import { CartProvider, useCart, formatPrice } from '@/lib/merch/cart-context';
import { CartDrawer, CartButton } from '@/components/merch/cart-drawer';

interface Product {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  retailPrice: number;
  category: string;
  mockupUrl: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
  variants: {
    id: string;
    size: string | null;
    color: string | null;
    colorCode: string | null;
    retailPrice: number;
    inStock: boolean;
  }[];
}

interface Artist {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
}

function ArtistStoreContent() {
  const params = useParams();
  const username = params.username as string;
  const { addItem } = useCart();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStore();
  }, [username]);

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/artist-merch/store/${username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Store not found');
      }

      setArtist(data.artist);
      setProducts(data.products);
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const handleAddToCart = (product: Product, variant?: Product['variants'][0]) => {
    addItem(
      {
        id: `${product.id}-${variant?.id || 'default'}`,
        name: product.name,
        description: product.description || '',
        price: variant?.retailPrice || product.retailPrice,
        currency: 'USD',
        image: product.mockupUrl || product.thumbnailUrl || undefined,
        category: product.category as any,
        inStock: variant?.inStock ?? true,
        // Artist product fields for checkout
        artistId: artist?.id,
        artistUsername: artist?.username || username,
        productId: product.id,
        variantId: variant?.id,
      },
      1,
      variant ? { size: variant.size || undefined, color: variant.color || undefined } : undefined
    );
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg)' }}
      >
        <ShoppingBag className="h-12 w-12 text-white/20" />
        <h1 className="text-xl font-semibold text-white">Store Not Found</h1>
        <p className="text-white/60">{error || "This artist doesn't have a store yet"}</p>
        <Link
          href={`/u/${username}`}
          className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          View Artist Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-purple-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-center justify-between"
          >
            <Link
              href={`/u/${username}`}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
            <CartButton />
          </motion.div>

          {/* Artist Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center text-center"
          >
            {artist.image ? (
              <Image
                src={artist.image}
                alt={artist.name || username}
                width={80}
                height={80}
                className="mb-4 rounded-full border-2 border-orange-500/50"
              />
            ) : (
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30">
                <User className="h-10 w-10 text-white/60" />
              </div>
            )}
            <h1 className="mb-1 text-2xl font-bold text-white md:text-3xl">
              {artist.name || username}'s Merch
            </h1>
            {artist.bio && <p className="max-w-md text-sm text-white/60">{artist.bio}</p>}
          </motion.div>

          {/* Category Filter */}
          {Object.keys(categories).length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 flex flex-wrap justify-center gap-2"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                All ({products.length})
              </button>
              {Object.entries(categories).map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {cat} ({count})
                </button>
              ))}
            </motion.div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"
            >
              <Package className="mx-auto mb-4 h-12 w-12 text-white/20" />
              <h3 className="mb-2 text-lg font-semibold text-white">No Products Yet</h3>
              <p className="text-white/60">
                {artist.name || username} hasn't added any merch yet. Check back soon!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-white/10 to-white/5">
                    {product.mockupUrl || product.thumbnailUrl ? (
                      <Image
                        src={product.mockupUrl || product.thumbnailUrl || ''}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-16 w-16 text-white/20" />
                      </div>
                    )}
                    {product.isFeatured && (
                      <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="mb-1 truncate text-lg font-semibold text-white">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-white/50">
                        {product.description}
                      </p>
                    )}

                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-white">
                        {formatPrice(product.retailPrice)}
                      </span>
                      {product.variants.length > 0 && (
                        <span className="text-sm text-white/40">
                          {product.variants.filter((v) => v.inStock).length} options
                        </span>
                      )}
                    </div>

                    {/* Variant Selector (simplified) */}
                    {product.variants.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {product.variants
                            .filter((v) => v.size)
                            .slice(0, 5)
                            .map((v) => (
                              <span
                                key={v.id}
                                className={`rounded px-2 py-0.5 text-xs ${
                                  v.inStock
                                    ? 'bg-white/10 text-white/70'
                                    : 'bg-white/5 text-white/30 line-through'
                                }`}
                              >
                                {v.size}
                              </span>
                            ))}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product, product.variants[0])}
                          className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-2.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-orange-500/25"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-2.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-orange-500/25"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-white/40">
              Powered by{' '}
              <Link href="/" className="text-orange-400 hover:text-orange-300">
                Rock N' Roll Basement
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

export default function ArtistMerchStorePage() {
  return (
    <CartProvider>
      <ArtistStoreContent />
    </CartProvider>
  );
}
