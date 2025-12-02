'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Bell,
  Mail,
  CheckCircle,
  Filter,
  LayoutGrid,
  List,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { CartProvider, useCart, MerchProduct, formatPrice } from '@/lib/merch/cart-context';
import { CartDrawer, CartButton } from '@/components/merch/cart-drawer';
import { ProductGrid } from '@/components/merch/product-card';

// ============================================
// STORE CONFIG - Set to true when ready to sell
// ============================================
const STORE_LIVE = false; // Toggle this to enable/disable the store

// Products with real Stripe Price IDs
const SAMPLE_PRODUCTS: MerchProduct[] = [
  {
    id: 'rnrb-tee-black',
    name: 'RNRB Classic Logo Tee',
    description:
      "Premium cotton t-shirt with the iconic Rock N' Roll Basement logo. Available in multiple sizes.",
    price: 2999,
    currency: 'USD',
    category: 'apparel',
    inStock: true,
    stripeProductId: 'prod_TWlUWi951vK4Rg',
    stripePriceId: 'price_1SZhxv2H6bMdop9gJSsCr3lH',
    variants: [
      { id: 's', name: 'S', type: 'size', inStock: true },
      { id: 'm', name: 'M', type: 'size', inStock: true },
      { id: 'l', name: 'L', type: 'size', inStock: true },
      { id: 'xl', name: 'XL', type: 'size', inStock: true },
      { id: '2xl', name: '2XL', type: 'size', inStock: false },
    ],
  },
  {
    id: 'rnrb-hoodie-black',
    name: 'RNRB Hoodie',
    description: 'Cozy heavyweight hoodie with embroidered RNRB logo. Perfect for studio sessions.',
    price: 6499,
    currency: 'USD',
    category: 'apparel',
    inStock: true,
    stripeProductId: 'prod_TWlUJ9FcWeKrhn',
    stripePriceId: 'price_1SZhxv2H6bMdop9gJ37b71Xr',
    variants: [
      { id: 's', name: 'S', type: 'size', inStock: true },
      { id: 'm', name: 'M', type: 'size', inStock: true },
      { id: 'l', name: 'L', type: 'size', inStock: true },
      { id: 'xl', name: 'XL', type: 'size', inStock: true },
    ],
  },
  {
    id: 'rnrb-cap',
    name: 'RNRB Snapback Cap',
    description: "Classic snapback with embroidered Rock N' Roll Basement logo.",
    price: 3499,
    currency: 'USD',
    category: 'accessories',
    inStock: true,
    stripeProductId: 'prod_TWlUCU3fpaU9Mg',
    stripePriceId: 'price_1SZhxw2H6bMdop9gq5fJq9g3',
  },
  {
    id: 'rnrb-pick-tin',
    name: 'RNRB Guitar Picks (12-Pack)',
    description: 'Premium Tortex picks with RNRB branding. Mixed gauge pack.',
    price: 1299,
    currency: 'USD',
    category: 'limited',
    inStock: true,
    stripeProductId: 'prod_TWlUT1CaQdyM6q',
    stripePriceId: 'price_1SZhxx2H6bMdop9gvwoLERDx',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'studio-gear', name: 'Studio Gear' },
  { id: 'limited', name: 'Limited' },
];

// ============================================
// Coming Soon Component
// ============================================
function ComingSoonView() {
  const [email, setEmail] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call - in future, connect to actual notification system
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setNotifyEnabled(true);
    setIsSubmitting(false);
  };

  const teaserItems = [
    {
      name: 'Apparel',
      description: 'Tees, hoodies & more',
      gradient: 'from-orange-500/30 to-red-600/30',
    },
    {
      name: 'Accessories',
      description: 'Hats, pins & patches',
      gradient: 'from-purple-500/30 to-indigo-600/30',
    },
    {
      name: 'Studio Gear',
      description: 'For the serious musician',
      gradient: 'from-emerald-500/30 to-teal-600/30',
    },
    {
      name: 'Limited Drops',
      description: 'Exclusive collaborations',
      gradient: 'from-amber-500/30 to-orange-600/30',
    },
  ];

  return (
    <>
      {/* Coming Soon Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 text-center md:p-12"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-6 py-2"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-2 w-2 rounded-full bg-orange-500"
          />
          <span className="text-sm font-semibold uppercase tracking-wider text-orange-400">
            Coming Soon
          </span>
        </motion.div>

        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">Something Big is Brewing</h2>
        <p className="mx-auto mb-8 max-w-xl text-white/60">
          We're crafting premium merchandise for musicians, by musicians. Quality gear that
          represents the Rock N' Roll Basement community and the passion we share for music.
        </p>

        {!notifyEnabled ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleNotifyMe}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50"
            >
              <Bell className="h-4 w-4" />
              {isSubmitting ? 'Joining...' : 'Notify Me'}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-4"
          >
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="font-medium text-green-400">
              You'll be first to know when we launch
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Teaser Product Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-white/50">
          What's Coming
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teaserItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${item.gradient} p-6 transition-all duration-300 hover:border-white/20`}
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <div className="relative z-10">
                <h4 className="mb-1 text-lg font-semibold text-white">{item.name}</h4>
                <p className="text-sm text-white/50">{item.description}</p>
              </div>
              <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <span className="text-xs text-white/40">Soon</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Brand Values Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8"
      >
        <div className="grid gap-8 text-center md:grid-cols-3">
          <div className="group">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 transition-transform duration-300 group-hover:scale-110">
              <span className="text-2xl font-bold text-orange-400">01</span>
            </div>
            <h4 className="mb-2 font-semibold text-white">Premium Quality</h4>
            <p className="text-sm text-white/50">
              Every item crafted with care and built to last through countless gigs
            </p>
          </div>
          <div className="group">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 transition-transform duration-300 group-hover:scale-110">
              <span className="text-2xl font-bold text-purple-400">02</span>
            </div>
            <h4 className="mb-2 font-semibold text-white">Made for Musicians</h4>
            <p className="text-sm text-white/50">
              Designed with the working musician in mind, from stage to studio
            </p>
          </div>
          <div className="group">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 transition-transform duration-300 group-hover:scale-110">
              <span className="text-2xl font-bold text-emerald-400">03</span>
            </div>
            <h4 className="mb-2 font-semibold text-white">Community Driven</h4>
            <p className="text-sm text-white/50">
              Proceeds support the platform and fellow musicians in the community
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ============================================
// Live Store Component
// ============================================
function LiveStoreView() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = SAMPLE_PRODUCTS.filter(
    (product) => activeCategory === 'all' || product.category === activeCategory
  );

  return (
    <>
      {/* Header Actions */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/merch/orders"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          Order History
        </Link>
        <CartButton />
      </div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2.5 transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2.5 transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Products Grid */}
      <ProductGrid products={filteredProducts} />

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-sm"
      >
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          <div className="group">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-4xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110">
              {SAMPLE_PRODUCTS.filter((p) => p.inStock).length}
            </div>
            <div className="mt-1 text-sm font-medium text-white/50">Products</div>
          </div>
          <div className="group">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-4xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110">
              {CATEGORIES.length - 1}
            </div>
            <div className="mt-1 text-sm font-medium text-white/50">Categories</div>
          </div>
          <div className="group">
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 bg-clip-text text-4xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110">
              Free
            </div>
            <div className="mt-1 text-sm font-medium text-white/50">Shipping $50+</div>
          </div>
          <div className="group">
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110">
              100%
            </div>
            <div className="mt-1 text-sm font-medium text-white/50">Community Owned</div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ============================================
// Main Page Component
// ============================================
function MerchStoreContent() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gradient-to-br from-red-500/5 to-transparent blur-3xl" />
      </div>

      {/* Logo & Header Section */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* RR Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
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
            transition={{ delay: 0.1 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(249, 115, 22, 0.15)' }}
              >
                <ShoppingBag className="h-7 w-7" style={{ color: 'var(--accent)' }} />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">RNRB Merch Store</h1>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>
              Official Rock N' Roll Basement merchandise
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {STORE_LIVE ? <LiveStoreView /> : <ComingSoonView />}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-white/40">
            Questions about the merch store?{' '}
            <Link href="/messages" className="text-orange-400 hover:text-orange-300">
              Reach out to us
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

export default function MerchStorePage() {
  return (
    <CartProvider>
      <MerchStoreContent />
    </CartProvider>
  );
}
