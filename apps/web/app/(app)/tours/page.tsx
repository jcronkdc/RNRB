'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Ticket, 
  Radio,
  Users,
  Clock,
  TrendingUp,
  Globe,
  Music
} from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import { DailyProvider } from '@daily-co/daily-react';
import Daily from '@daily-co/daily-js';
import { LivePerformance } from '@/components/daily/live-performance';

// Mock tour data - in a real app, this would come from your database
const upcomingShows = [
  {
    id: '1',
    venue: 'The Roxy Theatre',
    city: 'Los Angeles, CA',
    date: new Date('2025-12-15T20:00:00'),
    ticketUrl: 'https://tickets.example.com/roxy',
    soldOut: false,
    capacity: 500,
    ticketsSold: 423,
  },
  {
    id: '2',
    venue: 'Fillmore',
    city: 'San Francisco, CA',
    date: new Date('2025-12-18T21:00:00'),
    ticketUrl: 'https://tickets.example.com/fillmore',
    soldOut: true,
    capacity: 1200,
    ticketsSold: 1200,
  },
  {
    id: '3',
    venue: 'House of Blues',
    city: 'Chicago, IL',
    date: new Date('2025-12-22T19:30:00'),
    ticketUrl: 'https://tickets.example.com/hob',
    soldOut: false,
    capacity: 800,
    ticketsSold: 567,
  },
];

const pastStreams = [
  {
    id: '1',
    title: 'Acoustic Sessions from Home',
    date: new Date('2025-11-10'),
    viewers: 15420,
    duration: '1h 45m',
    platform: 'YouTube',
  },
  {
    id: '2',
    title: 'Behind the Scenes - Studio Recording',
    date: new Date('2025-11-05'),
    viewers: 8930,
    duration: '52m',
    platform: 'Twitch',
  },
];

export default function ToursPage() {
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [selectedShow, setSelectedShow] = useState<typeof upcomingShows[0] | null>(null);
  const [callObject, setCallObject] = useState<any>(null);

  useEffect(() => {
    if (showLiveStream) {
      // Initialize Daily call object for live streaming
      const daily = Daily.createCallObject({
        subscribeToTracksAutomatically: true,
      });
      setCallObject(daily);

      return () => {
        daily.destroy();
      };
    }
  }, [showLiveStream]);

  const startVirtualShow = (show: typeof upcomingShows[0]) => {
    setSelectedShow(show);
    setShowLiveStream(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tours & Live Performances</h1>
          <p className="text-muted-foreground">
            Connect with fans through live shows and virtual performances
          </p>
        </div>

        {showLiveStream && callObject && selectedShow ? (
          <DailyProvider callObject={callObject}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowLiveStream(false);
                    setSelectedShow(null);
                  }}
                >
                  Back to Tours
                </Button>
              </div>
              
              <LivePerformance
                performanceName={`Live from ${selectedShow.venue}`}
                description={`Virtual concert streaming from ${selectedShow.city}`}
                scheduledTime={selectedShow.date}
                ticketUrl={selectedShow.ticketUrl}
              />
            </div>
          </DailyProvider>
        ) : (
          <>
            {/* Tour Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingShows.length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Shows</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Ticket className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2,190</p>
                    <p className="text-sm text-muted-foreground">Tickets Sold</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24.3K</p>
                    <p className="text-sm text-muted-foreground">Stream Viewers</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-sm text-muted-foreground">Avg. Capacity</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Upcoming Shows */}
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Upcoming Shows</h2>
                <Button variant="secondary" size="sm">
                  Add Show
                </Button>
              </div>

              <div className="space-y-4">
                {upcomingShows.map((show) => (
                  <div
                    key={show.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {show.date.getDate()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {show.date.toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold">{show.venue}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {show.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {show.date.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {show.soldOut ? (
                          <p className="text-sm font-semibold text-red-500">SOLD OUT</p>
                        ) : (
                          <p className="text-sm">
                            <span className="font-semibold">{show.ticketsSold}</span>
                            <span className="text-muted-foreground">/{show.capacity}</span>
                          </p>
                        )}
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full ${show.soldOut ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${(show.ticketsSold / show.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startVirtualShow(show)}
                        >
                          <Radio className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => window.open(show.ticketUrl, '_blank')}
                        >
                          Tickets
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Live Streaming */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Virtual Performances</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Stream live performances to fans worldwide. Perfect for intimate sessions,
                  behind-the-scenes content, or full virtual concerts.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Global Reach</p>
                      <p className="text-sm text-muted-foreground">
                        Connect with fans anywhere in the world
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Music className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">High-Quality Audio</p>
                      <p className="text-sm text-muted-foreground">
                        Crystal clear sound for the best experience
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-6" onClick={() => setShowLiveStream(true)}>
                  Start Virtual Show
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Streams</h3>
                
                <div className="space-y-3">
                  {pastStreams.map((stream) => (
                    <div key={stream.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{stream.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stream.date.toLocaleDateString()} • {stream.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {stream.viewers.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">viewers</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
