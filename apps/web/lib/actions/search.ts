'use server';

import { listProjects, listSongs, listAssets } from '@songforge/db';
import { requireOrgSession } from '@songforge/auth';

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

    // Search projects
    if (!type || type === 'all' || type === 'project') {
      const projects = await listProjects(session.orgId, { status: 'active' });
      const matchingProjects = projects.projects.filter(
        (p) => p.name.toLowerCase().includes(searchLower) || p.description?.toLowerCase().includes(searchLower)
      );
      results.push(
        ...matchingProjects.map((p) => ({
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
      const projects = await listProjects(session.orgId, { status: 'active' });
      for (const project of projects.projects.slice(0, 10)) {
        // Limit to avoid too many queries
        try {
          const songs = await listSongs(project.id);
          const matchingSongs = songs.filter(
            (s) => s.title.toLowerCase().includes(searchLower) || s.key?.toLowerCase().includes(searchLower)
          );
          results.push(
            ...matchingSongs.map((s) => ({
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
      const projects = await listProjects(session.orgId, { status: 'active' });
      for (const project of projects.projects.slice(0, 10)) {
        try {
          const assets = await listAssets(project.id);
          const matchingAssets = assets.filter((a) => a.name.toLowerCase().includes(searchLower));
          results.push(
            ...matchingAssets.map((a) => ({
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

