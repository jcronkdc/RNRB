/**
 * Prisma Mock Utilities
 *
 * Provides mock implementations and helpers for testing database operations.
 */

import { vi } from 'vitest';

/**
 * Creates a mock Prisma client with all common models mocked.
 * This can be used to override the default mock with specific implementations.
 */
export function createMockPrismaClient() {
  return {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    song: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    track: {
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
      count: vi.fn(),
    },
    feedComment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    feedReaction: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    merchProduct: {
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
    merchOrderItem: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
    },
    creditPurchase: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    site: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tour: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    setlist: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      if (typeof callback === 'function') {
        return callback(createMockPrismaClient());
      }
      return Promise.all(callback);
    }),
    $disconnect: vi.fn(),
    $connect: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  };
}

/**
 * Type for the mock Prisma client
 */
export type MockPrismaClient = ReturnType<typeof createMockPrismaClient>;

/**
 * Mock data generators for common models
 */
export const mockDataGenerators = {
  /**
   * Generate a mock user with optional overrides
   */
  user: (overrides: Record<string, unknown> = {}) => ({
    id: `user_${Math.random().toString(36).slice(2)}`,
    email: `user${Date.now()}@example.com`,
    name: 'Test User',
    image: null,
    emailVerified: new Date(),
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    stripeCustomerId: `cus_${Math.random().toString(36).slice(2)}`,
    stripeSubscriptionId: null,
    aiRequestsUsed: 0,
    aiRequestsBonus: 0,
    videoMinutesUsed: 0,
    videoMinutesBonus: 0,
    storageUsedBytes: BigInt(0),
    storageBonusGB: 0,
    profileCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Generate a mock project with optional overrides
   */
  project: (overrides: Record<string, unknown> = {}) => ({
    id: `proj_${Math.random().toString(36).slice(2)}`,
    name: 'Test Project',
    slug: `test-project-${Date.now()}`,
    description: 'A test project',
    ownerId: `user_${Math.random().toString(36).slice(2)}`,
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Generate a mock song with optional overrides
   */
  song: (overrides: Record<string, unknown> = {}) => ({
    id: `song_${Math.random().toString(36).slice(2)}`,
    title: 'Test Song',
    projectId: `proj_${Math.random().toString(36).slice(2)}`,
    key: 'C',
    tempo: 120,
    lyrics: 'Test lyrics here',
    structure: '[]',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Generate a mock merch order with optional overrides
   */
  merchOrder: (overrides: Record<string, unknown> = {}) => ({
    id: `order_${Math.random().toString(36).slice(2)}`,
    orderNumber: `ORD-${Date.now()}`,
    siteId: `site_${Math.random().toString(36).slice(2)}`,
    status: 'pending',
    paymentStatus: 'pending',
    totalCents: 2999,
    shippingAddress: null,
    customerEmail: null,
    customerName: null,
    stripePaymentIntentId: null,
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Generate a mock credit purchase with optional overrides
   */
  creditPurchase: (overrides: Record<string, unknown> = {}) => ({
    id: `cp_${Math.random().toString(36).slice(2)}`,
    userId: `user_${Math.random().toString(36).slice(2)}`,
    type: 'ai',
    unitAmount: 100,
    storageAmount: null,
    priceCents: 999,
    stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
    status: 'pending',
    fulfilledAt: null,
    createdAt: new Date(),
    ...overrides,
  }),
};

export default createMockPrismaClient;
