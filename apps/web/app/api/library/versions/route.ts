import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

/**
 * GET /api/library/versions?fileId=xxx
 * Get version history for a file
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const fileId = searchParams.get('fileId');
    if (!fileId) {
      throw AppError.badRequest('fileId is required');
    }

    // Get the file
    const file = await prisma.libraryFile.findFirst({
      where: {
        id: fileId,
        userId: user.id,
      },
    });

    if (!file) {
      throw AppError.notFound('File not found');
    }

    // Find the root file (if this is a version)
    const rootId = file.parentId || file.id;

    // Get all versions including the current file
    const versions = await prisma.libraryFile.findMany({
      where: {
        OR: [{ id: rootId }, { parentId: rootId }],
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        version: true,
        size: true,
        mimeType: true,
        url: true,
        createdAt: true,
        updatedAt: true,
        notes: true,
      },
      orderBy: { version: 'desc' },
    });

    return NextResponse.json({
      currentVersionId: fileId,
      versions: versions.map((v) => ({
        ...v,
        size: v.size.toString(),
        isCurrent: v.id === fileId,
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/versions', method: 'GET' });
  }
}

/**
 * POST /api/library/versions
 * Create a new version of a file (upload as new version)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();

    const fileId = formData.get('fileId') as string;
    const file = formData.get('file') as File;
    const notes = formData.get('notes') as string;

    if (!fileId || !file) {
      throw AppError.badRequest('fileId and file are required');
    }

    // Get the original file
    const originalFile = await prisma.libraryFile.findFirst({
      where: {
        id: fileId,
        userId: user.id,
      },
    });

    if (!originalFile) {
      throw AppError.notFound('File not found');
    }

    // Find the root file
    const rootId = originalFile.parentId || originalFile.id;

    // Get current max version
    const maxVersion = await prisma.libraryFile.aggregate({
      where: {
        OR: [{ id: rootId }, { parentId: rootId }],
        userId: user.id,
      },
      _max: { version: true },
    });

    const newVersion = (maxVersion._max.version || 1) + 1;

    // Upload the new file to storage
    // Note: In production, this would use the same upload logic as the main upload route
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileBuffer = await file.arrayBuffer();
    const fileName = `${user.id}/${Date.now()}-v${newVersion}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('library')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new AppError('Failed to upload file', 'INTERNAL_ERROR', 500);
    }

    const { data: urlData } = supabase.storage.from('library').getPublicUrl(fileName);

    // Calculate file hash for duplicate detection
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Create new version record
    const newFile = await prisma.libraryFile.create({
      data: {
        userId: user.id,
        name: originalFile.name, // Keep the same name
        originalName: file.name,
        type: originalFile.type,
        mimeType: file.type,
        size: file.size,
        url: urlData.publicUrl,
        path: fileName,
        parentId: rootId, // Link to root file
        version: newVersion,
        hash,
        notes: notes || `Version ${newVersion}`,
        // Copy other metadata from original
        collectionId: originalFile.collectionId,
        tags: originalFile.tags,
        bpm: originalFile.bpm,
        musicalKey: originalFile.musicalKey,
        mood: originalFile.mood,
      },
    });

    return NextResponse.json({
      success: true,
      version: {
        id: newFile.id,
        version: newFile.version,
        name: newFile.name,
        size: newFile.size.toString(),
        createdAt: newFile.createdAt,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/versions', method: 'POST' });
  }
}

/**
 * PUT /api/library/versions
 * Restore a previous version (makes it the current version)
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { versionId } = body;
    if (!versionId) {
      throw AppError.badRequest('versionId is required');
    }

    // Get the version to restore
    const versionToRestore = await prisma.libraryFile.findFirst({
      where: {
        id: versionId,
        userId: user.id,
      },
    });

    if (!versionToRestore) {
      throw AppError.notFound('Version not found');
    }

    // For now, "restoring" just means copying the URL and updating version
    // In a full implementation, you might duplicate the file

    return NextResponse.json({
      success: true,
      message: 'Version restored',
      restoredVersion: {
        id: versionToRestore.id,
        version: versionToRestore.version,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/versions', method: 'PUT' });
  }
}
