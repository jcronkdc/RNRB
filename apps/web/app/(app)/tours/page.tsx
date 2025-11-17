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
  Music,
  DollarSign,
  CheckCircle
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
            {/* Comprehensive Tour Management */}
            <Card className="p-8 mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <h2 className="text-3xl font-bold mb-4">🎤 Complete Tour Management Platform</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Rock N' Roll Basement provides end-to-end tour management: from booking venues to streaming virtual concerts, 
                managing setlists to tracking ticket sales - everything you need to run successful tours.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-background/50 rounded-lg">
                  <MapPin className="h-8 w-8 text-blue-500 mb-3" />
                  <h4 className="font-semibold mb-2">Venue Database</h4>
                  <p className="text-sm text-muted-foreground">
                    Store venue contacts, capacity, load-in times, and technical specs for every location on your tour.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <Calendar className="h-8 w-8 text-green-500 mb-3" />
                  <h4 className="font-semibold mb-2">Show Scheduling</h4>
                  <p className="text-sm text-muted-foreground">
                    Visual calendar with routing optimization, travel time calculations, and automatic conflict detection.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <Ticket className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-2">Ticketing Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect to major ticket platforms or embed your own. Track sales in real-time with revenue analytics.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <Radio className="h-8 w-8 text-red-500 mb-3" />
                  <h4 className="font-semibold mb-2">Virtual Concerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Stream live performances to multiple platforms simultaneously with HD video and professional audio.
                  </p>
                </div>
              </div>

              <div className="bg-background/30 rounded-lg p-6 border border-brand-primary/20">
                <h3 className="text-xl font-semibold mb-4">Why Artists Choose Our Tour Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">All Tour Data in One Place</p>
                      <p className="text-sm text-muted-foreground">
                        No more spreadsheets, email chains, or scattered information. Venues, dates, contracts, 
                        setlists, and revenue all organized in one platform accessible to your entire team.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Real-Time Team Collaboration</p>
                      <p className="text-sm text-muted-foreground">
                        Tour manager, band members, crew, and booking agents all see the same information. 
                        Changes sync instantly across all devices.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Hybrid Tours (Physical + Virtual)</p>
                      <p className="text-sm text-muted-foreground">
                        Play physical venues AND stream to fans worldwide. Expand your reach and revenue by 
                        offering virtual tickets to shows that would otherwise be limited by venue capacity.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Financial Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        Track ticket sales, merch revenue, and expenses per show. Automated split calculations 
                        ensure everyone gets paid correctly according to your agreements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Detailed Tour Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-6">📅 Show & Venue Management</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Comprehensive Venue Profiles</p>
                      <p className="text-sm text-muted-foreground">
                        Store everything: stage dimensions, backline gear available, load-in procedures, parking info, 
                        hospitality rider, technical contact info, payment terms. Access all details from your phone backstage.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded flex-shrink-0">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Smart Routing & Scheduling</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically suggests optimal tour routing to minimize travel time and costs. Flags impossible 
                        routing (like coast-to-coast overnight drives). Integrates with Google Maps for drive time estimates.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded flex-shrink-0">
                      <Music className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Dynamic Setlist Management</p>
                      <p className="text-sm text-muted-foreground">
                        Create setlists, shuffle songs, add encore sections. Band members see the setlist on their 
                        phones during the show. Mark songs as played to track what you've performed.
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-6">💰 Revenue & Analytics</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded flex-shrink-0">
                      <Ticket className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Real-Time Ticket Sales Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        See how many tickets sold, revenue per show, and sell-through rates. Integrates with major 
                        ticketing platforms or use our built-in ticketing system.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Tour Analytics Dashboard</p>
                      <p className="text-sm text-muted-foreground">
                        Compare performance across venues and cities. Which markets love you? Where should you play 
                        larger venues? Data-driven decisions for routing your next tour.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Revenue Split Automation</p>
                      <p className="text-sm text-muted-foreground">
                        Configure payout percentages once. System automatically calculates each member's share 
                        after expenses. Transparent financial reports keep everyone aligned.
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Technical Specs */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6">Livestreaming Capabilities for Virtual Tours</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-brand-primary">Streaming Destinations</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• YouTube Live (auto-archive to channel)</li>
                    <li>• Twitch (gaming & music communities)</li>
                    <li>• Facebook Live (direct to fan page)</li>
                    <li>• Custom RTMP (your own CDN)</li>
                    <li>• Multi-stream (all platforms at once)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-brand-primary">Virtual Venue Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ticketed virtual shows</li>
                    <li>• VIP backstage access rooms</li>
                    <li>• Live chat moderation</li>
                    <li>• Digital merch sales during show</li>
                    <li>• Recording for later replay</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-brand-primary">Fan Engagement</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Real-time song requests (paid)</li>
                    <li>• Shoutouts & dedications</li>
                    <li>• Interactive polls between songs</li>
                    <li>• Tip jar for virtual venues</li>
                    <li>• Post-show meet & greet rooms</li>
                  </ul>
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
