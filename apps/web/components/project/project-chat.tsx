'use client';

import { useChannel, usePresence } from 'ably/react';
import { useState } from 'react';
import { Send, Users } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: number;
  clientId: string;
  userName?: string;
  userEmail?: string;
}

interface ProjectChatProps {
  channelName: string;
  userName?: string;
  userEmail?: string;
}

export default function ProjectChat({ channelName, userName = 'Anonymous', userEmail }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const { channel } = useChannel(channelName, (message) => {
    setMessages((prev) => [...prev, {
      id: message.id || Date.now().toString(),
      text: message.data.text,
      timestamp: message.timestamp || Date.now(),
      clientId: message.clientId || 'unknown',
      userName: message.data.userName || message.clientId,
      userEmail: message.data.userEmail
    }]);
  });

  const { presenceData } = usePresence(channelName, {
    userName,
    userEmail,
    status: 'active'
  });

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    channel.publish('chat-message', {
      text: inputText,
      userName,
      userEmail,
    });
    
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[600px] flex-col bg-background">
      {/* Header with online count */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
        <h3 className="text-lg font-semibold">
          Project Chat
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 text-green-500" />
          <span>{presenceData?.length || 0} online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg bg-muted/50 p-3 hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-brand-primary">
                {msg.userName || msg.clientId}
              </span>
              {msg.userEmail && (
                <span className="text-xs text-muted-foreground">
                  {msg.userEmail}
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">{msg.text}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <MessageSquare className="w-12 h-12 mx-auto opacity-20" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
              <p className="text-xs">This chat is private to project members only.</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Press Enter to send)"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="rounded-lg bg-brand-primary px-4 py-2 text-brand-primary-foreground transition hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Tip: Use @username to mention collaborators
        </p>
      </div>
    </div>
  );
}

