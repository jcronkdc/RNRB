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
    <div className="bg-background min-h-screen">
      {/* Premium Hero */}
      <div className="border-border/50 relative overflow-hidden border-b">
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="bg-brand-primary/10 absolute right-1/3 top-0 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-6xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <Users className="text-brand-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Build Your Network</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Discover Musicians</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
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
                  : 'border-border bg-surface-muted text-foreground hover:bg-surface border'
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
                  : 'border-border bg-surface-muted text-foreground hover:bg-surface border'
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
                  : 'border-border bg-surface-muted text-foreground hover:bg-surface border'
              }`}
            >
              <Phone className="mr-2 inline-block h-4 w-4" />
              Phone
            </button>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search by ${searchType}... (min 2 characters)`}
              className="border-border bg-surface text-foreground placeholder-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-xl border py-3.5 pl-12 pr-12 outline-none transition focus:ring-2"
            />
            {isLoading && (
              <Loader2 className="text-brand-primary absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin" />
            )}
          </div>

          <div className="rnrb-card border-brand-primary/20 bg-brand-primary/5 mt-4 p-4">
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Sparkles className="text-brand-primary h-4 w-4" />
              Search respects privacy. Only public profiles appear in results.
            </p>
          </div>
        </Card>

        {/* Search Results */}
        {error && (
          <Card className="rnrb-card mb-8 border-destructive/50 bg-destructive/5 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          </Card>
        )}

        {hasSearched && !isLoading && searchResults.length === 0 && !error && (
          <Card className="rnrb-card p-12 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="font-display mb-2 text-xl font-semibold">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or search type
            </p>
          </Card>
        )}

        {searchResults.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Found <span className="font-semibold text-foreground">{totalResults}</span> {totalResults === 1 ? 'user' : 'users'}
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
                            : 'border-border bg-surface hover:bg-surface-muted border'
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
            <p className="text-muted-foreground mb-8">
              Start searching above or explore these upcoming features:
            </p>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rnrb-card bg-surface-muted p-6">
                <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Search className="text-brand-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">Advanced Filters</h3>
                <p className="text-muted-foreground text-sm">
                  Filter by genre, instrument, location, and availability
                </p>
              </div>

              <div className="rnrb-card bg-surface-muted p-6">
                <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Phone className="text-brand-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">Phone Search</h3>
                <p className="text-muted-foreground text-sm">
                  Connect using phone numbers (with artist permission)
                </p>
              </div>

              <div className="rnrb-card bg-surface-muted p-6">
                <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Music className="text-brand-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">Browse by Genre</h3>
                <p className="text-muted-foreground text-sm">
                  Discover artists working in your musical style
                </p>
              </div>

              <div className="rnrb-card bg-surface-muted p-6">
                <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Users className="text-brand-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">Recommended Artists</h3>
                <p className="text-muted-foreground text-sm">
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
              <p className="text-muted-foreground mt-3 text-xs">
                Make your profile public so other artists can find and connect with you
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
