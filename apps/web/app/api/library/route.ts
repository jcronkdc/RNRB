import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * GET /api/library
 * List all library files for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Parse and validate pagination parameters
    const limitParam = parseInt(searchParams.get('limit') || '50');
    const offsetParam = parseInt(searchParams.get('offset') || '0');

    // Validate parsed values are valid positive integers (or zero for offset)
    if (isNaN(limitParam) || limitParam < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter: must be a positive integer' },
        { status: 400 }
      );
    }

    if (isNaN(offsetParam) || offsetParam < 0) {
      return NextResponse.json(
        { error: 'Invalid offset parameter: must be a non-negative integer' },
        { status: 400 }
      );
    }

    const limit = limitParam;
    const offset = offsetParam;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Additional filter params
    const collectionId = searchParams.get('collectionId');
    const isFavorite = searchParams.get('isFavorite');
    const bpmMin = searchParams.get('bpmMin');
    const bpmMax = searchParams.get('bpmMax');
    const musicalKey = searchParams.get('musicalKey');
    const mood = searchParams.get('mood');
    const tagsFilter = searchParams.get('tags');

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (type && type !== 'all') {
      where.type = type;
    }

    if (collectionId) {
      where.collectionId = collectionId;
    }

    if (isFavorite === 'true') {
      where.isFavorite = true;
    }

    if (bpmMin || bpmMax) {
      where.bpm = {};
      if (bpmMin) where.bpm.gte = parseInt(bpmMin);
      if (bpmMax) where.bpm.lte = parseInt(bpmMax);
    }

    if (musicalKey) {
      where.musicalKey = musicalKey;
    }

    if (mood) {
      where.mood = mood;
    }

    if (tagsFilter) {
      const tags = tagsFilter.split(',').filter(Boolean);
      if (tags.length > 0) {
        where.tags = { hasSome: tags };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { lyrics: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get files with pagination
    const [files, total] = await Promise.all([
      prisma.libraryFile.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          originalName: true,
          url: true,
          path: true,
          size: true,
          mimeType: true,
          type: true,
          duration: true,
          waveformData: true,
          bpm: true,
          musicalKey: true,
          mood: true,
          tags: true,
          color: true,
          isFavorite: true,
          playCount: true,
          lastPlayed: true,
          notes: true,
          lyrics: true,
          chordData: true,
          version: true,
          parentId: true,
          collectionId: true,
          collection: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.libraryFile.count({ where }),
    ]);

    return NextResponse.json({
      files,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching library files:', error);
    return NextResponse.json({ error: 'Failed to fetch library files' }, { status: 500 });
  }
}

/**
 * POST /api/library
 * Create a new library file entry (after upload to storage)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, originalName, url, path, size, mimeType, type, duration, waveformData, tags } =
      body;

    // Validate required fields
    if (!name || !url || !path || !size || !mimeType || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create library file entry
    const libraryFile = await prisma.libraryFile.create({
      data: {
        userId: session.user.id,
        name,
        originalName: originalName || name,
        url,
        path,
        size: BigInt(size),
        mimeType,
        type,
        duration,
        waveformData,
        tags: tags || [],
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedFile = {
      ...libraryFile,
      size: libraryFile.size.toString(),
    };

    return NextResponse.json(serializedFile, { status: 201 });
  } catch (error) {
    console.error('Error creating library file:', error);
    return NextResponse.json({ error: 'Failed to create library file' }, { status: 500 });
  }
}

/**
 * DELETE /api/library
 * Bulk delete library files
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ error: 'No file IDs provided' }, { status: 400 });
    }

    const ids = idsParam.split(',');

    // Delete files (only owned by the user)
    const result = await prisma.libraryFile.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      deleted: result.count,
      message: `Deleted ${result.count} file(s)`,
    });
  } catch (error) {
    console.error('Error deleting library files:', error);
    return NextResponse.json({ error: 'Failed to delete library files' }, { status: 500 });
  }
}
