import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/projects/[slug]/views
 * Get all saved views (smart filters) for a project
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = session.user.id;

    const project = await db.project.findUnique({
      where: { slug },
      include: {
        members: { where: { userId } },
        views: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.members.length === 0 && project.visibility === 'private') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ views: project.views });
  } catch (error) {
    console.error('GET /api/projects/[slug]/views error:', error);
    return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[slug]/views
 * Create a new saved view (smart filter)
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { name, filters, sortBy, sortOrder, isDefault } = body;

    if (!name || !filters) {
      return NextResponse.json(
        { error: 'Missing required fields: name, filters' },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({
      where: { slug },
      include: { members: { where: { userId } } },
    });

    if (!project || project.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.projectView.updateMany({
        where: { projectId: project.id, createdById: userId },
        data: { isDefault: false },
      });
    }

    const view = await db.projectView.create({
      data: {
        projectId: project.id,
        name,
        filters,
        sortBy: sortBy || 'updatedAt',
        sortOrder: sortOrder || 'desc',
        isDefault: isDefault || false,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ view }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects/[slug]/views error:', error);
    return NextResponse.json({ error: 'Failed to create view' }, { status: 500 });
  }
}






