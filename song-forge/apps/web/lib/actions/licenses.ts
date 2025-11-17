"use server";

import { requireOrgSession } from "@cronkwaters/auth";
import { createLicense, listLicenses, getProjectBySlug } from "@cronkwaters/db";
import type { LicenseTemplate } from "@prisma/client";
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
 * Create a new license
 */
export async function createLicenseAction(
  projectSlug: string,
  input: {
    template: LicenseTemplate;
    title: string;
    terms?: string;
    notes?: string;
  },
): Promise<ActionResult<{ id: string }>> {
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
    if (!session.activeMembership) {
      return {
        success: false,
        error: "Active organization not found",
      };
    }

    const project = await getProjectBySlug(projectSlug, session.activeMembership.org.id);
    if (!project) {
      return {
        success: false,
        error: "Project not found",
      };
    }

    // SECURITY: Sanitize user inputs
    const sanitizedTitle = sanitizeUserInput(input.title);
    const sanitizedTerms = input.terms ? sanitizeUserInput(input.terms) : undefined;
    const sanitizedNotes = input.notes ? sanitizeUserInput(input.notes) : undefined;

    const license = await createLicense({
      projectId: project.id,
      template: input.template,
      title: sanitizedTitle,
      terms: sanitizedTerms,
      notes: sanitizedNotes,
    });

    revalidatePath(`/app/projects/${projectSlug}`);

    return {
      success: true,
      data: { id: license.id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create license",
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
        error: "Active organization not found",
        data: [],
      };
    }
    const project = await getProjectBySlug(projectSlug, session.activeMembership.org.id);
    if (!project) {
      return {
        success: false,
        error: "Project not found",
        data: [],
      };
    }

    const licenses = await listLicenses(project.id);

    return {
      success: true,
      data: licenses.map(
        (l: { id: string; template: string; title: string; status: string; createdAt: Date }) => ({
          id: l.id,
          template: l.template.replace(/_/g, " "),
          title: l.title,
          status: l.status,
          createdAt: l.createdAt.toISOString(),
        }),
      ),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list licenses",
      data: [],
    };
  }
}
