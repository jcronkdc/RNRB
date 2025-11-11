import { PrismaClient } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & {
  __songforgePrisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

const prisma =
  globalForPrisma.__songforgePrisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__songforgePrisma = prisma;
}

if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connected');
    } catch (error) {
      console.warn('⚠️ Database connection failed', error);
    }
  })();
}

export { prisma };
export * from '@prisma/client';

// Helper functions
export * from './helpers/projects';
export * from './helpers/songs';
export * from './helpers/assets';
export * from './helpers/splits';
export * from './helpers/licenses';
export * from './helpers/events';
export * from './helpers/podcasts';

// Validation schemas
export * from './validation';
