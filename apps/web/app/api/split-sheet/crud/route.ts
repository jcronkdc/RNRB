import { prisma } from '@cronkwaters/db';
import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Split Sheet CRUD API
 *
 * GET    /api/split-sheet/crud?projectId=xxx - List split sheets for a project
 * POST   /api/split-sheet/crud - Create a new split sheet
 * PUT    /api/split-sheet/crud - Update an existing split sheet
 * DELETE /api/split-sheet/crud?id=xxx - Delete a split sheet
 */

async function verifyProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: { some: { userId } },
    },
    select: { id: true },
  });
  return !!project;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const id = searchParams.get('id');

    if (id) {
      const splitSheet = await prisma.splitSheet.findUnique({
        where: { id },
        include: {
          contributors: true,
          project: {
            select: { id: true, name: true },
          },
        },
      });

      if (!splitSheet) {
        return NextResponse.json({ error: 'Split sheet not found' }, { status: 404 });
      }

      const hasAccess = await verifyProjectAccess(splitSheet.projectId, session.user.id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({ splitSheet });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const hasAccess = await verifyProjectAccess(projectId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const splitSheets = await prisma.splitSheet.findMany({
      where: { projectId },
      include: {
        contributors: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ splitSheets });
  } catch (error) {
    console.error('[SPLIT-SHEET] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch split sheets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, title, notes, contributors } = body;

    if (!projectId || !title) {
      return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 });
    }

    const hasAccess = await verifyProjectAccess(projectId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 });
    }

    const totalPercentage = (contributors || []).reduce(
      (sum: number, c: any) => sum + (c.percentage || 0),
      0
    );

    if (totalPercentage > 100) {
      return NextResponse.json({ error: 'Total percentage cannot exceed 100%' }, { status: 400 });
    }

    const splitSheet = await prisma.splitSheet.create({
      data: {
        projectId,
        title,
        notes: notes || null,
        contributors: {
          create: (contributors || []).map((c: any) => ({
            name: c.name,
            role: c.role || null,
            percentage: c.percentage || 0,
            pro: c.pro || null,
            ipi: c.ipi || null,
            publisher: c.publisher || null,
            email: c.email || null,
          })),
        },
      },
      include: { contributors: true },
    });

    return NextResponse.json({ splitSheet }, { status: 201 });
  } catch (error) {
    console.error('[SPLIT-SHEET] POST error:', error);
    return NextResponse.json({ error: 'Failed to create split sheet' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, notes, finalized, contributors } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await prisma.splitSheet.findUnique({
      where: { id },
      select: { projectId: true, finalized: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Split sheet not found' }, { status: 404 });
    }

    const hasAccess = await verifyProjectAccess(existing.projectId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (existing.finalized) {
      return NextResponse.json({ error: 'Cannot modify a finalized split sheet' }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (notes !== undefined) updateData.notes = notes;
    if (finalized) {
      updateData.finalized = true;
      updateData.finalizedAt = new Date();
    }

    if (contributors) {
      await prisma.splitContributor.deleteMany({ where: { splitSheetId: id } });
    }

    const splitSheet = await prisma.splitSheet.update({
      where: { id },
      data: {
        ...updateData,
        ...(contributors
          ? {
              contributors: {
                create: contributors.map((c: any) => ({
                  name: c.name,
                  role: c.role || null,
                  percentage: c.percentage || 0,
                  pro: c.pro || null,
                  ipi: c.ipi || null,
                  publisher: c.publisher || null,
                  email: c.email || null,
                })),
              },
            }
          : {}),
      },
      include: { contributors: true },
    });

    return NextResponse.json({ splitSheet });
  } catch (error) {
    console.error('[SPLIT-SHEET] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update split sheet' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await prisma.splitSheet.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Split sheet not found' }, { status: 404 });
    }

    const hasAccess = await verifyProjectAccess(existing.projectId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.splitSheet.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SPLIT-SHEET] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete split sheet' }, { status: 500 });
  }
}
