'use server';

import { requireOrgSession } from '@songforge/auth';
import { createProjectSchema, updateProjectSchema , createProject, updateProject, deleteProject, getProjectBySlug, listProjects } from '@songforge/db';
import { revalidatePath } from 'next/cache';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new project
 */
export async function createProjectAction(
  input: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await requireOrgSession();
    const validated = createProjectSchema.parse(input);

    // Generate slug if not provided
    const slug = validated.slug || validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (!session.activeMembership) {
      return {
        success: false,
        error: 'Active organization not found'
      };
    }
    const project = await createProject({
      orgId: session.activeMembership.org.id,
      ...validated,
      slug
    });

    revalidatePath('/app/projects');
    revalidatePath(`/app/projects/${project.slug}`);

    return {
      success: true,
      data: { id: project.id, slug: project.slug }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project'
    };
  }
}

/**
 * Update project
 */
export async function updateProjectAction(
  projectId: string,
  input: unknown
): Promise<ActionResult<{ slug: string }>> {
  try {
    const session = await requireOrgSession();
    const validated = updateProjectSchema.parse(input);

    if (!session.activeMembership) {
      return {
        success: false,
        error: 'Active organization not found'
      };
    }
    // Verify ownership
    const project = await getProjectBySlug(projectId, session.activeMembership.org.id);
    if (!project || project.orgId !== session.activeMembership.org.id) {
      return {
        success: false,
        error: 'Project not found or unauthorized'
      };
    }

    const updated = await updateProject(projectId, validated);

    revalidatePath('/app/projects');
    revalidatePath(`/app/projects/${updated.slug}`);

    return {
      success: true,
      data: { slug: updated.slug }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project'
    };
  }
}

/**
 * Delete project
 */
export async function deleteProjectAction(projectId: string): Promise<ActionResult<void>> {
  try {
    const session = await requireOrgSession();
    if (!session.activeMembership) {
      return {
        success: false,
        error: 'Active organization not found'
      };
    }

    await deleteProject(projectId, session.activeMembership.org.id);

    revalidatePath('/app/projects');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete project'
    };
  }
}

/**
 * List projects for current org
 */
export async function listProjectsAction(options?: {
  visibility?: 'private' | 'org' | 'public';
  status?: 'active' | 'archived' | 'draft';
}) {
  try {
    const session = await requireOrgSession();
    if (!session.activeMembership) {
      return {
        success: false,
        error: 'Active organization not found',
        data: { projects: [], total: 0, hasMore: false }
      };
    }

    const result = await listProjects(session.activeMembership.org.id, options);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list projects',
      data: { projects: [], total: 0, hasMore: false }
    };
  }
}

