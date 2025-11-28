'use client';

import { useState } from 'react';
import { Palette, Check, Eye, Sparkles, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'dark' | 'light';
  previewImage?: string;
  colors: {
    primary: string;
    accent: string;
    text: string;
  };
}

const templates: Template[] = [
  {
    id: 'noir',
    name: 'NOIR',
    description: 'Cinematic dark theme with dramatic red accents',
    category: 'dark',
    colors: { primary: '#000000', accent: '#ff6347', text: '#ffffff' },
  },
  {
    id: 'vinyl',
    name: 'VINYL',
    description: 'Retro record store vibe with warm browns',
    category: 'dark',
    colors: { primary: '#2d1b0e', accent: '#d4a574', text: '#f5e6d3' },
  },
  {
    id: 'neon',
    name: 'NEON',
    description: 'Cyberpunk glow with electric cyan',
    category: 'dark',
    colors: { primary: '#0a0a0a', accent: '#00ffff', text: '#ffffff' },
  },
  {
    id: 'acoustic',
    name: 'ACOUSTIC',
    description: 'Warm, organic feel with natural tones',
    category: 'light',
    colors: { primary: '#f5f0e8', accent: '#8b6914', text: '#2c2416' },
  },
  {
    id: 'arena',
    name: 'ARENA',
    description: 'Stadium energy with bold pink accents',
    category: 'dark',
    colors: { primary: '#1a1a2e', accent: '#e94560', text: '#ffffff' },
  },
  {
    id: 'editorial',
    name: 'EDITORIAL',
    description: 'Gallery minimal with clean contrast',
    category: 'light',
    colors: { primary: '#ffffff', accent: '#000000', text: '#1a1a1a' },
  },
  {
    id: 'outlaw',
    name: 'OUTLAW',
    description: 'Weathered americana with gold accents',
    category: 'dark',
    colors: { primary: '#1c1610', accent: '#c9a962', text: '#e8dcc8' },
  },
  {
    id: 'futura',
    name: 'FUTURA',
    description: 'Chrome & glass with silver highlights',
    category: 'dark',
    colors: { primary: '#0d0d0d', accent: '#c0c0c0', text: '#ffffff' },
  },
];

interface TemplateSwitcherProps {
  currentTemplateId: string;
  currentTheme?: Record<string, unknown>;
  onTemplateChange: (templateId: string, keepTheme: boolean) => Promise<void>;
}

export function TemplateSwitcher({
  currentTemplateId,
  currentTheme,
  onTemplateChange,
}: TemplateSwitcherProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplateId);
  const [isChanging, setIsChanging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [keepCustomTheme, setKeepCustomTheme] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'dark' | 'light'>('all');

  const hasCustomTheme = currentTheme && Object.keys(currentTheme).length > 0;

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === currentTemplateId) return;
    setSelectedTemplate(templateId);
    setShowConfirm(true);
  };

  const handleConfirmChange = async () => {
    setIsChanging(true);
    try {
      await onTemplateChange(selectedTemplate, keepCustomTheme);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to change template:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancelChange = () => {
    setSelectedTemplate(currentTemplateId);
    setShowConfirm(false);
    setKeepCustomTheme(false);
  };

  const filteredTemplates =
    filterCategory === 'all' ? templates : templates.filter((t) => t.category === filterCategory);

  const currentTemplate = templates.find((t) => t.id === currentTemplateId);
  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Current Template */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Current Template
          </h3>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Check size={14} />
            Active
          </div>
        </div>

        {currentTemplate && (
          <div className="flex items-start gap-4">
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: currentTemplate.colors.primary }}
            >
              <div
                className="h-12 w-12 rounded-full"
                style={{ background: currentTemplate.colors.accent }}
              />
            </div>
            <div className="flex-1">
              <h4 className="mb-1 text-xl font-bold uppercase" style={{ color: 'var(--text)' }}>
                {currentTemplate.name}
              </h4>
              <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                {currentTemplate.description}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {Object.values(currentTemplate.colors).map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border-2"
                      style={{ backgroundColor: color, borderColor: 'var(--bg)' }}
                      title={color}
                    />
                  ))}
                </div>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {currentTemplate.category === 'dark' ? '🌙 Dark Theme' : '☀️ Light Theme'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Gallery */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Switch Template
          </h3>
          {/* Category Filter */}
          <div
            className="flex rounded-lg p-1"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            {(['all', 'dark', 'light'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`rounded px-3 py-1 text-sm font-medium capitalize transition-colors ${
                  filterCategory === category ? 'bg-white/10' : ''
                }`}
                style={{
                  color: filterCategory === category ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const isActive = template.id === currentTemplateId;
            const isSelected = template.id === selectedTemplate;

            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                disabled={isActive}
                className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:scale-[1.02] disabled:cursor-default disabled:hover:scale-100 ${
                  isSelected && !isActive ? 'ring-2' : ''
                }`}
                style={
                  {
                    background: 'var(--panel)',
                    border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
                    '--tw-ring-color': 'var(--accent)',
                  } as React.CSSProperties
                }
              >
                {/* Template Preview */}
                <div
                  className="mb-3 flex h-24 items-center justify-center rounded-lg"
                  style={{ background: template.colors.primary }}
                >
                  <div className="space-y-2">
                    <div
                      className="h-3 w-24 rounded"
                      style={{ background: template.colors.text }}
                    />
                    <div
                      className="h-8 w-32 rounded"
                      style={{ background: template.colors.accent }}
                    />
                  </div>
                </div>

                {/* Template Info */}
                <h4 className="mb-1 font-bold uppercase" style={{ color: 'var(--text)' }}>
                  {template.name}
                </h4>
                <p className="mb-3 text-xs" style={{ color: 'var(--muted)' }}>
                  {template.description}
                </p>

                {/* Color Palette */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {Object.values(template.colors).map((color, i) => (
                      <div
                        key={i}
                        className="h-5 w-5 rounded-full border-2"
                        style={{ backgroundColor: color, borderColor: 'var(--bg)' }}
                      />
                    ))}
                  </div>

                  {isActive && (
                    <div
                      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      <Check size={12} />
                      Active
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Sparkles size={16} />
                      Switch to {template.name}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedTemplateObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div
            className="w-full max-w-lg rounded-xl p-6"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'var(--accent)', opacity: 0.2 }}
              >
                <Palette size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  Switch Template?
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Change to {selectedTemplateObj.name}
                </p>
              </div>
            </div>

            <div
              className="mb-6 rounded-lg p-4"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <p className="mb-3 text-sm" style={{ color: 'var(--text)' }}>
                This will apply the <strong>{selectedTemplateObj.name}</strong> template styling to
                your website.
              </p>

              {hasCustomTheme && (
                <div className="space-y-3">
                  <div
                    className="rounded-lg p-3"
                    style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <p className="mb-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                      You have custom theme settings
                    </p>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={keepCustomTheme}
                        onChange={(e) => setKeepCustomTheme(e.target.checked)}
                        className="mt-1"
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span className="flex-1 text-sm" style={{ color: 'var(--muted)' }}>
                        Keep my custom colors and fonts (merge with new template)
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelChange}
                disabled={isChanging}
                className="flex-1 rounded-lg px-4 py-3 font-medium transition-colors hover:bg-white/5"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChange}
                disabled={isChanging}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                }}
              >
                {isChanging ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Switching...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Switch Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
