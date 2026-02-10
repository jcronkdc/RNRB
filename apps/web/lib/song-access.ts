/**
 * Song Access Control
 *
 * Centralized authorization for song operations.
 * A user can access a song if they are:
 *   1. The song owner
 *   2. An accepted collaborator (SongCollaborator with acceptedAt)
 *   3. A member of the song's project (if it belongs to one)
 *   4. The song is public (read-only)
 */

import { db } from '@/lib/db';

export type SongAccessLevel = 'owner' | 'collaborator' | 'project-member' | 'public' | 'none';

export async function getSongAccessLevel(
  songId: string,
  userId: string
): Promise<{ level: SongAccessLevel; song: Awaited<ReturnType<typeof fetchSongWithAccess>> }> {
  const song = await fetchSongWithAccess(songId, userId);

  if (!song) {
    return { level: 'none', song: null };
  }

  // Owner
  if (song.userId === userId) {
    return { level: 'owner', song };
  }

  // Accepted collaborator
  const isCollaborator = song.collaborators.some(
    (c) => (c.userId === userId || c.email === null) && c.acceptedAt !== null
  );
  if (isCollaborator) {
    return { level: 'collaborator', song };
  }

  // Project member
  if (song.project) {
    const isProjectMember = song.project.members.some((m) => m.userId === userId);
    if (isProjectMember) {
      return { level: 'project-member', song };
    }
  }

  // Public song (read-only)
  if (song.visibility === 'public') {
    return { level: 'public', song };
  }

  return { level: 'none', song };
}

/**
 * Check if a user can read a song
 */
export async function canReadSong(songId: string, userId: string): Promise<boolean> {
  const { level } = await getSongAccessLevel(songId, userId);
  return level !== 'none';
}

/**
 * Check if a user can edit a song (owner, collaborator, or project member)
 */
export async function canEditSong(songId: string, userId: string): Promise<boolean> {
  const { level } = await getSongAccessLevel(songId, userId);
  return level === 'owner' || level === 'collaborator' || level === 'project-member';
}

/**
 * Check if a user is the owner of a song
 */
export async function isSongOwner(songId: string, userId: string): Promise<boolean> {
  const { level } = await getSongAccessLevel(songId, userId);
  return level === 'owner';
}

// Internal: fetch song with all access-related joins in a single query
async function fetchSongWithAccess(songId: string, userId: string) {
  return db.song.findUnique({
    where: { id: songId },
    include: {
      collaborators: {
        where: {
          OR: [{ userId }, { email: null }], // Match by userId; email match handled separately
        },
        select: {
          id: true,
          userId: true,
          email: true,
          role: true,
          acceptedAt: true,
        },
      },
      project: {
        include: {
          members: {
            where: { userId },
            select: { userId: true, role: true },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}
