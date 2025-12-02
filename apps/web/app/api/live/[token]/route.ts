/**
 * Public Setlist API
 *
 * VIRAL LOOP: Serves public setlist data for fans
 * No auth required - this is the public-facing endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { prisma } from '@cronkwaters/db';

/**
 * GET - Fetch public setlist by share token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const setlist = await prisma.setlist.findUnique({
      where: { publicShareToken: token },
      include: {
        show: {
          include: {
            venue: {
              select: {
                name: true,
                city: true,
                state: true,
                country: true,
              },
            },
            org: {
              select: {
                name: true,
                slug: true,
                image: true,
              },
            },
          },
        },
        items: {
          orderBy: { position: 'asc' },
          include: {
            song: {
              select: {
                id: true,
                title: true,
                key: true,
                tempo: true,
                duration: true,
                // Don't expose lyrics/chords publicly
              },
            },
          },
        },
      },
    });

    if (!setlist || !setlist.isPublic) {
      return NextResponse.json({ error: 'Setlist not found or not public' }, { status: 404 });
    }

    // Track view (async, don't block response)
    trackSetlistView(setlist.id, request).catch(console.error);

    // Update view count
    await prisma.setlist.update({
      where: { id: setlist.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    // Format response for public consumption
    return NextResponse.json({
      title: setlist.publicTitle || setlist.name,
      showName: setlist.show.name,
      showDate: setlist.show.date,
      venue: setlist.show.venue
        ? {
            name: setlist.show.venue.name,
            location: [
              setlist.show.venue.city,
              setlist.show.venue.state,
              setlist.show.venue.country,
            ]
              .filter(Boolean)
              .join(', '),
          }
        : null,
      artist: {
        name: setlist.show.org.name,
        slug: setlist.show.org.slug,
        image: setlist.show.org.image,
      },
      songs: setlist.items.map((item) => ({
        position: item.position + 1,
        title: item.customTitle || item.song?.title || 'Unknown',
        key: item.song?.key,
        tempo: item.song?.tempo,
        duration: item.song?.duration,
        isEncore: item.isEncore,
        notes: item.notes,
      })),
      totalDuration: setlist.items.reduce((sum, item) => sum + (item.song?.duration || 0), 0),
      viewCount: setlist.viewCount + 1,
    });
  } catch (error) {
    console.error('[PUBLIC_SETLIST] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Track setlist view for viral analytics
 */
async function trackSetlistView(setlistId: string, request: NextRequest) {
  try {
    // Hash IP for privacy
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

    // Get geo info from Vercel headers (if available)
    const country = request.headers.get('x-vercel-ip-country') || undefined;
    const city = request.headers.get('x-vercel-ip-city') || undefined;

    await prisma.setlistShare.create({
      data: {
        id: crypto.randomUUID(),
        setlistId,
        referrer: request.headers.get('referer') || undefined,
        userAgent: request.headers.get('user-agent')?.slice(0, 500) || undefined,
        ipHash,
        country,
        city,
      },
    });
  } catch (error) {
    // Don't fail the request if tracking fails
    console.error('[SETLIST_TRACK] Error:', error);
  }
}
