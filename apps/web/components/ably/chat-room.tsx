'use client';

import { useChannel, usePresence } from 'ably/react';
import { useState, useEffect } from 'react';
import { Send, Users, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  text: string;
  timestamp: number;
  clientId: string;
  name?: string;
}

interface ChatRoomProps {
  channelName: string;
  userName?: string;
}

export function ChatRoom({ channelName, userName: providedUserName }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState(providedUserName || 'Anonymous');

  useEffect(() => {
    // Get user name from Supabase
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous';
        setUserName(name);
      }
    });
  }, []);

  const { channel } = useChannel(channelName, (message) => {
    setMessages((prev) => [...prev, {
      id: message.id || Date.now().toString(),
      text: message.data.text,
      timestamp: message.timestamp || Date.now(),
      clientId: message.clientId || 'unknown',
      name: message.data.name || message.clientId
    }]);
  });

  const { presenceData } = usePresence(channelName, {
    name: userName,
    status: 'online'
  });

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    channel.publish('message', {
      text: inputText,
      name: userName,
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
    <div className="flex h-[600px] flex-col rounded-lg border border-border bg-surface shadow-lg">
      {/* Header with presence indicator */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-surface-muted">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Project Chat
          </h3>
          <p className="text-xs text-muted-foreground">Real-time collaboration</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <Users className="h-4 w-4" />
          <span>{presenceData?.length || 0} online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg bg-surface-muted border border-border/50 p-3 hover:border-brand-primary/30 transition"
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-brand-primary">
                {msg.name || msg.clientId}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-foreground">{msg.text}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center flex-col text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-surface-muted">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (AI assistant coming soon)"
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="rounded-lg bg-brand-primary px-4 py-2.5 text-brand-primary-foreground transition hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          AI assistant coming soon - get chord suggestions, theory help, and more
        </p>
      </div>
    </div>
  );
}

