'use client';

import { Button, cn } from '@cronkwaters/ui';
import {
  Minus,
  Send,
  Sparkles,
  MessageSquare,
  Music,
  ListMusic,
  Lightbulb,
  HelpCircle,
  Zap,
  Square,
  Loader2,
} from '@/components/ui/custom-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { useAssistant } from '@/hooks/use-assistant';

// Quick action buttons based on context
const QUICK_ACTIONS = {
  default: [
    { icon: Music, label: 'Create a song', prompt: 'Help me create a new song' },
    { icon: ListMusic, label: 'Build setlist', prompt: 'Help me build a setlist for my next show' },
    {
      icon: Lightbulb,
      label: 'Song ideas',
      prompt: 'Give me some creative song ideas based on my style',
    },
    { icon: HelpCircle, label: 'How to...', prompt: 'How do I get started with CronkWaters?' },
  ],
  songwriting: [
    {
      icon: Music,
      label: 'Chord suggestions',
      prompt: 'Suggest some chord progressions for my current song',
    },
    { icon: Lightbulb, label: 'Lyric ideas', prompt: 'Help me with lyrics for the chorus' },
    { icon: Zap, label: 'Rhyme finder', prompt: 'Find rhymes for my lyrics' },
    { icon: HelpCircle, label: 'Bridge help', prompt: 'Help me write a bridge section' },
  ],
  projects: [
    { icon: Music, label: 'Add song', prompt: 'Help me add a new song to this project' },
    {
      icon: ListMusic,
      label: 'Organize tracks',
      prompt: 'Help me organize the songs in this project',
    },
    {
      icon: Lightbulb,
      label: 'Album flow',
      prompt: 'Suggest the best order for these songs as an album',
    },
    {
      icon: HelpCircle,
      label: 'Release tips',
      prompt: 'What should I do before releasing this project?',
    },
  ],
  tours: [
    { icon: ListMusic, label: 'Plan setlist', prompt: 'Help me plan a setlist for this tour' },
    { icon: Lightbulb, label: 'Route optimizer', prompt: 'Help optimize my tour route' },
    { icon: Zap, label: 'Budget estimate', prompt: 'Estimate the budget for this tour' },
    { icon: HelpCircle, label: 'Venue tips', prompt: 'Tips for booking venues in new cities' },
  ],
  library: [
    { icon: Music, label: 'Organize files', prompt: 'Help me organize my audio library' },
    { icon: Lightbulb, label: 'Find stems', prompt: 'Help me find specific stems in my library' },
    { icon: Zap, label: 'Tag suggestions', prompt: 'Suggest tags for my uploaded files' },
    { icon: HelpCircle, label: 'Storage tips', prompt: 'Tips for managing my storage space' },
  ],
  copyright: [
    {
      icon: Zap,
      label: 'Split calculator',
      prompt: 'Help me calculate royalty splits for my song',
    },
    {
      icon: Lightbulb,
      label: 'Registration help',
      prompt: 'How do I register my song for copyright?',
    },
    {
      icon: HelpCircle,
      label: 'Explain rights',
      prompt: 'Explain the different types of music rights',
    },
    { icon: Music, label: 'Split sheet', prompt: 'Help me create a split sheet for collaborators' },
  ],
};

// Context-aware suggestions based on page
const PROACTIVE_SUGGESTIONS: Record<string, { trigger: string; suggestion: string }> = {
  '/dashboard': {
    trigger: "I see you're on the dashboard",
    suggestion:
      'Would you like me to summarize your recent activity or suggest what to work on next?',
  },
  '/songwriting': {
    trigger: "I see you're working on songwriting",
    suggestion:
      "Need help with lyrics, chords, or structure? I can suggest rhymes, chord progressions, or help you break through writer's block!",
  },
  '/projects': {
    trigger: "I see you're viewing your projects",
    suggestion:
      'I can help you organize songs, suggest album flow, or prepare for release. What would you like to work on?',
  },
  '/tours': {
    trigger: "I see you're planning tours",
    suggestion:
      'I can help with setlists, route optimization, budget estimates, or venue research. What do you need?',
  },
  '/library': {
    trigger: "I see you're in your library",
    suggestion:
      'I can help you organize files, find specific stems, or suggest better tagging. How can I help?',
  },
  '/copyright': {
    trigger: "I see you're looking at copyright",
    suggestion:
      'I can help calculate splits, explain music rights, or prepare registration documents. What do you need?',
  },
  '/collaboration': {
    trigger: "I see you're looking at collaborations",
    suggestion:
      'I can help draft messages to collaborators, suggest potential partners, or manage split sheets. How can I assist?',
  },
};

function getQuickActionsForPath(pathname: string) {
  if (pathname.includes('/songwriting')) return QUICK_ACTIONS.songwriting;
  if (pathname.includes('/projects')) return QUICK_ACTIONS.projects;
  if (pathname.includes('/tours')) return QUICK_ACTIONS.tours;
  if (pathname.includes('/library')) return QUICK_ACTIONS.library;
  if (pathname.includes('/copyright')) return QUICK_ACTIONS.copyright;
  return QUICK_ACTIONS.default;
}

function getProactiveSuggestion(pathname: string) {
  for (const [path, suggestion] of Object.entries(PROACTIVE_SUGGESTIONS)) {
    if (pathname.includes(path.replace('/', ''))) {
      return suggestion;
    }
  }
  return null;
}

export function AssistantChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showProactiveSuggestion, setShowProactiveSuggestion] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    currentAction,
    sendMessage,
    reset,
    stopStreaming,
  } = useAssistant({
    onError: (err) => {
      console.error('Assistant error:', err);
    },
    onAction: (action) => {
      console.log('AI action:', action);
    },
  });

  const quickActions = getQuickActionsForPath(pathname);
  const proactiveSuggestion = getProactiveSuggestion(pathname);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if ((messages.length > 0 || isStreaming) && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized, isStreaming]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Hide proactive suggestion after first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowProactiveSuggestion(false);
    }
  }, [messages.length]);

  const handleSendMessage = async (messageOverride?: string) => {
    const messageToSend = messageOverride || inputValue.trim();
    if (!messageToSend || isLoading || isStreaming) {
      return;
    }

    setInputValue('');
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Minimized state - show only icon button (cannot close completely)
  // Using SVG text to completely bypass CSS color rules
  if (!isOpen || isMinimized) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        data-ai-floating-btn="true"
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'flex items-center gap-2',
          'rounded-full',
          'ai-floating-btn',
          'bg-gradient-to-r from-brand-primary to-purple-600',
          'shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/40',
          'transition-all duration-300',
          'hover:scale-105 active:scale-95',
          'group',
          isMinimized ? 'p-3' : 'px-4 py-3'
        )}
        aria-label="Open AI Assistant"
        title="AI Assistant"
      >
        <div className="relative">
          <Sparkles className="h-5 w-5 text-white transition-transform group-hover:rotate-12" />
          {isMinimized && (
            <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-purple-600" />
          )}
        </div>
        {!isMinimized && (
          <svg width="90" height="20" viewBox="0 0 90 20" className="flex-shrink-0">
            <text
              x="0"
              y="15"
              fill="#ffffff"
              fontWeight="600"
              fontSize="14"
              fontFamily="system-ui, sans-serif"
            >
              AI Assistant
            </text>
          </svg>
        )}
      </button>
    );
  }

  // Chat widget (expanded state)
  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-[420px] max-w-[calc(100vw-2rem)]',
        'rounded-2xl shadow-2xl',
        'flex flex-col',
        'h-[650px] max-h-[calc(100vh-2rem)]'
      )}
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-brand-primary/10 via-purple-500/10 to-brand-primary/10 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 shadow-lg shadow-brand-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
            <div
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-400"
              style={{ border: '2px solid var(--panel)' }}
            />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              AI Assistant
            </h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {isStreaming
                ? 'Typing...'
                : currentAction
                  ? `Running ${currentAction}...`
                  : 'Ready to help'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMinimize}
            className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
            title="Minimize to icon"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <>
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col px-2">
              {/* Welcome */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 shadow-lg shadow-brand-primary/30">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h4 className="mb-1 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  Hey! I'm your AI Assistant
                </h4>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  I know your songs, projects, and preferences. Ask me anything!
                </p>
              </div>

              {/* Proactive suggestion */}
              {showProactiveSuggestion && proactiveSuggestion && (
                <div className="mb-4 rounded-xl border border-brand-primary/30 bg-brand-primary/10 p-4">
                  <p className="mb-1 text-xs font-medium text-brand-primary">
                    {proactiveSuggestion.trigger}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {proactiveSuggestion.suggestion}
                  </p>
                </div>
              )}

              {/* Quick actions */}
              <div className="mt-auto">
                <p
                  className="mb-3 text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted-soft)' }}
                >
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.prompt)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl p-3',
                        'text-left text-sm',
                        'hover:bg-black/5 dark:hover:bg-white/5',
                        'transition-all duration-200',
                        'group'
                      )}
                      style={{
                        border: '1px solid var(--border)',
                        background: 'var(--panel)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <action.icon className="h-4 w-4 text-brand-primary transition-transform group-hover:scale-110" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-lg shadow-brand-primary/20'
                    : ''
                )}
                style={
                  message.role === 'assistant'
                    ? {
                        border: '1px solid var(--border)',
                        background: 'var(--panel)',
                        color: 'var(--text)',
                      }
                    : undefined
                }
              >
                {message.role === 'assistant' && (
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-brand-primary to-purple-600">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-brand-primary">AI Assistant</span>
                    {message.isStreaming && (
                      <span
                        className="ml-auto flex items-center gap-1 text-xs"
                        style={{ color: 'var(--muted-soft)' }}
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        typing
                      </span>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                  {message.isStreaming && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-primary" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && !isStreaming && (
            <div className="flex justify-start">
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-brand-primary"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {currentAction ? `Running ${currentAction}...` : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="max-w-[90%] rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
                <p className="mb-1 font-medium text-red-400">Error</p>
                <p className="text-xs text-red-300">{error}</p>
                {error.includes('Upgrade') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => (window.location.href = '/settings/subscription')}
                  >
                    View Plans
                  </Button>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="p-3"
          style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--panel-hover)',
          }}
        >
          {messages.length > 0 && (
            <div className="mb-2 flex items-center justify-between">
              <div className="flex gap-1">
                {quickActions.slice(0, 3).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading || isStreaming}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-2 py-1',
                      'text-xs',
                      'hover:bg-black/5 dark:hover:bg-white/5',
                      'transition-colors',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                    style={{ color: 'var(--muted)' }}
                  >
                    <action.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                disabled={isLoading || isStreaming}
                className="h-auto py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: 'var(--muted)' }}
              >
                <MessageSquare className="mr-1 h-3 w-3" />
                New
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className={cn(
                'flex-1 resize-none rounded-xl px-4 py-3',
                'text-sm',
                'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
                'max-h-32'
              )}
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              rows={1}
              disabled={isLoading || isStreaming}
            />
            {isStreaming ? (
              <Button
                onClick={stopStreaming}
                size="icon"
                className="shrink-0 bg-red-500 hover:bg-red-600"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="shrink-0 bg-gradient-to-r from-brand-primary to-purple-600 shadow-lg shadow-brand-primary/20 hover:from-brand-primary/90 hover:to-purple-600/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="mt-2 text-center text-xs" style={{ color: 'var(--muted-soft)' }}>
            Enter to send • Shift+Enter for new line
          </p>
        </div>
      </>
    </div>
  );
}
