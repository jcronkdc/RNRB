import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { checkRateLimit, strictLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: prevent brute-force code guessing
    try {
      await checkRateLimit(strictLimiter, `org-join:${session.user.id}`);
    } catch {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length < 4 || trimmedCode.length > 20) {
      return NextResponse.json({ error: 'Invalid invite code format' }, { status: 400 });
    }

    // Find the invite
    const invite = await prisma.orgInvite.findUnique({
      where: { code: trimmedCode },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check expiration
    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: 'This invite code has expired' }, { status: 410 });
    }

    // Check max uses
    if (invite.maxUses !== null && invite.uses >= invite.maxUses) {
      return NextResponse.json(
        { error: 'This invite code has reached its maximum number of uses' },
        { status: 410 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId: session.user.id,
          orgId: invite.orgId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        {
          error: 'You are already a member of this organization',
          organization: invite.org,
        },
        { status: 409 }
      );
    }

    // Join the org + increment invite uses in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.membership.create({
        data: {
          userId: session.user!.id!,
          orgId: invite.orgId,
          role: 'member',
        },
      });

      await tx.orgInvite.update({
        where: { id: invite.id },
        data: { uses: { increment: 1 } },
      });
    });

    return NextResponse.json({
      success: true,
      organization: invite.org,
    });
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json({ error: 'Failed to join organization' }, { status: 500 });
  }
}
