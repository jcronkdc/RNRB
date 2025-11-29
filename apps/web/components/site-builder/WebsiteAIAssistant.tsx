'use client';

import {
  Bot,
  Send,
  X,
  Sparkles,
  Lightbulb,
  Palette,
  Layout,
  Type,
  Image,
  Music,
  Calendar,
  Mail,
  Globe,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Wand2,
  Zap,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: AIAction[];
}

interface AIAction {
  type: 'apply_theme' | 'add_section' | 'update_content' | 'navigate';
  label: string;
  payload: Record<string, unknown>;
}

interface WebsiteAIAssistantProps {
  siteId: string;
  siteName?: string;
  currentSection?: string;
  onApplyTheme?: (theme: Record<string, unknown>) => void;
  onAddSection?: (sectionType: string) => void;
  onUpdateContent?: (sectionId: string, content: Record<string, unknown>) => void;
  onNavigate?: (tab: string) => void;
}

const QUICK_PROMPTS = [
  {
    icon: Palette,
    label: 'Change my color scheme',
    prompt: 'I want to change my website colors. What options do you recommend?',
  },
  {
    icon: Layout,
    label: 'Add a new section',
    prompt: 'What sections should I add to make my website more engaging?',
  },
  {
    icon: Type,
    label: 'Improve my bio',
    prompt: 'Help me write a compelling artist bio for my website.',
  },
  {
    icon: Image,
    label: 'Photo gallery tips',
    prompt: 'What are the best practices for my photo gallery section?',
  },
  {
    icon: Music,
    label: 'Music integration',
    prompt: 'How do I best showcase my music on my website?',
  },
  {
    icon: Calendar,
    label: 'Tour dates setup',
    prompt: 'Help me set up my tour dates section effectively.',
  },
  {
    icon: Mail,
    label: 'Grow my mailing list',
    prompt: 'What strategies can help me grow my mailing list?',
  },
  {
    icon: Globe,
    label: 'SEO optimization',
    prompt: 'How can I improve my website SEO to get more fans?',
  },
];

const SYSTEM_CONTEXT = `You are an expert website design assistant for musicians and artists using CronkWaters. 
You help users build beautiful, professional websites for their music careers.

Your capabilities:
- Suggest color schemes and themes that match the artist's genre/vibe
- Recommend which sections to add (hero, bio, music player, tour dates, merch, contact, etc.)
- Help write compelling copy for bios, descriptions, and CTAs
- Provide SEO tips specific to musicians
- Guide users through the website builder features
- Suggest best practices for showcasing music, photos, and videos

Available section types:
- hero_image, hero_video, hero_slideshow, hero_animated, hero_split
- video_hero (YouTube/Vimeo backgrounds)
- streaming (Spotify, Apple Music, SoundCloud links)
- photo_gallery
- music_player, discography
- tour_dates, tour_map
- bio_full, bio_split, band_members, timeline, achievements
- contact_form, booking
- mailing_list
- merch_store
- social_links
- header, footer

Available themes: noir (dark/elegant), vinyl (warm/vintage), neon (cyberpunk), acoustic (light/organic), arena (bold/dramatic), editorial (minimal/clean), outlaw (country/western), futura (modern/sleek)

When suggesting actions, be specific and actionable. Format responses in a friendly, encouraging tone.
Use markdown for formatting when helpful.`;

export function WebsiteAIAssistant({
  siteId,
  siteName,
  currentSection,
  onApplyTheme,
  onAddSection,
  onUpdateContent,
  onNavigate,
}: WebsiteAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey there! 👋 I'm your AI website assistant. I'm here to help you build an amazing website for ${siteName || 'your music'}.\n\nI can help you with:\n- 🎨 Choosing colors and themes\n- 📝 Writing compelling content\n- 🎵 Showcasing your music\n- 📈 Growing your audience\n\nWhat would you like to work on?`,
      timestamp: new Date(),
      suggestions: ['Help me choose a theme', 'What sections should I add?', 'Write my artist bio'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickPrompts(false);

    try {
      const response = await fetch('/api/ai/website-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          siteId,
          siteName,
          currentSection,
          systemContext: SYSTEM_CONTEXT,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        actions: data.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or check out our help guides for immediate assistance.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: AIAction) => {
    switch (action.type) {
      case 'apply_theme':
        onApplyTheme?.(action.payload as Record<string, unknown>);
        break;
      case 'add_section':
        onAddSection?.(action.payload.sectionType as string);
        break;
      case 'update_content':
        onUpdateContent?.(
          action.payload.sectionId as string,
          action.payload.content as Record<string, unknown>
        );
        break;
      case 'navigate':
        onNavigate?.(action.payload.tab as string);
        break;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        }}
        title="AI Website Assistant"
      >
        <Bot size={24} className="text-white" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
          <Sparkles size={12} />
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all ${
        isMinimized ? 'h-14 w-80' : 'h-[600px] w-[420px]'
      }`}
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className="flex flex-shrink-0 cursor-pointer items-center justify-between px-4 py-3"
        style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Website Assistant</h3>
            {!isMinimized && <p className="text-xs text-white/80">Powered by CronkWaters AI</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ background: 'var(--bg)' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}
                  style={{
                    background:
                      message.role === 'user'
                        ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
                        : 'var(--panel)',
                    color: message.role === 'user' ? '#fff' : 'var(--text)',
                    border: message.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {/* Message content with markdown-like rendering */}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content.split('\n').map((line, i) => {
                      // Bold text
                      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      // Bullet points
                      if (line.startsWith('- ')) {
                        return (
                          <div key={i} className="ml-2 flex gap-2">
                            <span>•</span>
                            <span dangerouslySetInnerHTML={{ __html: boldLine.slice(2) }} />
                          </div>
                        );
                      }
                      return <p key={i} dangerouslySetInnerHTML={{ __html: boldLine }} />;
                    })}
                  </div>

                  {/* Copy button for assistant messages */}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="absolute -right-2 -top-2 rounded-full p-1.5 opacity-0 transition-all group-hover:opacity-100"
                      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                    >
                      {copiedId === message.id ? (
                        <Check size={12} className="text-green-400" />
                      ) : (
                        <Copy size={12} style={{ color: 'var(--muted)' }} />
                      )}
                    </button>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
                          style={{
                            background: 'var(--accent)',
                            color: '#fff',
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleAction(action)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
                          style={{
                            background: 'var(--accent)',
                            color: '#fff',
                          }}
                        >
                          <Wand2 size={14} />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-2 rounded-2xl rounded-bl-md px-4 py-3"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {showQuickPrompts && (
            <div
              className="flex-shrink-0 border-t px-4 py-3"
              style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb size={14} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  Quick Actions
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.prompt)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all hover:scale-[1.02]"
                    style={{
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <prompt.icon size={14} style={{ color: 'var(--accent)' }} />
                    <span className="truncate">{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div
            className="flex flex-shrink-0 items-end gap-2 border-t p-4"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your website..."
              rows={1}
              className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl px-4 py-2.5 text-sm"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
                  : 'var(--bg)',
                color: input.trim() ? '#fff' : 'var(--muted)',
                border: input.trim() ? 'none' : '1px solid var(--border)',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Standalone help button component for contextual help
export function AIHelpButton({
  context,
  onAsk,
}: {
  context: string;
  onAsk: (question: string) => void;
}) {
  return (
    <button
      onClick={() => onAsk(`Help me with ${context}`)}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-all hover:scale-105"
      style={{
        background: 'var(--accent)',
        opacity: 0.8,
        color: '#fff',
      }}
      title={`Get AI help with ${context}`}
    >
      <Zap size={12} />
      AI Help
    </button>
  );
}
