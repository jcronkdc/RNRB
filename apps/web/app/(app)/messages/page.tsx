'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Bell, Wifi, CheckCircle } from 'lucide-react';
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

        {/* Comprehensive Messaging Overview */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <h2 className="text-3xl font-bold mb-4">Professional Real-Time Messaging</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Rock N' Roll Basement provides enterprise-grade real-time communication built specifically for music collaboration. 
            Keep your entire team connected - from band members to producers, managers to crew - with instant messaging, 
            presence awareness, and organized conversation threads.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-background/50 rounded-lg">
              <MessageSquare className="h-8 w-8 text-purple-500 mb-3" />
              <h4 className="font-semibold mb-2">Instant Messaging</h4>
              <p className="text-sm text-muted-foreground">
                Send text, images, audio clips, and files. Messages deliver in milliseconds with read receipts and typing indicators.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <Users className="h-8 w-8 text-blue-500 mb-3" />
              <h4 className="font-semibold mb-2">Presence Awareness</h4>
              <p className="text-sm text-muted-foreground">
                See who's online, in a session, or away. Know exactly when your collaborators are available to respond.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <Bell className="h-8 w-8 text-green-500 mb-3" />
              <h4 className="font-semibold mb-2">Smart Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Get notified for @mentions, replies, and important updates. Customize notification rules per channel.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <Wifi className="h-8 w-8 text-orange-500 mb-3" />
              <h4 className="font-semibold mb-2">Offline Support</h4>
              <p className="text-sm text-muted-foreground">
                Messages queue when offline and auto-send when reconnected. Never lose a message due to network issues.
              </p>
            </div>
          </div>

          <div className="bg-background/30 rounded-lg p-6 border border-brand-primary/20">
            <h3 className="text-xl font-semibold mb-4">Built for Music Collaboration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Project-Based Channels</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically create chat channels for each project, album, or tour. Keep conversations organized 
                    and searchable. Archive old projects without losing message history.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Audio Message Sharing</p>
                  <p className="text-sm text-muted-foreground">
                    Send voice memos, song ideas, or quick feedback as audio messages. Perfect for sharing melodic 
                    ideas or explaining production notes that are hard to type.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">File Sharing Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop audio files, PDFs, images, or videos directly into chat. All files automatically 
                    stored in your project's asset library for easy retrieval later.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Thread Conversations</p>
                  <p className="text-sm text-muted-foreground">
                    Reply to specific messages to create threads. Keep multiple conversations organized without 
                    cluttering the main channel - essential for busy project channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-2xl font-semibold mb-6">Advanced Chat Features</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/10 rounded flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Rich Text Formatting</p>
                  <p className="text-sm text-muted-foreground">
                    Bold, italic, code blocks, bullet lists, and links. Format messages for clarity. 
                    Use markdown shortcuts for fast formatting.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold mb-1">@Mentions & Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Tag specific team members with @username to get their attention. Mention @everyone for 
                    urgent announcements. Smart notifications only alert what's relevant to you.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 bg-green-500/10 rounded flex-shrink-0">
                  <Bell className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Pinned Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Pin important info to the top of channels. Perfect for setlists, schedule changes, or 
                    venue details that everyone needs quick access to.
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-semibold mb-6">🔔 Collaboration Tools</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="p-2 bg-orange-500/10 rounded flex-shrink-0">
                  <Wifi className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Always-On Connection</p>
                  <p className="text-sm text-muted-foreground">
                    WebSocket-based real-time updates. See new messages instantly without refreshing. 
                    Automatic reconnection if internet drops - messages sync when you're back online.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/10 rounded flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Message History Search</p>
                  <p className="text-sm text-muted-foreground">
                    Full-text search across all your conversations. Find that lyric idea from 3 months ago or 
                    the venue contact info shared last tour.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Direct Messages & Group Chats</p>
                  <p className="text-sm text-muted-foreground">
                    1-on-1 DMs for private conversations or create group chats for specific topics. Keep band 
                    discussions separate from business meetings separate from creative sessions.
                  </p>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="p-8">
          <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-brand-primary">Real-Time Technology</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• WebSocket connections (sub-100ms latency)</li>
                <li>• Automatic reconnection with exponential backoff</li>
                <li>• Message queuing for offline periods</li>
                <li>• End-to-end encryption option</li>
                <li>• Presence heartbeats every 15 seconds</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-brand-primary">Message Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Markdown formatting support</li>
                <li>• File attachments up to 100MB</li>
                <li>• Image/video inline previews</li>
                <li>• Message reactions (emoji responses)</li>
                <li>• Edit & delete messages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-brand-primary">Organization</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Unlimited channels per project</li>
                <li>• Thread conversations</li>
                <li>• Message pinning</li>
                <li>• Full history search</li>
                <li>• Archive old channels</li>
              </ul>
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
