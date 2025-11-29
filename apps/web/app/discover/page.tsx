'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Search, Users, Mail, Phone, Music, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { UserProfileCard, type UserProfileCardProps } from '@/components/user-profile-card';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResponse {
  users: UserProfileCardProps[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'email' | 'phone'>('username');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfileCardProps[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Extracted performSearch function with mount tracking
  const performSearch = async (page: number = 1, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        q: debouncedSearchQuery,
        type: searchType,
        page: page.toString(),
        limit: '12',
      });

      const response = await fetch(`/api/discover/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal, // Pass the abort signal
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data: SearchResponse = await response.json();

      // Update state with search results
      setSearchResults(data.users);
      setTotalResults(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);

      if (data.message) {
        setError(data.message);
      }
    } catch (err) {
      // Ignore abort errors (normal when component unmounts)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Search error:', err);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search effect with proper cleanup
  useEffect(() => {
    const controller = new AbortController();

    if (debouncedSearchQuery.trim().length >= 2) {
      performSearch(1, controller.signal);
    } else {
      setSearchResults([]);
      setTotalResults(0);
      setHasSearched(false);
      setError(null);
    }

    // Cleanup: Abort ongoing fetch when effect re-runs or component unmounts
    return () => {
      controller.abort();
    };
  }, [debouncedSearchQuery, searchType]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      performSearch(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/3 top-0 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-6xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                <Users className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Build Your Network</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Discover Musicians</h1>
              </div>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Find collaborators, connect with artists worldwide, build your creative network
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-6xl px-4 py-12">
        {/* Search Box */}
        <Card className="rnrb-card mb-8 p-8">
          <h2 className="font-display mb-6 text-2xl font-bold">Search for Artists</h2>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSearchType('username')}
              className={`rounded-xl px-6 py-2.5 font-medium transition ${
                searchType === 'username'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'border border-border bg-surface-muted text-foreground hover:bg-surface'
              }`}
            >
              <Users className="mr-2 inline-block h-4 w-4" />
              Username
            </button>
            <button
              onClick={() => setSearchType('email')}
              className={`rounded-xl px-6 py-2.5 font-medium transition ${
                searchType === 'email'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'border border-border bg-surface-muted text-foreground hover:bg-surface'
              }`}
            >
              <Mail className="mr-2 inline-block h-4 w-4" />
              Email
            </button>
            <button
              onClick={() => setSearchType('phone')}
              className={`rounded-xl px-6 py-2.5 font-medium transition ${
                searchType === 'phone'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'border border-border bg-surface-muted text-foreground hover:bg-surface'
              }`}
            >
              <Phone className="mr-2 inline-block h-4 w-4" />
              Phone
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search by ${searchType}... (min 2 characters)`}
              className="w-full rounded-xl border border-border bg-surface py-3.5 pl-12 pr-12 text-foreground placeholder-muted-foreground outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-brand-primary" />
            )}
          </div>

          <div className="rnrb-card mt-4 border-brand-primary/20 bg-brand-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              Search respects privacy. Only public profiles appear in results.
            </p>
          </div>
        </Card>

        {/* Search Results */}
        {error && (
          <Card className="rnrb-card border-destructive/50 bg-destructive/5 mb-8 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-destructive h-5 w-5" />
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          </Card>
        )}

        {hasSearched && !isLoading && searchResults.length === 0 && !error && (
          <Card className="rnrb-card p-12 text-center">
            <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="font-display mb-2 text-xl font-semibold">No users found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or search type</p>
          </Card>
        )}

        {searchResults.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{totalResults}</span>{' '}
                {totalResults === 1 ? 'user' : 'users'}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((user) => (
                <UserProfileCard key={user.id} {...user} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="rnrb-button-secondary rounded-xl px-4 py-2"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className={`h-10 w-10 rounded-xl font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                            : 'border border-border bg-surface hover:bg-surface-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="rnrb-button-secondary rounded-xl px-4 py-2"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Coming Soon Features - Only show when not searching */}
        {!hasSearched && (
          <Card className="rnrb-card p-8">
            <h2 className="font-display mb-4 text-2xl font-bold">Advanced Features</h2>
            <p className="mb-8 text-muted-foreground">
              Start searching above or explore these upcoming features:
            </p>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rnrb-card bg-surface-muted p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Search className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Advanced Filters</h3>
                <p className="text-sm text-muted-foreground">
                  Filter by genre, instrument, location, and availability
                </p>
              </div>

              <div className="rnrb-card bg-surface-muted p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Phone className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Phone Search</h3>
                <p className="text-sm text-muted-foreground">
                  Connect using phone numbers (with artist permission)
                </p>
              </div>

              <div className="rnrb-card bg-surface-muted p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Music className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Browse by Genre</h3>
                <p className="text-sm text-muted-foreground">
                  Discover artists working in your musical style
                </p>
              </div>

              <div className="rnrb-card bg-surface-muted p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Users className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Recommended Artists</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered recommendations based on your interests
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/settings/profile">
                <Button className="rnrb-button-primary rounded-xl px-8 py-3 font-semibold">
                  Set Up Your Profile First
                </Button>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                Make your profile public so other artists can find and connect with you
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
