'use client';

/**
 * SETLIST TEMPLATES MODAL
 *
 * Browse and apply pre-built or custom setlist templates
 * Features: Festival, Club, Acoustic, Wedding templates + user-created
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Sparkles, X, Clock, Zap, Music, Heart, Briefcase, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

type Template = {
  id: string;
  name: string;
  description?: string | null;
  targetDuration: number;
  energyLevel?: string | null;
  isBuiltIn: boolean;
};

export function SetlistTemplatesModal({
  projectId,
  onClose,
  onApply,
}: {
  projectId: string;
  onClose: () => void;
  onApply: (songs: any[], template: Template) => void;
}) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/setlist-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        setError('Failed to load templates');
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Error loading templates');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (template: Template) => {
    setApplying(template.id);
    setError(null);

    try {
      const response = await fetch(`/api/setlist-templates/${template.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        onApply(data.songs, template);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to apply template');
      }
    } catch (err) {
      console.error('Error applying template:', err);
      setError('Error applying template');
    } finally {
      setApplying(null);
    }
  };

  const getTemplateIcon = (template: Template) => {
    const name = template.name.toLowerCase();
    if (name.includes('festival')) return Zap;
    if (name.includes('club')) return Music;
    if (name.includes('acoustic')) return Heart;
    if (name.includes('wedding') || name.includes('corporate')) return Briefcase;
    return Sparkles;
  };

  const getEnergyColor = (energyLevel?: string | null) => {
    switch (energyLevel) {
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'mellow':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden"
      >
        <Card className="rnrb-card p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display mb-1 text-2xl font-bold sm:text-3xl">
                Setlist Templates
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Choose a pre-built template to generate your setlist
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 shrink-0 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-brand-primary" />
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <p className="mb-4 text-muted-foreground">No templates available yet</p>
              <Button className="rnrb-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Template
              </Button>
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
              {/* Built-in Templates */}
              {templates.filter((t) => t.isBuiltIn).length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Built-in Templates
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {templates
                      .filter((t) => t.isBuiltIn)
                      .map((template) => {
                        const Icon = getTemplateIcon(template);
                        const isApplying = applying === template.id;

                        return (
                          <button
                            key={template.id}
                            onClick={() => handleApplyTemplate(template)}
                            disabled={isApplying || !!applying}
                            className="rnrb-card group p-4 text-left transition hover:border-brand-primary/50 disabled:opacity-50 sm:p-5"
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-brand-primary/10 p-2">
                                  <Icon className="h-5 w-5 text-brand-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="truncate font-semibold">{template.name}</h4>
                                </div>
                              </div>
                              {isApplying && (
                                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-primary" />
                              )}
                            </div>

                            {template.description && (
                              <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
                                {template.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2 py-0.5 text-xs">
                                <Clock className="h-3 w-3" />
                                {template.targetDuration} min
                              </span>
                              {template.energyLevel && (
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getEnergyColor(template.energyLevel)}`}
                                >
                                  {template.energyLevel === 'high' && <Zap className="h-3 w-3" />}
                                  {template.energyLevel === 'mellow' && (
                                    <Heart className="h-3 w-3" />
                                  )}
                                  {template.energyLevel}
                                </span>
                              )}
                            </div>

                            {isApplying && (
                              <p className="mt-3 text-xs font-medium text-brand-primary">
                                Generating setlist...
                              </p>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* User Templates */}
              {templates.filter((t) => !t.isBuiltIn).length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    My Custom Templates
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {templates
                      .filter((t) => !t.isBuiltIn)
                      .map((template) => {
                        const isApplying = applying === template.id;

                        return (
                          <button
                            key={template.id}
                            onClick={() => handleApplyTemplate(template)}
                            disabled={isApplying || !!applying}
                            className="rnrb-card group p-4 text-left transition hover:border-brand-primary/50 disabled:opacity-50 sm:p-5"
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-500/10 p-2">
                                  <Sparkles className="h-5 w-5 text-purple-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="truncate font-semibold">{template.name}</h4>
                                </div>
                              </div>
                              {isApplying && (
                                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-primary" />
                              )}
                            </div>

                            {template.description && (
                              <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
                                {template.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2 py-0.5 text-xs">
                                <Clock className="h-3 w-3" />
                                {template.targetDuration} min
                              </span>
                              {template.energyLevel && (
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getEnergyColor(template.energyLevel)}`}
                                >
                                  {template.energyLevel}
                                </span>
                              )}
                            </div>

                            {isApplying && (
                              <p className="mt-3 text-xs font-medium text-brand-primary">
                                Generating setlist...
                              </p>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {!loading && templates.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-center text-xs text-muted-foreground sm:text-sm">
                Templates analyze your songs and build optimized setlists based on duration, energy,
                and style
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
