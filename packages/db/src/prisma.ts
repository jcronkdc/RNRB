import { PrismaClient } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & {
  __cronkwatersPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

const prisma = globalForPrisma.__cronkwatersPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__cronkwatersPrisma = prisma;
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
