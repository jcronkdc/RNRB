import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { standardLimiter, strictLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * GET /api/projects/[slug]/songs
 * Get all songs for a project
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `project-songs-read:${userId}`);

    // Find project by slug (or ID for backward compatibility)
    const project = await db.project.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all songs in the project
    const songs = await db.song.findMany({
      where: {
        projectId: project.id,
      },
      select: {
        id: true,
        title: true,
        key: true,
        tempo: true,
        timeSignature: true,
        status: true,
        lyrics: true,
        chords: true,
        createdAt: true,
        updatedAt: true,
        lastSavedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error('GET /api/projects/[slug]/songs error:', error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[slug]/songs
 * Create a new song in a project
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { userId, title, key, tempo, timeSignature, lyrics, chords, songStructure } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Rate limit: 10 songs per minute
    await checkRateLimit(strictLimiter, `project-songs-write:${userId}`);

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Song title is required' }, { status: 400 });
    }

    // Find project by slug (or ID for backward compatibility)
    const project = await db.project.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        members: {
          where: {
            userId,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if user is a member
    if (project.members.length === 0) {
      return NextResponse.json(
        { error: 'You must be a project member to create songs' },
        { status: 403 }
      );
    }

    // Create the song
    const song = await db.song.create({
      data: {
        userId,
        projectId: project.id,
        title: title.trim(),
        key: key || null,
        tempo: tempo ? parseInt(tempo) : null,
        timeSignature: timeSignature || null,
        lyrics: lyrics || null,
        chords: chords ? JSON.stringify(chords) : null,
        status: 'draft',
        visibility: 'private',
        lastSavedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects/[slug]/songs error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create song',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
