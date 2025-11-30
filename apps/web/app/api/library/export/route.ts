import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

/**
 * POST /api/library/export
 * Export multiple files as a ZIP archive
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { fileIds, collectionId, includeMetadata = true } = body;

    if (!fileIds?.length && !collectionId) {
      throw AppError.badRequest('Must provide fileIds or collectionId');
    }

    // Get files to export
    let files;
    if (collectionId) {
      // Export entire collection
      const collection = await prisma.libraryCollection.findFirst({
        where: {
          id: collectionId,
          userId: user.id,
        },
        include: {
          files: {
            select: {
              id: true,
              name: true,
              originalName: true,
              url: true,
              type: true,
              mimeType: true,
              size: true,
              duration: true,
              bpm: true,
              musicalKey: true,
              mood: true,
              tags: true,
              lyrics: true,
              notes: true,
              createdAt: true,
            },
          },
        },
      });

      if (!collection) {
        throw AppError.notFound('Collection not found');
      }

      files = collection.files;
    } else {
      // Export selected files
      files = await prisma.libraryFile.findMany({
        where: {
          id: { in: fileIds },
          userId: user.id,
        },
        select: {
          id: true,
          name: true,
          originalName: true,
          url: true,
          type: true,
          mimeType: true,
          size: true,
          duration: true,
          bpm: true,
          musicalKey: true,
          mood: true,
          tags: true,
          lyrics: true,
          notes: true,
          createdAt: true,
        },
      });
    }

    if (files.length === 0) {
      throw AppError.notFound('No files found to export');
    }

    // Check total size (limit to 500MB per export)
    const totalSize = files.reduce((sum, f) => sum + Number(f.size), 0);
    const maxExportSize = 500 * 1024 * 1024; // 500MB

    if (totalSize > maxExportSize) {
      throw new AppError(
        `Export too large (${Math.round(totalSize / (1024 * 1024))}MB). Maximum is 500MB per export.`,
        'BAD_REQUEST',
        413
      );
    }

    // Create ZIP file
    const zip = new JSZip();

    // Group files by type for organization
    const filesByType: Record<string, typeof files> = {};
    for (const file of files) {
      const type = file.type || 'other';
      if (!filesByType[type]) {
        filesByType[type] = [];
      }
      filesByType[type].push(file);
    }

    // Download and add files to ZIP
    const downloadPromises = files.map(async (file) => {
      try {
        const response = await fetch(file.url);
        if (!response.ok) {
          console.error(`Failed to fetch ${file.name}: ${response.status}`);
          return null;
        }

        const buffer = await response.arrayBuffer();
        const type = file.type || 'other';
        const folderName = type.replace('_', '-');

        // Sanitize filename
        const safeName = file.originalName.replace(/[<>:"/\\|?*]/g, '_');
        zip.file(`${folderName}/${safeName}`, buffer);

        return file;
      } catch (err) {
        console.error(`Error downloading ${file.name}:`, err);
        return null;
      }
    });

    const downloadedFiles = (await Promise.all(downloadPromises)).filter(Boolean);

    if (downloadedFiles.length === 0) {
      throw new AppError('Failed to download any files', 'INTERNAL_ERROR', 500);
    }

    // Add metadata file if requested
    if (includeMetadata) {
      const metadata = {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
        totalFiles: downloadedFiles.length,
        files: downloadedFiles.map((f) => ({
          name: f!.originalName,
          type: f!.type,
          size: Number(f!.size),
          duration: f!.duration,
          bpm: f!.bpm,
          key: f!.musicalKey,
          mood: f!.mood,
          tags: f!.tags,
          notes: f!.notes,
          createdAt: f!.createdAt,
        })),
      };

      zip.file('_metadata.json', JSON.stringify(metadata, null, 2));

      // Add lyrics files if any have lyrics
      const lyricsFolder = zip.folder('_lyrics');
      for (const file of downloadedFiles) {
        if (file?.lyrics) {
          const safeName = file.originalName
            .replace(/\.[^.]+$/, '.txt')
            .replace(/[<>:"/\\|?*]/g, '_');
          lyricsFolder?.file(safeName, file.lyrics);
        }
      }
    }

    // Generate ZIP
    const zipContent = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Return ZIP file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = collectionId
      ? `library-collection-${timestamp}.zip`
      : `library-export-${timestamp}.zip`;

    return new NextResponse(zipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipContent.byteLength.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/export', method: 'POST' });
  }
}

/**
 * GET /api/library/export/single
 * Download a single file (with tracking)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');
    const shareId = searchParams.get('shareId');

    if (!fileId) {
      throw AppError.badRequest('fileId is required');
    }

    let file;
    let isShared = false;

    if (shareId) {
      // Downloading a shared file
      const share = await prisma.libraryFileShare.findFirst({
        where: {
          id: shareId,
          fileId,
          sharedWithId: user.id,
          canDownload: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
          file: true,
        },
      });

      if (!share) {
        throw AppError.forbidden('You do not have permission to download this file');
      }

      // Track download
      await prisma.libraryFileShare.update({
        where: { id: shareId },
        data: { downloadedAt: new Date() },
      });

      file = share.file;
      isShared = true;
    } else {
      // Downloading own file
      file = await prisma.libraryFile.findFirst({
        where: {
          id: fileId,
          userId: user.id,
        },
      });

      if (!file) {
        throw AppError.notFound('File not found');
      }
    }

    // Return file info for client-side download
    // (The actual download is done client-side using the URL)
    return NextResponse.json({
      url: file.url,
      name: file.originalName,
      mimeType: file.mimeType,
      size: file.size.toString(),
      isShared,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/export', method: 'GET' });
  }
}
