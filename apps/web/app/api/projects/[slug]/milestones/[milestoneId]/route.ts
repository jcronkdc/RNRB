import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/projects/[slug]/milestones/[milestoneId]
 * Get a specific milestone
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; milestoneId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug, milestoneId } = await params;
    const userId = session.user.id;

    const project = await db.project.findUnique({
      where: { slug },
      include: { members: { where: { userId } } },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.members.length === 0 && project.visibility === 'private') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const milestone = await db.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!milestone || milestone.projectId !== project.id) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('GET /api/projects/[slug]/milestones/[milestoneId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestone' }, { status: 500 });
  }
}

/**
 * PATCH /api/projects/[slug]/milestones/[milestoneId]
 * Update a milestone
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; milestoneId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug, milestoneId } = await params;
    const userId = session.user.id;
    const body = await req.json();

    const project = await db.project.findUnique({
      where: { slug },
      include: { members: { where: { userId } } },
    });

    if (!project || project.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Handle status transitions
    const updateData: any = { ...body };

    if (body.status === 'in_progress' && !body.startedAt) {
      updateData.startedAt = new Date();
    }

    if (body.status === 'completed' && !body.completedAt) {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    }

    if (body.status === 'blocked' && body.blockingIssue && !body.blockedSince) {
      updateData.blockedSince = new Date();
    }

    const milestone = await db.projectMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('PATCH /api/projects/[slug]/milestones/[milestoneId] error:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[slug]/milestones/[milestoneId]
 * Delete a milestone
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; milestoneId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug, milestoneId } = await params;
    const userId = session.user.id;

    const project = await db.project.findUnique({
      where: { slug },
      include: { members: { where: { userId } } },
    });

    if (!project || project.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await db.projectMilestone.delete({
      where: { id: milestoneId },
    });

    return NextResponse.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/projects/[slug]/milestones/[milestoneId] error:', error);
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 });
  }
}





