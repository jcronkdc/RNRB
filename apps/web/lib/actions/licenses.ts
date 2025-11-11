'use server';

import { revalidatePath } from 'next/cache';
import { createLicense, listLicenses } from '@songforge/db';
import { requireOrgSession } from '@songforge/auth';
import { getProjectBySlug } from '@songforge/db';
import type { LicenseTemplate } from '@prisma/client';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new license
 */
export async function createLicenseAction(
  projectSlug: string,
  input: {
    template: LicenseTemplate;
    title: string;
    terms?: string;
    notes?: string;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireOrgSession();

    const project = await getProjectBySlug(projectSlug, session.orgId);
    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    const license = await createLicense({
      projectId: project.id,
      ...input
    });

    revalidatePath(`/app/projects/${projectSlug}`);

    return {
      success: true,
      data: { id: license.id }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create license'
    };
  }
}

/**
 * List licenses for a project
 */
export async function listLicensesAction(projectSlug: string) {
  try {
    const session = await requireOrgSession();

    const project = await getProjectBySlug(projectSlug, session.orgId);
    if (!project) {
      return {
        success: false,
        error: 'Project not found',
        data: []
      };
    }

    const licenses = await listLicenses(project.id);

    return {
      success: true,
      data: licenses.map((l) => ({
        id: l.id,
        template: l.template.replace(/_/g, ' '),
        title: l.title,
        status: l.status,
        createdAt: l.createdAt.toISOString()
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list licenses',
      data: []
    };
  }
}

