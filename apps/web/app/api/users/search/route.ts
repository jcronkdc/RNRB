import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

/**
 * GET /api/users/search
 * Search for users by name or email
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search users by name or email (excluding current user)
    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });

    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error, { route: '/api/users/search', method: 'GET' });
  }
}
