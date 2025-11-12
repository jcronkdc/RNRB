'use server';

import { requireOrgSession } from '@songforge/auth';
import { createSplitSheetSchema, updateSplitSheetSchema , createSplitSheet, updateSplitSheet, addContributor, updateContributor, removeContributor, finalizeSplitSheet, listSplitSheets , getProjectBySlug } from '@songforge/db';
import { revalidatePath } from 'next/cache';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new split sheet
 */
export async function createSplitSheetAction(
  projectSlug: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireOrgSession();
    const validated = createSplitSheetSchema.parse(input);

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

    const splitSheet = await createSplitSheet({
      projectId: project.id,
      ...validated
    });

    revalidatePath(`/app/projects/${projectSlug}`);

    return {
      success: true,
      data: { id: splitSheet.id }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create split sheet'
    };
  }
}

/**
 * Update split sheet
 */
export async function updateSplitSheetAction(
  splitSheetId: string,
  input: unknown
): Promise<ActionResult<void>> {
  try {
    await requireOrgSession();
    const validated = updateSplitSheetSchema.parse(input);

    await updateSplitSheet(splitSheetId, validated);

    revalidatePath('/app/projects');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update split sheet'
    };
  }
}

/**
 * Add contributor to split sheet
 */
export async function addContributorAction(
  splitSheetId: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireOrgSession();
    const { splitContributorSchema } = await import('@songforge/db');
    const validated = splitContributorSchema.parse(input);

    const contributor = await addContributor(splitSheetId, validated);

    revalidatePath('/app/projects');

    return {
      success: true,
      data: { id: contributor.id }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add contributor'
    };
  }
}

/**
 * Update contributor
 */
export async function updateContributorAction(
  contributorId: string,
  input: unknown
): Promise<ActionResult<void>> {
  try {
    await requireOrgSession();
    const { splitContributorSchema } = await import('@songforge/db');
    const validated = splitContributorSchema.partial().parse(input);

    await updateContributor(contributorId, validated);

    revalidatePath('/app/projects');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update contributor'
    };
  }
}

/**
 * Remove contributor
 */
export async function removeContributorAction(
  contributorId: string
): Promise<ActionResult<void>> {
  try {
    await requireOrgSession();

    await removeContributor(contributorId);

    revalidatePath('/app/projects');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove contributor'
    };
  }
}

/**
 * Finalize split sheet
 */
export async function finalizeSplitSheetAction(
  splitSheetId: string,
  pdfKey: string
): Promise<ActionResult<void>> {
  try {
    await requireOrgSession();

    await finalizeSplitSheet(splitSheetId, pdfKey);

    revalidatePath('/app/projects');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to finalize split sheet'
    };
  }
}

/**
 * List split sheets for a project
 */
export async function listSplitSheetsAction(projectSlug: string) {
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

    const splits = await listSplitSheets(project.id);

    return {
      success: true,
      data: splits
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list split sheets',
      data: []
    };
  }
}

