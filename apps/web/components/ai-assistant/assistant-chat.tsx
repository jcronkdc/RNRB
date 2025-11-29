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
        'rounded-lg border border-border bg-background shadow-2xl',
        'flex flex-col',
        isMinimized ? 'h-14' : 'h-[600px] max-h-[calc(100vh-2rem)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="text-primary h-5 w-5" />
            <div className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleMinimize} className="h-8 w-8">
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Sparkles className="text-primary h-8 w-8" />
                </div>
                <h4 className="mb-2 font-semibold">Welcome to AI Assistant!</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  I'm here to help you navigate CronkWaters and answer any questions.
                </p>
                <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-left text-xs">
                  <p className="font-medium">💬 Ask me about:</p>
                  <ul className="space-y-1 text-muted-foreground">
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
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="mb-1 flex items-center gap-1">
                      <Sparkles className="text-primary h-3 w-3" />
                      <span className="text-primary text-xs font-medium">AI Assistant</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="bg-primary/60 h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="bg-primary/60 h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="bg-primary/60 h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-destructive/10 text-destructive border-destructive/20 max-w-[85%] rounded-lg border px-3 py-2 text-sm">
                  <p className="mb-1 font-medium">⚠️ Error</p>
                  <p className="text-xs">{error}</p>
                  {error.includes('Upgrade') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
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
          <div className="border-t border-border p-3">
            {messages.length > 0 && (
              <div className="mb-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="h-auto py-1 text-xs text-muted-foreground"
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
                  'flex-1 resize-none rounded-md px-3 py-2',
                  'bg-muted text-sm',
                  'border-input border',
                  'focus:ring-primary focus:outline-none focus:ring-2',
                  'placeholder:text-muted-foreground',
                  'max-h-32'
                )}
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  );
}
