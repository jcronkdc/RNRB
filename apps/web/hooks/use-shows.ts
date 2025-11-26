/**
 * Custom hook for fetching and managing shows data
 * Includes caching, pagination, and optimistic updates
 */

import { useCallback, useEffect, useState } from 'react';

interface Show {
  id: string;
  name: string;
  slug: string;
  date: string;
  status: string;
  venue?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
  };
  tour?: {
    id: string;
    name: string;
  };
  setlist?: {
    id: string;
    name: string;
  };
}

interface ShowsResponse {
  shows: Show[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface UseShowsOptions {
  orgId?: string;
  tourId?: string;
  projectId?: string;
  status?: string;
  upcoming?: boolean;
  includeSetlist?: boolean;
  autoFetch?: boolean;
}

export function useShows(options: UseShowsOptions = {}) {
  const {
    orgId,
    tourId,
    projectId,
    status,
    upcoming,
    includeSetlist = false,
    autoFetch = true,
  } = options;

  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchShows = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '20',
          ...(orgId && { orgId }),
          ...(tourId && { tourId }),
          ...(projectId && { projectId }),
          ...(status && { status }),
          ...(upcoming !== undefined && { upcoming: upcoming.toString() }),
          ...(includeSetlist && { includeSetlist: 'true' }),
        });

        const response = await fetch(`/api/shows?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch shows');
        }

        const data: ShowsResponse = await response.json();

        setShows((prev) => (append ? [...prev, ...data.shows] : data.shows));
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching shows:', err);
      } finally {
        setLoading(false);
      }
    },
    [orgId, tourId, projectId, status, upcoming, includeSetlist]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchShows(page + 1, true);
    }
  }, [loading, hasMore, page, fetchShows]);

  const refresh = useCallback(() => {
    fetchShows(1, false);
  }, [fetchShows]);

  // Optimistic updates
  const addShowOptimistic = useCallback((show: Show) => {
    setShows((prev) => [show, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  const updateShowOptimistic = useCallback((showId: string, updates: Partial<Show>) => {
    setShows((prev) => prev.map((show) => (show.id === showId ? { ...show, ...updates } : show)));
  }, []);

  const deleteShowOptimistic = useCallback((showId: string) => {
    setShows((prev) => prev.filter((show) => show.id !== showId));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchShows();
    }
  }, [autoFetch, fetchShows]);

  return {
    shows,
    loading,
    error,
    total,
    page,
    hasMore,
    fetchShows,
    loadMore,
    refresh,
    addShowOptimistic,
    updateShowOptimistic,
    deleteShowOptimistic,
  };
}



