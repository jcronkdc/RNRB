import { notFound } from 'next/navigation'
import { currentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { Button } from '@cronkwaters/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cronkwaters/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cronkwaters/ui'
import { Badge } from '@cronkwaters/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@cronkwaters/ui'
import { CalendarIcon, Music, FileText, Users, MessageSquare, Settings, Play, Download, Edit } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { CommentsSection } from '@/components/app/comments/CommentsSection'
import { ExportButton } from '@/components/app/ExportButton'

interface SongPageProps {
  params: {
    slug: string
    songSlug: string
  }
}

export default async function SongPage({ params }: SongPageProps) {
  const user = await currentUser()
  
  if (!user) {
    notFound()
  }

  const song = await db.song.findFirst({
    where: {
      slug: params.songSlug,
      project: {
        slug: params.slug,
        organization: {
          members: {
            some: {
              userId: user.id
            }
          }
        }
      }
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
          organizationId: true
        }
      },
      splitSheet: {
        include: {
          recipients: true
        }
      },
      assets: {
        select: {
          id: true,
          name: true,
          fileType: true,
          fileSize: true,
          uploadedAt: true,
          uploadedBy: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    }
  })

  if (!song) {
    notFound()
  }

  // Get collaborators for this song
  const collaborators = song.splitSheet?.recipients || []

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${params.slug}`} className="hover:underline">{song.project.name}</Link>
          <span>/</span>
          <span>Songs</span>
          <span>/</span>
          <span>{song.title}</span>
        </nav>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Created {format(new Date(song.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <Badge variant={song.status === 'published' ? 'default' : 'secondary'}>
                {song.status}
              </Badge>
              {song.genre && (
                <Badge variant="outline">{song.genre}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${params.slug}/songs/${params.songSlug}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">
            Assets ({song.assets.length})
          </TabsTrigger>
          <TabsTrigger value="splits">Splits</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Song Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-sm">{song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo</p>
                  <p className="text-sm">{song.bpm ? `${song.bpm} BPM` : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Key</p>
                  <p className="text-sm">{song.key || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Genre</p>
                  <p className="text-sm">{song.genre || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ISRC</p>
                  <p className="text-sm font-mono">{song.isrc || 'Not assigned'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collaborators</CardTitle>
                <CardDescription>People who contributed to this song</CardDescription>
              </CardHeader>
              <CardContent>
                {collaborators.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No collaborators added yet</p>
                ) : (
                  <div className="space-y-3">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {collaborator.name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{collaborator.name}</p>
                            <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium">{collaborator.percentage}%</p>
                      </div>
                    ))}
                  </div>
                )}
                <Link href={`/projects/${params.slug}/songs/${params.songSlug}/splits`}>
                  <Button variant="outline" className="w-full mt-4">
                    Manage Splits
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {song.lyrics && (
            <Card>
              <CardHeader>
                <CardTitle>Lyrics</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap font-sans">{song.lyrics}</pre>
              </CardContent>
            </Card>
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
          {song.assets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No assets uploaded yet</p>
                <Button className="mt-4">Upload First Asset</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {song.assets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base">{asset.name}</CardTitle>
                          <CardDescription>
                            {asset.fileType} • {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={asset.uploadedBy.image || ''} />
                        <AvatarFallback>
                          {asset.uploadedBy.name?.[0] || asset.uploadedBy.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        Uploaded by {asset.uploadedBy.name || asset.uploadedBy.email} on {format(new Date(asset.uploadedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="splits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Split Sheet</CardTitle>
              <CardDescription>Ownership and royalty distribution for this song</CardDescription>
            </CardHeader>
            <CardContent>
              {!song.splitSheet || collaborators.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground mb-4">No split sheet created yet</p>
                  <Link href={`/projects/${params.slug}/songs/${params.songSlug}/splits`}>
                    <Button>Create Split Sheet</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="space-y-4 mb-6">
                    {collaborators.map((recipient) => (
                      <div key={recipient.id} className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {recipient.role} • {recipient.publisher || 'No publisher'}
                          </p>
                          {recipient.email && (
                            <p className="text-xs text-muted-foreground">{recipient.email}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold">{recipient.percentage}%</p>
                          {recipient.pro && (
                            <p className="text-xs text-muted-foreground">PRO: {recipient.pro}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="font-medium">Total</p>
                    <p className="text-2xl font-semibold">
                      {collaborators.reduce((sum, r) => sum + r.percentage, 0)}%
                    </p>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Link href={`/projects/${params.slug}/songs/${params.songSlug}/splits`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit Split Sheet
                      </Button>
                    </Link>
                    <ExportButton
                      type="splitSheet"
                      id={song.splitSheet.id}
                      title={`${song.title} Split Sheet`}
                      variant="outline"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <CommentsSection
            entityType="song"
            entityId={song.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
