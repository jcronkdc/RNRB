'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Play, 
  Pause,
  Calendar,
  MapPin,
  Music,
  Globe,
  Heart,
  Share2,
  ExternalLink,
  Disc
} from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { Card } from '@cronkwaters/ui';
import type { Org, Project, Tour, Show, Venue, Song } from '@prisma/client';

interface ArtistPageClientProps {
  org: Org & {
    projects: (Project & { _count: { songs: number } })[];
    tours: (Tour & { shows: (Show & { venue: Venue | null })[] })[];
  };
  latestSongs: (Song & { project: { name: string; coverImage: string | null } })[];
}

export function ArtistPageClient({ org, latestSongs }: ArtistPageClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<typeof latestSongs[0] | null>(null);

  const upcomingShows = org.tours.flatMap(tour => tour.shows);
  const socialLinks = org.website ? { website: org.website } : {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5" />
        
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-32 text-center">
          {/* Artist Avatar */}
          <div className="mx-auto mb-8 h-48 w-48 overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/50 p-1 shadow-2xl">
            <div className="h-full w-full rounded-full bg-background p-8">
              <Music className="h-full w-full text-primary" />
            </div>
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-6xl font-bold tracking-tighter text-transparent md:text-8xl">
            {org.name}
          </h1>
          
          {org.description && (
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              {org.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Play Latest
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Heart className="h-5 w-5" />
              Follow
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </div>

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Latest Tracks */}
        {latestSongs.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-bold tracking-tight">Latest Tracks</h2>
            <div className="rounded-xl bg-card p-2">
              {latestSongs.map((song, _index) => (
                <TrackRow
                  key={song.id}
                  song={song}
                  index={_index + 1}
                  isPlaying={currentTrack?.id === song.id && isPlaying}
                  onPlay={() => {
                    setCurrentTrack(song);
                    setIsPlaying(true);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Discography */}
        {org.projects.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-bold tracking-tight">Discography</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {org.projects.map((project) => (
                <Card key={project.id} className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl">
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Disc className="h-24 w-24 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {project._count.songs} tracks
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Shows */}
        {upcomingShows.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-bold tracking-tight">Upcoming Shows</h2>
            <div className="space-y-4">
              {upcomingShows.map((show) => (
                <Card key={show.id} className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{show.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(show.date), 'EEEE, MMMM d, yyyy')}
                        </span>
                        {show.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {show.venue.name}, {show.venue.city}
                            {show.venue.state && `, ${show.venue.state}`}
                          </span>
                        )}
                      </div>
                    </div>
                    {show.ticketUrl && (
                      <Button asChild>
                        <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">
                          Get Tickets
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            {org.tours.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link href="#tours">
                    View All Tour Dates
                  </Link>
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Fan Engagement */}
        <section className="mb-16">
          <Card className="overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Join the Community</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Get exclusive updates, early access to new music, and special offers
            </p>
            <div className="mx-auto max-w-md">
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border bg-background/50 px-4 py-2 backdrop-blur-sm"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function TrackRow({ 
  song, 
  index: _index, 
  isPlaying,
  onPlay 
}: { 
  song: Song & { project: { name: string; coverImage: string | null } };
  index: number;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50">
      <button
        onClick={onPlay}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{song.title}</h4>
        <p className="text-sm text-muted-foreground">
          {song.project.name}
        </p>
      </div>

      {song.tempo && (
        <span className="text-sm text-muted-foreground">
          {song.tempo} BPM
        </span>
      )}

      <Button variant="ghost" size="sm">
        <Heart className="h-4 w-4" />
      </Button>
    </div>
  );
}

