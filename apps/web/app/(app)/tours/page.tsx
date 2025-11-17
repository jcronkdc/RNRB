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

// Tour management features - shows will appear here once you create them
const upcomingShows: any[] = [];
const pastStreams: any[] = [];

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
            {/* Getting Started */}
            <Card className="p-8 mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">Tour Management Coming Soon</h2>
                  <p className="text-muted-foreground mb-4">
                    Professional tour management features are currently in development. Soon you'll be able to manage shows, track ticket sales, and stream virtual performances.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Venue Management</p>
                        <p className="text-sm text-muted-foreground">Track shows, locations, and capacity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Ticket className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Ticket Tracking</p>
                        <p className="text-sm text-muted-foreground">Monitor sales and revenue</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Radio className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Live Streaming</p>
                        <p className="text-sm text-muted-foreground">Virtual performances worldwide</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Analytics</p>
                        <p className="text-sm text-muted-foreground">Real-time tour insights</p>
                      </div>
                    </div>
                  </div>
                </div>
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
