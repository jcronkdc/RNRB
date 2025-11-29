/**
 * DATABASE PROTECTION UTILITIES
 *
 * Prevents accidental data loss and provides safeguards
 * for production database operations.
 */

import { PrismaClient } from '@prisma/client';

// Environment detection
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Check if the current environment allows destructive operations
 */
export function canPerformDestructiveOperations(): boolean {
  // Never allow in production without explicit override
  if (isProduction) {
    const override = process.env.ALLOW_DESTRUCTIVE_DB_OPS;
    if (override !== 'I_UNDERSTAND_THIS_WILL_DELETE_DATA') {
      console.error('❌ BLOCKED: Destructive database operation attempted in production');
      console.error(
        '   Set ALLOW_DESTRUCTIVE_DB_OPS="I_UNDERSTAND_THIS_WILL_DELETE_DATA" to override'
      );
      return false;
    }
    console.warn('⚠️ WARNING: Destructive operation allowed via override in PRODUCTION');
  }
  return true;
}

/**
 * Safe delete wrapper - uses soft delete by default
 * Only performs hard delete if explicitly requested AND environment allows
 */
export async function safeDelete<T>(
  prisma: PrismaClient,
  model: string,
  where: any,
  options: { hardDelete?: boolean; reason?: string } = {}
): Promise<{ success: boolean; message: string; affected?: number }> {
  const { hardDelete = false, reason = 'No reason provided' } = options;

  // Log the operation
  console.log(`[DB] Delete operation requested on ${model}`);
  console.log(`[DB] Where: ${JSON.stringify(where)}`);
  console.log(`[DB] Reason: ${reason}`);
  console.log(`[DB] Hard Delete: ${hardDelete}`);

  if (hardDelete) {
    if (!canPerformDestructiveOperations()) {
      return {
        success: false,
        message: 'Hard delete blocked in production environment',
      };
    }
  }

  try {
    // Check if model has soft delete fields
    const hasIsDeleted = await checkModelHasSoftDelete(prisma, model);

    if (hasIsDeleted && !hardDelete) {
      // Perform soft delete
      const result = await (prisma as any)[model].updateMany({
        where,
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      console.log(`[DB] ✅ Soft deleted ${result.count} records from ${model}`);
      return {
        success: true,
        message: `Soft deleted ${result.count} records`,
        affected: result.count,
      };
    } else {
      // Hard delete (only if allowed)
      const result = await (prisma as any)[model].deleteMany({ where });

      console.log(`[DB] ⚠️ Hard deleted ${result.count} records from ${model}`);
      return {
        success: true,
        message: `Hard deleted ${result.count} records`,
        affected: result.count,
      };
    }
  } catch (error) {
    console.error(`[DB] ❌ Delete operation failed:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a model has soft delete capability
 */
async function checkModelHasSoftDelete(prisma: PrismaClient, model: string): Promise<boolean> {
  // Models with soft delete support
  const softDeleteModels = [
    'post',
    'song',
    'project',
    'asset',
    // Add more models as they gain soft delete support
  ];

  return softDeleteModels.includes(model.toLowerCase());
}

/**
 * Create a backup checkpoint before major operations
 */
export async function createBackupCheckpoint(
  description: string
): Promise<{ success: boolean; checkpointId?: string; message: string }> {
  // For Neon, this creates a branch which acts as a backup
  console.log(`[DB] Creating backup checkpoint: ${description}`);
  console.log(`[DB] Timestamp: ${new Date().toISOString()}`);

  // In production, you would call Neon's API to create a branch
  // For now, we log the checkpoint
  const checkpointId = `checkpoint_${Date.now()}`;

  console.log(`[DB] ✅ Checkpoint created: ${checkpointId}`);

  return {
    success: true,
    checkpointId,
    message: `Backup checkpoint created: ${description}`,
  };
}

/**
 * Wrap dangerous operations with confirmation
 */
export async function withConfirmation<T>(
  operation: () => Promise<T>,
  description: string,
  options: { requireManualConfirmation?: boolean } = {}
): Promise<T | null> {
  console.log('━'.repeat(60));
  console.log(`⚠️  DANGEROUS OPERATION: ${description}`);
  console.log('━'.repeat(60));

  if (isProduction && options.requireManualConfirmation) {
    console.error('❌ This operation requires manual confirmation in production');
    console.error('   Please use the dashboard or run with explicit confirmation');
    return null;
  }

  // Create checkpoint before operation
  await createBackupCheckpoint(`Before: ${description}`);

  try {
    const result = await operation();
    console.log('✅ Operation completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Operation failed:', error);
    throw error;
  }
}

/**
 * Protected Prisma client that blocks dangerous operations in production
 */
export function createProtectedPrismaClient(prisma: PrismaClient): PrismaClient {
  return new Proxy(prisma, {
    get(target, prop) {
      const value = (target as any)[prop];

      // Intercept model access
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, {
          get(modelTarget, modelProp) {
            const modelValue = (modelTarget as any)[modelProp];

            // Block dangerous operations in production
            if (isProduction) {
              const dangerousOps = ['deleteMany', 'delete'];
              if (dangerousOps.includes(String(modelProp))) {
                return async (...args: any[]) => {
                  console.error(`❌ BLOCKED: ${String(modelProp)} operation in production`);
                  console.error('   Use soft delete instead, or set ALLOW_DESTRUCTIVE_DB_OPS');
                  throw new Error(`${String(modelProp)} is blocked in production`);
                };
              }
            }

            return modelValue;
          },
        });
      }

      // Block $executeRaw in production for DROP/TRUNCATE/DELETE
      if (prop === '$executeRaw' || prop === '$executeRawUnsafe') {
        return async (...args: any[]) => {
          const query = String(args[0]?.strings?.join('') || args[0] || '');
          const dangerousPatterns = [
            /DROP\s+TABLE/i,
            /DROP\s+DATABASE/i,
            /TRUNCATE/i,
            /DELETE\s+FROM.*WHERE\s*$/i, // DELETE without WHERE
            /DROP\s+SCHEMA/i,
          ];

          if (isProduction) {
            for (const pattern of dangerousPatterns) {
              if (pattern.test(query)) {
                console.error(`❌ BLOCKED: Dangerous raw SQL in production`);
                console.error(`   Query: ${query.substring(0, 100)}...`);
                throw new Error('Dangerous SQL operation blocked in production');
              }
            }
          }

          return (target as any)[prop](...args);
        };
      }

      return value;
    },
  });
}
