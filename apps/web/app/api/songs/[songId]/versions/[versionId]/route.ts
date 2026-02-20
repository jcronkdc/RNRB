import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/songs/[songId]/versions/[versionId]
 * Get a specific version with full details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string; versionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId, versionId } = await params;
    const userId = session.user.id;

    // Check access
    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          include: {
            members: { where: { userId } },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const hasAccess =
      song.userId === userId ||
      (song.project && song.project.members.length > 0) ||
      song.visibility === 'public';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get version with full details
    const version = await db.songVersion.findUnique({
      where: { id: versionId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!version || version.songId !== songId) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json({
      version: {
        id: version.id,
        versionNum: version.versionNum,
        label: version.label,
        description: version.description,
        title: version.title,
        lyrics: version.lyrics,
        chords: version.chords,
        key: version.key,
        tempo: version.tempo,
        timeSignature: version.timeSignature,
        audioUrl: version.audioUrl,
        audioPath: version.audioPath,
        isPublished: version.isPublished,
        createdBy: version.createdBy,
        createdAt: version.createdAt,
      },
    });
  } catch (error) {
    console.error('GET /api/songs/[songId]/versions/[versionId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch version' }, { status: 500 });
  }
}

/**
 * PATCH /api/songs/[songId]/versions/[versionId]
 * Restore a version (make it the current song state)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string; versionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId, versionId } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { action } = body; // 'restore' or 'publish'

    // Check access
    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          include: {
            members: { where: { userId } },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const canEdit = song.userId === userId || (song.project && song.project.members.length > 0);

    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const version = await db.songVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.songId !== songId) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    if (action === 'restore') {
      // Restore this version to current song state
      await db.song.update({
        where: { id: songId },
        data: {
          title: version.title,
          lyrics: version.lyrics,
          chords: version.chords,
          key: version.key,
          tempo: version.tempo,
          timeSignature: version.timeSignature,
          audioUrl: version.audioUrl,
          audioPath: version.audioPath,
          lastSavedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Version restored successfully',
        versionNum: version.versionNum,
      });
    } else if (action === 'publish') {
      // Mark as published version
      await db.songVersion.updateMany({
        where: { songId, isPublished: true },
        data: { isPublished: false },
      });

      await db.songVersion.update({
        where: { id: versionId },
        data: { isPublished: true },
      });

      return NextResponse.json({
        message: 'Version published successfully',
        versionNum: version.versionNum,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/songs/[songId]/versions/[versionId] error:', error);
    return NextResponse.json({ error: 'Failed to update version' }, { status: 500 });
  }
}

/**
 * DELETE /api/songs/[songId]/versions/[versionId]
 * Delete a version
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string; versionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId, versionId } = await params;
    const userId = session.user.id;

    // Check access
    const song = await db.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    if (song.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await db.songVersion.delete({
      where: { id: versionId },
    });

    return NextResponse.json({ message: 'Version deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/songs/[songId]/versions/[versionId] error:', error);
    return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 });
  }
}
