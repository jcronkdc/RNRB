'use server';

import type { LicenseTemplate } from '@prisma/client';
import { requireOrgSession } from '@songforge/auth';
import { createLicense, listLicenses, getProjectBySlug } from '@songforge/db';
import { revalidatePath } from 'next/cache';

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
    if (!session.activeMembership) {
      return {
        success: false,
        error: 'Active organization not found'
      };
    }

    const project = await getProjectBySlug(projectSlug, session.activeMembership.org.id);
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

    if (!session.activeMembership) {
      return {
        success: false,
        error: 'Active organization not found',
        data: []
      };
    }
    const project = await getProjectBySlug(projectSlug, session.activeMembership.org.id);
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
      data: licenses.map((l: { id: string; template: string; title: string; status: string; createdAt: Date }) => ({
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

