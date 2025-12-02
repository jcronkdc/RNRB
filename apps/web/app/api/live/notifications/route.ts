/**
 * Live Stream Notification Subscriptions
 *
 * POST /api/live/notifications - Subscribe to live notifications from an artist
 * GET /api/live/notifications - Get your live notification subscriptions
 * DELETE /api/live/notifications - Unsubscribe from live notifications
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get all artists user is subscribed to for live notifications
    const subscriptions = await db.$queryRaw<any[]>`
      SELECT 
        lns.*,
        u.id as artist_id,
        u.name as artist_name,
        u.image as artist_avatar,
        (
          SELECT COUNT(*) FROM live_streams 
          WHERE streamer_id = lns.artist_id 
          AND status = 'live'
        )::int as is_currently_live
      FROM live_notification_subscriptions lns
      JOIN "User" u ON u.id = lns.artist_id
      WHERE lns.user_id = ${user.id}
      AND lns.is_active = true
      ORDER BY u.name ASC
    `;

    return NextResponse.json({ subscriptions });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { artistId, preferences } = body;

    if (!artistId) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    // Verify artist exists
    const artist = await db.$queryRaw<any[]>`
      SELECT id, name FROM "User" WHERE id = ${artistId} LIMIT 1
    `;

    if (!artist.length) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Create or update subscription
    await db.$executeRaw`
      INSERT INTO live_notification_subscriptions (user_id, artist_id, notify_on_live, notify_on_scheduled, notify_via_push, notify_via_email)
      VALUES (
        ${user.id},
        ${artistId},
        ${preferences?.notifyOnLive !== false},
        ${preferences?.notifyOnScheduled !== false},
        ${preferences?.pushEnabled !== false},
        ${preferences?.emailEnabled ?? false}
      )
      ON CONFLICT (user_id, artist_id)
      DO UPDATE SET
        notify_on_live = ${preferences?.notifyOnLive !== false},
        notify_on_scheduled = ${preferences?.notifyOnScheduled !== false},
        notify_via_push = ${preferences?.pushEnabled !== false},
        notify_via_email = ${preferences?.emailEnabled ?? false},
        is_active = true,
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: `Subscribed to live notifications from ${artist[0].name}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artistId');

    if (!artistId) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    // Soft delete - set inactive
    await db.$executeRaw`
      UPDATE live_notification_subscriptions
      SET is_active = false, updated_at = NOW()
      WHERE user_id = ${user.id} AND artist_id = ${artistId}
    `;

    return NextResponse.json({ success: true, message: 'Unsubscribed from live notifications' });
  } catch (error) {
    return handleApiError(error);
  }
}
