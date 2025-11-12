import type { Song } from '@prisma/client';

import { prisma } from '../index';

export interface CreateSongInput {
  projectId: string;
  title: string;
  key?: string;
  tempo?: number;
  timeSignature?: string;
  iswc?: string;
  description?: string;
  lyrics?: string;
}

export interface UpdateSongInput {
  title?: string;
  key?: string;
  tempo?: number;
  timeSignature?: string;
  iswc?: string;
  description?: string;
  lyrics?: string;
}

/**
 * Create a new song with validation
 */
export async function createSong(input: CreateSongInput): Promise<Song> {
  // Validate project exists
  const project = await prisma.project.findUnique({
    where: { id: input.projectId }
  });

  if (!project) {
    throw new Error(`Project with id "${input.projectId}" not found`);
  }

  // If ISWC provided, check uniqueness
  if (input.iswc) {
    const existing = await prisma.song.findUnique({
      where: { iswc: input.iswc }
    });

    if (existing) {
      throw new Error(`Song with ISWC "${input.iswc}" already exists`);
    }
  }

  return prisma.song.create({
    data: input
  });
}

/**
 * Update song with validation and org ownership check
 */
export async function updateSong(songId: string, input: UpdateSongInput, orgId?: string): Promise<Song> {
  const existing = await prisma.song.findUnique({
    where: { id: songId },
    include: {
      project: {
        select: {
          orgId: true
        }
      }
    }
  });

  if (!existing) {
    throw new Error(`Song with id "${songId}" not found`);
  }

  // SECURITY: Verify organization ownership if orgId provided
  if (orgId && existing.project.orgId !== orgId) {
    throw new Error('Unauthorized: Song does not belong to this organization');
  }

  // If ISWC is being changed, check uniqueness
  if (input.iswc && input.iswc !== existing.iswc) {
    const iswcConflict = await prisma.song.findUnique({
      where: { iswc: input.iswc }
    });

    if (iswcConflict) {
      throw new Error(`Song with ISWC "${input.iswc}" already exists`);
    }
  }

  return prisma.song.update({
    where: { id: songId },
    data: {
      ...input,
      updatedAt: new Date()
    }
  });
}

/**
 * List songs for a project
 */
export async function listSongs(projectId: string) {
  return prisma.song.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Get song by ID
 */
export async function getSongById(songId: string) {
  return prisma.song.findUnique({
    where: { id: songId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
          orgId: true
        }
      }
    }
  });
}

/**
 * Delete song with org ownership validation
 */
export async function deleteSong(songId: string, orgId?: string): Promise<void> {
  // SECURITY: Verify organization ownership if orgId provided
  if (orgId) {
    const existing = await prisma.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          select: {
            orgId: true
          }
        }
      }
    });

    if (!existing) {
      throw new Error(`Song with id "${songId}" not found`);
    }

    if (existing.project.orgId !== orgId) {
      throw new Error('Unauthorized: Song does not belong to this organization');
    }
  }

  await prisma.song.delete({
    where: { id: songId }
  });
}

