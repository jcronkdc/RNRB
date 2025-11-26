/**
 * Dashboard Data Hook
 * Optimized data fetching for dashboard with caching and auto-refresh
 * SAFETY: Includes proper cleanup, error handling, and memory leak prevention
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface DashboardStats {
  projectCount: number;
  songCount: number;
  collaboratorCount: number;
  recentActivity: number;
  storageUsed: number;
  storageTotal: number;
}

interface UseDashboardDataOptions {
  refreshInterval?: number; // in ms
  enabled?: boolean;
}

const CACHE_KEY = 'dashboard_stats_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options;
  
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const mountedRef = useRef(true); // Safety: track mounted state

  // Try to load from cache first (only in browser)
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
      console.warn('Failed to load dashboard cache:', e);
    }
    return false;
  }, []);

  // Save to cache (only in browser)
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
      console.warn('Failed to save dashboard cache:', e);
    }
  }, []);

  // Fetch dashboard data with safety checks
  const fetchData = useCallback(async (force = false) => {
    if (!enabled || !mountedRef.current) return;
    
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('Dashboard: Skipping concurrent fetch');
      return;
    }
    
    // Rate limiting - don't fetch more than once per 5 seconds
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 5000) {
      console.log('Dashboard: Rate limit hit, skipping fetch');
      return;
    }

    fetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      // TODO: Replace with actual API call
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Safety: check if still mounted before updating state
      if (!mountedRef.current) {
        console.log('Dashboard: Component unmounted, skipping state update');
        return;
      }
      
      const mockData: DashboardStats = {
        projectCount: 5,
        songCount: 23,
        collaboratorCount: 8,
        recentActivity: 15,
        storageUsed: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
        storageTotal: 50 * 1024 * 1024 * 1024, // 50 GB
      };

      if (mountedRef.current) {
        setData(mockData);
        setError(null);
        saveToCache(mockData);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [enabled, saveToCache]);

  // Initial load
  useEffect(() => {
    if (!enabled) return;

    mountedRef.current = true;

    // Try cache first
    const hasCache = loadFromCache();
    
    // Fetch fresh data in background
    fetchData(!hasCache);

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
    };
  }, [enabled, loadFromCache, fetchData]);

  // Auto-refresh with proper cleanup
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchData();
      }
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, refreshInterval, fetchData]);

  // Refresh handler
  const refresh = useCallback(() => {
    if (mountedRef.current) {
      setLoading(true);
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
  return `${gb.toFixed(1)} GB`;
}

/**
 * Calculate storage percentage
 */
export function getStoragePercentage(used: number, total: number): number {
  if (!total || total <= 0) return 0;
  if (!used || used < 0) return 0;
  const percentage = Math.round((used / total) * 100);
  return Math.min(100, Math.max(0, percentage)); // Clamp between 0-100
}

