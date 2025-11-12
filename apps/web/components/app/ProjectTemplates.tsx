'use client';

import { Button, cn } from '@songforge/ui';
import { Music, Disc, Mic, Radio } from 'lucide-react';
import { useState } from 'react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultVisibility: 'private' | 'org' | 'public';
}

const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'single',
    name: 'Single Release',
    description: 'Perfect for a standalone track. Includes song, assets, and split tracking.',
    icon: Music,
    defaultVisibility: 'public'
  },
  {
    id: 'ep',
    name: 'EP',
    description: 'Multi-track EP structure. Organize 3-7 songs with shared assets and splits.',
    icon: Disc,
    defaultVisibility: 'public'
  },
  {
    id: 'album',
    name: 'Full Album',
    description: 'Complete album workflow. Track multiple songs, sessions, and collaborators.',
    icon: Radio,
    defaultVisibility: 'public'
  },
  {
    id: 'session',
    name: 'Recording Session',
    description: 'Capture a single recording session. Track takes, assets, and session notes.',
    icon: Mic,
    defaultVisibility: 'org'
  }
];

interface ProjectTemplatesProps {
  onSelect: (template: ProjectTemplate) => void;
  onCancel: () => void;
}

export function ProjectTemplates({ onSelect, onCancel }: ProjectTemplatesProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-foreground">Choose a Template</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with a template to get organized faster, or create a blank project.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isSelected = selected === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelected(template.id)}
              className={cn(
                'group relative rounded-2xl border-2 p-5 text-left transition-all',
                isSelected
                  ? 'border-brand-primary bg-brand-primary/5 shadow-soft'
                  : 'border-border/60 bg-surface/80 hover:border-brand-primary/40 hover:shadow-soft'
              )}
            >
              <div className="mb-3 inline-flex rounded-xl bg-brand-primary/10 p-2 text-brand-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="mb-2 text-base font-semibold text-brand-foreground">{template.name}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{template.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const template = TEMPLATES.find((t) => t.id === selected);
            if (template) {
              onSelect(template);
            }
          }}
          disabled={!selected}
          className="sf-btn-primary"
        >
          Use Template
        </Button>
      </div>
    </div>
  );
}

