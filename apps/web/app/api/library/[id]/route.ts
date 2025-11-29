import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { deleteAudioFile } from '@/lib/storage';

/**
 * GET /api/library/[id]
 * Get a single library file by ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const file = await prisma.libraryFile.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Convert BigInt to string for JSON serialization
    const serializedFile = {
      ...file,
      size: file.size.toString(),
    };

    return NextResponse.json(serializedFile);
  } catch (error) {
    console.error('Error fetching library file:', error);
    return NextResponse.json({ error: 'Failed to fetch library file' }, { status: 500 });
  }
}

/**
 * PATCH /api/library/[id]
 * Update a library file's metadata
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, tags, metadata } = body;

    // Verify file ownership
    const existingFile = await prisma.libraryFile.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Update file
    const updatedFile = await prisma.libraryFile.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(tags && { tags }),
        ...(metadata && { metadata }),
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedFile = {
      ...updatedFile,
      size: updatedFile.size.toString(),
    };

    return NextResponse.json(serializedFile);
  } catch (error) {
    console.error('Error updating library file:', error);
    return NextResponse.json({ error: 'Failed to update library file' }, { status: 500 });
  }
}

/**
 * DELETE /api/library/[id]
 * Delete a library file (from database and storage)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get file info
    const file = await prisma.libraryFile.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from storage first
    try {
      await deleteAudioFile(file.path);
    } catch (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    await prisma.libraryFile.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'File deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error deleting library file:', error);
    return NextResponse.json({ error: 'Failed to delete library file' }, { status: 500 });
  }
}
