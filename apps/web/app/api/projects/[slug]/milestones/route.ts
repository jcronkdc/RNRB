import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/projects/[slug]/milestones
 * Get all milestones for a project
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = session.user.id;

    // Get project
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        members: { where: { userId } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.members.length === 0 && project.visibility === 'private') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get milestones
    const milestones = await db.projectMilestone.findMany({
      where: { projectId: project.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });

    return NextResponse.json({
      projectId: project.id,
      projectName: project.name,
      milestones: milestones.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        dueDate: m.dueDate,
        status: m.status,
        priority: m.priority,
        progress: m.progress,
        assignedTo: m.assignedTo,
        dependencies: m.dependencies,
        blockingIssue: m.blockingIssue,
        blockedSince: m.blockedSince,
        startedAt: m.startedAt,
        completedAt: m.completedAt,
        createdBy: m.createdBy,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/projects/[slug]/milestones error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[slug]/milestones
 * Create a new milestone
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { title, description, dueDate, priority, assignedTo, dependencies } = body;

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, dueDate' },
        { status: 400 }
      );
    }

    // Get project
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        members: { where: { userId } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create milestone
    const milestone = await db.projectMilestone.create({
      data: {
        projectId: project.id,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        status: 'not_started',
        priority: priority || 'medium',
        assignedTo: assignedTo || [],
        dependencies: dependencies || [],
        progress: 0,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects/[slug]/milestones error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}





