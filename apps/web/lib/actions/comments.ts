'use server';

import { db } from '@/lib/db';
import { currentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getComments(entityType: 'project' | 'song', entityId: string) {
  try {
    const comments = await db.comment.findMany({
      where: {
        entityType,
        entityId,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  } catch (error) {
    console.error('Failed to get comments:', error);
    return [];
  }
}

export async function createComment(
  entityType: 'project' | 'song',
  entityId: string,
  text: string,
  parentId?: string
) {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('You must be logged in to comment');
  }

  try {
    // Verify user has access to the resource
    if (entityType === 'project') {
      const project = await db.project.findFirst({
        where: {
          id: entityId,
          organization: {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        },
      });

      if (!project) {
        throw new Error('You do not have access to this project');
      }
    } else if (entityType === 'song') {
      const song = await db.song.findFirst({
        where: {
          id: entityId,
          project: {
            organization: {
              members: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
      });

      if (!song) {
        throw new Error('You do not have access to this song');
      }
    }

    const comment = await db.comment.create({
      data: {
        text,
        entityType,
        entityId,
        userId: user.id,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Revalidate the resource page
    if (entityType === 'project') {
      const project = await db.project.findUnique({
        where: { id: entityId },
        select: { slug: true },
      });
      if (project?.slug) {
        revalidatePath(`/projects/${project.slug}`);
      }
    } else if (entityType === 'song') {
      const song = await db.song.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          project: {
            select: { slug: true },
          },
        },
      });
      if (song?.project?.slug) {
        revalidatePath(`/projects/${song.project.slug}/songs/${song.id}`);
      }
    }

    return comment;
  } catch (error) {
    console.error('Failed to create comment:', error);
    throw new Error('Failed to create comment');
  }
}

export async function updateComment(commentId: string, text: string) {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('You must be logged in to update a comment');
  }

  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
      },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== user.id) {
      throw new Error('You can only edit your own comments');
    }

    const updatedComment = await db.comment.update({
      where: { id: commentId },
      data: {
        text,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Revalidate the resource page
    if (comment.entityType === 'project') {
      const project = await db.project.findUnique({
        where: { id: comment.entityId },
        select: { slug: true },
      });
      if (project) {
        revalidatePath(`/projects/${project.slug}`);
      }
    } else if (comment.entityType === 'song') {
      const song = await db.song.findUnique({
        where: { id: comment.entityId },
        select: {
          slug: true,
          project: {
            select: { slug: true },
          },
        },
      });
      if (song) {
        revalidatePath(`/projects/${song.project.slug}/songs/${song.slug}`);
      }
    }

    return updatedComment;
  } catch (error) {
    console.error('Failed to update comment:', error);
    throw new Error('Failed to update comment');
  }
}

export async function deleteComment(commentId: string) {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('You must be logged in to delete a comment');
  }

  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== user.id) {
      throw new Error('You can only delete your own comments');
    }

    // Delete all replies first
    await db.comment.deleteMany({
      where: { parentId: commentId },
    });

    // Delete the comment
    await db.comment.delete({
      where: { id: commentId },
    });

    // Revalidate the resource page
    if (comment.entityType === 'project') {
      const project = await db.project.findUnique({
        where: { id: comment.entityId },
        select: { slug: true },
      });
      if (project?.slug) {
        revalidatePath(`/projects/${project.slug}`);
      }
    } else if (comment.entityType === 'song') {
      const song = await db.song.findUnique({
        where: { id: comment.entityId },
        select: {
          id: true,
          project: {
            select: { slug: true },
          },
        },
      });
      if (song?.project?.slug) {
        revalidatePath(`/projects/${song.project.slug}/songs/${song.id}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete comment:', error);
    throw new Error('Failed to delete comment');
  }
}

export async function getCommentCount(entityType: 'project' | 'song', entityId: string) {
  try {
    const count = await db.comment.count({
      where: {
        entityType,
        entityId,
      },
    });

    return count;
  } catch (error) {
    console.error('Failed to get comment count:', error);
    return 0;
  }
}
