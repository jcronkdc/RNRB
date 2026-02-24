import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import type { Prisma } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & {
  __cronkwatersPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

function createPrismaClient(): PrismaClient {
  const connectionString = (process.env.DATABASE_URL || '').trim();
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
  });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Prisma] Database connection initialized (v7 with pg adapter)');
  }

  return client;
}

function createBuildTimeStub(): PrismaClient {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'then' || prop === Symbol.toPrimitive || prop === Symbol.toStringTag)
        return undefined;
      if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve();
      if (prop === '$extends') return () => new Proxy({}, handler);
      if (prop === '$queryRaw') return () => Promise.resolve([]);
      return new Proxy(() => {}, {
        get() {
          throw new Error(`DATABASE_URL is not set — cannot perform DB operations at build time.`);
        },
        apply() {
          throw new Error(`DATABASE_URL is not set — cannot perform DB operations at build time.`);
        },
      });
    },
  };
  return new Proxy({}, handler) as unknown as PrismaClient;
}

const basePrisma: PrismaClient =
  globalForPrisma.__cronkwatersPrisma ??
  (process.env.DATABASE_URL ? createPrismaClient() : createBuildTimeStub());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__cronkwatersPrisma = basePrisma;
}

// Convert former $use middleware to $extends (Prisma 7 removed $use)
const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const isProduction = process.env.NODE_ENV === 'production';
        const allowDestructive =
          process.env.ALLOW_DESTRUCTIVE_DB_OPS === 'I_UNDERSTAND_THIS_WILL_DELETE_DATA';

        if (isProduction && !allowDestructive && operation === 'deleteMany') {
          console.error(`BLOCKED: ${model}.deleteMany() in production`);
          throw new Error(
            `Bulk delete operations are blocked in production for safety. Use soft delete instead.`
          );
        }

        if (isProduction && operation === 'delete') {
          console.warn(`DELETE: ${model} - ${JSON.stringify(args)}`);
        }

        if (
          isProduction &&
          ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany'].includes(operation)
        ) {
          console.log(`[DB AUDIT] ${operation} on ${model} at ${new Date().toISOString()}`);
        }

        return query(args);
      },
    },
  },
}) as unknown as PrismaClient;

if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      await basePrisma.$queryRaw`SELECT 1`;
      console.log('Database connected');
      console.log('Production safety extensions active');
    } catch (error) {
      console.warn('Database connection failed', error);
    }
  })();
}

type PrismaModelDelegate = {
  updateMany: (args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
  deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
};

export const safeDelete = async (
  model: keyof typeof Prisma.ModelName,
  where: Record<string, unknown>,
  options: { hardDelete?: boolean; reason?: string } = {}
) => {
  const { hardDelete = false, reason = 'No reason provided' } = options;

  console.log(`[SAFE DELETE] Model: ${model}, Reason: ${reason}`);

  const softDeleteModels = ['Post', 'Song', 'Project', 'Asset'];
  const modelName = model.toLowerCase() as keyof typeof basePrisma;
  const modelDelegate = basePrisma[modelName] as unknown as PrismaModelDelegate;

  if (softDeleteModels.includes(model) && !hardDelete) {
    return modelDelegate.updateMany({
      where,
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  if (process.env.NODE_ENV === 'production' && !hardDelete) {
    throw new Error('Hard delete not allowed in production. Set hardDelete: true explicitly.');
  }

  return modelDelegate.deleteMany({ where });
};

export { prisma, basePrisma };
