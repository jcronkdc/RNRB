'use server';

import { prisma } from '@cronkwaters/db';
import { createProject as dbCreateProject } from '@cronkwaters/db';
import { getOrgSessionFromSession, auth } from '@cronkwaters/auth';
import { validateCSRFToken } from '../csrf';
import { sanitizeUserInput } from '../sanitization';
import { rateLimitMiddleware } from '../rate-limit';
import { z } from 'zod';
import { action } from '../actions/safe-action';
import { requireOrgSession } from '../session';

export async function getProjects() {
  const session = await getOrgSessionFromSession();
  if (!session || !session.activeMembership) {
    throw new Error('Unauthorized');
  }

  const projects = await prisma.project.findMany({
    where: {
      orgId: session.activeMembership.orgId,
    },
    include: {
      songs: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return projects;
}

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const createProjectAction = action(
  createProjectSchema,
  async (input) => {
    try {
      const csrfValid = await validateCSRFToken();
      if (!csrfValid) {
        return { error: 'CSRF validation failed' };
      }

      await rateLimitMiddleware('serverAction');
      
      const session = await requireOrgSession();
      
      const sanitizedName = sanitizeUserInput(input.name);
      const sanitizedDescription = input.description ? sanitizeUserInput(input.description) : undefined;
      
      const project = await dbCreateProject({
        name: sanitizedName,
        description: sanitizedDescription,
        orgId: session.organization.id,
      });

      return { data: { project } };
    } catch (error) {
      console.error("Failed to create project:", error);
      return { error: "Failed to create project" };
    }
  }
);