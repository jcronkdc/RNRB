'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users as UsersIcon, Send, AtSign } from 'lucide-react';
import { Card } from '@cronkwaters/ui';
import dynamic from 'next/dynamic';

// Optimal pathway: Project Detail → Chat (1 click)
// Collaboration: Real-time messaging scoped to project

// Dynamically import Ably components (prevent SSR issues)
const ProjectChat = dynamic(() => import('@/components/project/project-chat'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-[600px] rounded-lg bg-white/5" />
});

const ProjectPresence = dynamic(() => import('@/components/project/project-presence'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-48 rounded-lg bg-white/5" />
});

export default function ProjectChatPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'chat' | 'presence'>('chat');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-brand-primary" />
            Project Chat
          </h1>
          <p className="text-muted-foreground">
            Real-time messaging for project collaborators. All members can chat here.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'bg-card hover:bg-card/80 text-muted-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          
          <button
            onClick={() => setActiveTab('presence')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'presence'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'bg-card hover:bg-card/80 text-muted-foreground'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            Who's Online
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              {activeTab === 'chat' && (
                <ProjectChat channelName={`rnrb:project:${params.slug}`} />
              )}
              
              {activeTab === 'presence' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Online Members</h2>
                  <ProjectPresence channelName={`rnrb:project:${params.slug}`} />
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat Features */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Chat Features</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-primary mt-0.5" />
                  <div>
                    <strong>Real-time Messaging</strong>
                    <p className="text-muted-foreground">Messages appear instantly for all online members</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-2">
                  <AtSign className="w-4 h-4 text-brand-primary mt-0.5" />
                  <div>
                    <strong>@Mentions</strong>
                    <p className="text-muted-foreground">Tag members to get their attention</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-2">
                  <UsersIcon className="w-4 h-4 text-brand-primary mt-0.5" />
                  <div>
                    <strong>Presence</strong>
                    <p className="text-muted-foreground">See who's currently online and active</p>
                  </div>
                </li>
              </ul>
            </Card>

            {/* Coming Soon */}
            <Card className="p-6 border-dashed">
              <h3 className="font-semibold mb-4">Coming Soon</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• File sharing in chat</li>
                <li>• Voice messages</li>
                <li>• Message reactions</li>
                <li>• Thread replies</li>
                <li>• Chat history search</li>
              </ul>
            </Card>

            {/* Privacy Note */}
            <Card className="p-6 bg-yellow-500/5 border-yellow-500/20">
              <h3 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
                Private & Secure
              </h3>
              <p className="text-sm text-muted-foreground">
                This chat is private to project members only. Messages are encrypted in transit.
                Only invited collaborators can see and participate.
              </p>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

