'use client';

import { useState } from 'react';
import { 
  Calendar,
  ListMusic,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  FileText,
  Guitar,
  Piano,
  Drum,
  Plus,
  Edit,
  ChevronUp,
  ChevronDown,
  Copy,
  Share2,
  Download,
  Settings,
  Users
} from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { Card } from '@cronkwaters/ui';
import { Badge } from '@cronkwaters/ui';
import { Input } from '@cronkwaters/ui';
import { Switch } from '@cronkwaters/ui';
import { PageHeader } from '@/components/app/PageHeader';

export function PracticePageClient() {
  const [selectedTab, setSelectedTab] = useState<'setlists' | 'rehearsals' | 'charts'>('setlists');
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [tempo, setTempo] = useState(120);

  // Sample setlist templates
  const setlists = [
    {
      id: '1',
      name: 'Summer Festival 2024',
      date: new Date('2024-07-15'),
      venue: 'Central Park',
      songs: [
        { id: '1', title: 'Opening Act', duration: 240, key: 'C', tempo: 120 },
        { id: '2', title: 'Crowd Favorite', duration: 210, key: 'G', tempo: 140 },
        { id: '3', title: 'New Single', duration: 195, key: 'Am', tempo: 110 },
        { id: '4', title: 'Classic Hit', duration: 225, key: 'F', tempo: 125 },
      ],
      totalDuration: 870,
    },
    {
      id: '2',
      name: 'Club Tour Setlist',
      date: new Date('2024-06-20'),
      venue: 'Various',
      songs: [
        { id: '5', title: 'Energy Starter', duration: 180, key: 'D', tempo: 130 },
        { id: '6', title: 'Dance Floor Hit', duration: 200, key: 'Em', tempo: 128 },
        { id: '7', title: 'Slow Jam', duration: 240, key: 'Bb', tempo: 90 },
      ],
      totalDuration: 620,
    },
  ];

  const rehearsals = [
    {
      id: '1',
      title: 'Full Band Practice',
      date: new Date('2024-01-20T18:00:00'),
      duration: 120,
      location: 'Studio A',
      attendees: ['John (Guitar)', 'Sarah (Vocals)', 'Mike (Drums)', 'Lisa (Bass)'],
      agenda: ['New song arrangements', 'Solo sections', 'Transitions'],
    },
    {
      id: '2',
      title: 'Acoustic Set Rehearsal',
      date: new Date('2024-01-22T14:00:00'),
      duration: 90,
      location: 'Home Studio',
      attendees: ['Sarah (Vocals)', 'John (Guitar)'],
      agenda: ['Stripped versions', 'Harmonies', 'Crowd interaction'],
    },
  ];

  const chordCharts = [
    {
      id: '1',
      title: 'Summer Breeze',
      key: 'C',
      tempo: 120,
      timeSignature: '4/4',
      sections: [
        { name: 'Intro', chords: ['C', 'Am', 'F', 'G'], repeat: 2 },
        { name: 'Verse', chords: ['C', 'Em', 'F', 'C', 'F', 'C', 'G', 'C'], repeat: 1 },
        { name: 'Chorus', chords: ['F', 'G', 'C', 'Am', 'F', 'G', 'C', 'C'], repeat: 2 },
      ],
    },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Practice & Performance"
        description="Build setlists, schedule rehearsals, and access chord charts for your performances"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Setlist
            </Button>
          </div>
        }
      />

      {/* Metronome Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Metronome</span>
              <Switch
                checked={isMetronomeOn}
                onCheckedChange={setIsMetronomeOn}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTempo(Math.max(40, tempo - 10))}
                disabled={!isMetronomeOn}
              >
                -10
              </Button>
              <div className="w-20 text-center">
                <Input
                  type="number"
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="text-center"
                  disabled={!isMetronomeOn}
                />
                <span className="text-xs text-muted-foreground">BPM</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTempo(Math.min(300, tempo + 10))}
                disabled={!isMetronomeOn}
              >
                +10
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled={!isMetronomeOn}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="icon" disabled={!isMetronomeOn}>
              {isMetronomeOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'setlists', label: 'Setlists', icon: ListMusic },
            { id: 'rehearsals', label: 'Rehearsals', icon: Calendar },
            { id: 'charts', label: 'Chord Charts', icon: FileText },
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
      {selectedTab === 'setlists' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {setlists.map((setlist) => (
            <Card key={setlist.id} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{setlist.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {setlist.date.toLocaleDateString()} • {setlist.venue}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {setlist.songs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {song.key} • {song.tempo} BPM • {formatDuration(song.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  {setlist.songs.length} songs
                </span>
                <span className="font-medium">
                  Total: {formatDuration(setlist.totalDuration)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'rehearsals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Rehearsals</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Rehearsal
            </Button>
          </div>

          <div className="space-y-4">
            {rehearsals.map((rehearsal) => (
              <Card key={rehearsal.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{rehearsal.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rehearsal.date.toLocaleDateString()} at {rehearsal.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' • '}{rehearsal.duration} minutes
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Calendar className="mr-1 h-3 w-3" />
                        {rehearsal.location}
                      </Badge>
                      <Badge variant="outline">
                        <Users className="mr-1 h-3 w-3" />
                        {rehearsal.attendees.length} members
                      </Badge>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium">Agenda:</p>
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {rehearsal.agenda.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">Edit</Button>
                    <Button>Join Call</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'charts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chord Charts & Tabs</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Chart
            </Button>
          </div>

          {chordCharts.map((chart) => (
            <Card key={chart.id} className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{chart.title}</h3>
                  <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                    <span>Key: {chart.key}</span>
                    <span>{chart.tempo} BPM</span>
                    <span>{chart.timeSignature}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Transpose
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {chart.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{section.name}</h4>
                      {section.repeat > 1 && (
                        <Badge variant="outline">×{section.repeat}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {section.chords.map((chord, chordIndex) => (
                        <div
                          key={chordIndex}
                          className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/5 font-mono text-lg font-bold"
                        >
                          {chord}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-4 border-t pt-6">
                <Button variant="outline" className="flex-1">
                  <Guitar className="mr-2 h-4 w-4" />
                  Guitar Tab
                </Button>
                <Button variant="outline" className="flex-1">
                  <Piano className="mr-2 h-4 w-4" />
                  Piano Sheet
                </Button>
                <Button variant="outline" className="flex-1">
                  <Drum className="mr-2 h-4 w-4" />
                  Drum Pattern
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
