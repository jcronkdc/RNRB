import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { Button } from '@cronkwaters/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cronkwaters/ui'
import { Input } from '@cronkwaters/ui'
import { Label } from '@cronkwaters/ui'
import { Textarea } from '@cronkwaters/ui'
import { ArrowLeft, Music } from 'lucide-react'
import Link from 'next/link'
import { createProject } from '@/lib/actions/projects'

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Get user's active organization
  const membership = await db.membership.findFirst({
    where: {
      userId: user.id,
      organizationId: user.activeOrganizationId || undefined
    },
    include: {
      organization: true
    }
  })

  if (!membership) {
    redirect('/onboarding/organization')
  }

  async function handleCreateProject(formData: FormData) {
    'use server'
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    
    if (!name) {
      throw new Error('Project name is required')
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    // Check if slug already exists
    const existingProject = await db.project.findFirst({
      where: {
        slug,
        organizationId: membership.organizationId
      }
    })

    const finalSlug = existingProject 
      ? `${slug}-${Date.now().toString(36).slice(-4)}`
      : slug

    const project = await db.project.create({
      data: {
        name,
        slug: finalSlug,
        description,
        organizationId: membership.organizationId,
        status: 'active'
      }
    })

    redirect(`/projects/${project.slug}`)
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Create New Project</CardTitle>
              <CardDescription>
                Start organizing your music, collaborations, and releases
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={handleCreateProject} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="My Awesome Album"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Give your project a memorable name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your project, its theme, goals, or any other details..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add details about your project
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium text-sm mb-2">What's in a project?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Organize multiple songs and versions</li>
                <li>• Manage split sheets and royalties</li>
                <li>• Store assets, stems, and documentation</li>
                <li>• Collaborate with team members</li>
                <li>• Track licenses and contracts</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Create Project
              </Button>
              <Link href="/projects" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Projects help you organize your creative work. You can always edit or archive projects later.
        </p>
      </div>
    </div>
  )
}
