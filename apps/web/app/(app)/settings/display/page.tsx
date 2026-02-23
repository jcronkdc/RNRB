'use client';

import { motion } from 'motion/react';
import { Monitor, Sun, Moon, Check, Palette } from '@/components/ui/custom-icons';
import { WorkshopPageHeader } from '@/components/workshop/page-header';
import { useTheme } from '@/components/theme';

export default function DisplaySettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light' as const,
      label: 'Light',
      description: 'A warm, cream-toned theme for daytime use',
      Icon: Sun,
      preview: {
        bg: '#faf8f5',
        panel: '#f5f2ed',
        text: '#2c2622',
        accent: '#d5512f',
      },
    },
    {
      id: 'dark' as const,
      label: 'Dark',
      description: 'The classic workshop aesthetic with warm browns',
      Icon: Moon,
      preview: {
        bg: '#1c1915',
        panel: '#2a2620',
        text: '#f5f0e8',
        accent: '#e85d3b',
      },
    },
    {
      id: 'system' as const,
      label: 'System',
      description: 'Automatically match your device settings',
      Icon: Monitor,
      preview: null,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <WorkshopPageHeader
          icon={Palette}
          label="Settings"
          title="Display & Theme"
          description="Customize how Rock N' Roll Basement looks on your device"
        />

        <div className="mt-8 space-y-8">
          {/* Theme Selection */}
          <section>
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Theme
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const isSelected = theme === option.id;
                const Icon = option.Icon;

                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme(option.id)}
                    className="relative overflow-hidden rounded-xl p-4 text-left transition-all"
                    style={{
                      background: isSelected ? 'rgba(232, 93, 59, 0.1)' : 'var(--panel)',
                      border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: 'var(--accent)' }}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}

                    {/* Theme preview */}
                    {option.preview ? (
                      <div
                        className="mb-4 h-24 overflow-hidden rounded-lg"
                        style={{
                          background: option.preview.bg,
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="flex h-full flex-col p-2">
                          <div
                            className="mb-2 h-3 w-3/4 rounded"
                            style={{ background: option.preview.text }}
                          />
                          <div
                            className="flex-1 rounded"
                            style={{ background: option.preview.panel }}
                          >
                            <div className="p-2">
                              <div
                                className="mb-1 h-2 w-1/2 rounded"
                                style={{ background: option.preview.accent }}
                              />
                              <div
                                className="h-2 w-2/3 rounded opacity-50"
                                style={{ background: option.preview.text }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="mb-4 flex h-24 items-center justify-center overflow-hidden rounded-lg"
                        style={{
                          background: 'var(--panel-hover)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="flex gap-2">
                          <Sun className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                          <div className="h-5 w-px" style={{ background: 'var(--border)' }} />
                          <Moon className="h-5 w-5" style={{ color: 'var(--sky)' }} />
                        </div>
                      </div>
                    )}

                    {/* Label and description */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          background: isSelected ? 'var(--accent)' : 'var(--panel-hover)',
                        }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{
                            color: isSelected ? 'white' : 'var(--muted)',
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          {option.label}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Current Theme Info */}
          <section
            className="rounded-xl p-6"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'var(--accent-dim)' }}
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                ) : (
                  <Sun className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                )}
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  Currently using {resolvedTheme} mode
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {theme === 'system'
                    ? 'Based on your device settings'
                    : `You selected ${theme} mode`}
                </p>
              </div>
            </div>
          </section>

          {/* Tip */}
          <section
            className="rounded-xl p-4"
            style={{
              background: 'rgba(107, 155, 195, 0.1)',
              border: '1px solid rgba(107, 155, 195, 0.2)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--sky)' }}>
              <strong>Tip:</strong> You can quickly toggle between light and dark mode using the
              theme button in the navigation bar.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
