import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

// Batch operation schema
const batchOperationSchema = z.object({
  operation: z.enum(['move_to_collection', 'remove_from_collection', 'delete', 'tag', 'favorite']),
  fileIds: z.array(z.string()).min(1).max(100),
  collectionId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
});

/**
 * POST /api/library/batch
 * Perform batch operations on multiple files
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { operation, fileIds, collectionId, tags, isFavorite } = batchOperationSchema.parse(body);

    // Verify user owns all files
    const files = await prisma.libraryFile.findMany({
      where: {
        id: { in: fileIds },
        userId: user.id,
      },
      select: { id: true },
    });

    if (files.length !== fileIds.length) {
      throw AppError.forbidden('You can only modify files you own');
    }

    let result: { affected: number; operation: string };

    switch (operation) {
      case 'move_to_collection': {
        if (!collectionId) {
          throw AppError.badRequest('Collection ID required for move operation');
        }

        // Verify collection ownership
        const collection = await prisma.libraryCollection.findFirst({
          where: { id: collectionId, userId: user.id },
        });

        if (!collection) {
          throw AppError.notFound('Collection not found');
        }

        // Update files to add collection
        const updated = await prisma.libraryFile.updateMany({
          where: {
            id: { in: fileIds },
            userId: user.id,
          },
          data: { collectionId },
        });

        result = { affected: updated.count, operation: 'move_to_collection' };
        break;
      }

      case 'remove_from_collection': {
        const updated = await prisma.libraryFile.updateMany({
          where: {
            id: { in: fileIds },
            userId: user.id,
          },
          data: { collectionId: null },
        });

        result = { affected: updated.count, operation: 'remove_from_collection' };
        break;
      }

      case 'delete': {
        // Delete files and their associated data
        const deleted = await prisma.libraryFile.deleteMany({
          where: {
            id: { in: fileIds },
            userId: user.id,
          },
        });

        result = { affected: deleted.count, operation: 'delete' };
        break;
      }

      case 'tag': {
        if (!tags || tags.length === 0) {
          throw AppError.badRequest('Tags required for tag operation');
        }

        // Get existing files with tags
        const existingFiles = await prisma.libraryFile.findMany({
          where: {
            id: { in: fileIds },
            userId: user.id,
          },
          select: { id: true, tags: true },
        });

        // Update each file, merging tags
        let affected = 0;
        for (const file of existingFiles) {
          const existingTags = file.tags || [];
          const newTags = [...new Set([...existingTags, ...tags])];

          await prisma.libraryFile.update({
            where: { id: file.id },
            data: { tags: newTags },
          });
          affected++;
        }

        result = { affected, operation: 'tag' };
        break;
      }

      case 'favorite': {
        if (isFavorite === undefined) {
          throw AppError.badRequest('isFavorite value required for favorite operation');
        }

        const updated = await prisma.libraryFile.updateMany({
          where: {
            id: { in: fileIds },
            userId: user.id,
          },
          data: { isFavorite },
        });

        result = { affected: updated.count, operation: 'favorite' };
        break;
      }

      default:
        throw AppError.badRequest('Invalid operation');
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/batch', method: 'POST' });
  }
}
