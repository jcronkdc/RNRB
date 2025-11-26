/**
 * Custom hook for fetching and managing tours data
 * Includes caching, pagination, and optimistic updates
 */

import { useCallback, useEffect, useState } from 'react';

interface Tour {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  posterImage?: string;
  public: boolean;
  org: {
    id: string;
    name: string;
    slug: string;
  };
  shows?: any[];
  _count?: {
    shows: number;
  };
}

interface ToursResponse {
  tours: Tour[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface UseToursOptions {
  orgId?: string;
  status?: string;
  includeShows?: boolean;
  autoFetch?: boolean;
}

export function useTours(options: UseToursOptions = {}) {
  const { orgId, status, includeShows = false, autoFetch = true } = options;

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchTours = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '20',
          ...(orgId && { orgId }),
          ...(status && { status }),
          ...(includeShows && { includeShows: 'true' }),
        });

        const response = await fetch(`/api/tours?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }

        const data: ToursResponse = await response.json();

        setTours((prev) => (append ? [...prev, ...data.tours] : data.tours));
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching tours:', err);
      } finally {
        setLoading(false);
      }
    },
    [orgId, status, includeShows]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchTours(page + 1, true);
    }
  }, [loading, hasMore, page, fetchTours]);

  const refresh = useCallback(() => {
    fetchTours(1, false);
  }, [fetchTours]);

  // Optimistic update for creating a tour
  const addTourOptimistic = useCallback((tour: Tour) => {
    setTours((prev) => [tour, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  // Optimistic update for updating a tour
  const updateTourOptimistic = useCallback((tourId: string, updates: Partial<Tour>) => {
    setTours((prev) =>
      prev.map((tour) => (tour.id === tourId ? { ...tour, ...updates } : tour))
    );
  }, []);

  // Optimistic update for deleting a tour
  const deleteTourOptimistic = useCallback((tourId: string) => {
    setTours((prev) => prev.filter((tour) => tour.id !== tourId));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTours();
    }
  }, [autoFetch, fetchTours]);

  return {
    tours,
    loading,
    error,
    total,
    page,
    hasMore,
    fetchTours,
    loadMore,
    refresh,
    addTourOptimistic,
    updateTourOptimistic,
    deleteTourOptimistic,
  };
}





