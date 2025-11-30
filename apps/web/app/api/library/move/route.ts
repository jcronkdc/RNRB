import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/library/move
 * Move files to a collection
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fileIds, collectionId } = body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'fileIds must be a non-empty array' }, { status: 400 });
    }

    // If collectionId is provided, verify it exists and belongs to user
    if (collectionId) {
      const collection = await prisma.libraryCollection.findFirst({
        where: {
          id: collectionId,
          userId: session.user.id,
        },
      });

      if (!collection) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }
    }

    // Update all files
    const result = await prisma.libraryFile.updateMany({
      where: {
        id: { in: fileIds },
        userId: session.user.id,
      },
      data: {
        collectionId: collectionId || null,
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error('Error moving files:', error);
    return NextResponse.json({ error: 'Failed to move files' }, { status: 500 });
  }
}
