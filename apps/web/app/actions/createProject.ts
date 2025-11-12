'use server';

import { prisma } from '@cronkwaters/db';
import { auth } from '@cronkwaters/auth';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(name: string) {
  // Use NextAuth for authentication
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('You must be signed in to create a project.');
  }

  const userId = session.user.id;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    // First get user's organization
    const membership = await prisma.organizationMembership.findFirst({
      where: { userId },
      include: { organization: true }
    });

    if (!membership) {
      throw new Error('You must be part of an organization to create projects.');
    }

    // Create the project
    await prisma.project.create({
      data: {
        name,
        slug,
        orgId: membership.organizationId
      }
    });

    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create project' };
  }
}
