import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/projects/[id]
 * Get a single project by ID or slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Try to find by ID first, then by slug
    const project = await db.project.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id },
              { slug: id },
            ],
          },
          {
            // Ensure user has access
            OR: [
              { visibility: 'public' },
              {
                members: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          }
        ],
      },
      include: {
        members: {
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
        },
        songs: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
        _count: {
          select: {
            songs: true,
            members: true,
            studioSessions: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Transform response
    const response = {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      tagline: project.tagline,
      cover_image: project.coverImage,
      visibility: project.visibility,
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString(),
      song_count: project._count.songs,
      collaborator_count: project._count.members,
      session_count: project._count.studioSessions,
      members: project.members.map(m => ({
        id: m.id,
        role: m.role,
        user: m.user,
      })),
      songs: project.songs,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { userId, name, description, tagline, coverImage, visibility } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user has permission to update
    const existingProject = await db.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        members: {
          some: {
            userId: userId,
            role: {
              in: ['owner', 'admin'],
            },
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Update project
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (tagline !== undefined) updateData.tagline = tagline?.trim() || null;
    if (coverImage !== undefined) updateData.coverImage = coverImage || null;
    if (visibility) updateData.visibility = visibility;

    const updatedProject = await db.project.update({
      where: { id: existingProject.id },
      data: updateData,
      include: {
        _count: {
          select: {
            songs: true,
            members: true,
            studioSessions: true,
          },
        },
      },
    });

    // Transform response
    const response = {
      id: updatedProject.id,
      name: updatedProject.name,
      slug: updatedProject.slug,
      description: updatedProject.description,
      tagline: updatedProject.tagline,
      cover_image: updatedProject.coverImage,
      visibility: updatedProject.visibility,
      created_at: updatedProject.createdAt.toISOString(),
      updated_at: updatedProject.updatedAt.toISOString(),
      song_count: updatedProject._count.songs,
      collaborator_count: updatedProject._count.members,
      session_count: updatedProject._count.studioSessions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project (owner only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user is owner
    const project = await db.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        members: {
          some: {
            userId: userId,
            role: 'owner',
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Delete project (cascade will handle related records)
    await db.project.delete({
      where: { id: project.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

