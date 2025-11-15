import { currentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { OnboardingChecklist } from './OnboardingChecklist'

export async function OnboardingChecklistWrapper() {
  const user = await currentUser()
  if (!user) return null

  // Check user's onboarding progress
  const [membership, profile, projects, firstSong] = await Promise.all([
    db.membership.findFirst({
      where: { userId: user.id }
    }),
    db.musicianProfile.findUnique({
      where: { userId: user.id }
    }),
    db.project.findFirst({
      where: {
        organization: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    }),
    db.song.findFirst({
      where: {
        project: {
          organization: {
            members: {
              some: { userId: user.id }
            }
          }
        }
      }
    })
  ])

  const hasOrganization = !!membership
  const hasProfile = !!profile && !!profile.bio
  const hasProject = !!projects
  const hasFirstSong = !!firstSong

  // Don't show if all basic steps are complete
  if (hasOrganization && hasProfile && hasProject && hasFirstSong) {
    return null
  }

  const items = [
    {
      id: 'organization',
      title: 'Create or Join Organization',
      description: 'Set up your collaborative workspace',
      href: '/onboarding/organization',
      completed: hasOrganization
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add bio, skills, and preferences',
      href: '/settings/artist-profile',
      completed: hasProfile
    },
    {
      id: 'project',
      title: 'Create Your First Project',
      description: 'Start organizing your music',
      href: '/projects/new',
      completed: hasProject
    },
    {
      id: 'song',
      title: 'Add Your First Song',
      description: 'Upload or create a new track',
      href: hasProject ? `/projects/${projects?.slug}/songs/new` : '/projects',
      completed: hasFirstSong
    }
  ]

  return <OnboardingChecklist items={items} />
}

