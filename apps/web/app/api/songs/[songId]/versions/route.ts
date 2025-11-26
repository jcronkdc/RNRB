import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/songs/[songId]/versions
 * Get all versions of a song
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId } = await params;
    const userId = session.user.id;

    // Check if user has access to this song
    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Check access: owner, project member, or public song
    const hasAccess =
      song.userId === userId ||
      (song.project && song.project.members.length > 0) ||
      song.visibility === 'public';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all versions
    const versions = await db.songVersion.findMany({
      where: { songId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { versionNum: 'desc' },
    });

    return NextResponse.json({
      songId,
      songTitle: song.title,
      currentVersion: song.lastSavedAt,
      versions: versions.map((v) => ({
        id: v.id,
        versionNum: v.versionNum,
        label: v.label,
        description: v.description,
        title: v.title,
        hasAudio: !!v.audioUrl,
        isPublished: v.isPublished,
        createdBy: v.createdBy,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/songs/[songId]/versions error:', error);
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

/**
 * POST /api/songs/[songId]/versions
 * Create a new version of a song
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { label, description, makePublished } = body;

    // Check if user has access to modify this song
    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Must be owner or project member
    const canEdit =
      song.userId === userId || (song.project && song.project.members.length > 0);

    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the latest version number
    const latestVersion = await db.songVersion.findFirst({
      where: { songId },
      orderBy: { versionNum: 'desc' },
      select: { versionNum: true },
    });

    const nextVersionNum = (latestVersion?.versionNum || 0) + 1;

    // If making this published, unpublish all others
    if (makePublished) {
      await db.songVersion.updateMany({
        where: { songId, isPublished: true },
        data: { isPublished: false },
      });
    }

    // Create new version with current song state
    const newVersion = await db.songVersion.create({
      data: {
        songId,
        versionNum: nextVersionNum,
        label: label || `Version ${nextVersionNum}`,
        description,
        title: song.title,
        lyrics: song.lyrics,
        chords: song.chords,
        key: song.key,
        tempo: song.tempo,
        timeSignature: song.timeSignature,
        audioUrl: song.audioUrl,
        audioPath: song.audioPath,
        createdById: userId,
        isPublished: makePublished || false,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        version: {
          id: newVersion.id,
          versionNum: newVersion.versionNum,
          label: newVersion.label,
          description: newVersion.description,
          isPublished: newVersion.isPublished,
          createdBy: newVersion.createdBy,
          createdAt: newVersion.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/songs/[songId]/versions error:', error);
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 });
  }
}




