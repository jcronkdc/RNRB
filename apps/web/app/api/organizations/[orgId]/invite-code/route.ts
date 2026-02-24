import { prisma } from '@cronkwaters/db';
import { randomBytes } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { checkRateLimit, strictLimiter } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = await params;

    // Rate limit
    try {
      await checkRateLimit(strictLimiter, `org-invite-code:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Verify user is owner or admin of the org
    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId: session.user.id,
          orgId,
        },
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json(
        { error: 'You do not have permission to create invite codes for this organization' },
        { status: 403 }
      );
    }

    // Generate a readable invite code (6 chars, uppercase alphanumeric)
    const code = randomBytes(4)
      .toString('base64')
      .replace(/[^A-Z0-9]/gi, '')
      .substring(0, 6)
      .toUpperCase();

    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.orgInvite.create({
      data: {
        orgId,
        code,
        maxUses: 50,
        expiresAt,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        code: invite.code,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating invite code:', error);
    return NextResponse.json({ error: 'Failed to create invite code' }, { status: 500 });
  }
}
