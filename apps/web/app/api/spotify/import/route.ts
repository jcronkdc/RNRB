import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * POST /api/spotify/import
 * Import Spotify playlist tracks as songs in a project
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, songs } = body;

    if (!projectId || !songs || !Array.isArray(songs)) {
      return NextResponse.json({ error: 'Project ID and songs array required' }, { status: 400 });
    }

    // Verify user has access to project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!project || project.members.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 });
    }

    // Check for existing songs by title to avoid duplicates
    const existingSongs = await db.song.findMany({
      where: {
        projectId,
        title: {
          in: songs.map((s: any) => s.title),
        },
      },
    });

    const existingTitles = new Set(existingSongs.map((s) => s.title.toLowerCase()));

    // Filter out duplicates
    const newSongs = songs.filter((song: any) => !existingTitles.has(song.title.toLowerCase()));

    if (newSongs.length === 0) {
      return NextResponse.json({
        message: 'All songs already exist in project',
        imported: 0,
        skipped: songs.length,
      });
    }

    // Create songs in batch
    const createdSongs = await db.song.createMany({
      data: newSongs.map((song: any) => ({
        userId: user.id,
        projectId,
        title: song.title,
        description: song.artist ? `By ${song.artist}` : null,
        tempo: song.tempo || null,
        key: song.key || null,
        lyrics: null,
        chords: null,
      })),
    });

    return NextResponse.json({
      message: 'Songs imported successfully',
      imported: createdSongs.count,
      skipped: songs.length - newSongs.length,
    });
  } catch (error) {
    console.error('Spotify import error:', error);
    return NextResponse.json({ error: 'Failed to import songs' }, { status: 500 });
  }
}
