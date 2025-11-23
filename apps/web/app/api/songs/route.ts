import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

/**
 * GET /api/songs
 * Get all standalone songs for the authenticated user (not in projects)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const songs = await db.song.findMany({
      where: {
        userId: session.user.id,
        projectId: null, // Standalone songs only
        archived: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        key: true,
        tempo: true,
        timeSignature: true,
        status: true,
        visibility: true,
        lyrics: true,
        chords: true,
        lastSavedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('GET /api/songs error:', error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}

/**
 * POST /api/songs
 * Create a new standalone song
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title = 'Untitled Song',
      key,
      tempo,
      timeSignature,
      lyrics,
      chords,
      status = 'draft',
      visibility = 'private',
    } = body;

    const song = await db.song.create({
      data: {
        userId: session.user.id,
        title,
        key,
        tempo: tempo ? parseInt(tempo) : null,
        timeSignature,
        lyrics,
        chords: chords ? JSON.stringify(chords) : null,
        status,
        visibility,
        lastSavedAt: new Date(),
      },
    });

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error('POST /api/songs error:', error);
    return NextResponse.json({ error: 'Failed to create song' }, { status: 500 });
  }
}
