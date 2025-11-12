'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Edit,
  Ticket,
  Music,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '@songforge/ui';
import { Badge } from '@songforge/ui';
import { Card } from '@songforge/ui';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyState } from '@/components/app/EmptyState';
import type { Tour, Show, Venue } from '@prisma/client';

interface TourDetailClientProps {
  tour: Tour & {
    shows: (Show & {
      venue: Venue | null;
      _count: { fanEngagements: number };
    })[];
    _count: {
      shows: number;
      fanEngagements: number;
    };
  };
}

export function TourDetailClient({ tour }: TourDetailClientProps) {
  const _router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'shows' | 'analytics' | 'fans'>('shows');

  const upcomingShows = tour.shows.filter(
    show => new Date(show.date) >= new Date() && show.status !== 'cancelled'
  );
  const pastShows = tour.shows.filter(
    show => new Date(show.date) < new Date() || show.status === 'completed'
  );

  const statusColors = {
    planning: 'warning',
    announced: 'info',
    ongoing: 'success',
    completed: 'subtle',
    cancelled: 'danger',
  } as const;

  const _showStatusColors = {
    scheduled: 'info',
    soldout: 'success',
    cancelled: 'danger',
    postponed: 'warning',
    completed: 'subtle',
  } as const;

  return (
    <div className="space-y-8">
      <PageHeader
        title={tour.name}
        description={tour.description || undefined}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
              Edit Tour
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Show
            </Button>
          </div>
        }
      />

      {/* Tour Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Shows</p>
              <p className="text-2xl font-bold">{tour._count.shows}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-3">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fan Signups</p>
              <p className="text-2xl font-bold">{tour._count.fanEngagements}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-3">
              <MapPin className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cities</p>
              <p className="text-2xl font-bold">
                {new Set(tour.shows.map(s => s.venue?.city).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Badge variant={statusColors[tour.status]} className="px-4 py-2 text-base">
              {tour.status}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8" aria-label="Tour sections">
          {[
            { id: 'shows', label: 'Shows', count: tour._count.shows },
            { id: 'analytics', label: 'Analytics' },
            { id: 'fans', label: 'Fans', count: tour._count.fanEngagements },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/20 hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'shows' && (
        <div className="space-y-8">
          {/* Upcoming Shows */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Upcoming Shows ({upcomingShows.length})
            </h3>
            {upcomingShows.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming shows"
                description="Add shows to your tour to get started"
                action={
                  <Button>
                    <Plus className="h-4 w-4" />
                    Add Show
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {upcomingShows.map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>
            )}
          </div>

          {/* Past Shows */}
          {pastShows.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Past Shows ({pastShows.length})
              </h3>
              <div className="space-y-4">
                {pastShows.map((show) => (
                  <ShowCard key={show.id} show={show} isPast />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'analytics' && (
        <Card className="p-12">
          <div className="mx-auto max-w-sm text-center">
            <DollarSign className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Tour Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track ticket sales, revenue, and attendance across your tour
            </p>
          </div>
        </Card>
      )}

      {selectedTab === 'fans' && (
        <Card className="p-12">
          <div className="mx-auto max-w-sm text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Fan Engagement</h3>
            <p className="text-sm text-muted-foreground">
              {tour._count.fanEngagements} fans have signed up for updates
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function ShowCard({ 
  show, 
  isPast = false 
}: { 
  show: Show & { 
    venue: Venue | null; 
    _count: { fanEngagements: number };
  }; 
  isPast?: boolean;
}) {
  const _showStatusColors = {
    scheduled: 'info',
    soldout: 'success',
    cancelled: 'danger',
    postponed: 'warning',
    completed: 'subtle',
  } as const;

  return (
    <Card className={`p-6 ${isPast ? 'opacity-75' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold">{show.name}</h4>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(show.date), 'EEEE, MMMM d, yyyy')}
                </span>
                {show.doorsTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Doors: {format(new Date(show.doorsTime), 'h:mm a')}
                  </span>
                )}
              </div>
            </div>
            <Badge variant={_showStatusColors[show.status]}>
              {show.status}
            </Badge>
          </div>

          {show.venue && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{show.venue.name}</span>
              {show.venue.city && show.venue.state && (
                <span>• {show.venue.city}, {show.venue.state}</span>
              )}
              {show.venue.capacity && (
                <span>• Capacity: {show.venue.capacity.toLocaleString()}</span>
              )}
            </div>
          )}

          {show._count.fanEngagements > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{show._count.fanEngagements} fans interested</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {show.ticketUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">
                <Ticket className="h-4 w-4" />
                Tickets
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Music className="h-4 w-4" />
            Setlist
          </Button>
        </div>
      </div>
    </Card>
  );
}

