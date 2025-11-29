/**
 * FETCH UTILITIES
 *
 * Provides timeout-enabled fetch and retry utilities for external API calls.
 * Prevents hung requests and improves reliability.
 */

/**
 * Fetch with timeout support using AbortController
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: 10 seconds)
 * @returns Promise<Response>
 * @throws Error if request times out or fails
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch with retry support
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param config - Retry configuration
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: {
    maxRetries?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<Response> {
  const { maxRetries = 3, timeoutMs = 10000, retryDelayMs = 1000, backoff = true } = config;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);

      // Retry on 5xx errors
      if (response.status >= 500 && attempt < maxRetries) {
        const delay = backoff ? retryDelayMs * Math.pow(2, attempt) : retryDelayMs;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = backoff ? retryDelayMs * Math.pow(2, attempt) : retryDelayMs;
        console.warn(`[FETCH] Retry ${attempt + 1}/${maxRetries} for ${url}: ${lastError.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch after ${maxRetries} retries: ${url}`);
}

/**
 * Preset timeouts for different types of external services
 */
export const TIMEOUTS = {
  /** Fast APIs like Datamuse (5 seconds) */
  FAST_API: 5000,
  /** Standard APIs (10 seconds) */
  STANDARD: 10000,
  /** AI/ML APIs that may take longer (30 seconds) */
  AI_SERVICE: 30000,
  /** Image generation APIs (60 seconds) */
  IMAGE_GENERATION: 60000,
  /** File operations (120 seconds) */
  FILE_OPERATION: 120000,
} as const;
