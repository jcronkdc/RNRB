'use server';

import { revalidatePath } from 'next/cache';
import { createProjectSchema, updateProjectSchema } from '@songforge/db/validation/projects';
import { createProject, updateProject, deleteProject, getProjectBySlug, listProjects } from '@songforge/db';
import type { OrgSession } from '@songforge/auth';
import { requireOrgSession } from '@songforge/auth';

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

    const project = await createProject({
      orgId: session.orgId,
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

    // Verify ownership
    const project = await getProjectBySlug(projectId, session.orgId);
    if (!project || project.orgId !== session.orgId) {
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

    await deleteProject(projectId, session.orgId);

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

    const result = await listProjects(session.orgId, options);

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

