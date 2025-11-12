'use server';

import { requireOrgSession } from '@cronkwater/auth';
import { listProjects, listSongs, listAssets } from '@cronkwater/db';

export interface SearchResult {
  id: string;
  type: 'project' | 'song' | 'asset';
  title: string;
  subtitle?: string;
  href: string;
}

export async function searchAction(query: string, type?: 'all' | 'project' | 'song' | 'asset') {
  try {
    const session = await requireOrgSession();
    const results: SearchResult[] = [];

    if (!query.trim()) {
      return { success: true, data: [] };
    }

    const searchLower = query.toLowerCase();

    if (!session.activeMembership) {
      return {
        success: false,
        error: 'Active organization not found',
        data: []
      };
    }

    // Search projects
    if (!type || type === 'all' || type === 'project') {
      const projects = await listProjects(session.activeMembership.org.id, { status: 'active' });
      const matchingProjects = projects.projects.filter(
        (p: { name: string; description?: string | null }) => p.name.toLowerCase().includes(searchLower) || p.description?.toLowerCase().includes(searchLower)
      );
      results.push(
        ...matchingProjects.map((p: { id: string; name: string; description?: string | null; slug: string }) => ({
          id: p.id,
          type: 'project' as const,
          title: p.name,
          subtitle: p.description || undefined,
          href: `/app/projects/${p.slug}`
        }))
      );
    }

    // Search songs (across all projects)
    if (!type || type === 'all' || type === 'song') {
      const projects = await listProjects(session.activeMembership.org.id, { status: 'active' });
      for (const project of projects.projects.slice(0, 10)) {
        // Limit to avoid too many queries
        try {
          const songs = await listSongs(project.id);
          const matchingSongs = songs.filter(
            (s: { title: string; key?: string | null }) => s.title.toLowerCase().includes(searchLower) || s.key?.toLowerCase().includes(searchLower)
          );
          results.push(
            ...matchingSongs.map((s: { id: string; title: string }) => ({
              id: s.id,
              type: 'song' as const,
              title: s.title,
              subtitle: `In ${project.name}`,
              href: `/app/projects/${project.slug}?tab=songs`
            }))
          );
        } catch {
          // Skip if project doesn't exist or error
        }
      }
    }

    // Search assets
    if (!type || type === 'all' || type === 'asset') {
      const projects = await listProjects(session.activeMembership.org.id, { status: 'active' });
      for (const project of projects.projects.slice(0, 10)) {
        try {
          const assets = await listAssets(project.id);
          const matchingAssets = assets.filter((a: { name: string }) => a.name.toLowerCase().includes(searchLower));
          results.push(
            ...matchingAssets.map((a: { id: string; name: string }) => ({
              id: a.id,
              type: 'asset' as const,
              title: a.name,
              subtitle: `In ${project.name}`,
              href: `/app/projects/${project.slug}?tab=assets`
            }))
          );
        } catch {
          // Skip if error
        }
      }
    }

    return {
      success: true,
      data: results.slice(0, 50) // Limit results
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      data: []
    };
  }
}

