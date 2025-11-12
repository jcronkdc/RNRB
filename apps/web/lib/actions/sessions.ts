'use server';

import { action } from "../actions/safe-action";
import { z } from "zod";
import { prisma } from "@cronkwaters/db";
import { requireOrgSession } from "../session";
import { validateCSRFToken } from '../csrf';
import { sanitizeUserInput } from '../sanitization';
import { rateLimitMiddleware } from '../rate-limit';

const createSessionSchema = z.object({
  title: z.string().min(1).max(100),
  projectId: z.string(),
  type: z.enum(['writing', 'recording', 'meeting', 'rehearsal']),
  startTime: z.date(),
  endTime: z.date(),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const createSessionAction = action(
  createSessionSchema,
  async (input) => {
    try {
      const csrfValid = await validateCSRFToken();
      if (!csrfValid) {
        return { error: 'CSRF validation failed' };
      }

      await rateLimitMiddleware('serverAction');
      
      const session = await requireOrgSession();
      
      // Verify project belongs to org
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          orgId: session.organization.id
        }
      });
      
      if (!project) {
        return { error: 'Project not found' };
      }
      
      const sanitizedTitle = sanitizeUserInput(input.title);
      const sanitizedLocation = input.location ? sanitizeUserInput(input.location) : undefined;
      const sanitizedNotes = input.notes ? sanitizeUserInput(input.notes) : undefined;
      
      // Create the session
      const studioSession = await prisma.studioSession.create({
        data: {
          title: sanitizedTitle,
          type: input.type,
          status: 'confirmed',
          startTime: input.startTime,
          endTime: input.endTime,
          location: sanitizedLocation,
          notes: sanitizedNotes,
          projectId: input.projectId,
          createdById: session.user.id,
          attendees: {
            create: {
              userId: session.user.id,
              role: 'organizer',
              status: 'confirmed'
            }
          }
        },
        include: {
          project: true,
          attendees: {
            include: {
              user: true
            }
          }
        }
      });

      return { data: { session: studioSession } };
    } catch (error) {
      console.error("Failed to create session:", error);
      return { error: "Failed to create session" };
    }
  }
);

const updateSessionSchema = z.object({
  sessionId: z.string(),
  title: z.string().min(1).max(100).optional(),
  type: z.enum(['writing', 'recording', 'meeting', 'rehearsal']).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
});

export const updateSessionAction = action(
  updateSessionSchema,
  async (input) => {
    try {
      const csrfValid = await validateCSRFToken();
      if (!csrfValid) {
        return { error: 'CSRF validation failed' };
      }

      await rateLimitMiddleware('serverAction');
      
      const session = await requireOrgSession();
      
      // Verify session belongs to org
      const studioSession = await prisma.studioSession.findFirst({
        where: {
          id: input.sessionId,
          project: {
            orgId: session.organization.id
          }
        }
      });
      
      if (!studioSession) {
        return { error: 'Session not found' };
      }
      
      // Only organizer can update
      if (studioSession.createdById !== session.user.id) {
        return { error: 'Only the organizer can update this session' };
      }
      
      const updateData: any = {};
      
      if (input.title) updateData.title = sanitizeUserInput(input.title);
      if (input.type) updateData.type = input.type;
      if (input.startTime) updateData.startTime = input.startTime;
      if (input.endTime) updateData.endTime = input.endTime;
      if (input.location !== undefined) updateData.location = input.location ? sanitizeUserInput(input.location) : null;
      if (input.notes !== undefined) updateData.notes = input.notes ? sanitizeUserInput(input.notes) : null;
      if (input.status) updateData.status = input.status;
      
      const updated = await prisma.studioSession.update({
        where: { id: input.sessionId },
        data: updateData
      });

      return { data: { session: updated } };
    } catch (error) {
      console.error("Failed to update session:", error);
      return { error: "Failed to update session" };
    }
  }
);

export const deleteSessionAction = action(
  z.object({ sessionId: z.string() }),
  async (input) => {
    try {
      const csrfValid = await validateCSRFToken();
      if (!csrfValid) {
        return { error: 'CSRF validation failed' };
      }

      await rateLimitMiddleware('serverAction');
      
      const session = await requireOrgSession();
      
      // Verify session belongs to org and user is organizer
      const studioSession = await prisma.studioSession.findFirst({
        where: {
          id: input.sessionId,
          project: {
            orgId: session.organization.id
          },
          createdById: session.user.id
        }
      });
      
      if (!studioSession) {
        return { error: 'Session not found or you do not have permission to delete it' };
      }
      
      await prisma.studioSession.delete({
        where: { id: input.sessionId }
      });

      return { data: { success: true } };
    } catch (error) {
      console.error("Failed to delete session:", error);
      return { error: "Failed to delete session" };
    }
  }
);
