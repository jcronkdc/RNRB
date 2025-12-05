/**
 * Setlist Sharing API
 *
 * VIRAL LOOP: Generate shareable links and QR codes for setlists
 * Fans scan QR at gig → see setlist → discover Rock N' Roll Basement
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

import { auth } from '@cronkwaters/auth';

// Generate a URL-safe random string
const nanoid = (size = 21) => randomBytes(size).toString('base64url').slice(0, size);
import { prisma } from '@cronkwaters/db';

/**
 * GET - Get share status for a setlist
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const setlist = await prisma.setlist.findUnique({
      where: { id },
      include: {
        show: {
          include: {
            org: {
              select: { id: true, slug: true, name: true },
            },
          },
        },
        _count: {
          select: { shares: true },
        },
      },
    });

    if (!setlist) {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 });
    }

    // Check user has access to this setlist's org
    const membership = await prisma.membership.findFirst({
      where: {
        orgId: setlist.show.orgId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rocknrollbasement.com';
    const shareUrl = setlist.publicShareToken
      ? `${baseUrl}/setlist/${setlist.publicShareToken}`
      : null;

    return NextResponse.json({
      isPublic: setlist.isPublic,
      shareToken: setlist.publicShareToken,
      shareUrl,
      publicTitle: setlist.publicTitle,
      qrCodeUrl: setlist.qrCodeUrl,
      viewCount: setlist.viewCount,
      lastViewedAt: setlist.lastViewedAt,
      totalShares: setlist._count.shares,
    });
  } catch (error) {
    console.error('[SETLIST_SHARE] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST - Enable/update public sharing for a setlist
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { publicTitle, isPublic = true } = body;

    const setlist = await prisma.setlist.findUnique({
      where: { id },
      include: {
        show: {
          include: {
            org: true,
            venue: true,
          },
        },
      },
    });

    if (!setlist) {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 });
    }

    // Check user has access
    const membership = await prisma.membership.findFirst({
      where: {
        orgId: setlist.show.orgId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate share token if not exists
    const shareToken = setlist.publicShareToken || nanoid(12);

    // Generate QR code URL (using Google Charts API - free and reliable)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rocknrollbasement.com';
    const shareUrl = `${baseUrl}/setlist/${shareToken}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;

    // Default public title from show/venue info
    const defaultTitle =
      publicTitle ||
      (setlist.show.venue?.name
        ? `${setlist.show.name} @ ${setlist.show.venue.name}`
        : setlist.show.name || setlist.name || 'Live Setlist');

    const updated = await prisma.setlist.update({
      where: { id },
      data: {
        isPublic,
        publicShareToken: shareToken,
        publicTitle: defaultTitle,
        qrCodeUrl,
      },
    });

    return NextResponse.json({
      success: true,
      isPublic: updated.isPublic,
      shareToken: updated.publicShareToken,
      shareUrl,
      publicTitle: updated.publicTitle,
      qrCodeUrl: updated.qrCodeUrl,
    });
  } catch (error) {
    console.error('[SETLIST_SHARE] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE - Disable public sharing
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const setlist = await prisma.setlist.findUnique({
      where: { id },
      include: { show: true },
    });

    if (!setlist) {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        orgId: setlist.show.orgId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.setlist.update({
      where: { id },
      data: {
        isPublic: false,
        // Keep the token for potential re-enable
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SETLIST_SHARE] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
