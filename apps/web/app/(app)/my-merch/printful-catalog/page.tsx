'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronRight,
  Loader2,
  Package,
  TShirt,
  Hoodie,
  CoffeeMug,
  Poster,
  BaseballCap,
  StickerIcon,
  ShoppingBag,
  X,
  Grid,
  List,
  Star,
  ArrowLeft,
} from '@/components/ui/custom-icons';

// Curated keywords for band/artist merch - only show products matching these
const ALLOWED_PRODUCT_KEYWORDS = [
  // T-Shirts & Tops
  't-shirt',
  'tee',
  'tank top',
  'tank',
  'long sleeve',
  'longsleeve',
  // Hoodies & Outerwear
  'hoodie',
  'sweatshirt',
  'pullover',
  'crewneck',
  'fleece',
  'zip-up',
  'zip up',
  // Headwear
  'hat',
  'cap',
  'beanie',
  'snapback',
  'trucker',
  'bucket hat',
  'dad hat',
  // Posters & Art
  'poster',
  'print',
  'canvas',
  'framed',
  'wall art',
  // Stickers
  'sticker',
  'decal',
  'kiss-cut',
  'die-cut',
  // Bags
  'tote',
  'tote bag',
  // Drinkware
  'mug',
  'coffee mug',
  'tumbler',
];

// Categories for filtering within our curated selection
const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: Package, keywords: [] },
  {
    id: 'tshirts',
    name: 'T-Shirts',
    icon: TShirt,
    keywords: ['t-shirt', 'tee', 'short sleeve'],
  },
  {
    id: 'longsleeve',
    name: 'Long Sleeve',
    icon: TShirt,
    keywords: ['long sleeve', 'longsleeve'],
  },
  {
    id: 'tanks',
    name: 'Tank Tops',
    icon: TShirt,
    keywords: ['tank top', 'tank', 'sleeveless'],
  },
  {
    id: 'hoodies',
    name: 'Hoodies & Sweatshirts',
    icon: Hoodie,
    keywords: ['hoodie', 'sweatshirt', 'pullover', 'crewneck', 'fleece', 'zip'],
  },
  {
    id: 'hats',
    name: 'Hats',
    icon: BaseballCap,
    keywords: ['hat', 'cap', 'beanie', 'snapback', 'trucker', 'bucket', 'dad hat'],
  },
  {
    id: 'posters',
    name: 'Posters & Wall Art',
    icon: Poster,
    keywords: ['poster', 'print', 'canvas', 'art', 'wall', 'framed'],
  },
  {
    id: 'stickers',
    name: 'Stickers',
    icon: StickerIcon,
    keywords: ['sticker', 'decal'],
  },
  {
    id: 'totes',
    name: 'Tote Bags',
    icon: ShoppingBag,
    keywords: ['tote', 'bag'],
  },
  {
    id: 'mugs',
    name: 'Mugs',
    icon: CoffeeMug,
    keywords: ['mug', 'tumbler', 'coffee'],
  },
];

interface PrintfulProduct {
  id: number;
  type: string;
  type_name: string;
  brand: string;
  model: string;
  image: string;
  variant_count: number;
  currency: string;
  avg_fulfillment_time: number;
  techniques?: { key: string; display_name: string; is_default: boolean }[];
  files?: { id: string; type: string; title: string }[];
  options?: { id: string; title: string; type: string; values: Record<string, string> }[];
  is_discontinued: boolean;
  description?: string;
}

interface PrintfulCategory {
  id: number;
  parent_id: number;
  image_url: string;
  size: string;
  title: string;
}

export default function PrintfulCatalogPage() {
  const [products, setProducts] = useState<PrintfulProduct[]>([]);
  const [categories, setCategories] = useState<PrintfulCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<PrintfulProduct | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'price'>('popular');

  // Fetch Printful categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/merch/printful?action=categories');
        const data = await response.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Helper to check if a product matches our curated selection
  const isAllowedProduct = useCallback((product: PrintfulProduct) => {
    const productText = `${product.model} ${product.type_name}`.toLowerCase();
    return ALLOWED_PRODUCT_KEYWORDS.some((keyword) => productText.includes(keyword.toLowerCase()));
  }, []);

  // Fetch Printful catalog (once - we filter client-side)
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/merch/printful?action=catalog');
        const data = await response.json();

        if (data.success && data.catalog) {
          // Filter out discontinued products AND only keep curated products
          const curatedProducts = data.catalog.filter(
            (p: PrintfulProduct) => !p.is_discontinued && isAllowedProduct(p)
          );
          setProducts(curatedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch catalog:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, [isAllowedProduct]);

  // Filter products by category and search
  const filteredProducts = products.filter((product) => {
    // First, filter by category
    if (selectedCategory !== 'all') {
      const category = CATEGORIES.find((c) => c.id === selectedCategory);
      if (category && category.keywords.length > 0) {
        const productText =
          `${product.model} ${product.type_name} ${product.brand || ''}`.toLowerCase();
        const matchesCategory = category.keywords.some((keyword) =>
          productText.includes(keyword.toLowerCase())
        );
        if (!matchesCategory) return false;
      }
    }

    // Then, filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.model.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.type_name.toLowerCase().includes(query)
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.model.localeCompare(b.model);
      case 'price':
        return 0; // Would need variant prices
      default:
        return a.variant_count - b.variant_count; // More variants = more popular
    }
  });

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-500/5 to-transparent blur-3xl" />
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

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <Link
              href="/my-merch/create"
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Create
            </Link>
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-orange-500/20">
                <Package className="h-7 w-7 text-purple-400" />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">Band Merch Catalog</h1>
            <p className="text-lg text-white/60">
              {products.length} curated products for artist merchandise
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:outline-none"
              >
                <option value="popular">Most Variants</option>
                <option value="name">Name A-Z</option>
              </select>

              <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-2.5 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-2.5 transition-all ${
                    viewMode === 'list'
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-lg'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {cat.name}
                </button>
              );
            })}
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-400" />
                <p className="mt-4 text-white/60">Loading merch catalog...</p>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-white/20" />
              <p className="text-lg font-semibold text-white">No products found</p>
              <p className="mt-2 text-white/60">Try a different search or category</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-4'
              }
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link
                    href={`/my-merch/customize/${product.id}`}
                    className={`group block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 ${
                      viewMode === 'list' ? 'flex items-center gap-6 p-4' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <div
                      className={`relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 ${
                        viewMode === 'grid' ? 'aspect-square' : 'h-24 w-24 flex-shrink-0 rounded-xl'
                      }`}
                    >
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.model}
                          fill
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-12 w-12 text-white/20" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
                          Customize
                        </span>
                      </div>

                      {/* Variant Count Badge */}
                      {viewMode === 'grid' && (
                        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
                          {product.variant_count} variants
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                      {product.brand && (
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-purple-400">
                          {product.brand}
                        </p>
                      )}
                      <h3 className="mb-1 font-semibold text-white group-hover:text-purple-300">
                        {product.model}
                      </h3>
                      <p className="text-sm text-white/50">{product.type_name}</p>

                      {viewMode === 'list' && (
                        <div className="mt-2 flex items-center gap-4 text-sm text-white/40">
                          <span>{product.variant_count} variants</span>
                          {product.avg_fulfillment_time && (
                            <span>~{product.avg_fulfillment_time} day fulfillment</span>
                          )}
                        </div>
                      )}

                      {/* Techniques */}
                      {product.techniques &&
                        product.techniques.length > 0 &&
                        viewMode === 'grid' && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {product.techniques.slice(0, 2).map((tech) => (
                              <span
                                key={tech.key}
                                className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60"
                              >
                                {tech.display_name}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Arrow for list view */}
                    {viewMode === 'list' && (
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-white/30 group-hover:text-purple-400" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Results Count */}
          {!isLoading && sortedProducts.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center text-sm text-white/40"
            >
              Showing {sortedProducts.length} of {products.length} products
            </motion.p>
          )}

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link href="/my-merch/create" className="text-sm text-white/50 hover:text-white">
              ← Back to Create Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
