'use client';

import { Button, cn } from '@cronkwaters/ui';
import { X, Minus, Send, Sparkles, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { useAssistant } from '@/hooks/use-assistant';

export function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, sendMessage, reset } = useAssistant({
    onError: (err) => {
      console.error('Assistant error:', err);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'flex items-center gap-2',
          'rounded-full px-4 py-3',
          'bg-primary text-primary-foreground',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-200',
          'hover:scale-105 active:scale-95',
          'group'
        )}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-5 w-5 group-hover:animate-spin" />
        <span className="font-medium">AI Assistant</span>
      </button>
    );
  }

  // Chat widget
  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-[400px] max-w-[calc(100vw-2rem)]',
        'rounded-xl border-2 border-zinc-700/80 bg-zinc-900/95 shadow-2xl backdrop-blur-sm',
        'flex flex-col',
        'ring-1 ring-white/5',
        isMinimized ? 'h-14' : 'h-[600px] max-h-[calc(100vh-2rem)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-xl border-b border-zinc-700/50 bg-gradient-to-r from-zinc-800/80 to-zinc-800/60 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary/20 to-purple-500/20">
            <Sparkles className="h-5 w-5 text-brand-primary" />
            <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-zinc-800 bg-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-zinc-400">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMinimize}
            className="h-8 w-8 text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-900/50 p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary/20 to-purple-500/20">
                  <Sparkles className="h-8 w-8 text-brand-primary" />
                </div>
                <h4 className="mb-2 font-semibold text-white">Welcome to AI Assistant!</h4>
                <p className="mb-4 text-sm text-zinc-400">
                  I'm here to help you navigate CronkWaters and answer any questions.
                </p>
                <div className="space-y-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4 text-left text-xs">
                  <p className="font-medium text-zinc-200">💬 Ask me about:</p>
                  <ul className="space-y-1.5 text-zinc-400">
                    <li>• Navigating features</li>
                    <li>• Creating songs & projects</li>
                    <li>• Collaboration tips</li>
                    <li>• Copyright & splits</li>
                    <li>• Troubleshooting issues</li>
                  </ul>
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
                    'max-w-[85%] rounded-xl px-4 py-2.5 text-sm shadow-sm',
                    message.role === 'user'
                      ? 'bg-brand-primary text-white'
                      : 'border border-zinc-700/50 bg-zinc-800 text-zinc-100'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-brand-primary" />
                      <span className="text-xs font-medium text-brand-primary">AI Assistant</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl border border-zinc-700/50 bg-zinc-800 px-4 py-3 text-sm shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-brand-primary"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-brand-primary"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-brand-primary"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="max-w-[85%] rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <p className="mb-1 font-medium">⚠️ Error</p>
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
          <div className="border-t border-zinc-700/50 bg-zinc-800/50 p-3">
            {messages.length > 0 && (
              <div className="mb-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="h-auto py-1 text-xs text-zinc-400 hover:text-white"
                >
                  <MessageSquare className="mr-1 h-3 w-3" />
                  New conversation
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
                  'flex-1 resize-none rounded-lg px-3 py-2.5',
                  'bg-zinc-900 text-sm text-white',
                  'border-2 border-zinc-700',
                  'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
                  'placeholder:text-zinc-500',
                  'max-h-32'
                )}
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="shrink-0 bg-brand-primary hover:bg-brand-primary/80"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-zinc-500">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  );
}
