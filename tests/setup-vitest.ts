import { beforeAll, vi } from 'vitest';

// Mock database for unit tests
beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Mocking database for unit tests.');
    
    // Mock @cronkwaters/db module
    vi.mock('@cronkwaters/db', () => ({
      prisma: {
        $transaction: vi.fn(),
        splitContributor: {
          deleteMany: vi.fn(),
        },
        splitSheet: {
          deleteMany: vi.fn(),
        },
        asset: {
          deleteMany: vi.fn(),
        },
        project: {
          deleteMany: vi.fn(),
        },
        org: {
          deleteMany: vi.fn(),
        }
      }
    }));
  } else {
    // If DATABASE_URL is set, use real database
    const { prisma } = await import('@cronkwaters/db');
    
    await prisma.$transaction([
      prisma.splitContributor.deleteMany({}),
      prisma.splitSheet.deleteMany({}),
      prisma.asset.deleteMany({}),
      prisma.project.deleteMany({ where: { slug: { startsWith: 'test-project' } } }),
      prisma.org.deleteMany({ where: { slug: { startsWith: 'test-org' } } })
    ]);
  }
});
