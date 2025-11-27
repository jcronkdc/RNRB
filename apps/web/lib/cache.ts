/**
 * Simple in-memory cache for API responses
 * Useful for frequently accessed, relatively static data like user memberships
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 300000): void {
    // Default TTL: 5 minutes
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key);
      }
    }
  }
}

export const cache = new Cache();

// Run cleanup every 10 minutes
let cleanupInterval: NodeJS.Timeout | null = null;

if (typeof window === 'undefined') {
  // Server-side only
  cleanupInterval = setInterval(() => cache.cleanup(), 600000);
  
  // Cleanup on process exit (for serverless environments)
  if (typeof process !== 'undefined') {
    const cleanup = () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
      }
    };
    
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    process.on('exit', cleanup);
  }
}

/**
 * Helper to wrap async functions with caching
 */
export async function withCache<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fn();
  cache.set(key, data, ttl);
  return data;
}






