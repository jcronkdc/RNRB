/**
 * Blocked Users API
 *
 * GET - Get list of users blocked by the current user
 */

import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
      const blocks = await prisma.userBlock.findMany({
        where: { blockerId: userId },
        orderBy: { createdAt: 'desc' },
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
      });

      const blocked = blocks.map((block) => ({
        id: block.id,
        user: {
          id: block.blocked.id,
          name: block.blocked.name,
          image: block.blocked.image,
          email: block.blocked.email,
        },
        blockedAt: block.createdAt.toISOString(),
      }));

      return NextResponse.json({ blocked, total: blocked.length });
    } catch {
      // UserBlock model might not exist yet
      return NextResponse.json({ blocked: [], total: 0 });
    }
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked users' }, { status: 500 });
  }
}
