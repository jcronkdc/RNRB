import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * GET /api/library/collections/[id]
 * Get a specific collection
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const collection = await prisma.libraryCollection.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { files: true },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...collection,
      fileCount: collection._count.files,
      _count: undefined,
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

/**
 * PATCH /api/library/collections/[id]
 * Update a collection
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, color, icon, sortOrder } = body;

    // Verify ownership
    const existing = await prisma.libraryCollection.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check for name conflicts if name is being changed
    if (name && name !== existing.name) {
      const nameConflict = await prisma.libraryCollection.findFirst({
        where: {
          userId: session.user.id,
          name: name.trim(),
          NOT: { id },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A collection with this name already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.libraryCollection.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

/**
 * DELETE /api/library/collections/[id]
 * Delete a collection (files are moved to uncategorized)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.libraryCollection.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Delete collection (files will have collectionId set to null due to onDelete: SetNull)
    await prisma.libraryCollection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
