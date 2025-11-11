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




