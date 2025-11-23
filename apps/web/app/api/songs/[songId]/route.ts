import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/auth';

type RouteContext = {
  params: {
    songId: string;
  };
};

/**
 * GET /api/songs/[songId]
 * Get a specific song by ID
 */
export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const song = await db.song.findUnique({
      where: {
        id: params.songId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Check access: owner or public song
    if (song.userId !== session.user.id && song.visibility !== 'public') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ song });
  } catch (error) {
    console.error('GET /api/songs/[songId] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch song' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/songs/[songId]
 * Update a song (auto-save)
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await db.song.findUnique({
      where: { id: params.songId },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      key,
      tempo,
      timeSignature,
      lyrics,
      chords,
      status,
      visibility,
    } = body;

    const song = await db.song.update({
      where: { id: params.songId },
      data: {
        ...(title !== undefined && { title }),
        ...(key !== undefined && { key }),
        ...(tempo !== undefined && { tempo: tempo ? parseInt(tempo) : null }),
        ...(timeSignature !== undefined && { timeSignature }),
        ...(lyrics !== undefined && { lyrics }),
        ...(chords !== undefined && { chords: typeof chords === 'string' ? chords : JSON.stringify(chords) }),
        ...(status !== undefined && { status }),
        ...(visibility !== undefined && { visibility }),
        lastSavedAt: new Date(),
      },
    });

    return NextResponse.json({ song });
  } catch (error) {
    console.error('PATCH /api/songs/[songId] error:', error);
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/songs/[songId]
 * Delete a song (soft delete by archiving)
 */
export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await db.song.findUnique({
      where: { id: params.songId },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete by archiving
    await db.song.update({
      where: { id: params.songId },
      data: { archived: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/songs/[songId] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
}

