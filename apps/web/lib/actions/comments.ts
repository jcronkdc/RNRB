'use server';

import { requireOrgSession } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { z } from 'zod';

// Input validation schemas
const createCommentSchema = z.object({
  text: z.string().min(1).max(5000),
  entityId: z.string(),
  entityType: z.enum(['project', 'song', 'asset', 'license', 'split'])
});

export async function createCommentAction(
  entityId: string,
  entityType: 'project' | 'song' | 'asset' | 'license' | 'split',
  text: string
) {
  try {
    const session = await requireOrgSession();

    const validated = createCommentSchema.parse({
      text,
      entityId,
      entityType
    });

    // Verify user has access to the entity
    let hasAccess = false;
    switch (entityType) {
      case 'project': {
        const project = await prisma.project.findFirst({
          where: {
            slug: entityId,
            orgId: session.activeMembership?.org.id
          }
        });
        hasAccess = !!project;
        break;
      }
      case 'song': {
        const song = await prisma.song.findFirst({
          where: {
            id: entityId,
            project: {
              orgId: session.activeMembership?.org.id
            }
          }
        });
        hasAccess = !!song;
        break;
      }
      case 'asset': {
        const asset = await prisma.asset.findFirst({
          where: {
            id: entityId,
            project: {
              orgId: session.activeMembership?.org.id
            }
          }
        });
        hasAccess = !!asset;
        break;
      }
      case 'license': {
        const license = await prisma.license.findFirst({
          where: {
            id: entityId,
            project: {
              orgId: session.activeMembership?.org.id
            }
          }
        });
        hasAccess = !!license;
        break;
      }
      case 'split': {
        const split = await prisma.splitSheet.findFirst({
          where: {
            id: entityId,
            project: {
              orgId: session.activeMembership?.org.id
            }
          }
        });
        hasAccess = !!split;
        break;
      }
    }

    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have access to comment on this item'
      };
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        text: validated.text,
        userId: (session as any).user?.id || '',
        entityId: validated.entityId,
        entityType: validated.entityType
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return {
      success: true,
      data: comment
    };
  } catch (error) {
    console.error('Failed to create comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comment'
    };
  }
}

// Get comments for an entity
export async function getCommentsForEntity(
  entityId: string,
  entityType: string
) {
  try {
    const session = await requireOrgSession();

    // Verify access (similar to create comment)
    let hasAccess = false;
    switch (entityType) {
      case 'project': {
        const project = await prisma.project.findFirst({
          where: {
            slug: entityId,
            orgId: session.activeMembership?.org.id
          }
        });
        hasAccess = !!project;
        break;
      }
      // Add other entity type checks as needed
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      return [];
    }

    // Fetch comments for the entity
    const comments = await prisma.comment.findMany({
      where: {
        entityId,
        entityType
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return comments;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }
}
