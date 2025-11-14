import { notFound } from 'next/navigation'
import { currentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, Music, FileText, Users, MessageSquare, Settings } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { CommentsSection } from '@/components/app/comments/CommentsSection'

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const user = await currentUser()
  
  if (!user) {
    notFound()
  }

  const project = await db.project.findFirst({
    where: {
      slug: params.slug,
      organization: {
        members: {
          some: {
            userId: user.id
          }
        }
      }
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      _count: {
        select: {
          songs: true,
          assets: true,
          splitSheets: true,
          licenses: true
        }
      }
    }
  })

  if (!project) {
    notFound()
  }

  // Get recent songs
  const recentSongs = await db.song.findMany({
    where: {
      projectId: project.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true
    }
  })

  // Get team members
  const teamMembers = await db.membership.findMany({
    where: {
      organizationId: project.organizationId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true
        }
      }
    },
    take: 8
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Created {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
          </div>
          <Link href={`/projects/${params.slug}/settings`}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="songs">
            Songs ({project._count.songs})
          </TabsTrigger>
          <TabsTrigger value="assets">
            Assets ({project._count.assets})
          </TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="comments">
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project._count.songs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project._count.assets}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Split Sheets</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project._count.splitSheets}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Licenses</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project._count.licenses}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Songs</CardTitle>
                <CardDescription>Latest songs added to this project</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSongs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No songs yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentSongs.map((song) => (
                      <div key={song.id} className="flex items-center justify-between">
                        <Link 
                          href={`/projects/${params.slug}/songs/${song.slug}`}
                          className="hover:underline"
                        >
                          <span className="font-medium">{song.title}</span>
                        </Link>
                        <Badge variant={song.status === 'published' ? 'default' : 'secondary'}>
                          {song.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Link href={`/projects/${params.slug}/songs/new`}>
                  <Button variant="outline" className="w-full mt-4">
                    Add Song
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>People collaborating on this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.image || ''} />
                        <AvatarFallback>
                          {member.user.name?.[0] || member.user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="songs" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Songs</h2>
            <Link href={`/projects/${params.slug}/songs/new`}>
              <Button>
                <Music className="h-4 w-4 mr-2" />
                New Song
              </Button>
            </Link>
          </div>
          {recentSongs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Music className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No songs in this project yet</p>
                <Link href={`/projects/${params.slug}/songs/new`}>
                  <Button className="mt-4">Create First Song</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentSongs.map((song) => (
                <Card key={song.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/projects/${params.slug}/songs/${song.slug}`}
                        className="hover:underline"
                      >
                        <CardTitle>{song.title}</CardTitle>
                      </Link>
                      <Badge variant={song.status === 'published' ? 'default' : 'secondary'}>
                        {song.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created {format(new Date(song.createdAt), 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Assets</h2>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Upload Asset
            </Button>
          </div>
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No assets uploaded yet</p>
              <Button className="mt-4">Upload First Asset</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Team Members</h2>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.user.image || ''} />
                      <AvatarFallback>
                        {member.user.name?.[0] || member.user.email[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {member.user.name || member.user.email}
                      </CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <CommentsSection
            entityType="project"
            entityId={project.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
