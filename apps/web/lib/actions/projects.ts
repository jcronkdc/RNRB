'use server'

import { db } from '@/lib/db'
import { currentUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  organizationId: z.string()
})

export async function createProject(data: {
  name: string
  description?: string
  organizationId: string
}) {
  const user = await currentUser()
  if (!user?.id) {
    throw new Error('You must be logged in to create a project')
  }

  // Verify user has access to the organization
  const membership = await db.membership.findFirst({
    where: {
      userId: user.id,
      organizationId: data.organizationId
    }
  })

  if (!membership) {
    throw new Error('You do not have access to this organization')
  }

  // Validate input
  const validated = createProjectSchema.parse(data)

  // Generate slug
  const baseSlug = validated.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Check if slug already exists
  const existingProject = await db.project.findFirst({
    where: {
      slug: baseSlug,
      organizationId: validated.organizationId
    }
  })

  const slug = existingProject 
    ? `${baseSlug}-${Date.now().toString(36).slice(-4)}`
    : baseSlug

  // Create project
  const project = await db.project.create({
    data: {
      name: validated.name,
      slug,
      description: validated.description,
      organizationId: validated.organizationId,
      status: 'active'
    }
  })

  // Revalidate projects page
  revalidatePath('/projects')
  
  return project
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string
    description?: string
    status?: 'active' | 'archived' | 'completed'
  }
) {
  const user = await currentUser()
  if (!user?.id) {
    throw new Error('You must be logged in to update a project')
  }

  // Verify user has access to the project
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      organization: {
        members: {
          some: {
            userId: user.id
          }
        }
      }
    }
  })

  if (!project) {
    throw new Error('Project not found or you do not have access')
  }

  // Update project
  const updatedProject = await db.project.update({
    where: { id: projectId },
    data: {
      ...data,
      updatedAt: new Date()
    }
  })

  // Revalidate pages
  revalidatePath('/projects')
  revalidatePath(`/projects/${project.slug}`)
  
  return updatedProject
}

export async function deleteProject(projectId: string) {
  const user = await currentUser()
  if (!user?.id) {
    throw new Error('You must be logged in to delete a project')
  }

  // Verify user has admin access to the project
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      organization: {
        members: {
          some: {
            userId: user.id,
            role: { in: ['owner', 'admin'] }
          }
        }
      }
    }
  })

  if (!project) {
    throw new Error('Project not found or you do not have permission to delete it')
  }

  // Delete project and all related data
  await db.project.delete({
    where: { id: projectId }
  })

  // Revalidate projects page
  revalidatePath('/projects')
  
  return { success: true }
}

export async function getProjectStats(organizationId: string) {
  const [
    totalProjects,
    activeProjects,
    totalSongs,
    totalAssets
  ] = await Promise.all([
    db.project.count({
      where: { organizationId }
    }),
    db.project.count({
      where: { 
        organizationId,
        status: 'active'
      }
    }),
    db.song.count({
      where: {
        project: {
          organizationId
        }
      }
    }),
    db.asset.count({
      where: {
        project: {
          organizationId
        }
      }
    })
  ])

  return {
    totalProjects,
    activeProjects,
    totalSongs,
    totalAssets
  }
}