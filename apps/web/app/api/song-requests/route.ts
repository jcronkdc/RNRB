import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/song-requests
 * List song requests for a setlist (requires auth + setlist ownership)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const setlistId = searchParams.get('setlistId');

    if (!setlistId) {
      return NextResponse.json({ error: 'Setlist ID required' }, { status: 400 });
    }

    const requests = await db.songRequest.findMany({
      where: { setlistId },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Song requests GET error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to fetch song requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/song-requests
 * Submit a new song request (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setlistId, songTitle, requestedBy, email, message, dedication } = body;

    if (!setlistId || !songTitle || !requestedBy) {
      return NextResponse.json(
        { error: 'Setlist ID, song title, and requester name are required' },
        { status: 400 }
      );
    }

    // Verify setlist exists
    const setlist = await db.setlist.findUnique({
      where: { id: setlistId },
    });

    if (!setlist) {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 });
    }

    const songRequest = await db.songRequest.create({
      data: {
        setlistId,
        songTitle,
        requestedBy,
        email,
        message,
        dedication,
        status: 'pending',
      },
    });

    return NextResponse.json({ songRequest }, { status: 201 });
  } catch (error) {
    console.error('Song requests POST error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to create song request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
