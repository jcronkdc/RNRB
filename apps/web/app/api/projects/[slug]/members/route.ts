import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/projects/[slug]/members
 * List all members of a project
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 100 requests per minute
    await checkRateLimit(standardLimiter, `project-members:${user.id}`);

    // Find project by slug first
    const project = await db.project.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectId = project.id;

    // Check if user has access to this project
    const membership = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all project members
    const members = await db.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // Owners first
        { joinedAt: 'asc' },
      ],
    });

    const formattedMembers = members.map((m) => ({
      userId: m.user.id,
      userName: m.user.name || m.user.email?.split('@')[0] || 'User',
      userEmail: m.user.email,
      avatar: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      status: m.status,
    }));

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    console.error('Error loading team members:', error);
    return NextResponse.json({ error: 'Failed to load team members' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[slug]/members
 * Add the authenticated user as a member of a project (invite accept)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, `project-member-add:${user.id}`);

    const body = await request.json().catch(() => ({}));
    const role = body.role || 'member';

    // Find the project
    const project = await db.project.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if already a member
    const existing = await db.projectMember.findFirst({
      where: { projectId: project.id, userId: user.id },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already a member' }, { status: 409 });
    }

    // Add as member
    const member = await db.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role,
      },
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Failed to join project' }, { status: 500 });
  }
}
