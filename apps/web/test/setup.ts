/**
 * Vitest Test Setup
 *
 * This file runs before all tests to set up the testing environment.
 * It configures:
 * - DOM testing utilities (jsdom)
 * - Custom matchers (jest-dom)
 * - Mock implementations for external services
 * - Environment variables for tests
 */

import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Extend Vitest matchers with jest-dom
import '@testing-library/jest-dom/vitest';

// ============================================
// Environment Setup
// ============================================

// Set test environment variables
// NODE_ENV is typically read-only in TypeScript, but we need to set it for tests
(process.env as Record<string, string>).NODE_ENV = 'test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// ============================================
// Mock: Next.js Router
// ============================================

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(() => []),
  }),
}));

// ============================================
// Mock: NextAuth
// ============================================

vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(() =>
    Promise.resolve({
      user: null,
      expires: new Date().toISOString(),
    })
  ),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

// ============================================
// Mock: Prisma Client
// ============================================

vi.mock('@cronkwaters/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    song: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    feedPost: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    merchOrder: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    creditPurchase: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn((callback) =>
      callback({
        user: { findUnique: vi.fn(), update: vi.fn() },
        project: { findUnique: vi.fn(), update: vi.fn() },
      })
    ),
    $disconnect: vi.fn(),
    $connect: vi.fn(),
  },
}));

// ============================================
// Mock: Stripe
// ============================================

const mockStripeInstance = {
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  subscriptions: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
  },
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
    confirm: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripeInstance),
}));

// ============================================
// Mock: Ably
// ============================================

vi.mock('ably', () => ({
  Realtime: vi.fn(() => ({
    connection: {
      on: vi.fn(),
      once: vi.fn(),
      off: vi.fn(),
      state: 'connected',
    },
    channels: {
      get: vi.fn(() => ({
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        publish: vi.fn(),
        presence: {
          enter: vi.fn(),
          leave: vi.fn(),
          get: vi.fn(),
          subscribe: vi.fn(),
        },
      })),
    },
    close: vi.fn(),
  })),
}));

// ============================================
// Mock: Email (Resend)
// ============================================

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(() => Promise.resolve({ id: 'test-email-id' })),
    },
  })),
}));

// ============================================
// Mock: Daily.co
// ============================================

vi.mock('@daily-co/daily-js', () => ({
  default: {
    createCallObject: vi.fn(() => ({
      join: vi.fn(),
      leave: vi.fn(),
      destroy: vi.fn(),
      setLocalAudio: vi.fn(),
      setLocalVideo: vi.fn(),
      participants: vi.fn(() => ({})),
      on: vi.fn(),
      off: vi.fn(),
    })),
  },
}));

// ============================================
// Mock: fetch for API routes
// ============================================

const originalFetch = global.fetch;

beforeAll(() => {
  // Mock fetch for tests
  global.fetch = vi.fn((url, options) => {
    // Default mock response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      headers: new Headers(),
    } as Response);
  });
});

afterAll(() => {
  // Restore original fetch
  global.fetch = originalFetch;
});

// ============================================
// Cleanup
// ============================================

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

// ============================================
// Test Utilities Export
// ============================================

export { mockStripeInstance };

/**
 * Helper to create a mock session
 */
export function createMockSession(overrides = {}) {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      subscriptionTier: 'free',
      ...overrides,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Helper to create a mock user
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    stripeCustomerId: 'cus_test123',
    stripeSubscriptionId: null,
    aiRequestsUsed: 0,
    aiRequestsBonus: 0,
    videoMinutesUsed: 0,
    videoMinutesBonus: 0,
    storageUsedBytes: 0,
    storageBonusGB: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Helper to create a mock Stripe webhook event
 */
export function createMockStripeEvent(type: string, data: Record<string, unknown>) {
  return {
    id: `evt_test_${Date.now()}`,
    type,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    object: 'event',
    api_version: '2024-06-20',
  };
}

/**
 * Helper to create a mock Stripe subscription
 */
export function createMockStripeSubscription(overrides = {}) {
  return {
    id: 'sub_test123',
    customer: 'cus_test123',
    status: 'active',
    items: {
      data: [
        {
          price: {
            id: 'price_creator',
          },
        },
      ],
    },
    created: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    canceled_at: null,
    trial_end: null,
    ...overrides,
  };
}

/**
 * Helper to create mock Next.js Request
 */
export function createMockNextRequest(url: string, options: RequestInit = {}): Request {
  return new Request(`http://localhost:3000${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
}
