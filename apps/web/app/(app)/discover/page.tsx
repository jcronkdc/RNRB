'use client';

import { Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  Mail,
  Phone,
  Music,
  Sparkles,
  Loader2,
  AlertCircle,
  UserPlus,
  UserCheck,
  ArrowRight,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { UserProfileCard, type UserProfileCardProps } from '@/components/user-profile-card';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchUser extends UserProfileCardProps {
  isFollowing?: boolean;
}

interface SearchResponse {
  users: SearchUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

interface SuggestedUser {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  profile: {
    genres: string[];
    instruments: string[];
    availableForCollaboration: boolean;
  } | null;
  stats: {
    followers: number;
    posts: number;
  };
  followsYou: boolean;
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'email' | 'phone'>('username');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Suggested users
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Fetch suggested users on mount
  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const response = await fetch('/api/users/suggested');
        if (response.ok) {
          const data = await response.json();
          setSuggestedUsers(data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setSuggestionsLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  const handleFollowSuggested = async (userId: string) => {
    try {
      const response = await fetch(`/api/community/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isFollowing) {
          setFollowingIds(prev => new Set([...prev, userId]));
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Hero Section */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* White RR Logo [[memory:11700420]] */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex justify-center"
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

          {/* Accent bar */}
          <div
            style={{
              marginBottom: '24px',
              height: '4px',
              width: '48px',
              borderRadius: '2px',
              backgroundColor: 'var(--accent)',
            }}
          />

          <div className="flex items-center gap-4">
            <div
              style={{
                display: 'flex',
                height: '56px',
                width: '56px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              <Users style={{ height: '28px', width: '28px', color: 'var(--accent)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Build Your Network</p>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                Discover Musicians
              </h1>
            </div>
          </div>
          <p
            style={{
              marginTop: '12px',
              maxWidth: '42rem',
              fontSize: '1.125rem',
              color: 'var(--muted)',
            }}
          >
            Find collaborators, connect with artists worldwide, build your creative network
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Search Box */}
        <div
          style={{
            marginBottom: '32px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--panel)',
            padding: '32px',
          }}
        >
          <h2
            style={{
              marginBottom: '24px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--text)',
            }}
          >
            Search for Artists
          </h2>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSearchType('username')}
              style={{
                borderRadius: 'var(--radius-sm)',
                padding: '10px 24px',
                fontWeight: '500',
                transition: 'all 0.2s',
                backgroundColor: searchType === 'username' ? 'var(--accent)' : 'var(--bg)',
                color: 'var(--text)',
                border: searchType === 'username' ? 'none' : '1px solid var(--border)',
              }}
            >
              <Users className="mr-2 inline-block h-4 w-4" />
              Username
            </button>
            <button
              onClick={() => setSearchType('email')}
              style={{
                borderRadius: 'var(--radius-sm)',
                padding: '10px 24px',
                fontWeight: '500',
                transition: 'all 0.2s',
                backgroundColor: searchType === 'email' ? 'var(--accent)' : 'var(--bg)',
                color: 'var(--text)',
                border: searchType === 'email' ? 'none' : '1px solid var(--border)',
              }}
            >
              <Mail className="mr-2 inline-block h-4 w-4" />
              Email
            </button>
            <button
              onClick={() => setSearchType('phone')}
              style={{
                borderRadius: 'var(--radius-sm)',
                padding: '10px 24px',
                fontWeight: '500',
                transition: 'all 0.2s',
                backgroundColor: searchType === 'phone' ? 'var(--accent)' : 'var(--bg)',
                color: 'var(--text)',
                border: searchType === 'phone' ? 'none' : '1px solid var(--border)',
              }}
            >
              <Phone className="mr-2 inline-block h-4 w-4" />
              Phone
            </button>
          </div>

          <div className="relative">
            <Search
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '20px',
                width: '20px',
                color: 'var(--muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search by ${searchType}... (min 2 characters)`}
              style={{
                width: '100%',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                padding: '14px 48px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            {isLoading && (
              <Loader2
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '20px',
                  width: '20px',
                  color: 'var(--accent)',
                }}
                className="animate-spin"
              />
            )}
          </div>

          <div
            style={{
              marginTop: '16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              padding: '16px',
            }}
          >
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                color: 'var(--muted)',
              }}
            >
              <Sparkles style={{ height: '16px', width: '16px', color: 'var(--accent)' }} />
              Search respects privacy. Only public profiles appear in results.
            </p>
          </div>
        </div>

        {/* Search Results */}
        {error && (
          <div
            style={{
              marginBottom: '32px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--error)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '24px',
            }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle style={{ height: '20px', width: '20px', color: 'var(--error)' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--error)' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {hasSearched && !isLoading && searchResults.length === 0 && !error && (
          <div
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--panel)',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <Users
              style={{
                margin: '0 auto 16px',
                height: '64px',
                width: '64px',
                color: 'var(--muted)',
              }}
            />
            <h3
              style={{
                marginBottom: '8px',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text)',
              }}
            >
              No users found
            </h3>
            <p style={{ color: 'var(--muted)' }}>Try adjusting your search terms or search type</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                Found{' '}
                <span style={{ fontWeight: '600', color: 'var(--text)' }}>{totalResults}</span>{' '}
                {totalResults === 1 ? 'user' : 'users'}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((user) => (
                <UserProfileCard 
                  key={user.id} 
                  {...user} 
                  isFollowing={user.isFollowing}
                  onFollowChange={(userId, isFollowing, newCount) => {
                    setSearchResults(prev => prev.map(u => 
                      u.id === userId 
                        ? { ...u, isFollowing, stats: { ...u.stats, followers: newCount } }
                        : u
                    ));
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 16px',
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
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
                        style={{
                          height: '40px',
                          width: '40px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                          backgroundColor:
                            currentPage === pageNum ? 'var(--accent)' : 'var(--panel)',
                          color: 'var(--text)',
                          border: currentPage === pageNum ? 'none' : '1px solid var(--border)',
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 16px',
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Suggested Users - Show when not searching */}
        {!hasSearched && suggestedUsers.length > 0 && (
          <div
            style={{
              marginBottom: '32px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--panel)',
              padding: '32px',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}
                >
                  Suggested for You
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                  Musicians you might want to connect with
                </p>
              </div>
              <Link href="/network">
                <button
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  My Network
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {suggestionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      padding: '16px',
                    }}
                  >
                    <Link href={`/community/users/${user.id}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          style={{
                            height: '48px',
                            width: '48px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: 'var(--accent-dim)',
                            flexShrink: 0,
                          }}
                        >
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || 'User'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Users style={{ height: '20px', width: '20px', color: 'var(--accent)' }} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              style={{
                                fontWeight: '600',
                                color: 'var(--text)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {user.name || 'Anonymous'}
                            </h3>
                            {user.followsYou && (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '2px 6px',
                                  borderRadius: '9999px',
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  color: '#22c55e',
                                  fontWeight: '500',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Follows you
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {user.stats.followers} followers
                          </p>
                        </div>
                      </div>
                    </Link>
                    
                    {user.profile?.genres && user.profile.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {user.profile.genres.slice(0, 2).map((genre) => (
                          <span
                            key={genre}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--panel)',
                              color: 'var(--muted)',
                            }}
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleFollowSuggested(user.id)}
                      disabled={followingIds.has(user.id)}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        backgroundColor: followingIds.has(user.id) ? 'var(--bg)' : 'var(--accent)',
                        color: 'var(--text)',
                        border: followingIds.has(user.id) ? '1px solid var(--border)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {followingIds.has(user.id) ? (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Coming Soon Features - Only show when not searching */}
        {!hasSearched && (
          <div
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--panel)',
              padding: '32px',
            }}
          >
            <h2
              style={{
                marginBottom: '16px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--text)',
              }}
            >
              Advanced Features
            </h2>
            <p style={{ marginBottom: '32px', color: 'var(--muted)' }}>
              Start searching above or explore these upcoming features:
            </p>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    height: '48px',
                    width: '48px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-dim)',
                  }}
                >
                  <Search style={{ height: '24px', width: '24px', color: 'var(--accent)' }} />
                </div>
                <h3 style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text)' }}>
                  Advanced Filters
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  Filter by genre, instrument, location, and availability
                </p>
              </div>

              <div
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    height: '48px',
                    width: '48px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-dim)',
                  }}
                >
                  <Phone style={{ height: '24px', width: '24px', color: 'var(--accent)' }} />
                </div>
                <h3 style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text)' }}>
                  Phone Search
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  Connect using phone numbers (with artist permission)
                </p>
              </div>

              <div
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    height: '48px',
                    width: '48px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-dim)',
                  }}
                >
                  <Music style={{ height: '24px', width: '24px', color: 'var(--accent)' }} />
                </div>
                <h3 style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text)' }}>
                  Browse by Genre
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  Discover artists working in your musical style
                </p>
              </div>

              <div
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    height: '48px',
                    width: '48px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-dim)',
                  }}
                >
                  <Users style={{ height: '24px', width: '24px', color: 'var(--accent)' }} />
                </div>
                <h3 style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text)' }}>
                  Recommended Artists
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  AI-powered recommendations based on your interests
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/settings/profile">
                <Button
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 32px',
                    fontWeight: '600',
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text)',
                  }}
                >
                  Set Up Your Profile First
                </Button>
              </Link>
              <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                Make your profile public so other artists can find and connect with you
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
