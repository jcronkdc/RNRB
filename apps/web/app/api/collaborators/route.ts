import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

/**
 * GET /api/collaborators
 * Get users the current user has collaborated with (project members, file share recipients, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get unique collaborators from multiple sources
    const collaboratorIds = new Set<string>();

    // 1. Users from shared projects
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        project: {
          members: {
            some: { userId: user.id },
          },
        },
        userId: { not: user.id },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    projectMembers.forEach((m) => collaboratorIds.add(m.userId));

    // 2. Users we've shared files with
    const sharedWith = await prisma.libraryFileShare.findMany({
      where: { sharedById: user.id },
      select: { sharedWithId: true },
      distinct: ['sharedWithId'],
    });
    sharedWith.forEach((s) => collaboratorIds.add(s.sharedWithId));

    // 3. Users who shared files with us
    const sharedBy = await prisma.libraryFileShare.findMany({
      where: { sharedWithId: user.id },
      select: { sharedById: true },
      distinct: ['sharedById'],
    });
    sharedBy.forEach((s) => collaboratorIds.add(s.sharedById));

    // 4. Song collaborators
    const songCollaborators = await prisma.songCollaborator.findMany({
      where: {
        song: {
          OR: [{ userId: user.id }, { collaborators: { some: { userId: user.id } } }],
        },
        userId: { not: user.id },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    songCollaborators.forEach((c) => collaboratorIds.add(c.userId));

    // Get full user details
    const collaborators = await prisma.user.findMany({
      where: {
        id: { in: Array.from(collaboratorIds) },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    return handleApiError(error, { route: '/api/collaborators', method: 'GET' });
  }
}
