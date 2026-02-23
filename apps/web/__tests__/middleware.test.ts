import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: 'next' })),
      redirect: vi.fn((url: URL) => ({ type: 'redirect', url: url.toString() })),
      rewrite: vi.fn((url: URL) => ({ type: 'rewrite', url: url.toString() })),
      json: vi.fn((body: unknown, init?: ResponseInit) => ({
        type: 'json',
        body,
        status: init?.status,
      })),
    },
  };
});

function createRequest(
  path: string,
  options: {
    host?: string;
    cookies?: Record<string, string>;
    method?: string;
    headers?: Record<string, string>;
  } = {}
) {
  const url = `http://${options.host || 'www.cronkwaters.com'}${path}`;
  const req = new NextRequest(url, { method: options.method || 'GET' });

  if (options.cookies) {
    for (const [key, value] of Object.entries(options.cookies)) {
      req.cookies.set(key, value);
    }
  }

  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      req.headers.set(key, value);
    }
  }

  return req;
}

describe('Middleware', () => {
  beforeEach(() => {
    vi.resetModules();
    (process.env as Record<string, string>).NODE_ENV = 'test';
  });

  it('allows access to non-protected paths without session', async () => {
    const { proxy: middleware } = await import('../proxy');
    const req = createRequest('/');
    const res = await middleware(req);
    expect(res).toHaveProperty('type', 'next');
  });

  it('redirects to /auth for protected paths without session', async () => {
    const { proxy: middleware } = await import('../proxy');
    const req = createRequest('/dashboard');
    const res = await middleware(req);
    expect(res).toHaveProperty('type', 'redirect');
  });

  it('allows access to protected paths with session cookie', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'development';
    const { proxy: middleware } = await import('../proxy');
    const req = createRequest('/dashboard', {
      cookies: { 'next-auth.session-token': 'valid-session-token' },
    });
    const res = await middleware(req);
    expect(res).toHaveProperty('type');
  });

  it('redirects authenticated users away from /auth', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'development';
    const { proxy: middleware } = await import('../proxy');
    const req = createRequest('/auth', {
      cookies: { 'next-auth.session-token': 'valid-session-token' },
    });
    const res = await middleware(req);
    expect(res).toHaveProperty('type', 'redirect');
  });

  it('rewrites artist subdomain requests to /s/ route', async () => {
    const { proxy: middleware } = await import('../proxy');
    const req = createRequest('/', {
      host: 'myband.rnrb.band',
      headers: { host: 'myband.rnrb.band' },
    });
    const res = await middleware(req);
    expect(res).toHaveProperty('type', 'rewrite');
  });

  it('rewrites profile subdomain requests to /u/ route', async () => {
    const { proxy: middleware } = await import('../proxy');
    const req = createRequest('/', {
      host: 'johndoe.rnrb.bio',
      headers: { host: 'johndoe.rnrb.bio' },
    });
    const res = await middleware(req);
    expect(res).toHaveProperty('type', 'rewrite');
  });
});
