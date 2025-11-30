/**
 * Recording Notes API - Mycelial Integration
 * Track signal chains, gear settings, linked to projects/songs
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/session';

// GET - Fetch user's recording notes
export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const songId = searchParams.get('songId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = { userId: user.id };
    if (projectId) {
      where.projectId = projectId;
    }
    if (songId) {
      where.songId = songId;
    }

    const notes = await db.recordingNote.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        song: {
          select: { id: true, title: true },
        },
        studioSession: {
          select: { id: true, title: true, startTime: true },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching recording notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST - Create new recording note
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const {
      title,
      date,
      projectId,
      songId,
      studioSessionId,
      engineer,
      studio,
      signalChain,
      micPosition,
      micType,
      micDistance,
      preampSettings,
      eqSettings,
      compressionSettings,
      otherFx,
      referenceFiles,
      screenshots,
      notes,
      whatWorked,
      whatToImprove,
      tags,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Verify project ownership if provided
    if (projectId) {
      const project = await db.project.findFirst({
        where: {
          id: projectId,
          org: {
            memberships: {
              some: { userId: user.id },
            },
          },
        },
      });
      if (!project) {
        return NextResponse.json({ error: 'Project not found or no access' }, { status: 404 });
      }
    }

    // Verify song ownership if provided
    if (songId) {
      const song = await db.song.findFirst({
        where: {
          id: songId,
          OR: [{ userId: user.id }, { collaborators: { some: { userId: user.id } } }],
        },
      });
      if (!song) {
        return NextResponse.json({ error: 'Song not found or no access' }, { status: 404 });
      }
    }

    const note = await db.recordingNote.create({
      data: {
        userId: user.id,
        title,
        date: date ? new Date(date) : new Date(),
        projectId: projectId || null,
        songId: songId || null,
        studioSessionId: studioSessionId || null,
        engineer: engineer || null,
        studio: studio || null,
        signalChain: signalChain || null,
        micPosition: micPosition || null,
        micType: micType || null,
        micDistance: micDistance || null,
        preampSettings: preampSettings || null,
        eqSettings: eqSettings || null,
        compressionSettings: compressionSettings || null,
        otherFx: otherFx || null,
        referenceFiles: referenceFiles || [],
        screenshots: screenshots || [],
        notes: notes || null,
        whatWorked: whatWorked || null,
        whatToImprove: whatToImprove || null,
        tags: tags || [],
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        song: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating recording note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

// PUT - Update recording note
export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.recordingNote.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Process date field
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const note = await db.recordingNote.update({
      where: { id },
      data: updates,
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        song: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating recording note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

// DELETE - Delete recording note
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.recordingNote.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await db.recordingNote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recording note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
