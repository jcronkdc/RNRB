/**
 * FETCH WITH TIMEOUT
 *
 * A utility wrapper around fetch that adds timeout support using AbortController.
 * Prevents hung requests from exhausting serverless concurrency.
 *
 * Usage:
 *   import { fetchWithTimeout } from '@/lib/fetch-with-timeout';
 *
 *   // Basic usage (30s default timeout)
 *   const response = await fetchWithTimeout('https://api.example.com/data');
 *
 *   // Custom timeout (10 seconds)
 *   const response = await fetchWithTimeout('https://api.example.com/data', {
 *     timeout: 10000,
 *   });
 *
 *   // With other fetch options
 *   const response = await fetchWithTimeout('https://api.example.com/data', {
 *     timeout: 5000,
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ data: 'value' }),
 *   });
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  /** Timeout in milliseconds. Default: 30000 (30 seconds) */
  timeout?: number;
}

export class FetchTimeoutError extends Error {
  constructor(url: string, timeout: number) {
    super(`Request to ${url} timed out after ${timeout}ms`);
    this.name = 'FetchTimeoutError';
  }
}

/**
 * Fetch with automatic timeout support
 *
 * @param url - The URL to fetch
 * @param options - Fetch options plus optional timeout
 * @returns Promise<Response>
 * @throws FetchTimeoutError if the request times out
 */
export async function fetchWithTimeout(
  url: string | URL,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchTimeoutError(url.toString(), timeout);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Convenience method for JSON APIs with timeout
 *
 * @param url - The URL to fetch
 * @param options - Fetch options plus optional timeout
 * @returns Promise<T> - Parsed JSON response
 */
export async function fetchJsonWithTimeout<T = unknown>(
  url: string | URL,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * POST JSON with timeout
 *
 * @param url - The URL to POST to
 * @param data - Data to send as JSON body
 * @param options - Additional fetch options
 * @returns Promise<T> - Parsed JSON response
 */
export async function postJsonWithTimeout<T = unknown>(
  url: string | URL,
  data: unknown,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  return fetchJsonWithTimeout<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

// Preset timeout values for different API types
export const TIMEOUT_PRESETS = {
  /** Fast internal APIs (5 seconds) */
  FAST: 5000,
  /** Standard APIs (15 seconds) */
  STANDARD: 15000,
  /** Slow external APIs (30 seconds) */
  SLOW: 30000,
  /** Very slow operations like file processing (60 seconds) */
  EXTENDED: 60000,
  /** AI/ML APIs that may take longer (120 seconds) */
  AI: 120000,
} as const;
