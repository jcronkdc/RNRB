import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/projects/[slug]/songs/[songId]
 * Get a single song (requires auth)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; songId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug, songId } = await params;

    const song = await db.song.findUnique({
      where: {
        id: songId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error('GET /api/projects/[slug]/songs/[songId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
  }
}

/**
 * PATCH /api/projects/[slug]/songs/[songId]
 * Update a song
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; songId: string }> }
) {
  try {
    const { songId } = await params;
    const body = await req.json();
    const { userId, title, key, tempo, timeSignature, lyrics, chords, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if song exists and user has permission
    const existingSong = await db.song.findFirst({
      where: {
        id: songId,
        OR: [
          { userId }, // Owner
          {
            project: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
    });

    if (!existingSong) {
      return NextResponse.json(
        { error: 'Song not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Update song
    const updateData: any = {
      lastSavedAt: new Date(),
    };
    if (title) updateData.title = title.trim();
    if (key !== undefined) updateData.key = key || null;
    if (tempo !== undefined) updateData.tempo = tempo ? parseInt(tempo) : null;
    if (timeSignature !== undefined) updateData.timeSignature = timeSignature || null;
    if (lyrics !== undefined) updateData.lyrics = lyrics || null;
    if (chords !== undefined) updateData.chords = chords ? JSON.stringify(chords) : null;
    if (status) updateData.status = status;

    const updatedSong = await db.song.update({
      where: { id: songId },
      data: updateData,
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

    return NextResponse.json(updatedSong);
  } catch (error) {
    console.error('PATCH /api/projects/[slug]/songs/[songId] error:', error);
    return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[slug]/songs/[songId]
 * Delete a song
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; songId: string }> }
) {
  try {
    const { songId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user is the owner of the song or a project admin
    const song = await db.song.findFirst({
      where: {
        id: songId,
        OR: [
          { userId }, // Owner
          {
            project: {
              members: {
                some: {
                  userId,
                  role: {
                    in: ['owner', 'admin'],
                  },
                },
              },
            },
          },
        ],
      },
    });

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Delete song
    await db.song.delete({
      where: { id: songId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[slug]/songs/[songId] error:', error);
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}
