import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('getBaseUrl', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  async function importGetBaseUrl() {
    const mod = await import('../get-base-url');
    return mod.getBaseUrl;
  }

  it('returns NEXT_PUBLIC_APP_URL when set', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.cronkwaters.com';
    const getBaseUrl = await importGetBaseUrl();
    expect(getBaseUrl()).toBe('https://www.cronkwaters.com');
  });

  it('strips trailing slash from NEXT_PUBLIC_APP_URL', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.cronkwaters.com/';
    const getBaseUrl = await importGetBaseUrl();
    expect(getBaseUrl()).toBe('https://www.cronkwaters.com');
  });

  it('falls back to NEXTAUTH_URL when NEXT_PUBLIC_APP_URL is missing', async () => {
    process.env.NEXTAUTH_URL = 'https://auth.cronkwaters.com';
    const getBaseUrl = await importGetBaseUrl();
    expect(getBaseUrl()).toBe('https://auth.cronkwaters.com');
  });

  it('falls back to VERCEL_URL with https prefix', async () => {
    process.env.VERCEL_URL = 'cronkwaters.vercel.app';
    const getBaseUrl = await importGetBaseUrl();
    expect(getBaseUrl()).toBe('https://cronkwaters.vercel.app');
  });

  it('handles VERCEL_URL that already has http prefix', async () => {
    process.env.VERCEL_URL = 'https://cronkwaters.vercel.app';
    const getBaseUrl = await importGetBaseUrl();
    expect(getBaseUrl()).toBe('https://cronkwaters.vercel.app');
  });

  it('returns localhost in development when no env vars set', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'development';
    const getBaseUrl = await importGetBaseUrl();
    expect(getBaseUrl()).toBe('http://localhost:3001');
  });

  it('returns fallback URL in production when no env vars set', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const getBaseUrl = await importGetBaseUrl();
    expect(getBaseUrl()).toBe('https://www.cronkwaters.com');
  });

  it('prioritizes NEXT_PUBLIC_APP_URL over NEXTAUTH_URL', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.cronkwaters.com';
    process.env.NEXTAUTH_URL = 'https://auth.cronkwaters.com';
    const getBaseUrl = await importGetBaseUrl();
    expect(getBaseUrl()).toBe('https://app.cronkwaters.com');
  });
});
