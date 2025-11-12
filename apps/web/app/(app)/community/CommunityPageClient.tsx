'use client';

import { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Search,
  Music,
  Briefcase,
  Plus,
  TrendingUp,
  Heart,
  Filter
} from 'lucide-react';
import { Button } from '@songforge/ui';
import { Card } from '@songforge/ui';
import { Badge } from '@songforge/ui';
import { Input } from '@songforge/ui';
import { PageHeader } from '@/components/app/PageHeader';

export function CommunityPageClient() {
  const [selectedTab, setSelectedTab] = useState<'collaborations' | 'forum' | 'musicians'>('collaborations');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for now
  const collaborationRequests = [
    {
      id: '1',
      title: 'Looking for a guitarist for indie rock project',
      user: { name: 'Sarah Chen', image: null },
      projectType: 'Album',
      genre: ['Indie Rock', 'Alternative'],
      skillsNeeded: ['Electric Guitar', 'Acoustic Guitar'],
      location: 'Los Angeles, CA',
      isRemote: true,
      isPaid: true,
      responses: 5,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Need a mixing engineer for electronic EP',
      user: { name: 'Marcus Johnson', image: null },
      projectType: 'EP',
      genre: ['Electronic', 'House'],
      skillsNeeded: ['Mixing', 'Mastering'],
      location: 'Remote',
      isRemote: true,
      isPaid: true,
      responses: 3,
      createdAt: new Date('2024-01-14'),
    },
  ];

  const forumPosts = [
    {
      id: '1',
      title: 'Tips for recording vocals at home?',
      user: { name: 'Alex Rivera', image: null },
      category: 'technical',
      replies: 12,
      views: 234,
      lastReply: new Date('2024-01-15T10:30:00'),
      isPinned: true,
    },
    {
      id: '2',
      title: 'Share your latest track - Weekly Showcase Thread',
      user: { name: 'Community', image: null },
      category: 'showcase',
      replies: 45,
      views: 1023,
      lastReply: new Date('2024-01-15T09:15:00'),
      isPinned: true,
    },
  ];

  const musicians = [
    {
      id: '1',
      name: 'Emily Watson',
      instruments: ['Piano', 'Vocals'],
      genres: ['Jazz', 'Soul', 'R&B'],
      location: 'New York, NY',
      availableForCollaboration: true,
      availableForGigs: true,
      skills: [
        { name: 'Piano', level: 'professional' },
        { name: 'Vocals', level: 'advanced' },
        { name: 'Songwriting', level: 'advanced' },
      ],
    },
    {
      id: '2',
      name: 'David Park',
      instruments: ['Drums', 'Percussion'],
      genres: ['Rock', 'Funk', 'Jazz'],
      location: 'Austin, TX',
      availableForCollaboration: true,
      availableForGigs: false,
      skills: [
        { name: 'Drums', level: 'professional' },
        { name: 'Production', level: 'intermediate' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Community"
        description="Connect, collaborate, and create with musicians worldwide"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Post Request
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search collaborations, forum posts, or musicians..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8" aria-label="Community sections">
          {[
            { id: 'collaborations', label: 'Collaborations', icon: Briefcase },
            { id: 'forum', label: 'Forum', icon: MessageSquare },
            { id: 'musicians', label: 'Musicians', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-muted-foreground/20 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'collaborations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Badge variant="outline">5 Open</Badge>
              <Badge variant="outline">Remote OK</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {collaborationRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        by {request.user.name} • {request.projectType}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {request.genre.map((g) => (
                        <Badge key={g} variant="outline">
                          {g}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Music className="h-4 w-4" />
                        {request.skillsNeeded.join(', ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {request.responses} responses
                      </span>
                      {request.isPaid && (
                        <Badge variant="success">Paid</Badge>
                      )}
                      {request.isRemote && (
                        <Badge variant="info">Remote</Badge>
                      )}
                    </div>
                  </div>

                  <Button>View Details</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'forum' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'General', count: 234, icon: MessageSquare, color: 'text-blue-500' },
              { label: 'Collaboration', count: 89, icon: Users, color: 'text-green-500' },
              { label: 'Feedback', count: 156, icon: Heart, color: 'text-red-500' },
              { label: 'Showcase', count: 412, icon: TrendingUp, color: 'text-purple-500' },
            ].map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.label} className="cursor-pointer p-4 transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{category.label}</p>
                      <p className="text-2xl font-bold">{category.count}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            {forumPosts.map((post) => (
              <Card key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <Badge variant="warning">Pinned</Badge>
                      )}
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {post.user.name} • {post.replies} replies • {post.views} views
                    </p>
                  </div>
                  <Button variant="outline">View Thread</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'musicians' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {musicians.map((musician) => (
            <Card key={musician.id} className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/10" />
              <div className="p-6">
                <h3 className="text-lg font-semibold">{musician.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {musician.location}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {musician.instruments.map((instrument) => (
                    <Badge key={instrument} variant="outline">
                      {instrument}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  {musician.skills.slice(0, 2).map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between text-sm">
                      <span>{skill.name}</span>
                      <Badge variant={skill.level === 'professional' ? 'success' : 'info'}>
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-2">
                  <Button variant="outline" className="flex-1">
                    View Profile
                  </Button>
                  <Button className="flex-1">
                    Connect
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

