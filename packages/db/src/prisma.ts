import { PrismaClient, Prisma } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & {
  __cronkwatersPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

// List of dangerous operations to block in production
const DANGEROUS_SQL_PATTERNS = [
  /DROP\s+TABLE/i,
  /DROP\s+DATABASE/i,
  /DROP\s+SCHEMA/i,
  /TRUNCATE\s+TABLE/i,
  /DELETE\s+FROM\s+\w+\s*$/i, // DELETE without WHERE
];

// Helper to create and configure a new PrismaClient instance
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

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

// Check global cache first, then create new instance if needed (singleton pattern)
const basePrisma = globalForPrisma.__cronkwatersPrisma ?? createPrismaClient();

// Store in global to prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__cronkwatersPrisma = basePrisma;
}

// Add query extension to block dangerous raw SQL
const prisma = basePrisma.$extends({
  query: {
    $allOperations({ model, operation, args, query }) {
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

// Export utility for safe operations
export const safeDelete = async (
  model: keyof typeof Prisma.ModelName,
  where: Record<string, any>,
  options: { hardDelete?: boolean; reason?: string } = {}
) => {
  const { hardDelete = false, reason = 'No reason provided' } = options;

  console.log(`[SAFE DELETE] Model: ${model}, Reason: ${reason}`);

  // Check if model supports soft delete
  const softDeleteModels = ['Post', 'Song', 'Project', 'Asset'];

  if (softDeleteModels.includes(model) && !hardDelete) {
    // Use soft delete
    return (basePrisma as any)[model.toLowerCase()].updateMany({
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

  return (basePrisma as any)[model.toLowerCase()].deleteMany({ where });
};

export { prisma, basePrisma };
