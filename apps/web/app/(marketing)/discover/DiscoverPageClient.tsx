'use client';

import { useState } from 'react';
import { 
  Search,
  Music,
  Users,
  MapPin,
  TrendingUp,
  Play,
  Heart,
  Share2,
  Calendar,
  Sparkles,
  ChevronRight,
  Radio
} from 'lucide-react';
import { Button } from '@songforge/ui';
import { Card } from '@songforge/ui';
import { Badge } from '@songforge/ui';
import { Input } from '@songforge/ui';
import Link from 'next/link';
import { WaveformAnimation } from '@/components/animations/WaveformAnimation';

export function DiscoverPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [_selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Mock data for artists
  const featuredArtists = [
    {
      id: '1',
      name: 'The Midnight Echoes',
      genre: ['Indie Rock', 'Alternative'],
      location: 'Los Angeles, CA',
      bio: 'Blending dreamy soundscapes with powerful lyrics',
      followers: 12453,
      monthlyListeners: 34567,
      verified: true,
      image: null,
      latestRelease: 'Neon Dreams',
      upcomingShow: { date: new Date('2024-02-15'), venue: 'The Roxy Theatre' },
    },
    {
      id: '2',
      name: 'Sarah Chen',
      genre: ['Jazz', 'Soul'],
      location: 'New York, NY',
      bio: 'Grammy-nominated vocalist bringing modern soul to classic jazz',
      followers: 8932,
      monthlyListeners: 21345,
      verified: true,
      image: null,
      latestRelease: 'Blue Hour',
      upcomingShow: { date: new Date('2024-02-20'), venue: 'Blue Note' },
    },
    {
      id: '3',
      name: 'Electric Pulse',
      genre: ['Electronic', 'House'],
      location: 'Miami, FL',
      bio: 'High-energy electronic music for the dance floor',
      followers: 15678,
      monthlyListeners: 45678,
      verified: false,
      image: null,
      latestRelease: 'Frequency',
      upcomingShow: null,
    },
  ];

  const genres = [
    'Rock', 'Pop', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 
    'Country', 'R&B', 'Folk', 'Metal', 'Indie', 'Latin'
  ];

  const locations = [
    'Los Angeles', 'New York', 'Nashville', 'Austin', 
    'Seattle', 'Chicago', 'Miami', 'Atlanta'
  ];

  const trendingTracks = [
    { title: 'Midnight Drive', artist: 'The Midnight Echoes', plays: 45678 },
    { title: 'Blue Hour', artist: 'Sarah Chen', plays: 34567 },
    { title: 'Frequency', artist: 'Electric Pulse', plays: 56789 },
    { title: 'Summer Nights', artist: 'Coastal Dreams', plays: 23456 },
  ];

  const upcomingShows = [
    {
      artist: 'The Midnight Echoes',
      date: new Date('2024-02-15'),
      venue: 'The Roxy Theatre',
      city: 'Los Angeles, CA',
    },
    {
      artist: 'Sarah Chen',
      date: new Date('2024-02-20'),
      venue: 'Blue Note',
      city: 'New York, NY',
    },
    {
      artist: 'Desert Winds',
      date: new Date('2024-02-25'),
      venue: 'Red Rocks',
      city: 'Denver, CO',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pb-20 pt-32">
        <WaveformAnimation />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              Discover Amazing Artists
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              Explore a world of independent musicians, find your next favorite artist, 
              and support the music you love
            </p>
            
            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search artists, genres, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 pr-4 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="mb-12 grid gap-6 md:grid-cols-4">
          {[
            { label: 'Active Artists', value: '2,847', icon: Users, color: 'text-blue-500' },
            { label: 'Songs Available', value: '14,523', icon: Music, color: 'text-green-500' },
            { label: 'Upcoming Shows', value: '342', icon: Calendar, color: 'text-purple-500' },
            { label: 'Cities Represented', value: '156', icon: MapPin, color: 'text-orange-500' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Genre Filter */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Artists */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Artists</h2>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredArtists.map((artist) => (
              <Card key={artist.id} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-purple-500/20" />
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-xl font-semibold">
                        {artist.name}
                        {artist.verified && (
                          <Badge variant="success" className="h-5">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{artist.location}</p>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">{artist.bio}</p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {artist.genre.map((g) => (
                      <Badge key={g} variant="outline" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Followers</p>
                      <p className="font-semibold">{artist.followers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Listeners</p>
                      <p className="font-semibold">{artist.monthlyListeners.toLocaleString()}</p>
                    </div>
                  </div>

                  {artist.upcomingShow && (
                    <div className="mb-4 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Next Show</p>
                      <p className="text-sm font-medium">
                        {artist.upcomingShow.date.toLocaleDateString()} • {artist.upcomingShow.venue}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/artist/${artist.id}`} className="flex-1">
                      <Button className="w-full">View Profile</Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Trending Tracks */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Trending Tracks</h2>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <Card className="divide-y">
              {trendingTracks.map((track, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{track.title}</p>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {track.plays.toLocaleString()} plays
                    </span>
                    <Button variant="ghost" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Upcoming Shows */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Upcoming Shows</h2>
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {upcomingShows.map((show, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{show.artist}</p>
                      <p className="text-sm text-muted-foreground">
                        {show.venue} • {show.city}
                      </p>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {show.date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <Button size="sm">Get Tickets</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Location Explorer */}
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Explore by Location</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {locations.map((location) => (
              <Card
                key={location}
                className="cursor-pointer p-4 transition-all hover:shadow-lg"
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-medium">{location}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-purple-500/10 p-8 text-center">
          <Radio className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-4 text-3xl font-bold">Join the SongForge Community</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Are you a musician? Share your music with thousands of fans and connect 
            with fellow artists from around the world.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth">
              <Button size="lg">
                <Music className="mr-2 h-5 w-5" />
                Sign Up as Artist
              </Button>
            </Link>
            <Link href="/foundation">
              <Button size="lg" variant="outline">
                <Heart className="mr-2 h-5 w-5" />
                Support Musicians
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
