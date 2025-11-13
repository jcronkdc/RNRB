'use server';

import { prisma } from '@cronkwaters/db';
import { requireOrgSession } from '@cronkwaters/auth';

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'song_added' | 'asset_uploaded' | 'split_created' | 'license_created';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

export async function getOrganizationActivity(limit = 20) {
  const session = await requireOrgSession();
  
  if (!session.activeMembership) {
    return { success: false, error: 'No active membership', data: [] };
  }

  const orgId = session.activeMembership.orgId;

  try {
    // Fetch recent projects
    const projects = await prisma.project.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    // Fetch recent songs
    const songs = await prisma.song.findMany({
      where: {
        project: {
          orgId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        project: {
          select: { name: true }
        },
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    // Fetch recent assets
    const assets = await prisma.asset.findMany({
      where: {
        project: {
          orgId
        }
      },
      orderBy: { uploadedAt: 'desc' },
      take: limit,
      include: {
        project: {
          select: { name: true }
        },
        uploadedBy: {
          select: { name: true, email: true }
        }
      }
    });

    // Fetch recent splits
    const splits = await prisma.songSplit.findMany({
      where: {
        song: {
          project: {
            orgId
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        song: {
          select: { 
            title: true,
            project: {
              select: { name: true }
            }
          }
        },
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Fetch recent licenses
    const licenses = await prisma.license.findMany({
      where: {
        song: {
          project: {
            orgId
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        song: {
          select: { 
            title: true,
            project: {
              select: { name: true }
            }
          }
        },
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    // Combine all activities
    const activities: ActivityItem[] = [];

    // Add projects
    projects.forEach(project => {
      activities.push({
        id: `project_${project.id}`,
        type: 'project_created',
        title: `New project created`,
        description: `"${project.name}" was created`,
        timestamp: project.createdAt,
        user: project.createdBy?.name || project.createdBy?.email || 'Unknown'
      });
    });

    // Add songs
    songs.forEach(song => {
      activities.push({
        id: `song_${song.id}`,
        type: 'song_added',
        title: `New song added`,
        description: `"${song.title}" was added to ${song.project.name}`,
        timestamp: song.createdAt,
        user: song.createdBy?.name || song.createdBy?.email || 'Unknown'
      });
    });

    // Add assets
    assets.forEach(asset => {
      activities.push({
        id: `asset_${asset.id}`,
        type: 'asset_uploaded',
        title: `Asset uploaded`,
        description: `"${asset.name}" was uploaded to ${asset.project?.name || 'a project'}`,
        timestamp: asset.uploadedAt,
        user: asset.uploadedBy?.name || asset.uploadedBy?.email || 'Unknown'
      });
    });

    // Add splits
    splits.forEach(split => {
      activities.push({
        id: `split_${split.id}`,
        type: 'split_created',
        title: `Split created`,
        description: `${split.percentage}% split for "${split.song.title}" in ${split.song.project.name}`,
        timestamp: split.createdAt,
        user: split.user?.name || split.user?.email || 'Unknown'
      });
    });

    // Add licenses
    licenses.forEach(license => {
      activities.push({
        id: `license_${license.id}`,
        type: 'license_created',
        title: `License created`,
        description: `${license.type} license for "${license.song.title}" in ${license.song.project.name}`,
        timestamp: license.createdAt,
        user: license.createdBy?.name || license.createdBy?.email || 'Unknown'
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Return only the requested limit
    return {
      success: true,
      data: activities.slice(0, limit)
    };
  } catch (error) {
    console.error('Error fetching organization activity:', error);
    return {
      success: false,
      error: 'Failed to fetch activity',
      data: []
    };
  }
}

export async function getProjectActivity(projectId: string, limit = 10) {
  const session = await requireOrgSession();

  try {
    // Verify user has access to the project
    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        orgId: session.activeMembership?.orgId
      }
    });

    if (!project) {
      return { success: false, error: 'Project not found', data: [] };
    }

    // Fetch recent songs for this project
    const songs = await prisma.song.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    // Fetch recent assets for this project
    const assets = await prisma.asset.findMany({
      where: { projectId },
      orderBy: { uploadedAt: 'desc' },
      take: limit,
      include: {
        uploadedBy: {
          select: { name: true, email: true }
        }
      }
    });

    const activities: ActivityItem[] = [];

    // Add project creation as first activity
    activities.push({
      id: `project_${project.id}`,
      type: 'project_created',
      title: `Project created`,
      description: `"${project.name}" was created`,
      timestamp: project.createdAt,
      user: 'Unknown' // We don't have createdBy on project currently
    });

    // Add songs
    songs.forEach(song => {
      activities.push({
        id: `song_${song.id}`,
        type: 'song_added',
        title: `Song added`,
        description: `"${song.title}" was added`,
        timestamp: song.createdAt,
        user: song.createdBy?.name || song.createdBy?.email || 'Unknown'
      });
    });

    // Add assets
    assets.forEach(asset => {
      activities.push({
        id: `asset_${asset.id}`,
        type: 'asset_uploaded',
        title: `Asset uploaded`,
        description: `"${asset.name}" was uploaded`,
        timestamp: asset.uploadedAt,
        user: asset.uploadedBy?.name || asset.uploadedBy?.email || 'Unknown'
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      success: true,
      data: activities.slice(0, limit)
    };
  } catch (error) {
    console.error('Error fetching project activity:', error);
    return {
      success: false,
      error: 'Failed to fetch activity',
      data: []
    };
  }
}
