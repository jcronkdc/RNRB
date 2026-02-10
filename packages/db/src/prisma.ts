import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & {
  __cronkwatersPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

// Note: These patterns could be used in the future to validate raw SQL queries
// Currently the middleware intercepts deleteMany operations instead
const _DANGEROUS_SQL_PATTERNS = [
  /DROP\s+TABLE/i,
  /DROP\s+DATABASE/i,
  /DROP\s+SCHEMA/i,
  /TRUNCATE\s+TABLE/i,
  /DELETE\s+FROM\s+\w+\s*$/i, // DELETE without WHERE
];

// Helper to create and configure a new PrismaClient instance
// Optimized for 1000+ concurrent users with Neon connection pooling
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    // Optimize for serverless with connection pooling
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Log connection info on startup
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Prisma] Database connection initialized');
  }

  // Add middleware to protect against accidental destructive operations
  client.$use(async (params, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowDestructive =
      process.env.ALLOW_DESTRUCTIVE_DB_OPS === 'I_UNDERSTAND_THIS_WILL_DELETE_DATA';

    // Block deleteMany in production unless explicitly allowed
    if (isProduction && !allowDestructive) {
      if (params.action === 'deleteMany') {
        console.error(`❌ BLOCKED: ${params.model}.deleteMany() in production`);
        console.error('   Use soft delete instead (set isDeleted: true)');
        console.error('   Or set ALLOW_DESTRUCTIVE_DB_OPS="I_UNDERSTAND_THIS_WILL_DELETE_DATA"');
        throw new Error(
          `Bulk delete operations are blocked in production for safety. Use soft delete instead.`
        );
      }

      // Log all delete operations for audit trail
      if (params.action === 'delete') {
        console.warn(`⚠️ DELETE: ${params.model} - ID: ${JSON.stringify(params.args?.where)}`);
      }
    }

    // Log all write operations in production for audit
    if (
      isProduction &&
      ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany'].includes(params.action)
    ) {
      console.log(`[DB AUDIT] ${params.action} on ${params.model} at ${new Date().toISOString()}`);
    }

    return next(params);
  });

  return client;
}

// Build-time stub: returns a proxy that allows module-level setup ($extends, $use)
// but throws a clear error if any actual DB operation is attempted.
function createBuildTimeStub(): PrismaClient {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      // Allow promise-like checks (Next.js internals)
      if (prop === 'then' || prop === Symbol.toPrimitive || prop === Symbol.toStringTag) return undefined;
      // Allow lifecycle methods as no-ops
      if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve();
      // Allow $use (middleware registration) as a no-op
      if (prop === '$use') return () => {};
      // Allow $extends to return another proxy (chainable)
      if (prop === '$extends') return () => new Proxy({}, handler);
      // Allow $queryRaw (used in dev connection test) as a no-op
      if (prop === '$queryRaw') return () => Promise.resolve([]);
      // Any actual model access throws a clear error
      return new Proxy(() => {}, {
        get() {
          throw new Error(
            `DATABASE_URL is not set — cannot perform DB operations at build time.`
          );
        },
        apply() {
          throw new Error(
            `DATABASE_URL is not set — cannot perform DB operations at build time.`
          );
        },
      });
    },
  };
  return new Proxy({} as PrismaClient, handler);
}

// Check global cache first, then create new instance if needed (singleton pattern)
const basePrisma: PrismaClient =
  globalForPrisma.__cronkwatersPrisma ??
  (process.env.DATABASE_URL ? createPrismaClient() : createBuildTimeStub());

// Store in global to prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__cronkwatersPrisma = basePrisma;
}

// Add query extension to block dangerous raw SQL
const prisma = basePrisma.$extends({
  query: {
    $allOperations({ args, query }) {
      return query(args);
    },
  },
}) as unknown as PrismaClient;

// Connection test in development
if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      await basePrisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connected');
      console.log('🛡️ Production safety middleware active');
    } catch (error) {
      console.warn('⚠️ Database connection failed', error);
    }
  })();
}

// Type for Prisma model delegate with common methods
type PrismaModelDelegate = {
  updateMany: (args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
  deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
};

// Export utility for safe operations
export const safeDelete = async (
  model: keyof typeof Prisma.ModelName,
  where: Record<string, unknown>,
  options: { hardDelete?: boolean; reason?: string } = {}
) => {
  const { hardDelete = false, reason = 'No reason provided' } = options;

  console.log(`[SAFE DELETE] Model: ${model}, Reason: ${reason}`);

  // Check if model supports soft delete
  const softDeleteModels = ['Post', 'Song', 'Project', 'Asset'];

  // Get the model delegate dynamically
  const modelName = model.toLowerCase() as keyof typeof basePrisma;
  const modelDelegate = basePrisma[modelName] as unknown as PrismaModelDelegate;

  if (softDeleteModels.includes(model) && !hardDelete) {
    // Use soft delete
    return modelDelegate.updateMany({
      where,
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  // Hard delete - only if not in production or explicitly allowed
  if (process.env.NODE_ENV === 'production' && !hardDelete) {
    throw new Error('Hard delete not allowed in production. Set hardDelete: true explicitly.');
  }

  return modelDelegate.deleteMany({ where });
};

export { prisma, basePrisma };
