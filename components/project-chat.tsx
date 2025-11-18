'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare, Sparkles } from 'lucide-react';

// Dynamically import Ably components
const ChatRoom = dynamic(() => import('./ably/chat-room').then(m => m.ChatRoom), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-surface rounded-lg">
      <p className="text-muted-foreground">Loading chat...</p>
    </div>
  )
});

type ProjectChatProps = {
  projectSlug: string;
  projectName: string;
};

export function ProjectChat({ projectSlug, projectName }: ProjectChatProps) {
  const [channelName] = useState(`project-${projectSlug}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-primary" />
            Project Chat
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time messaging for {projectName}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <ChatRoom channelName={channelName} />
      </div>

      <div className="p-4 rnrb-card bg-purple-500/5 border-purple-500/20">
        <p className="text-sm text-brand-primary font-medium mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Real-Time Collaboration with AI
        </p>
        <p className="text-xs text-muted-foreground">
          Messages sync instantly. AI assistant coming soon - get chord suggestions and theory help in chat.
        </p>
      </div>
    </div>
  );
}

