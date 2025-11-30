import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/library/[id]/play
 * Increment play count and update last played time
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership and update
    const file = await prisma.libraryFile.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const updated = await prisma.libraryFile.update({
      where: { id },
      data: {
        playCount: { increment: 1 },
        lastPlayed: new Date(),
      },
    });

    // Convert BigInt to string for JSON serialization
    return NextResponse.json({
      ...updated,
      size: updated.size.toString(),
    });
  } catch (error) {
    console.error('Error updating play count:', error);
    return NextResponse.json({ error: 'Failed to update play count' }, { status: 500 });
  }
}
