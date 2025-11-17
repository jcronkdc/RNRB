import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { Button } from '@cronkwaters/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cronkwaters/ui'
import { Progress } from '@cronkwaters/ui'
import { CheckCircle, Circle, Building2, User, Music, FileText, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface WelcomeStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  completed: boolean
}

async function getOnboardingProgress(userId: string) {
  const [membership, profile, projects] = await Promise.all([
    db.membership.findFirst({
      where: { userId }
    }),
    db.musicianProfile.findUnique({
      where: { userId }
    }),
    db.project.findFirst({
      where: {
        organization: {
          members: {
            some: { userId }
          }
        }
      }
    })
  ])

  const hasOrganization = !!membership
  const hasProfile = !!profile && !!profile.bio
  const hasProject = !!projects

  return {
    hasOrganization,
    hasProfile,
    hasProject,
    completedSteps: [hasOrganization, hasProfile, hasProject].filter(Boolean).length
  }
}

export default async function WelcomePage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/auth')
  }

  const progress = await getOnboardingProgress(user.id)
  const progressPercentage = (progress.completedSteps / 3) * 100

  // If user has completed all steps, redirect to projects
  if (progress.completedSteps === 3) {
    redirect('/projects')
  }

  const steps: WelcomeStep[] = [
    {
      id: 'organization',
      title: 'Join or Create Organization',
      description: 'Set up your workspace for collaboration',
      icon: <Building2 className="h-5 w-5" />,
      href: '/onboarding/organization',
      completed: progress.hasOrganization
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself and your music',
      icon: <User className="h-5 w-5" />,
      href: '/settings/artist-profile',
      completed: progress.hasProfile
    },
    {
      id: 'project',
      title: 'Create First Project',
      description: 'Start organizing your music and collaborations',
      icon: <Music className="h-5 w-5" />,
      href: '/projects/new',
      completed: progress.hasProject
    }
  ]

  const nextStep = steps.find(step => !step.completed)

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to CronkWaters, {user.name || 'Creator'}! 
          <Sparkles className="inline-block ml-2 h-8 w-8 text-yellow-500" />
        </h1>
        <p className="text-xl text-muted-foreground">
          Let's get you set up in just a few steps
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Setup Progress</span>
          <span className="text-sm text-muted-foreground">{progress.completedSteps} of 3 completed</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="grid gap-4 mb-8">
        {steps.map((step, index) => (
          <Card key={step.id} className={step.completed ? 'opacity-75' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${step.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
                    {step.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {step.title}
                      {step.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                {!step.completed && (
                  <Link href={step.href}>
                    <Button>Start</Button>
                  </Link>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {nextStep && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-xl">Ready for the next step?</CardTitle>
            <CardDescription>
              Continue your setup journey with: {nextStep.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={nextStep.href}>
              <Button size="lg" className="w-full">
                Continue to {nextStep.title}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Read the Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Learn about all features and best practices
            </p>
            <Link href="/guide">
              <Button variant="outline" size="sm" className="w-full">
                View Guide
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Join Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other artists and creators
            </p>
            <Link href="/community">
              <Button variant="outline" size="sm" className="w-full">
                Explore Community
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Sparkles className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Discover Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Explore all the tools at your disposal
            </p>
            <Link href="/discover">
              <Button variant="outline" size="sm" className="w-full">
                Discover More
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Need help? Check out our{' '}
          <Link href="/guide" className="underline hover:no-underline">
            comprehensive guide
          </Link>{' '}
          or{' '}
          <Link href="/community" className="underline hover:no-underline">
            ask the community
          </Link>
        </p>
      </div>
    </div>
  )
}
