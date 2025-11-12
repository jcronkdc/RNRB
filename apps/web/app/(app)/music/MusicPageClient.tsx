'use client';

import { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2,
  Heart,
  Share2,
  Music,
  Disc,
  Radio,
  Headphones
} from 'lucide-react';
import { Button } from '@songforge/ui';
import { Card } from '@songforge/ui';
import { Badge } from '@songforge/ui';
import { Slider } from '@songforge/ui';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyState } from '@/components/app/EmptyState';
import type { Song, Project, Asset } from '@prisma/client';

interface MusicPageClientProps {
  songs: (Song & { project: { name: string; slug: string; coverImage: string | null } })[];
  projects: (Project & { _count: { songs: number } })[];
  audioAssets: (Asset & { project: { name: string; slug: string } | null })[];
}

export function MusicPageClient({ songs, projects, audioAssets: _audioAssets }: MusicPageClientProps) {
  const [selectedTab, setSelectedTab] = useState<'releases' | 'tracks' | 'playlists'>('releases');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<typeof songs[0] | null>(null);
  const [volume, setVolume] = useState(70);

  const handlePlayTrack = (song: typeof songs[0]) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Music"
        description="Share your music with fans and collaborate with other artists"
        actions={
          <Button>
            <Music className="h-4 w-4" />
            Upload Track
          </Button>
        }
      />

      {/* Now Playing Bar */}
      {currentTrack && (
        <Card className="sticky top-4 z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
          <div className="flex items-center gap-6">
            {/* Album Art */}
            <div className="h-16 w-16 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg">
              {currentTrack.project.coverImage ? (
                <img
                  src={currentTrack.project.coverImage}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music className="h-8 w-8 text-primary/50" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{currentTrack.title}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {currentTrack.project.name}
              </p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePlayPause}
                className="h-10 w-10 rounded-full p-0"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={([value]) => setVolume(value)}
                max={100}
                className="w-24"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8" aria-label="Music sections">
          {[
            { id: 'releases', label: 'Releases', icon: Disc, count: projects.length },
            { id: 'tracks', label: 'Tracks', icon: Music, count: songs.length },
            { id: 'playlists', label: 'Playlists', icon: Headphones },
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
                {tab.count !== undefined && (
                  <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'releases' && (
        <div>
          {projects.length === 0 ? (
            <EmptyState
              icon={Disc}
              title="No Public Releases"
              description="Make your projects public to share them with fans"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <ReleaseCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'tracks' && (
        <div>
          {songs.length === 0 ? (
            <EmptyState
              icon={Music}
              title="No Public Tracks"
              description="Upload and share your music with the world"
            />
          ) : (
            <div className="space-y-1">
              {songs.map((song, index) => (
                <TrackRow 
                  key={song.id} 
                  song={song} 
                  index={index + 1}
                  isPlaying={currentTrack?.id === song.id && isPlaying}
                  onPlay={() => handlePlayTrack(song)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'playlists' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/10 p-8">
              <Radio className="h-full w-full text-primary/50" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">Artist Radio</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Auto-generated playlist based on your music style
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReleaseCard({ project }: { project: Project & { _count: { songs: number } } }) {
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="absolute bottom-4 left-4 right-4">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              <Play className="mr-2 h-4 w-4" />
              Play
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate">{project.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {project._count.songs} tracks
        </p>
      </div>
    </Card>
  );
}

function TrackRow({ 
  song, 
  index, 
  isPlaying,
  onPlay 
}: { 
  song: Song & { project: { name: string; slug: string } };
  index: number;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-lg px-4 py-2 transition-colors hover:bg-muted/50">
      <div className="w-8 text-center text-sm text-muted-foreground">
        {isPlaying ? (
          <div className="flex h-4 items-end justify-center gap-0.5">
            <div className="h-2 w-0.5 animate-pulse bg-primary"></div>
            <div className="animation-delay-150 h-3 w-0.5 animate-pulse bg-primary"></div>
            <div className="animation-delay-300 h-4 w-0.5 animate-pulse bg-primary"></div>
            <div className="animation-delay-150 h-3 w-0.5 animate-pulse bg-primary"></div>
          </div>
        ) : (
          <span className="group-hover:hidden">{index}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={`hidden h-8 w-8 p-0 group-hover:inline-flex ${isPlaying ? 'hidden' : ''}`}
          onClick={onPlay}
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{song.title}</h4>
        <p className="text-sm text-muted-foreground truncate">
          {song.project.name}
        </p>
      </div>

      {song.key && (
        <Badge variant="outline" className="ml-auto">
          {song.key}
        </Badge>
      )}

      {song.tempo && (
        <span className="text-sm text-muted-foreground">
          {song.tempo} BPM
        </span>
      )}

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
        <Button variant="ghost" size="sm">
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Add animation delays to global CSS
const animationStyles = `
  .animation-delay-150 {
    animation-delay: 150ms;
  }
  .animation-delay-300 {
    animation-delay: 300ms;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

