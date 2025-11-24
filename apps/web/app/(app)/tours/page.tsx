'use client';

import { Card, Button } from '@cronkwaters/ui';
import Daily from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Ticket,
  Radio,
  TrendingUp,
  Globe,
  Music,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { LivePerformance } from '@/components/daily/live-performance';

// Tour management features - shows will appear here once you create them
const upcomingShows: any[] = [];
const pastStreams: any[] = [];

export default function ToursPage() {
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [selectedShow, setSelectedShow] = useState<(typeof upcomingShows)[0] | null>(null);
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

  const startVirtualShow = (show: (typeof upcomingShows)[0]) => {
    setSelectedShow(show);
    setShowLiveStream(true);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="border-border/50 relative overflow-hidden border-b">
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="bg-brand-primary/10 absolute left-1/4 top-0 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <Radio className="text-brand-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Live Performance</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Tours & Shows</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Manage your live shows, venues, and virtual performances
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl px-4 py-12">
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
            {/* Tour Management - Coming Soon */}
            <Card className="rnrb-card mb-8 border-blue-500/20 bg-blue-500/5 p-8">
              <h2 className="font-display mb-4 text-3xl font-bold">
                Tour Management - In Development
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                We're building comprehensive tour management tools. Here's what's planned (not built
                yet):
              </p>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <Radio className="text-brand-primary mb-3 h-8 w-8" />
                  <h4 className="text-brand-primary mb-2 font-semibold">
                    ✓ AVAILABLE NOW: Virtual Concerts
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Use Daily.co integration to stream live performances to YouTube, Twitch,
                    Facebook via RTMP. Up to 32 participants.
                  </p>
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <MapPin className="text-muted-foreground mb-3 h-8 w-8" />
                  <h4 className="mb-2 font-semibold">Coming Soon: Venue Database</h4>
                  <p className="text-muted-foreground text-sm">
                    Store venue contacts, capacity, load-in times (not built yet).
                  </p>
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <Calendar className="text-muted-foreground mb-3 h-8 w-8" />
                  <h4 className="mb-2 font-semibold">Coming Soon: Show Scheduling</h4>
                  <p className="text-muted-foreground text-sm">
                    Visual calendar with routing optimization (not built yet).
                  </p>
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <Ticket className="text-muted-foreground mb-3 h-8 w-8" />
                  <h4 className="mb-2 font-semibold">Coming Soon: Ticketing Integration</h4>
                  <p className="text-muted-foreground text-sm">
                    Connect to ticket platforms, track sales (not built yet).
                  </p>
                </div>
              </div>

              <div className="border-brand-primary/20 bg-background/30 rounded-lg border p-6">
                <h3 className="mb-4 text-xl font-semibold">Planned Features (Not Built Yet)</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">All Tour Data in One Place</p>
                      <p className="text-muted-foreground text-sm">
                        No more spreadsheets, email chains, or scattered information. Venues, dates,
                        contracts, setlists, and revenue all organized in one platform accessible to
                        your entire team.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">Real-Time Team Collaboration</p>
                      <p className="text-muted-foreground text-sm">
                        Tour manager, band members, crew, and booking agents all see the same
                        information. Changes sync instantly across all devices.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">Hybrid Tours (Physical + Virtual)</p>
                      <p className="text-muted-foreground text-sm">
                        Play physical venues AND stream to fans worldwide. Expand your reach and
                        revenue by offering virtual tickets to shows that would otherwise be limited
                        by venue capacity.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">Financial Tracking</p>
                      <p className="text-muted-foreground text-sm">
                        Track ticket sales, merch revenue, and expenses per show. Automated split
                        calculations ensure everyone gets paid correctly according to your
                        agreements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Detailed Tour Features */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-6 text-2xl font-semibold">📅 Show & Venue Management</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded bg-blue-500/10 p-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Comprehensive Venue Profiles</p>
                      <p className="text-muted-foreground text-sm">
                        Store everything: stage dimensions, backline gear available, load-in
                        procedures, parking info, hospitality rider, technical contact info, payment
                        terms. Access all details from your phone backstage.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded bg-green-500/10 p-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Smart Routing & Scheduling</p>
                      <p className="text-muted-foreground text-sm">
                        Automatically suggests optimal tour routing to minimize travel time and
                        costs. Flags impossible routing (like coast-to-coast overnight drives).
                        Integrates with Google Maps for drive time estimates.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded bg-purple-500/10 p-2">
                      <Music className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Dynamic Setlist Management</p>
                      <p className="text-muted-foreground text-sm">
                        Create setlists, shuffle songs, add encore sections. Band members see the
                        setlist on their phones during the show. Mark songs as played to track what
                        you've performed.
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="mb-6 text-2xl font-semibold">💰 Revenue & Analytics</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded bg-green-500/10 p-2">
                      <Ticket className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Real-Time Ticket Sales Tracking</p>
                      <p className="text-muted-foreground text-sm">
                        See how many tickets sold, revenue per show, and sell-through rates.
                        Integrates with major ticketing platforms or use our built-in ticketing
                        system.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded bg-blue-500/10 p-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Tour Analytics Dashboard</p>
                      <p className="text-muted-foreground text-sm">
                        Compare performance across venues and cities. Which markets love you? Where
                        should you play larger venues? Data-driven decisions for routing your next
                        tour.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded bg-purple-500/10 p-2">
                      <DollarSign className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Revenue Split Automation</p>
                      <p className="text-muted-foreground text-sm">
                        Configure payout percentages once. System automatically calculates each
                        member's share after expenses. Transparent financial reports keep everyone
                        aligned.
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Technical Specs */}
            <Card className="p-8">
              <h3 className="mb-6 text-2xl font-bold">
                Livestreaming Capabilities for Virtual Tours
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h4 className="text-brand-primary mb-3 font-semibold">Streaming Destinations</h4>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• YouTube Live (auto-archive to channel)</li>
                    <li>• Twitch (gaming & music communities)</li>
                    <li>• Facebook Live (direct to fan page)</li>
                    <li>• Custom RTMP (your own CDN)</li>
                    <li>• Multi-stream (all platforms at once)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-brand-primary mb-3 font-semibold">Virtual Venue Features</h4>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• Ticketed virtual shows</li>
                    <li>• VIP backstage access rooms</li>
                    <li>• Live chat moderation</li>
                    <li>• Digital merch sales during show</li>
                    <li>• Recording for later replay</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-brand-primary mb-3 font-semibold">Fan Engagement</h4>
                  <ul className="text-muted-foreground space-y-2 text-sm">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Virtual Performances</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Stream live performances to fans worldwide. Perfect for intimate sessions,
                  behind-the-scenes content, or full virtual concerts.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Globe className="text-muted-foreground mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-medium">Global Reach</p>
                      <p className="text-muted-foreground text-sm">
                        Connect with fans anywhere in the world
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Music className="text-muted-foreground mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-medium">High-Quality Audio</p>
                      <p className="text-muted-foreground text-sm">
                        Crystal clear sound for the best experience
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="mt-6 w-full" onClick={() => setShowLiveStream(true)}>
                  Start Virtual Show
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Recent Streams</h3>

                <div className="space-y-3">
                  {pastStreams.map((stream) => (
                    <div key={stream.id} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium">{stream.title}</h5>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {stream.date.toLocaleDateString()} • {stream.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{stream.viewers.toLocaleString()}</p>
                          <p className="text-muted-foreground text-xs">viewers</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
