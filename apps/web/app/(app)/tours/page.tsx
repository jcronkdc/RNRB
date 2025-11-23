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
  CheckCircle,
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                <Radio className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Live Performance</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Tours & Shows</h1>
              </div>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">
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
              <p className="mb-6 text-lg text-muted-foreground">
                We're building comprehensive tour management tools. Here's what's planned (not built
                yet):
              </p>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <Radio className="mb-3 h-8 w-8 text-brand-primary" />
                  <h4 className="mb-2 font-semibold text-brand-primary">
                    ✓ AVAILABLE NOW: Virtual Concerts
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use Daily.co integration to stream live performances to YouTube, Twitch,
                    Facebook via RTMP. Up to 32 participants.
                  </p>
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <MapPin className="mb-3 h-8 w-8 text-muted-foreground" />
                  <h4 className="mb-2 font-semibold">Coming Soon: Venue Database</h4>
                  <p className="text-sm text-muted-foreground">
                    Store venue contacts, capacity, load-in times (not built yet).
                  </p>
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <Calendar className="mb-3 h-8 w-8 text-muted-foreground" />
                  <h4 className="mb-2 font-semibold">Coming Soon: Show Scheduling</h4>
                  <p className="text-sm text-muted-foreground">
                    Visual calendar with routing optimization (not built yet).
                  </p>
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <Ticket className="mb-3 h-8 w-8 text-muted-foreground" />
                  <h4 className="mb-2 font-semibold">Coming Soon: Ticketing Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect to ticket platforms, track sales (not built yet).
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-brand-primary/20 bg-background/30 p-6">
                <h3 className="mb-4 text-xl font-semibold">Planned Features (Not Built Yet)</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">All Tour Data in One Place</p>
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
                        Tour manager, band members, crew, and booking agents all see the same
                        information. Changes sync instantly across all devices.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">Hybrid Tours (Physical + Virtual)</p>
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
                  <h4 className="mb-3 font-semibold text-brand-primary">Streaming Destinations</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• YouTube Live (auto-archive to channel)</li>
                    <li>• Twitch (gaming & music communities)</li>
                    <li>• Facebook Live (direct to fan page)</li>
                    <li>• Custom RTMP (your own CDN)</li>
                    <li>• Multi-stream (all platforms at once)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 font-semibold text-brand-primary">Virtual Venue Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ticketed virtual shows</li>
                    <li>• VIP backstage access rooms</li>
                    <li>• Live chat moderation</li>
                    <li>• Digital merch sales during show</li>
                    <li>• Recording for later replay</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 font-semibold text-brand-primary">Fan Engagement</h4>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Virtual Performances</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Stream live performances to fans worldwide. Perfect for intimate sessions,
                  behind-the-scenes content, or full virtual concerts.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Global Reach</p>
                      <p className="text-sm text-muted-foreground">
                        Connect with fans anywhere in the world
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Music className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">High-Quality Audio</p>
                      <p className="text-sm text-muted-foreground">
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
                    <div key={stream.id} className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium">{stream.title}</h5>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {stream.date.toLocaleDateString()} • {stream.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{stream.viewers.toLocaleString()}</p>
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
      </div>
    </div>
  );
}
