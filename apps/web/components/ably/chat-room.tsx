'use client';

import { useChannel, usePresence } from 'ably/react';
import { Send, Users, Sparkles, X , MessageSquare } from 'lucide-react';
import { useState } from 'react';

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
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const { channel } = useChannel(channelName, (message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: message.id || Date.now().toString(),
        text: message.data.text,
        timestamp: message.timestamp || Date.now(),
        clientId: message.clientId || 'unknown',
        name: message.data.name || message.clientId,
      },
    ]);
  });

  const { updateStatus } = usePresence(channelName, {
    name: userName,
    status: 'online',
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

  const getAIHelp = async () => {
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiSuggestion(null);

    try {
      const response = await fetch('/api/ai/chat-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: aiQuery,
          context: {}, // Add project context if available
        }),
      });

      if (!response.ok) {
        setAiSuggestion('AI assistant unavailable. Check OPENAI_API_KEY in environment.');
        setAiLoading(false);
        return;
      }

      const data = await response.json();
      setAiSuggestion(data.suggestion || 'No suggestion available');
    } catch (error) {
      setAiSuggestion('AI assistant unavailable. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  const useAISuggestion = () => {
    if (aiSuggestion) {
      setInputText(`[AI] ${aiSuggestion}`);
      setShowAIHelper(false);
      setAiQuery('');
      setAiSuggestion(null);
    }
  };

  return (
    <div className="border-border bg-surface flex h-[600px] flex-col rounded-lg border shadow-lg">
      {/* Header with presence indicator */}
      <div className="border-border bg-surface-muted flex items-center justify-between border-b p-4">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Project Chat</h3>
          <p className="text-muted-foreground text-xs">Real-time collaboration</p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <Users className="h-4 w-4" />
          <span>Live chat</span>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-surface flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="border-border/50 bg-surface-muted hover:border-brand-primary/30 rounded-lg border p-3 transition"
          >
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-brand-primary text-sm font-semibold">
                {msg.name || msg.clientId}
              </span>
              <span className="text-muted-foreground text-xs">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-foreground text-sm">{msg.text}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center">
            <MessageSquare className="mb-3 h-12 w-12 opacity-50" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-border bg-surface-muted border-t p-4">
        {/* AI Helper Popup */}
        {showAIHelper && (
          <div className="rnrb-card mb-4 border-purple-500/20 bg-purple-500/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h4 className="text-foreground font-semibold">AI Assistant</h4>
              </div>
              <button
                onClick={() => setShowAIHelper(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-muted-foreground mb-3 text-xs">
              Ask about chords, song structure, lyrics, or music theory
            </p>
            <textarea
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="What chord goes after Am in this progression?"
              className="border-border bg-surface text-foreground focus:border-brand-primary focus:ring-brand-primary/20 mb-3 w-full resize-none rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={getAIHelp}
                disabled={aiLoading || !aiQuery.trim()}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                {aiLoading ? 'Thinking...' : 'Get AI Suggestion'}
              </button>
            </div>
            {aiSuggestion && (
              <div className="border-brand-primary/30 bg-surface mt-3 rounded-lg border p-3">
                <p className="mb-1 text-xs font-semibold text-purple-400">AI SUGGESTION:</p>
                <p className="text-foreground mb-3 text-sm">{aiSuggestion}</p>
                <div className="flex gap-2">
                  <button
                    onClick={useAISuggestion}
                    className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700"
                  >
                    Use This
                  </button>
                  <button
                    onClick={() => setAiSuggestion(null)}
                    className="bg-surface hover:bg-surface-muted rounded px-3 py-1.5 text-xs font-medium transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="border-border bg-surface text-foreground placeholder-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 flex-1 rounded-lg border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2"
          />
          <button
            onClick={() => setShowAIHelper(!showAIHelper)}
            className="rounded-lg border border-purple-500/30 bg-purple-600/20 px-4 py-2.5 text-purple-400 shadow-lg transition hover:bg-purple-600/30"
            title="AI Assistant - Get chord suggestions, theory help"
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 rounded-lg px-4 py-2.5 shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
          <Sparkles className="h-3 w-3 text-purple-400" />
          Click the sparkle button for AI chord suggestions and music theory help
        </p>
      </div>
    </div>
  );
}
