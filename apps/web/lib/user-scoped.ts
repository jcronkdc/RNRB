/**
 * USER-SCOPED QUERY MIDDLEWARE
 *
 * This module provides utilities to automatically scope database queries
 * to the authenticated user, preventing data leakage between users.
 *
 * GOLDEN RULES:
 * 1. Always use these utilities in API routes dealing with user data
 * 2. Never expose raw Prisma queries that could access other users' data
 * 3. When in doubt, scope it out!
 *
 * Usage:
 *   import { scopedQuery, userOwns, requireOwnership } from '@/lib/user-scoped';
 *
 *   // In API routes:
 *   const projects = await scopedQuery(userId).project.findMany();
 *   const canEdit = await userOwns(userId, 'project', projectId);
 *   await requireOwnership(userId, 'song', songId); // Throws if not owner
 */

import { prisma } from '@cronkwaters/db';

import { AppError } from '@/lib/errors';

// ============================================
// OWNERSHIP VERIFICATION
// ============================================

/**
 * Resource types that have userId ownership
 * Note: These must match the Prisma model names exactly (camelCase)
 */
type OwnedResource =
  | 'project'
  | 'song'
  | 'setlist'
  | 'setlistTemplate'
  | 'show'
  | 'tour'
  | 'musicianSite'
  | 'libraryFile'
  | 'post'
  | 'merchOrder'
  | 'notification';

/**
 * Check if a user owns a specific resource
 * Returns true/false without throwing
 */
export async function userOwns(
  userId: string,
  resourceType: OwnedResource,
  resourceId: string
): Promise<boolean> {
  try {
    const resource = await (prisma[resourceType] as any).findFirst({
      where: {
        id: resourceId,
        userId: userId,
      },
      select: { id: true },
    });

    return !!resource;
  } catch {
    return false;
  }
}

/**
 * Require that a user owns a resource, throw AppError if not
 * Use in API routes before modifying resources
 */
export async function requireOwnership(
  userId: string,
  resourceType: OwnedResource,
  resourceId: string
): Promise<void> {
  const owns = await userOwns(userId, resourceType, resourceId);

  if (!owns) {
    throw AppError.forbidden(`You don't have permission to access this ${resourceType}`);
  }
}

// ============================================
// SCOPED QUERY BUILDER
// ============================================

/**
 * Creates a query helper that automatically adds userId to all queries
 *
 * This is a pattern for common operations - wraps Prisma with user scoping
 */
export function scopedQuery(userId: string) {
  return {
    /**
     * Find many resources owned by the user
     */
    findMany: async <T extends OwnedResource>(
      model: T,
      options: {
        where?: Record<string, unknown>;
        select?: Record<string, boolean>;
        orderBy?: Record<string, 'asc' | 'desc'>;
        take?: number;
        skip?: number;
      } = {}
    ) => {
      const { where = {}, ...rest } = options;

      return (prisma[model] as any).findMany({
        where: {
          ...where,
          userId, // Always scope to user
        },
        ...rest,
      });
    },

    /**
     * Find a single resource owned by the user
     * Returns null if not found or not owned
     */
    findFirst: async <T extends OwnedResource>(
      model: T,
      options: {
        where?: Record<string, unknown>;
        select?: Record<string, boolean>;
      } = {}
    ) => {
      const { where = {}, ...rest } = options;

      return (prisma[model] as any).findFirst({
        where: {
          ...where,
          userId, // Always scope to user
        },
        ...rest,
      });
    },

    /**
     * Find a resource by ID, but only if owned by user
     * Throws AppError if not found or not owned
     */
    findByIdOrThrow: async <T extends OwnedResource>(
      model: T,
      id: string,
      options: {
        select?: Record<string, boolean>;
        include?: Record<string, boolean>;
      } = {}
    ) => {
      const resource = await (prisma[model] as any).findFirst({
        where: {
          id,
          userId, // Must be owned by user
        },
        ...options,
      });

      if (!resource) {
        throw AppError.notFound(`${model} not found`);
      }

      return resource;
    },

    /**
     * Create a resource owned by the user
     */
    create: async <T extends OwnedResource>(model: T, data: Record<string, unknown>) => {
      return (prisma[model] as any).create({
        data: {
          ...data,
          userId, // Always set ownership
        },
      });
    },

    /**
     * Update a resource, but only if owned by user
     * Throws AppError if not found or not owned
     */
    update: async <T extends OwnedResource>(
      model: T,
      id: string,
      data: Record<string, unknown>
    ) => {
      // First verify ownership
      await requireOwnership(userId, model, id);

      return (prisma[model] as any).update({
        where: { id },
        data,
      });
    },

    /**
     * Delete a resource, but only if owned by user
     * Throws AppError if not found or not owned
     */
    delete: async <T extends OwnedResource>(model: T, id: string) => {
      // First verify ownership
      await requireOwnership(userId, model, id);

      return (prisma[model] as any).delete({
        where: { id },
      });
    },

    /**
     * Count resources owned by user
     */
    count: async <T extends OwnedResource>(model: T, where: Record<string, unknown> = {}) => {
      return (prisma[model] as any).count({
        where: {
          ...where,
          userId,
        },
      });
    },
  };
}

// ============================================
// COLLABORATION ACCESS (More complex ownership)
// ============================================

/**
 * Check if user has access to a project (owner OR collaborator)
 * Projects can be shared with collaborators
 */
export async function hasProjectAccess(userId: string, projectId: string): Promise<boolean> {
  // Check if owner
  const isOwner = await userOwns(userId, 'project', projectId);
  if (isOwner) return true;

  // Check if collaborator (project member)
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
    select: { userId: true },
  });

  return !!member;
}

/**
 * Require project access (owner OR collaborator)
 */
export async function requireProjectAccess(userId: string, projectId: string): Promise<void> {
  const hasAccess = await hasProjectAccess(userId, projectId);

  if (!hasAccess) {
    throw AppError.forbidden("You don't have access to this project");
  }
}

/**
 * Get user's role in a project
 */
export async function getProjectRole(
  userId: string,
  projectId: string
): Promise<'owner' | 'collaborator' | null> {
  // Check project membership
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
    select: { role: true },
  });

  if (!member) return null;

  // Owner role
  if (member.role === 'owner') return 'owner';

  // Any other role is a collaborator
  return 'collaborator';
}

// ============================================
// ADMIN ACCESS (Owner-only operations)
// ============================================

/**
 * Check if user is platform owner (admin)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isOwner: true },
  });

  return user?.isOwner ?? false;
}

/**
 * Require admin access
 */
export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId);

  if (!admin) {
    throw AppError.forbidden('Admin access required');
  }
}

// ============================================
// SAFE RESPONSE HELPERS
// ============================================

/**
 * Strip sensitive fields from a user object before returning
 */
export function sanitizeUser(user: Record<string, unknown>) {
  const {
    password,
    twoFactorSecret,
    twoFactorBackupCodes,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeConnectAccountId,
    ...safe
  } = user;

  return safe;
}

/**
 * Strip sensitive fields from any object
 * Removes fields that should never be exposed to clients
 */
export function sanitize<T extends Record<string, unknown>>(
  obj: T,
  sensitiveFields: string[] = []
): Partial<T> {
  const defaultSensitive = [
    'password',
    'secret',
    'token',
    'apiKey',
    'privateKey',
    'twoFactorSecret',
    'twoFactorBackupCodes',
  ];

  const allSensitive = [...defaultSensitive, ...sensitiveFields];
  const result = { ...obj };

  for (const field of allSensitive) {
    delete result[field];
  }

  return result;
}
