"use server";

import { requireOrgSession } from "@cronkwaters/auth";
import {
  createSplitSheetSchema,
  updateSplitSheetSchema,
  createSplitSheet,
  updateSplitSheet,
  addContributor,
  updateContributor,
  removeContributor,
  finalizeSplitSheet,
  listSplitSheets,
  getProjectBySlug,
} from "@cronkwaters/db";
import { revalidatePath } from "next/cache";

import { validateCSRFToken } from "../csrf";
import { rateLimitMiddleware } from "../rate-limit";
import { sanitizeUserInput } from "../sanitization";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new split sheet
 */
export async function createSplitSheetAction(
  input: unknown,
): Promise<ActionResult<{ splitSheet: { id: string } }>> {
  try {
    // SECURITY: CSRF Protection
    const csrfValid = await validateCSRFToken();
    if (!csrfValid) {
      return {
        success: false,
        error: "Invalid CSRF token",
      };
    }

    // SECURITY: Rate Limiting
    await rateLimitMiddleware("serverAction");

    const session = await requireOrgSession();
    const validated = createSplitSheetSchema.parse(input);

    // SECURITY: Sanitize user inputs
    if (validated.title) {
      validated.title = sanitizeUserInput(validated.title);
    }

    if (!(session as any).activeMembership) {
      return {
        success: false,
        error: "Active organization not found",
      };
    }

    // Handle both projectId and projectSlug
    let projectId = (validated as any).projectId;
    if (!projectId && (validated as any).projectSlug) {
      const project = await getProjectBySlug((validated as any).projectSlug, (session as any).activeMembership?.org?.id || '');
      if (!project) {
        return {
          success: false,
          error: "Project not found",
        };
      }
      projectId = project.id;
    }

    if (!projectId) {
      return {
        success: false,
        error: "Project ID or slug required",
      };
    }

    const splitSheet = await createSplitSheet({
      projectId: projectId,
      title: validated.title,
      initialSplits: (validated as any).initialSplits || [],
    } as any);

    revalidatePath(`/splits`);

    return {
      success: true,
      data: { splitSheet: { id: splitSheet.id } },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create split sheet",
    };
  }
}

/**
 * Update split sheet
 */
export async function updateSplitSheetAction(
  splitSheetId: string,
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    const session = await requireOrgSession();
    const validated = updateSplitSheetSchema.parse(input);

    if (!(session as any).activeMembership) {
      return {
        success: false,
        error: "Active organization not found",
      };
    }

    await updateSplitSheet(splitSheetId, validated, (session as any).activeMembership?.org?.id || '');

    revalidatePath("/app/projects");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update split sheet",
    };
  }
}

/**
 * Add contributor to split sheet
 */
export async function addContributorAction(
  splitSheetId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireOrgSession();
    const { splitContributorSchema } = await import("@cronkwaters/db");
    const validated = splitContributorSchema.parse(input);

    const contributor = await addContributor(splitSheetId, validated);

    revalidatePath("/app/projects");

    return {
      success: true,
      data: { id: contributor.id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add contributor",
    };
  }
}

/**
 * Update contributor
 */
export async function updateContributorAction(
  contributorId: string,
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    await requireOrgSession();
    const { splitContributorSchema } = await import("@cronkwaters/db");
    const validated = splitContributorSchema.partial().parse(input);

    await updateContributor(contributorId, validated);

    revalidatePath("/app/projects");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update contributor",
    };
  }
}

/**
 * Remove contributor
 */
export async function removeContributorAction(contributorId: string): Promise<ActionResult<void>> {
  try {
    await requireOrgSession();

    await removeContributor(contributorId);

    revalidatePath("/app/projects");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove contributor",
    };
  }
}

/**
 * Finalize split sheet
 */
export async function finalizeSplitSheetAction(
  splitSheetId: string,
  pdfKey: string,
): Promise<ActionResult<void>> {
  try {
    await requireOrgSession();

    await finalizeSplitSheet(splitSheetId, pdfKey);

    revalidatePath("/app/projects");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to finalize split sheet",
    };
  }
}

/**
 * List split sheets for a project
 */
export async function listSplitSheetsAction(projectSlug: string) {
  try {
    const session = await requireOrgSession();
    if (!(session as any).activeMembership) {
      return {
        success: false,
        error: "Active organization not found",
        data: [],
      };
    }

    const project = await getProjectBySlug(projectSlug, (session as any).activeMembership?.org?.id || '');
    if (!project) {
      return {
        success: false,
        error: "Project not found",
        data: [],
      };
    }

    const splits = await listSplitSheets(project.id);

    return {
      success: true,
      data: splits,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list split sheets",
      data: [],
    };
  }
}
