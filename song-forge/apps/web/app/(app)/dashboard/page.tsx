'use client';

import { 
  Music, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  FileText,
  Mic,
  Award,
  MessageSquare,
  Play,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Mock data - in real app this would come from your database
const stats = [
  { label: 'Active Projects', value: '12', icon: Music, change: '+2 this week', color: 'text-brand-primary' },
  { label: 'Upcoming Shows', value: '5', icon: Calendar, change: '3 this month', color: 'text-accent' },
  { label: 'Revenue (30d)', value: '$4,827', icon: DollarSign, change: '+12.5%', color: 'text-success' },
  { label: 'Collaborators', value: '24', icon: Users, change: '+3 new', color: 'text-warning' }
];

const recentActivity = [
  { type: 'song', title: 'Midnight Blues', action: 'New mix uploaded', time: '2 hours ago', icon: Music },
  { type: 'show', title: 'The Whiskey Bar', action: 'Tickets on sale', time: '5 hours ago', icon: Mic },
  { type: 'collab', title: 'Sarah Chen', action: 'Joined "Summer EP"', time: '1 day ago', icon: Users },
  { type: 'revenue', title: 'Spotify Royalties', action: '$127.43 received', time: '2 days ago', icon: DollarSign }
];

const upcomingShows = [
  { venue: 'The Basement', date: 'Nov 24', time: '9:00 PM', ticketsSold: 45, capacity: 100 },
  { venue: 'Blue Note Jazz', date: 'Dec 2', time: '8:30 PM', ticketsSold: 78, capacity: 150 },
  { venue: 'Rock Bottom', date: 'Dec 15', time: '10:00 PM', ticketsSold: 23, capacity: 80 }
];

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="rnrb-venue min-h-screen -m-6 p-6">
      {/* Main Stage Header - Neon Sign */}
      <div className="rnrb-stage-light relative mb-8 -m-6 p-12 bg-gradient-to-br from-rnrb-void via-rnrb-shadow to-rnrb-void overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="rnrb-vinyl absolute top-10 right-10" style={{ transform: 'rotate(15deg) scale(0.8)' }}></div>
          <div className="rnrb-vinyl absolute bottom-10 left-10" style={{ transform: 'rotate(-20deg) scale(0.6)' }}></div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="rnrb-neon rnrb-gig-poster-heading text-6xl mb-4">
            {greeting.toUpperCase()}, ROCKSTAR
          </h1>
          <p className="text-2xl text-rnrb-dust uppercase tracking-widest">
            Welcome to your Underground HQ
          </p>
        </div>
      </div>

      {/* Stats Grid - Concert Posters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className="rnrb-poster rnrb-card group"
            style={{ '--rotation': `${index % 2 === 0 ? '-1' : '1'}deg` } as React.CSSProperties}
          >
            <div className="flex items-start justify-between mb-4 relative z-20">
              <div className="rnrb-amp-stack p-3 rounded-lg">
                <stat.icon className={`w-8 h-8 ${stat.color} relative z-10`} />
              </div>
              <span className="rnrb-backstage-pass text-xs">{stat.change}</span>
            </div>
            <div className="relative z-20">
              <p className="rnrb-gig-poster-heading text-3xl mb-1">{stat.value}</p>
              <p className="text-sm text-rnrb-dust uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Venue Bulletin Board */}
        <div className="lg:col-span-2 rnrb-booth">
          <div className="flex items-center justify-between mb-6">
            <h2 className="rnrb-gig-poster-heading text-2xl">VENUE BULLETIN</h2>
            <Link href="/activity" className="rnrb-exit-sign text-xs">
              ALL ACTIVITY
            </Link>
          </div>
          <div className="rnrb-setlist">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border-b border-rnrb-smoke-haze/20 last:border-0">
                <div className="rnrb-bar-stool w-12 h-12 flex items-center justify-center">
                  <activity.icon size={20} className="text-rnrb-neon-cyan relative z-10" />
                </div>
                <div className="flex-1">
                  <p className="font-bold uppercase tracking-wide">{activity.title}</p>
                  <p className="text-sm text-rnrb-dust rnrb-graffiti">{activity.action}</p>
                </div>
                <span className="rnrb-sticky-note text-xs p-1">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="rnrb-card">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/projects/new" className="rnrb-btn rnrb-btn-primary w-full justify-center">
                <PlusCircle size={18} />
                New Project
              </Link>
              <Link href="/songs/new" className="rnrb-btn rnrb-btn-secondary w-full justify-center">
                <Music size={18} />
                Add Song
              </Link>
              <Link href="/shows/new" className="rnrb-btn rnrb-btn-secondary w-full justify-center">
                <Calendar size={18} />
                Schedule Show
              </Link>
            </div>
          </div>

          {/* Featured Content - Rock poster style */}
          <div className="rnrb-poster-card rnrb-card relative overflow-hidden h-48">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-accent/20" />
            <div className="relative z-10 p-6 flex flex-col justify-between h-full">
              <div>
                <Award className="w-8 h-8 text-warning mb-2" />
                <h3 className="font-bold text-lg">Artist Spotlight</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your track "Midnight Blues" is trending!
                </p>
              </div>
              <Link href="/analytics" className="text-sm text-brand-primary hover:underline">
                View Analytics →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Shows */}
      <div className="mt-6 rnrb-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Upcoming Shows</h2>
          <Link href="/shows" className="text-sm text-brand-primary hover:underline">
            Manage all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Venue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tickets</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingShows.map((show, index) => (
                <tr key={index} className="border-b border-border hover:bg-surface-muted transition-colors">
                  <td className="py-4 px-4 font-medium">{show.venue}</td>
                  <td className="py-4 px-4 text-sm">{show.date}</td>
                  <td className="py-4 px-4 text-sm">{show.time}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary"
                          style={{ width: `${(show.ticketsSold / show.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {show.ticketsSold}/{show.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-sm text-brand-primary hover:underline">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom CTA - Rock inspired */}
      <div className="mt-8 relative">
        <div className="rnrb-vinyl absolute -right-4 -top-4 opacity-10" />
        <div className="rnrb-card-elevated p-8 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Ready to rock?</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to Pro and unlock advanced features for serious musicians
            </p>
            <Link href="/pricing" className="rnrb-btn rnrb-btn-primary">
              <TrendingUp size={18} />
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}