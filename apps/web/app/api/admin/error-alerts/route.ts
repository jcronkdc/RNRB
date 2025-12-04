/**
 * ERROR ALERTS API
 *
 * POST - Create a real-time alert for critical errors
 * GET - Get unacknowledged alerts (admin only)
 * PATCH - Acknowledge an alert
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@cronkwaters/db';

/**
 * POST /api/admin/error-alerts
 * Create a real-time alert (called from error monitoring)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { type, title, message, url, timestamp } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$executeRaw`
      INSERT INTO "AdminErrorAlert" (
        "id",
        "type",
        "title",
        "message",
        "url",
        "createdAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${type},
        ${title.slice(0, 200)},
        ${message.slice(0, 1000)},
        ${url?.slice(0, 500) || null},
        ${timestamp ? new Date(timestamp) : new Date()}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Error Alerts API] Error:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

/**
 * GET /api/admin/error-alerts
 * Get unacknowledged alerts (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin/owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isOwner: true },
    });

    if (!user?.isOwner) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if AdminErrorAlert table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "AdminErrorAlert" LIMIT 1`;
    } catch (tableError) {
      // Table doesn't exist yet, return empty results
      return NextResponse.json({
        alerts: [],
        unreadCount: 0,
      });
    }

    const { searchParams } = new URL(request.url);
    const acknowledged = searchParams.get('acknowledged');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    let whereClause = '';
    if (acknowledged === 'false') {
      whereClause = 'WHERE acknowledged = false';
    } else if (acknowledged === 'true') {
      whereClause = 'WHERE acknowledged = true';
    }

    const alerts = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        "errorReportId",
        type,
        title,
        message,
        url,
        acknowledged,
        "acknowledgedAt",
        "createdAt"
      FROM "AdminErrorAlert"
      ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `);

    // Get unacknowledged count
    const counts = (await prisma.$queryRaw`
      SELECT COUNT(*) FILTER (WHERE acknowledged = false) as unread
      FROM "AdminErrorAlert"
    `) as Array<{ unread: bigint }>;

    return NextResponse.json({
      alerts,
      unreadCount: Number(counts[0].unread),
    });
  } catch (error) {
    console.error('[Error Alerts API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/error-alerts
 * Acknowledge an alert
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin/owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isOwner: true },
    });

    if (!user?.isOwner) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { alertId, acknowledgeAll } = body;

    if (acknowledgeAll) {
      await prisma.$executeRaw`
        UPDATE "AdminErrorAlert"
        SET 
          acknowledged = true,
          "acknowledgedAt" = NOW(),
          "acknowledgedBy" = ${session.user.id}
        WHERE acknowledged = false
      `;
    } else if (alertId) {
      await prisma.$executeRaw`
        UPDATE "AdminErrorAlert"
        SET 
          acknowledged = true,
          "acknowledgedAt" = NOW(),
          "acknowledgedBy" = ${session.user.id}
        WHERE id = ${alertId}
      `;
    } else {
      return NextResponse.json({ error: 'alertId or acknowledgeAll is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Error Alerts API] Error:', error);
    return NextResponse.json({ error: 'Failed to acknowledge alert' }, { status: 500 });
  }
}
