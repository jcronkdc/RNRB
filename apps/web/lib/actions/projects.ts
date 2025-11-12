'use server';

import { prisma } from '@songforge/db';
import { getOrgSessionFromSession } from '@songforge/auth';

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