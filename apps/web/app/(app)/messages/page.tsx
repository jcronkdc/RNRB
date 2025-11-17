'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Bell, Wifi } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card } from '@cronkwaters/ui';

// Dynamically import Ably components to prevent SSR issues
const ChatRoom = dynamic(() => import('@/components/ably').then(m => m.ChatRoom), {
  ssr: false,
  loading: () => <div className="animate-pulse h-[600px] rounded-lg bg-white/5" />
});

const PresenceList = dynamic(() => import('@/components/ably').then(m => m.PresenceList), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 rounded-lg bg-white/5" />
});

const NotificationFeed = dynamic(() => import('@/components/ably').then(m => m.NotificationFeed), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 rounded-lg bg-white/5" />
});

const ConnectionStatus = dynamic(() => import('@/components/ably').then(m => m.ConnectionStatus), {
  ssr: false,
  loading: () => <span className="text-sm text-gray-500">Connecting...</span>
});

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'presence' | 'notifications'>('chat');

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real-time Messaging</h1>
          <p className="text-muted-foreground">
            Collaborate with your band members, producers, and team in real-time
          </p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">Real-time Messaging Coming Soon</h2>
              <p className="text-muted-foreground mb-4">
                Professional real-time messaging and collaboration features are currently in development. Sign in to be notified when this feature launches.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Instant Chat</p>
                    <p className="text-sm text-muted-foreground">Real-time messaging with band members</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Presence Tracking</p>
                    <p className="text-sm text-muted-foreground">See who's online and available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Live Notifications</p>
                    <p className="text-sm text-muted-foreground">Get updates as they happen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wifi className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Auto-reconnection</p>
                    <p className="text-sm text-muted-foreground">Seamless experience even with network issues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* REMOVED Tab Navigation - will be enabled when Ably is configured */}
        <div style={{ display: 'none' }}>
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-accent text-accent-foreground'
                : 'bg-card hover:bg-card/80'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Room
          </button>
          <button
            onClick={() => setActiveTab('presence')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'presence'
                ? 'bg-accent text-accent-foreground'
                : 'bg-card hover:bg-card/80'
            }`}
          >
            <Users className="w-4 h-4" />
            Who's Online
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'notifications'
                ? 'bg-accent text-accent-foreground'
                : 'bg-card hover:bg-card/80'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {activeTab === 'chat' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Band Chat
                  </h2>
                  <ChatRoom channelName="band-general" />
                </div>
              )}
              
              {activeTab === 'presence' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Online Members
                  </h2>
                  <PresenceList channelName="band-general" />
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      See who's currently active in your workspace. Perfect for coordinating
                      real-time collaboration sessions, remote rehearsals, or production meetings.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Activity Feed
                  </h2>
                  <NotificationFeed />
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Real-time notifications for project updates, new songs, tour announcements,
                      and more. Never miss important updates from your team.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Real-time Features</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                  <div>
                    <strong>Instant Messaging:</strong> Chat with band members and collaborators
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                  <div>
                    <strong>Presence Tracking:</strong> See who's online and available
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                  <div>
                    <strong>Live Notifications:</strong> Get updates as they happen
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                  <div>
                    <strong>Auto-reconnection:</strong> Seamless experience even with network issues
                  </div>
                </li>
              </ul>
            </Card>

            {/* Coming Soon Card */}
            <Card className="p-6 border-dashed">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Voice & Video Calls</li>
                <li>• Screen Sharing for DAW Sessions</li>
                <li>• Live Collaborative Editing</li>
                <li>• Real-time Audio Streaming</li>
                <li>• Virtual Studio Sessions</li>
              </ul>
            </Card>
          </div>
        </div>
        </div> {/* End of hidden tab content */}
      </motion.div>
    </div>
  );
}
