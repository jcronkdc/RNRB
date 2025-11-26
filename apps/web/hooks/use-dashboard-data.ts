/**
 * Dashboard Data Hook - REAL DATA VERSION
 * Fetches actual stats from /api/dashboard/stats
 * Includes caching, auto-refresh, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface DashboardStats {
  projectCount: number;
  songCount: number;
  collaboratorCount: number;
  recentActivity: number;
  storageUsed: number;
  storageTotal: number;
  subscriptionTier?: string;
}

interface UseDashboardDataOptions {
  refreshInterval?: number; // in ms
  enabled?: boolean;
}

const CACHE_KEY = 'dashboard_stats_cache';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (shorter for real data)

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  // Load from cache (browser only)
  const loadFromCache = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < CACHE_TTL) {
          if (mountedRef.current) {
            setData(cachedData);
            setLoading(false);
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('[Dashboard] Cache load failed:', e);
    }
    return false;
  }, []);

  // Save to cache (browser only)
  const saveToCache = useCallback((newData: DashboardStats) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: newData,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn('[Dashboard] Cache save failed:', e);
    }
  }, []);

  // Fetch real dashboard data
  const fetchData = useCallback(async (force = false) => {
    if (!enabled || !mountedRef.current) return;
    
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    
    // Rate limiting - don't fetch more than once per 3 seconds
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 3000) return;

    fetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!mountedRef.current) return;

      if (!response.ok) {
        // Handle auth errors silently (user not logged in)
        if (response.status === 401) {
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const stats: DashboardStats = await response.json();
      
      if (mountedRef.current) {
        setData(stats);
        setError(null);
        saveToCache(stats);
        retryCountRef.current = 0; // Reset retry count on success
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      
      if (mountedRef.current) {
        // Only set error if we don't have cached data
        if (!data) {
          setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
        }
        
        // Exponential backoff retry (max 3 retries)
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 8000);
          setTimeout(() => fetchData(true), delay);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [enabled, data, saveToCache]);

  // Initial load
  useEffect(() => {
    if (!enabled) return;

    mountedRef.current = true;

    // Try cache first
    const hasCache = loadFromCache();
    
    // Fetch fresh data (in background if cached)
    fetchData(!hasCache);

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, loadFromCache, fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enabled, refreshInterval, fetchData]);

  // Manual refresh
  const refresh = useCallback(() => {
    if (mountedRef.current) {
      setLoading(true);
      retryCountRef.current = 0;
      return fetchData(true);
    }
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

/**
 * Format storage size for display
 */
export function formatStorageSize(bytes: number): string {
  if (!bytes || bytes < 0) return '0 GB';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb < 1) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  }
  return `${gb.toFixed(1)} GB`;
}

/**
 * Calculate storage percentage
 */
export function getStoragePercentage(used: number, total: number): number {
  if (!total || total <= 0) return 0;
  if (!used || used < 0) return 0;
  const percentage = Math.round((used / total) * 100);
  return Math.min(100, Math.max(0, percentage));
}
