'use server';

import { revalidatePath } from 'next/cache';
import { createSongSchema, updateSongSchema } from '@songforge/db/validation/songs';
import { createSong, updateSong, deleteSong, listSongs } from '@songforge/db';
import { requireOrgSession } from '@songforge/auth';
import { getProjectBySlug } from '@songforge/db';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new song
 */
export async function createSongAction(
  projectSlug: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireOrgSession();
    const validated = createSongSchema.parse(input);

    // Verify project exists and belongs to org
    const project = await getProjectBySlug(projectSlug, session.orgId);
    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    const song = await createSong({
      projectId: project.id,
      ...validated
    });

    revalidatePath(`/app/projects/${projectSlug}`);

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
    await requireOrgSession();
    const validated = updateSongSchema.parse(input);

    await updateSong(songId, validated);

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
    await requireOrgSession();

    await deleteSong(songId);

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

    const project = await getProjectBySlug(projectSlug, session.orgId);
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

