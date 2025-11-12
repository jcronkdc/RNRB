'use server';

import { prisma } from '@songforge/db';
import { getOrgSessionFromSession } from '@songforge/auth';

export async function getProjects() {
  const session = await getOrgSessionFromSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const projects = await prisma.project.findMany({
    where: {
      orgId: session.org.id,
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