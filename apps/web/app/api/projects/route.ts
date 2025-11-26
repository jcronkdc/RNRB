import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';
import { createProjectSchema, parseBody } from '@/lib/validations';

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
export async function GET() {
  try {
    const user = await requireAuth();

    // Get all projects where user is a member
    const projects = await db.project.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
        songs: {
          select: {
            id: true,
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform to match frontend expectations
    const transformedProjects = projects.map((project) => ({
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
    }));

    return NextResponse.json(transformedProjects);
  } catch (error) {
    return handleApiError(error, { route: '/api/projects', method: 'GET' });
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Validate input with Zod schema
    const validated = await parseBody(req, createProjectSchema);

    // Generate slug from name
    const baseSlug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists and make unique if needed
    const existingProject = await db.project.findUnique({
      where: { slug: baseSlug },
    });

    const finalSlug = existingProject ? `${baseSlug}-${Date.now()}` : baseSlug;

    // If no orgId provided, create or get user's personal org
    let finalOrgId = validated.orgId;

    if (!finalOrgId) {
      // Try to find user's personal org
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        include: {
          memberships: {
            where: {
              role: 'owner',
            },
            include: {
              org: true,
            },
          },
        },
      });

      if (dbUser?.memberships && dbUser.memberships.length > 0) {
        finalOrgId = dbUser.memberships[0].org.id;
      } else {
        // Create a personal org for the user
        const personalOrg = await db.org.create({
          data: {
            name: `${dbUser?.name || 'My'} Workspace`,
            slug: `${user.id}-workspace-${Date.now()}`,
            type: 'solo',
          },
        });

        // Add user as owner
        await db.membership.create({
          data: {
            userId: user.id,
            orgId: personalOrg.id,
            role: 'owner',
          },
        });

        finalOrgId = personalOrg.id;
      }
    }

    // Create the project
    const project = await db.project.create({
      data: {
        name: validated.name,
        slug: finalSlug,
        description: validated.description || null,
        tagline: validated.tagline || null,
        coverImage: validated.coverImage || null,
        visibility: validated.visibility,
        orgId: finalOrgId,
      },
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

    // Add creator as owner
    await db.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: 'owner',
      },
    });

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
      collaborator_count: project._count.members + 1, // +1 for creator
      session_count: project._count.studioSessions,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/projects', method: 'POST' });
  }
}
