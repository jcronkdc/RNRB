'use client';

/**
 * AI WORKSPACE CHAT
 * 
 * A beautiful conversational interface for creating workspaces with natural language.
 * Features:
 * - Floating button with sparkle effect
 * - Conversational chat interface
 * - Preview cards for workspace suggestions
 * - Smooth animations with Framer Motion
 * - Template gallery for quick creation
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@cronkwaters/ui';
import {
  Sparkles,
  Minus,
  Send,
  Loader2,
  ChevronRight,
  Wand2,
  Plus,
  Music4,
  Mic2,
  Users,
  Globe,
  Briefcase,
  Target,
  GraduationCap,
  FlaskConical,
  Radio,
  MapPin,
  ListMusic,
  ShoppingBag,
  Headphones,
} from '@/components/ui/custom-icons';
import { useWorkspace } from './workspace-context';
import { WORKSPACE_TEMPLATES, type WorkspaceTemplate } from './workspace-templates';
import { getToolByKey } from './tool-catalog';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  music: Music4,
  mic: Mic2,
  studio: Headphones,
  map: MapPin,
  list: ListMusic,
  users: Users,
  globe: Globe,
  briefcase: Briefcase,
  bag: ShoppingBag,
  target: Target,
  graduation: GraduationCap,
  flask: FlaskConical,
  radio: Radio,
  sparkles: Sparkles,
  layout: Sparkles,
};

// Preview card for workspace suggestions
interface WorkspacePreview {
  name: string;
  icon: string;
  tools: string[];
  gradient?: string;
  description?: string;
  matchedTemplate?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  previews?: WorkspacePreview[];
  suggestions?: string[];
  requiresConfirmation?: boolean;
  timestamp: Date;
}

// Suggested prompts for users
const SUGGESTED_PROMPTS = [
  { text: 'Create a songwriting workspace', icon: Music4 },
  { text: 'Set up my tour management area', icon: MapPin },
  { text: 'Build a collaboration hub', icon: Users },
  { text: 'What workspace should I use?', icon: Sparkles },
];

export function AIWorkspaceChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<WorkspacePreview | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { createWorkspace, addToolToWorkspace, workspaces, setActiveWorkspace } = useWorkspace();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Send message to AI
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setSelectedPreview(null);

    try {
      // Get existing workspaces for context
      const existingWorkspaces = workspaces.map(w => ({
        id: w.id,
        name: w.name,
        tools: w.tools.map(t => t.toolKey),
      }));

      const response = await fetch('/api/assistant/workspace-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          existingWorkspaces,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.response || 'I had trouble understanding that. Try asking me to create a workspace!',
        previews: data.previews || (data.preview ? [data.preview] : undefined),
        suggestions: data.suggestions,
        requiresConfirmation: data.requiresConfirmation,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('AI Workspace Builder error:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "Oops! Something went wrong. Try again with something like 'Create a songwriting workspace'.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, workspaces]);

  // Create workspace from preview
  const handleCreateFromPreview = useCallback(async (preview: WorkspacePreview) => {
    setIsLoading(true);
    
    try {
      // Create the workspace
      const workspace = await createWorkspace(preview.name, preview.icon);
      
      // Add all the tools
      for (const toolKey of preview.tools) {
        await addToolToWorkspace(workspace.id, toolKey);
      }

      // Switch to the new workspace
      setActiveWorkspace(workspace.id);

      // Success message with edit hint
      const successMessage: Message = {
        id: `msg-${Date.now()}-success`,
        role: 'assistant',
        content: `Done! Your "${preview.name}" workspace is ready with ${preview.tools.length} tools.\n\nYour new tab is now active! Click the "Edit" button in the workspace header to customize it - you can add more tools, remove ones you don't need, or rearrange them.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, successMessage]);
      setSelectedPreview(null);

      // Minimize after a moment so user can see their new workspace
      setTimeout(() => {
        setIsMinimized(true);
      }, 2500);

    } catch (error) {
      console.error('Failed to create workspace:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "Failed to create the workspace. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [createWorkspace, addToolToWorkspace, setActiveWorkspace]);

  // Create from template
  const handleCreateFromTemplate = useCallback(async (template: WorkspaceTemplate) => {
    setShowTemplates(false);
    
    const preview: WorkspacePreview = {
      name: template.name,
      icon: template.icon,
      tools: template.tools,
      gradient: template.gradient,
      description: template.description,
      matchedTemplate: template.id,
    };

    // Show preview message
    const previewMessage: Message = {
      id: `msg-${Date.now()}-preview`,
      role: 'assistant',
      content: `Here's the "${template.name}" workspace - ${template.description}`,
      previews: [preview],
      requiresConfirmation: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, previewMessage]);
    setSelectedPreview(preview);
  }, []);

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Reset chat
  const handleReset = () => {
    setMessages([]);
    setSelectedPreview(null);
    setShowTemplates(false);
  };

  // Handle minimize toggle
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Handle expand (when clicking minimized button)
  const handleExpand = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };

  // Minimized state - just an icon button (cannot close completely)
  if (!isOpen || isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExpand}
        className={cn(
          'fixed bottom-24 right-6 z-40',
          'flex items-center gap-2 rounded-full',
          'font-semibold shadow-lg',
          'gradient-btn bg-gradient-to-r from-violet-600 to-purple-600',
          'hover:shadow-xl hover:shadow-purple-500/30',
          'transition-shadow duration-300',
          // Show compact version when minimized (just icon), full when not open yet
          isMinimized ? 'p-3' : 'px-4 py-3'
        )}
        title="AI Workspace Builder"
      >
        <Wand2 className="h-5 w-5" />
        {!isMinimized && <span>AI Workspace Builder</span>}
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
      </motion.button>
    );
  }

  // Chat panel (open state)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-[440px] max-w-[calc(100vw-2rem)]',
        'rounded-2xl shadow-2xl overflow-hidden',
        'flex flex-col',
        'h-[600px] max-h-[calc(100vh-4rem)]'
      )}
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30">
            <Wand2 className="h-5 w-5 text-white" />
            <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2" style={{ borderColor: 'var(--panel)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              AI Workspace Builder
            </h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {isLoading ? 'Creating magic...' : 'Describe your ideal workspace'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="px-2 py-1 rounded-lg text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              New
            </button>
          )}
          <button
            onClick={handleMinimize}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            style={{ color: 'var(--muted)' }}
            title="Minimize to icon"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty state */}
        {messages.length === 0 && !showTemplates && (
          <div className="flex flex-col h-full">
            {/* Welcome */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <h4 className="mb-1 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                Build Your Perfect Workspace
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Tell me what you need, and I'll create a custom workspace for you!
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Try saying
              </p>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => sendMessage(prompt.text)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm',
                    'hover:bg-black/5 dark:hover:bg-white/5 transition-all group'
                  )}
                  style={{ border: '1px solid var(--border)' }}
                >
                  <prompt.icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text)' }}>{prompt.text}</span>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--muted)' }} />
                </motion.button>
              ))}
            </div>

            {/* Browse templates button */}
            <button
              onClick={() => setShowTemplates(true)}
              className={cn(
                'mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl',
                'font-medium transition-all',
                'hover:scale-[1.02]'
              )}
              style={{
                background: 'linear-gradient(135deg, var(--accent-dim) 0%, rgba(139, 92, 246, 0.2) 100%)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Browse Templates
            </button>
          </div>
        )}

        {/* Template gallery */}
        {showTemplates && messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold" style={{ color: 'var(--text)' }}>
                Workspace Templates
              </h4>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-sm hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Back
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {WORKSPACE_TEMPLATES.slice(0, 8).map((template, i) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleCreateFromTemplate(template)}
                  className={cn(
                    'p-3 rounded-xl text-left transition-all',
                    'hover:scale-[1.02] hover:shadow-lg group'
                  )}
                  style={{
                    background: `linear-gradient(135deg, var(--panel) 0%, rgba(139, 92, 246, 0.05) 100%)`,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
                    `bg-gradient-to-br ${template.gradient}`
                  )}>
                    {(() => {
                      const Icon = ICON_MAP[template.icon] || Sparkles;
                      return <Icon className="h-4 w-4 text-white" />;
                    })()}
                  </div>
                  <p className="font-medium text-sm mb-0.5" style={{ color: 'var(--text)' }}>
                    {template.name}
                  </p>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>
                    {template.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={cn(
                'max-w-[90%] space-y-3',
                message.role === 'user' ? 'text-right' : 'text-left'
              )}>
                {/* Message bubble */}
                <div
                  className={cn(
                    'inline-block rounded-2xl px-4 py-3 text-sm',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                      : ''
                  )}
                  style={message.role === 'assistant' ? {
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  } : undefined}
                >
                  {message.content}
                </div>

                {/* Preview cards */}
                {message.previews && message.previews.length > 0 && (
                  <div className="space-y-2">
                    {message.previews.map((preview, i) => (
                      <WorkspacePreviewCard
                        key={i}
                        preview={preview}
                        isSelected={selectedPreview?.name === preview.name}
                        onSelect={() => setSelectedPreview(preview)}
                        onCreate={() => handleCreateFromPreview(preview)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(suggestion)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium hover:scale-105 transition-transform"
                        style={{
                          background: 'var(--accent-dim)',
                          color: 'var(--accent)',
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && !selectedPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div 
              className="px-4 py-3 rounded-2xl"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--accent)' }} />
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                  Crafting your workspace...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div 
        className="p-3"
        style={{ 
          borderTop: '1px solid var(--border)',
          background: 'var(--panel-hover)',
        }}
      >
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your ideal workspace..."
            className={cn(
              'flex-1 resize-none rounded-xl px-4 py-3',
              'text-sm',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
              'max-h-24'
            )}
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className={cn(
              'flex-shrink-0 p-3 rounded-xl transition-all',
              'bg-gradient-to-r from-violet-500 to-purple-600 text-white',
              'hover:shadow-lg hover:shadow-purple-500/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'hover:scale-105 active:scale-95'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-xs" style={{ color: 'var(--muted)' }}>
          Press Enter to send
        </p>
      </div>
    </motion.div>
  );
}

// Workspace preview card component
function WorkspacePreviewCard({
  preview,
  isSelected,
  onSelect,
  onCreate,
  isLoading,
}: {
  preview: WorkspacePreview;
  isSelected: boolean;
  onSelect: () => void;
  onCreate: () => void;
  isLoading: boolean;
}) {
  const Icon = ICON_MAP[preview.icon] || Sparkles;
  const gradient = preview.gradient || 'from-violet-500 to-purple-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-xl overflow-hidden transition-all cursor-pointer',
        isSelected ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''
      )}
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      }}
      onClick={onSelect}
    >
      {/* Header with gradient */}
      <div className={cn(
        'px-4 py-3 flex items-center gap-3',
        `bg-gradient-to-r ${gradient}`
      )}>
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{preview.name}</h4>
          <p className="text-xs text-white/80 truncate">
            {preview.tools.length} tools included
          </p>
        </div>
      </div>

      {/* Tools */}
      <div className="p-3">
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
          Includes:
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {preview.tools.slice(0, 6).map((toolKey) => {
            const tool = getToolByKey(toolKey);
            return (
              <span
                key={toolKey}
                className="px-2 py-1 rounded-md text-xs"
                style={{ background: 'var(--accent-dim)', color: 'var(--text-secondary)' }}
              >
                {tool?.label || toolKey}
              </span>
            );
          })}
          {preview.tools.length > 6 && (
            <span 
              className="px-2 py-1 rounded-md text-xs"
              style={{ color: 'var(--muted)' }}
            >
              +{preview.tools.length - 6} more
            </span>
          )}
        </div>

        {/* Create button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreate();
          }}
          disabled={isLoading}
          className={cn(
            'w-full py-2.5 rounded-xl font-semibold text-sm',
            'flex items-center justify-center gap-2',
            'transition-all',
            'bg-gradient-to-r from-violet-500 to-purple-600 text-white',
            'hover:shadow-lg hover:shadow-purple-500/30',
            'hover:scale-[1.02] active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create This Workspace
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

