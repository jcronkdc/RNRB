'use client';

import {
  Wand2,
  X,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  PenTool,
  FileText,
  Mail,
  Search,
  MessageSquare,
  Megaphone,
  Music,
  Users,
  Star,
  Zap,
  ChevronRight,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface AIContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string, field?: string) => void;
  siteName?: string;
  genre?: string;
  context?: {
    currentSection?: string;
    existingContent?: string;
  };
}

type ContentType =
  | 'bio_short'
  | 'bio_long'
  | 'press_release'
  | 'social_post'
  | 'email_newsletter'
  | 'seo_description'
  | 'tagline'
  | 'cta_button'
  | 'about_section'
  | 'tour_announcement';

interface ContentTemplate {
  id: ContentType;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'bio' | 'marketing' | 'seo' | 'social';
  fields?: {
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'textarea' | 'select';
    options?: string[];
  }[];
}

const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'bio_short',
    name: 'Short Bio',
    description: '2-3 sentences for social media and quick intros',
    icon: PenTool,
    category: 'bio',
    fields: [
      { key: 'name', label: 'Artist/Band Name', placeholder: 'The Midnight' },
      { key: 'genre', label: 'Genre', placeholder: 'Synthwave, Electronic' },
      { key: 'location', label: 'Location', placeholder: 'Los Angeles, CA' },
      {
        key: 'highlights',
        label: 'Key Highlights',
        placeholder: '1M streams, toured with...',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'bio_long',
    name: 'Full Bio',
    description: 'Complete artist biography for press and website',
    icon: FileText,
    category: 'bio',
    fields: [
      { key: 'name', label: 'Artist/Band Name', placeholder: 'The Midnight' },
      { key: 'genre', label: 'Genre', placeholder: 'Synthwave, Electronic' },
      {
        key: 'origin_story',
        label: 'Origin Story',
        placeholder: 'How did you start?',
        type: 'textarea',
      },
      { key: 'influences', label: 'Influences', placeholder: 'Depeche Mode, New Order...' },
      {
        key: 'achievements',
        label: 'Achievements',
        placeholder: 'Awards, streams, tours...',
        type: 'textarea',
      },
      { key: 'current_project', label: 'Current Project', placeholder: 'Working on new album...' },
    ],
  },
  {
    id: 'press_release',
    name: 'Press Release',
    description: 'Professional announcement for media outlets',
    icon: Megaphone,
    category: 'marketing',
    fields: [
      { key: 'name', label: 'Artist/Band Name', placeholder: 'The Midnight' },
      {
        key: 'announcement',
        label: 'What are you announcing?',
        placeholder: 'New album, tour, single...',
        type: 'textarea',
      },
      { key: 'release_date', label: 'Release/Event Date', placeholder: 'March 15, 2024' },
      {
        key: 'quotes',
        label: 'Artist Quote (optional)',
        placeholder: 'What the artist says about it...',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'social_post',
    name: 'Social Media Post',
    description: 'Engaging posts for Instagram, Twitter, etc.',
    icon: MessageSquare,
    category: 'social',
    fields: [
      {
        key: 'platform',
        label: 'Platform',
        placeholder: 'Instagram',
        type: 'select',
        options: ['Instagram', 'Twitter/X', 'Facebook', 'TikTok'],
      },
      {
        key: 'topic',
        label: 'What is this about?',
        placeholder: 'New single, behind the scenes, tour announcement...',
      },
      {
        key: 'tone',
        label: 'Tone',
        placeholder: 'Excited',
        type: 'select',
        options: ['Excited', 'Casual', 'Professional', 'Mysterious', 'Grateful'],
      },
      {
        key: 'include_cta',
        label: 'Call to Action',
        placeholder: 'Link in bio, pre-save, tickets...',
      },
    ],
  },
  {
    id: 'email_newsletter',
    name: 'Email Newsletter',
    description: 'Engaging email for your mailing list',
    icon: Mail,
    category: 'marketing',
    fields: [
      { key: 'subject', label: 'Email Subject', placeholder: 'Big news from the studio...' },
      {
        key: 'main_content',
        label: 'Main Message',
        placeholder: 'What do you want to share?',
        type: 'textarea',
      },
      { key: 'cta', label: 'Call to Action', placeholder: 'Pre-save the album, get tickets...' },
    ],
  },
  {
    id: 'seo_description',
    name: 'SEO Meta Description',
    description: 'Optimized description for search engines',
    icon: Search,
    category: 'seo',
    fields: [
      { key: 'name', label: 'Artist/Band Name', placeholder: 'The Midnight' },
      { key: 'genre', label: 'Genre', placeholder: 'Synthwave' },
      { key: 'location', label: 'Location', placeholder: 'Los Angeles' },
      {
        key: 'keywords',
        label: 'Keywords to include',
        placeholder: 'synthwave, electronic, 80s...',
      },
    ],
  },
  {
    id: 'tagline',
    name: 'Tagline / Slogan',
    description: 'Catchy one-liner for your brand',
    icon: Sparkles,
    category: 'marketing',
    fields: [
      { key: 'name', label: 'Artist/Band Name', placeholder: 'The Midnight' },
      { key: 'vibe', label: 'Describe your vibe', placeholder: 'Nostalgic, dreamy, energetic...' },
      { key: 'genre', label: 'Genre', placeholder: 'Synthwave' },
    ],
  },
  {
    id: 'tour_announcement',
    name: 'Tour Announcement',
    description: 'Exciting tour/show announcement',
    icon: Music,
    category: 'marketing',
    fields: [
      { key: 'name', label: 'Artist/Band Name', placeholder: 'The Midnight' },
      { key: 'tour_name', label: 'Tour Name (optional)', placeholder: 'The Neon Dreams Tour' },
      {
        key: 'cities',
        label: 'Cities/Venues',
        placeholder: 'LA, NYC, Chicago, Austin...',
        type: 'textarea',
      },
      { key: 'dates', label: 'Date Range', placeholder: 'March - May 2024' },
      { key: 'ticket_info', label: 'Ticket Info', placeholder: 'On sale Friday at 10am...' },
    ],
  },
];

const CATEGORY_LABELS = {
  bio: { label: 'Bios & About', icon: Users },
  marketing: { label: 'Marketing', icon: Megaphone },
  seo: { label: 'SEO', icon: Search },
  social: { label: 'Social Media', icon: MessageSquare },
};

export function AIContentGenerator({
  isOpen,
  onClose,
  onInsert,
  siteName,
  genre,
  context,
}: AIContentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          formData: {
            ...formData,
            siteName: formData.name || siteName,
            genre: formData.genre || genre,
          },
          context,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (error) {
      console.error('Content generation error:', error);
      setGeneratedContent('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    onInsert(generatedContent);
    onClose();
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const filteredTemplates = activeCategory
    ? CONTENT_TEMPLATES.filter((t) => t.category === activeCategory)
    : CONTENT_TEMPLATES;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="presentation"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="flex h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-content-generator-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        {/* Left Panel - Template Selection */}
        <div
          className="w-80 shrink-0 overflow-y-auto"
          style={{ borderRight: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-4" style={{ background: 'var(--panel)' }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-pink-500">
                  <Wand2 size={20} className="text-white" />
                </div>
                <div>
                  <h2
                    id="ai-content-generator-title"
                    className="font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    AI Content Generator
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Create professional content instantly
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                style={{ color: 'var(--muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === null ? 'bg-orange-500 text-white' : 'bg-white/10'
                }`}
                style={{ color: activeCategory === null ? undefined : 'var(--text)' }}
              >
                All
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === key ? 'bg-orange-500 text-white' : 'bg-white/10'
                  }`}
                  style={{ color: activeCategory === key ? undefined : 'var(--text)' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Template List */}
          <div className="space-y-2 p-4 pt-0">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setFormData({});
                  setGeneratedContent('');
                }}
                className={`flex w-full items-start gap-3 rounded-xl p-4 text-left transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'bg-orange-500/20 ring-1 ring-orange-500'
                    : 'hover:bg-white/5'
                }`}
                style={{
                  background: selectedTemplate?.id === template.id ? undefined : 'var(--bg)',
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background:
                      selectedTemplate?.id === template.id ? 'var(--accent)' : 'var(--panel)',
                  }}
                >
                  <template.icon
                    size={18}
                    style={{
                      color: selectedTemplate?.id === template.id ? '#fff' : 'var(--accent)',
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                    {template.name}
                  </h4>
                  <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                    {template.description}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Form & Output */}
        <div className="flex flex-1 flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
          {selectedTemplate ? (
            <>
              {/* Form Header */}
              <div className="shrink-0 p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-pink-500">
                    <selectedTemplate.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {selectedTemplate.fields?.map((field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={`field-${field.key}`}
                        className="mb-2 block text-sm font-medium"
                        style={{ color: 'var(--text)' }}
                      >
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          id={`field-${field.key}`}
                          value={formData[field.key] || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, [field.key]: e.target.value })
                          }
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full rounded-xl px-4 py-3"
                          style={{
                            background: 'var(--panel)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                          }}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          id={`field-${field.key}`}
                          value={formData[field.key] || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, [field.key]: e.target.value })
                          }
                          className="w-full rounded-xl px-4 py-3"
                          style={{
                            background: 'var(--panel)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`field-${field.key}`}
                          type="text"
                          value={formData[field.key] || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, [field.key]: e.target.value })
                          }
                          placeholder={field.placeholder}
                          className="w-full rounded-xl px-4 py-3"
                          style={{
                            background: 'var(--panel)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                          }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                      color: '#fff',
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate Content
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Content */}
                {generatedContent && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                        Generated Content
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRegenerate}
                          disabled={isGenerating}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
                          style={{ color: 'var(--muted)' }}
                        >
                          <RefreshCw size={14} />
                          Regenerate
                        </button>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
                          style={{ color: copied ? 'var(--accent)' : 'var(--muted)' }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div
                      className="rounded-xl p-4 leading-relaxed"
                      style={{
                        background: 'var(--panel)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <p className="whitespace-pre-wrap">{generatedContent}</p>
                    </div>

                    {/* Insert Button */}
                    <button
                      onClick={handleInsert}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all hover:scale-[1.02]"
                      style={{
                        background: 'var(--accent)',
                        color: '#fff',
                      }}
                    >
                      <Zap size={18} />
                      Insert into Website
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                }}
              >
                <Wand2 size={40} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
                Select a Template
              </h3>
              <p className="max-w-md" style={{ color: 'var(--muted)' }}>
                Choose a content type from the left panel to get started. Our AI will help you
                create professional content in seconds.
              </p>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                  { icon: Star, label: 'Pro Quality', value: '100%' },
                  { icon: Zap, label: 'Generation Time', value: '<5s' },
                  { icon: Users, label: 'Artists Served', value: '10K+' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <stat.icon
                      size={24}
                      className="mx-auto mb-2"
                      style={{ color: 'var(--accent)' }}
                    />
                    <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                      {stat.value}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
