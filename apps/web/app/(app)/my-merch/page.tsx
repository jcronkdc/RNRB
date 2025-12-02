'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Plus,
  DollarSign,
  TrendingUp,
  Package,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  MoreVertical,
  CheckCircle,
  Clock,
  Pause,
  BarChart3,
  ArrowRight,
} from '@/components/ui/custom-icons';

interface Product {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  basePrice: number;
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  isPublished: boolean;
  mockupUrl?: string;
  thumbnailUrl?: string;
  salesCount: number;
  totalRevenue: number;
  createdAt: string;
  variants: { id: string; size?: string; color?: string }[];
}

interface Summary {
  totalProducts: number;
  activeProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalEarnings: number;
}

export default function MyMerchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'paused'>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/artist-merch/products');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.products);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (productId: string) => {
    try {
      const response = await fetch('/api/artist-merch/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, action: 'publish' }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  };

  const handleUnpublish = async (productId: string) => {
    try {
      const response = await fetch('/api/artist-merch/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, action: 'unpublish' }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to unpublish:', err);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/artist-merch/products?id=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'active') return p.status === 'ACTIVE';
    if (filter === 'draft') return p.status === 'DRAFT';
    if (filter === 'paused') return p.status === 'PAUSED';
    return true;
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
            <CheckCircle className="h-3 w-3" /> Live
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
            <Clock className="h-3 w-3" /> Draft
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
            <Pause className="h-3 w-3" /> Paused
          </span>
        );
      default:
        return null;
    }
  };

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
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20">
                  <ShoppingBag className="h-6 w-6 text-orange-400" />
                </div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">My Merch Store</h1>
              </div>
              <p className="text-white/60">Create and manage your merchandise products</p>
            </div>
            <Link
              href="/my-merch/create"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Create Product
            </Link>
          </motion.div>

          {/* Stats Cards */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-sm text-white/50">Products</p>
                <p className="text-2xl font-bold text-white">{summary.totalProducts}</p>
                <p className="text-xs text-white/40">{summary.activeProducts} active</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-sm text-white/50">Total Sales</p>
                <p className="text-2xl font-bold text-white">{summary.totalSales}</p>
                <p className="text-xs text-white/40">items sold</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-sm text-white/50">Revenue</p>
                <p className="text-2xl font-bold text-white">{formatPrice(summary.totalRevenue)}</p>
                <p className="text-xs text-white/40">total sales</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-white/50">Your Earnings</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatPrice(summary.totalEarnings)}
                </p>
                <Link
                  href="/my-merch/earnings"
                  className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
                >
                  View details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex gap-2"
          >
            {(['all', 'active', 'draft', 'paused'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20">
                <ShoppingBag className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">No products yet</h3>
              <p className="mb-6 text-white/60">
                Create your first product to start selling merchandise
              </p>
              <Link
                href="/my-merch/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white"
              >
                <Plus className="h-5 w-5" />
                Create Your First Product
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-white/10 to-white/5">
                    {product.mockupUrl || product.thumbnailUrl ? (
                      <Image
                        src={product.mockupUrl || product.thumbnailUrl || ''}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-16 w-16 text-white/20" />
                      </div>
                    )}
                    <div className="absolute right-3 top-3">{getStatusBadge(product.status)}</div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="mb-1 truncate text-lg font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="mb-3 text-sm capitalize text-white/50">{product.category}</p>

                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-white">
                          {formatPrice(product.retailPrice)}
                        </p>
                        <p className="text-xs text-white/40">
                          Profit: {formatPrice(product.retailPrice - product.basePrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">{product.salesCount} sold</p>
                        <p className="text-xs text-green-400">
                          {formatPrice(product.totalRevenue)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {product.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(product.id)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-500 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4" /> Publish
                        </button>
                      )}
                      {product.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleUnpublish(product.id)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                        >
                          <Pause className="h-4 w-4" /> Pause
                        </button>
                      )}
                      {product.status === 'PAUSED' && (
                        <button
                          onClick={() => handlePublish(product.id)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-500 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4" /> Resume
                        </button>
                      )}
                      <Link
                        href={`/my-merch/edit/${product.id}`}
                        className="flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Help Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="mb-1 text-lg font-semibold text-white">How it Works</h3>
                <p className="text-sm text-white/60">
                  Create products → We handle printing & shipping → You earn 85% of profit
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/my-merch/earnings"
                  className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  View Earnings
                </Link>
                <Link
                  href="/help/merch"
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
