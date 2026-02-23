'use client';

/**
 * SERVICES MARKETPLACE
 *
 * Connect musicians with professional services:
 * - Mixing Engineers
 * - Mastering Engineers
 * - Producers
 * - Session Musicians
 * - Songwriters
 * - Live Sound Engineers
 * - Video Production
 *
 * Revenue Model: 5-10% platform fee on bookings via Stripe Connect
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Sliders,
  Volume2,
  Music,
  Users,
  Mic,
  Edit,
  Speaker,
  Video,
  ChevronRight,
  Sparkles,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { EmptyState } from '@/components/empty-states';
import { UserCardSkeleton } from '@/components/loading-skeletons';

const CATEGORIES = [
  { id: 'mixing', name: 'Mixing', icon: Sliders, color: '#f97316' },
  { id: 'mastering', name: 'Mastering', icon: Volume2, color: '#8b5cf6' },
  { id: 'production', name: 'Production', icon: Music, color: '#06b6d4' },
  { id: 'session-musicians', name: 'Session Musicians', icon: Users, color: '#10b981' },
  { id: 'vocal-services', name: 'Vocal Services', icon: Mic, color: '#ec4899' },
  { id: 'songwriting', name: 'Songwriting', icon: Edit, color: '#f59e0b' },
  { id: 'live-sound', name: 'Live Sound', icon: Speaker, color: '#ef4444' },
  { id: 'video-production', name: 'Video Production', icon: Video, color: '#3b82f6' },
];

interface ServiceProvider {
  id: string;
  slug: string;
  displayName: string;
  tagline?: string;
  avatar?: string;
  location?: string;
  isVerified: boolean;
  isPro: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime?: string;
  skills: string[];
  startingPrice?: number;
  categoryId: string;
}

export default function MarketplacePage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');

  useEffect(() => {
    loadProviders();
  }, [selectedCategory, sortBy]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      params.set('sort', sortBy);

      const response = await fetch(`/api/marketplace/providers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(
    (p) =>
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header with Logo */}
      <header className="bg-surface/50 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  width={48}
                  height={48}
                  className="transition-opacity hover:opacity-80"
                />
              </Link>
              <div>
                <h1 className="font-display text-foreground text-2xl font-bold">
                  Services Marketplace
                </h1>
                <p className="text-muted-foreground text-sm">
                  Connect with professional engineers, producers & musicians
                </p>
              </div>
            </div>
            <Link href="/marketplace/become-provider">
              <Button className="bg-brand-primary hover:bg-brand-primary/90">
                <Sparkles className="mr-2 h-4 w-4" />
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search & Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill, or genre..."
              className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-xl border py-3 pr-4 pl-10 focus:ring-2 focus:outline-hidden"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border-border bg-surface text-foreground focus:border-brand-primary rounded-xl border px-4 py-3 focus:outline-hidden"
            >
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price">Lowest Price</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-border bg-surface hover:border-brand-primary/30 hover:bg-surface-muted'
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <span className="text-foreground text-center text-xs font-medium">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Provider Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <EmptyState
            type={selectedCategory ? 'search' : 'marketplace'}
            title={selectedCategory ? 'No providers in this category' : 'No providers yet'}
            description={
              selectedCategory
                ? 'Try selecting a different category or become a provider'
                : 'Be the first to offer your services!'
            }
            actionLabel={selectedCategory ? 'Clear Filter' : 'Become a Provider'}
            actionHref={selectedCategory ? undefined : '/marketplace/become-provider'}
            onAction={selectedCategory ? () => setSelectedCategory(null) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/marketplace/providers/${provider.slug}`}>
                  <Card className="group hover:border-brand-primary/30 hover:shadow-brand-primary/10 h-full overflow-hidden transition-all hover:shadow-lg">
                    <div className="p-6">
                      {/* Provider Header */}
                      <div className="mb-4 flex items-start gap-4">
                        <div className="border-border bg-surface-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2">
                          {provider.avatar ? (
                            <Image
                              src={provider.avatar}
                              alt={provider.displayName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-muted-foreground flex h-full w-full items-center justify-center text-2xl font-bold">
                              {provider.displayName.charAt(0)}
                            </div>
                          )}
                          {provider.isVerified && (
                            <div className="absolute -right-1 -bottom-1 rounded-full bg-blue-500 p-1">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-foreground group-hover:text-brand-primary truncate font-semibold">
                              {provider.displayName}
                            </h3>
                            {provider.isPro && (
                              <span className="rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                                PRO
                              </span>
                            )}
                          </div>
                          {provider.tagline && (
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                              {provider.tagline}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mb-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({provider.reviewCount})</span>
                        </div>
                        {provider.location && (
                          <div className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{provider.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        {provider.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="bg-surface-muted text-muted-foreground rounded-full px-2 py-1 text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {provider.skills.length > 4 && (
                          <span className="bg-surface-muted text-muted-foreground rounded-full px-2 py-1 text-xs">
                            +{provider.skills.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-border flex items-center justify-between border-t pt-4">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{provider.responseTime || 'Usually responds in 1 day'}</span>
                        </div>
                        {provider.startingPrice && (
                          <div className="text-right">
                            <span className="text-muted-foreground text-xs">from</span>
                            <span className="text-foreground ml-1 font-semibold">
                              ${(provider.startingPrice / 100).toFixed(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Featured Banner */}
        <Card className="from-brand-primary/20 mt-12 overflow-hidden bg-linear-to-r via-purple-500/20 to-cyan-500/20 p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex-1">
              <h2 className="text-foreground mb-2 text-2xl font-bold">Offer Your Services</h2>
              <p className="text-muted-foreground">
                Join our marketplace of professional engineers, producers, and musicians. Set your
                own rates, build your portfolio, and grow your client base.
              </p>
            </div>
            <Link href="/marketplace/become-provider">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
