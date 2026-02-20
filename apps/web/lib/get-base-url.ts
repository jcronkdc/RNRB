/**
 * Returns the application base URL.
 * Checks env vars in priority order and throws in production if none are set.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL.startsWith('http')
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return url.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('[getBaseUrl] No URL configured in production — using fallback');
    return 'https://www.cronkwaters.com';
  }

  return 'http://localhost:3001';
}
