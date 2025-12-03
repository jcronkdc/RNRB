/**
 * Blocked Users List API
 *
 * GET - Get list of blocked users
 */

import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

// GET - Get list of blocked users
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Try to get from database
    try {
      const blockedUsers = await prisma.userBlock.findMany({
        where: { blockerId: userId },
        include: {
          blocked: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        blockedUsers: blockedUsers.map((b) => ({
          id: b.blocked.id,
          name: b.blocked.name,
          image: b.blocked.image,
          email: b.blocked.email,
          blockedAt: b.createdAt,
        })),
      });
    } catch {
      // UserBlock model might not exist yet
      return NextResponse.json({ blockedUsers: [] });
    }
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked users' }, { status: 500 });
  }
}
