'use client';

import { useChannel, usePresence } from 'ably/react';
import { useState, useEffect } from 'react';
import { Send, Users } from 'lucide-react';

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

export function ChatRoom({ channelName, userName = 'Anonymous' }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

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
    <div className="flex h-[600px] flex-col rounded-lg border border-white/10 bg-black/20">
      {/* Header with presence indicator */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h3 className="text-lg font-semibold text-white">
          {channelName.replace('rnrb:', 'Chat: ')}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>{presenceData?.length || 0} online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg bg-white/5 p-3"
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-purple-400">
                {msg.name || msg.clientId}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-white">{msg.text}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

