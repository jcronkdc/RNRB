import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { requireFeatureAccess, SubscriptionError } from '@/lib/subscription';

/**
 * GET /api/setlists/[id]
 * Get setlist by ID with all songs and details
 * REQUIRES: Creator or Studio subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription access - FEATURE GATE
    try {
      await requireFeatureAccess(user.id, 'setlistManagement');
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return NextResponse.json(
          {
            error: 'Subscription required',
            message: error.message,
            feature: error.feature,
            requiredTier: error.requiredTier,
            upgradeUrl: '/settings/billing?upgrade=creator',
          },
          { status: 403 }
        );
      }
      throw error;
    }

    const { id } = await params;

    // Fetch setlist with all relations
    const setlist = await db.setlist.findUnique({
      where: { id },
      include: {
        show: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
              },
            },
          },
        },
        items: {
          include: {
            song: {
              select: {
                id: true,
                title: true,
                key: true,
                tempo: true,
                lyrics: true,
                chords: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!setlist) {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 });
    }

    // Transform for frontend
    const response = {
      id: setlist.id,
      name: setlist.name || 'Untitled Setlist',
      notes: setlist.notes,
      show: setlist.show
        ? {
            id: setlist.show.id,
            name: setlist.show.name,
            date: setlist.show.date,
            venue: setlist.show.venue,
          }
        : null,
      songs: setlist.items.map((item) => ({
        id: item.id,
        position: item.position,
        song: item.song
          ? {
              id: item.song.id,
              title: item.song.title,
              key: item.song.key,
              tempo: item.song.tempo,
              duration: item.duration, // Duration comes from SetlistItem, not Song
              lyrics: item.song.lyrics,
              chords: item.song.chords,
            }
          : {
              id: item.id,
              title: item.customTitle || 'Untitled',
              key: null,
              tempo: null,
              duration: item.duration,
              lyrics: null,
              chords: null,
            },
        notes: item.notes,
        isEncore: item.isEncore,
      })),
    };

    return NextResponse.json({ setlist: response });
  } catch (error) {
    console.error('Setlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch setlist' }, { status: 500 });
  }
}

