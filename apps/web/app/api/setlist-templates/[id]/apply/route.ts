import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * POST /api/setlist-templates/[id]/apply
 * Apply a template to generate a setlist
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Get template
    const template = await db.setlistTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check template access
    if (!template.isBuiltIn) {
      const membership = await db.membership.findUnique({
        where: {
          userId_orgId: {
            userId: user.id,
            orgId: template.orgId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Access denied to template' }, { status: 403 });
      }
    }

    // Get project and verify access
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        songs: {
          where: { archived: false },
          select: {
            id: true,
            title: true,
            writer: true,
            key: true,
            tempo: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify project access
    const projectMember = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id,
        },
      },
    });

    if (!projectMember) {
      return NextResponse.json({ error: 'Access denied to project' }, { status: 403 });
    }

    // Apply template logic
    let selectedSongs = project.songs;

    // Filter by template criteria
    if (template.filters) {
      const filters = template.filters as any;

      // Filter by tempo/energy
      if (template.energyLevel === 'high') {
        selectedSongs = selectedSongs.filter((song) => !song.tempo || song.tempo >= 120);
      } else if (template.energyLevel === 'mellow') {
        selectedSongs = selectedSongs.filter((song) => song.tempo && song.tempo < 100);
      }

      // Apply custom filters (genre, explicit content, etc.)
      if (filters.excludeExplicit) {
        // Would filter explicit content if tracked
      }
    }

    // If template has specific songs, use those
    if (template.songIds && template.songIds.length > 0) {
      selectedSongs = selectedSongs.filter((song) =>
        (template.songIds as string[]).includes(song.id)
      );
    }

    // Generate setlist to match target duration
    const targetDuration = template.targetDuration * 60; // Convert to seconds
    let totalDuration = 0;
    const setlistSongs = [];

    // Shuffle songs for variety
    const shuffled = [...selectedSongs].sort(() => Math.random() - 0.5);

    for (const song of shuffled) {
      const songDuration = 240; // Default 4 minutes (duration is tracked per SetlistItem, not Song)
      if (totalDuration + songDuration <= targetDuration) {
        setlistSongs.push(song);
        totalDuration += songDuration;
      }

      // Stop when we reach target duration
      if (totalDuration >= targetDuration * 0.9) {
        // Allow 10% variance
        break;
      }
    }

    return NextResponse.json({
      songs: setlistSongs,
      totalDuration,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
      },
    });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json({ error: 'Failed to apply template' }, { status: 500 });
  }
}

