'use server';

import { requireOrgSession } from '@cronkwaters/auth';
import { createSongSchema, updateSongSchema , createSong, updateSong, deleteSong, listSongs , getProjectBySlug } from '@cronkwaters/db';
import { revalidatePath } from 'next/cache';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new song
 */
export async function createSongAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireOrgSession();
    const validated = createSongSchema.parse(input);

    if (!(session as any).activeMembership) {
      return {
        success: false,
        error: 'Active organization not found'
      };
    }

    // Handle both projectId and projectSlug
    let projectId = (validated as any).projectId;
    if (!projectId && (validated as any).projectSlug) {
      const project = await getProjectBySlug((validated as any).projectSlug, (session as any).activeMembership?.org?.id || '');
      if (!project) {
        return {
          success: false,
          error: 'Project not found'
        };
      }
      projectId = project.id;
    }

    if (!projectId) {
      return {
        success: false,
        error: 'Project ID or slug required'
      };
    }

    const song = await createSong({
      projectId: projectId,
      title: validated.title,
      key: validated.key,
      tempo: validated.tempo,
      description: validated.description
    });

    revalidatePath(`/app/projects/${(validated as any).projectSlug || ''}`);

    return {
      success: true,
      data: { id: song.id }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create song'
    };
  }
}

/**
 * Update song
 */
export async function updateSongAction(
  songId: string,
  input: unknown
): Promise<ActionResult<void>> {
  try {
    const session = await requireOrgSession();
    
    if (!(session as any).activeMembership) {
      return {
        success: false,
        error: 'Active organization not found'
      };
    }

    const validated = updateSongSchema.parse(input);

    // SECURITY: Pass orgId to verify ownership
    await updateSong(songId, validated, (session as any).activeMembership?.org?.id || '');

    revalidatePath('/app/projects');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update song'
    };
  }
}

/**
 * Delete song
 */
export async function deleteSongAction(songId: string): Promise<ActionResult<void>> {
  try {
    const session = await requireOrgSession();

    if (!(session as any).activeMembership) {
      return {
        success: false,
        error: 'Active organization not found'
      };
    }

    // SECURITY: Pass orgId to verify ownership
    await deleteSong(songId, (session as any).activeMembership?.org?.id || '');

    revalidatePath('/app/projects');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete song'
    };
  }
}

/**
 * List songs for a project
 */
export async function listSongsAction(projectSlug: string) {
  try {
    const session = await requireOrgSession();
    if (!(session as any).activeMembership) {
      return {
        success: false,
        error: 'Active organization not found',
        data: []
      };
    }

    const project = await getProjectBySlug(projectSlug, (session as any).activeMembership?.org?.id || '');
    if (!project) {
      return {
        success: false,
        error: 'Project not found',
        data: []
      };
    }

    const songs = await listSongs(project.id);

    return {
      success: true,
      data: songs
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list songs',
      data: []
    };
  }
}

