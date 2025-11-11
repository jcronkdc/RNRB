import { prisma } from '../index';
import type { Project, ProjectVisibility, ProjectStatus } from '@prisma/client';

export interface CreateProjectInput {
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  coverImage?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  slug?: string;
  description?: string;
  tagline?: string;
  coverImage?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
}

/**
 * Create a new project with validation
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  // Validate slug uniqueness
  const existing = await prisma.project.findUnique({
    where: { slug: input.slug }
  });

  if (existing) {
    throw new Error(`Project with slug "${input.slug}" already exists`);
  }

  // Validate org exists
  const org = await prisma.org.findUnique({
    where: { id: input.orgId }
  });

  if (!org) {
    throw new Error(`Organization with id "${input.orgId}" not found`);
  }

  return prisma.project.create({
    data: {
      orgId: input.orgId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      tagline: input.tagline,
      coverImage: input.coverImage,
      visibility: input.visibility ?? 'private',
      status: input.status ?? 'active'
    }
  });
}

/**
 * Update project with validation
 */
export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> {
  // Check if project exists
  const existing = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!existing) {
    throw new Error(`Project with id "${projectId}" not found`);
  }

  // If slug is being changed, check uniqueness
  if (input.slug && input.slug !== existing.slug) {
    const slugConflict = await prisma.project.findUnique({
      where: { slug: input.slug }
    });

    if (slugConflict) {
      throw new Error(`Project with slug "${input.slug}" already exists`);
    }
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...input,
      updatedAt: new Date()
    }
  });
}

/**
 * Get project by slug with relations
 */
export async function getProjectBySlug(slug: string, orgId?: string) {
  return prisma.project.findFirst({
    where: {
      slug,
      ...(orgId ? { orgId } : {})
    },
    include: {
      org: {
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        }
      },
      songs: {
        orderBy: { createdAt: 'desc' }
      },
      assets: {
        orderBy: { createdAt: 'desc' }
      },
      splitSheets: {
        include: {
          contributors: true
        },
        orderBy: { createdAt: 'desc' }
      },
      licenses: {
        orderBy: { createdAt: 'desc' }
      },
      events: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
}

/**
 * List projects for an organization with filtering
 */
export async function listProjects(
  orgId: string,
  options?: {
    visibility?: ProjectVisibility;
    status?: ProjectStatus;
    limit?: number;
    offset?: number;
  }
) {
  const where = {
    orgId,
    ...(options?.visibility ? { visibility: options.visibility } : {}),
    ...(options?.status ? { status: options.status } : {})
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      include: {
        _count: {
          select: {
            songs: true,
            assets: true,
            splitSheets: true,
            licenses: true
          }
        }
      }
    }),
    prisma.project.count({ where })
  ]);

  return {
    projects,
    total,
    hasMore: (options?.offset ?? 0) + projects.length < total
  };
}

/**
 * Delete project (cascades to related records)
 */
export async function deleteProject(projectId: string, orgId: string): Promise<void> {
  // Verify ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error(`Project with id "${projectId}" not found`);
  }

  if (project.orgId !== orgId) {
    throw new Error('Unauthorized: Project does not belong to this organization');
  }

  await prisma.project.delete({
    where: { id: projectId }
  });
}

