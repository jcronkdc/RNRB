import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  visibility: 'private' | 'org' | 'public';
  created_at: string;
  updated_at: string;
  song_count: number;
  collaborator_count: number;
  session_count: number;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch');
  }
  return res.json();
};

/**
 * Hook for accessing user's projects across the app
 * Provides shared project data and operations for cross-feature integration
 */
export function useProjects() {
  const { data, error, isLoading, mutate: mutateProjects } = useSWR<Project[]>(
    '/api/projects',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 second deduping
    }
  );

  const refresh = useCallback(() => {
    return mutateProjects();
  }, [mutateProjects]);

  return {
    projects: data || [],
    isLoading,
    error: error?.message,
    refresh,
  };
}

/**
 * Hook for accessing a single project
 */
export function useProject(slugOrId: string | null) {
  const { data, error, isLoading, mutate: mutateProject } = useSWR<Project>(
    slugOrId ? `/api/projects/${slugOrId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    project: data,
    isLoading,
    error: error?.message,
    refresh: mutateProject,
  };
}

/**
 * Hook for adding songs to projects
 * Used by Songwriting and Create features
 */
export function useProjectSongActions() {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSongToProject = useCallback(
    async (projectSlug: string, songId: string) => {
      setIsAdding(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectSlug}/songs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add song to project');
        }

        const result = await response.json();

        // Invalidate project cache to reflect new song
        await mutate((key) => typeof key === 'string' && key.includes('/api/projects'));

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add song';
        setError(errorMessage);
        throw err;
      } finally {
        setIsAdding(false);
      }
    },
    []
  );

  const removeSongFromProject = useCallback(
    async (projectSlug: string, songId: string) => {
      setIsAdding(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectSlug}/songs/${songId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to remove song');
        }

        // Invalidate project cache
        await mutate((key) => typeof key === 'string' && key.includes('/api/projects'));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove song';
        setError(errorMessage);
        throw err;
      } finally {
        setIsAdding(false);
      }
    },
    []
  );

  return {
    addSongToProject,
    removeSongFromProject,
    isAdding,
    error,
  };
}

