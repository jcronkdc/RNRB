'use client';

import { Card } from '@cronkwaters/ui';
import { Music, Sparkles, FileText, Zap } from 'lucide-react';
import { useState } from 'react';

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro';
  content: string;
};

type SongTemplate = {
  name: string;
  description: string;
  genre: string;
  blocks: Omit<SongBlock, 'id'>[];
  icon: typeof Music;
  color: string;
};

const SONG_TEMPLATES: SongTemplate[] = [
  {
    name: 'Classic Pop',
    description: 'Verse-Chorus-Verse-Chorus-Bridge-Chorus',
    genre: 'Pop',
    blocks: [
      { type: 'verse', content: '[Verse 1]\nWrite your first verse here...' },
      { type: 'chorus', content: '[Chorus]\nWrite your catchy chorus here...' },
      { type: 'verse', content: '[Verse 2]\nWrite your second verse here...' },
      { type: 'chorus', content: '[Chorus]\nRepeat chorus...' },
      { type: 'bridge', content: '[Bridge]\nWrite your bridge here...' },
      { type: 'chorus', content: '[Chorus]\nFinal chorus...' },
    ],
    icon: Music,
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Modern Pop',
    description: 'Intro-Verse-Pre-Chorus-Chorus-Verse-Pre-Chorus-Chorus-Bridge-Chorus-Outro',
    genre: 'Pop',
    blocks: [
      { type: 'intro', content: '[Intro]\nInstrumental or vocal hook...' },
      { type: 'verse', content: '[Verse 1]\nSet the scene...' },
      { type: 'pre-chorus', content: '[Pre-Chorus]\nBuild tension...' },
      { type: 'chorus', content: '[Chorus]\nMain hook...' },
      { type: 'verse', content: '[Verse 2]\nContinue story...' },
      { type: 'pre-chorus', content: '[Pre-Chorus]\nBuild again...' },
      { type: 'chorus', content: '[Chorus]\nRepeat hook...' },
      { type: 'bridge', content: '[Bridge]\nNew perspective...' },
      { type: 'chorus', content: '[Chorus]\nFinal hook...' },
      { type: 'outro', content: '[Outro]\nFade out or final thought...' },
    ],
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Country Ballad',
    description: 'Verse-Chorus-Verse-Chorus (Simple, story-focused)',
    genre: 'Country',
    blocks: [
      { type: 'verse', content: '[Verse 1]\nTell your story...' },
      { type: 'chorus', content: '[Chorus]\nEmotional payoff...' },
      { type: 'verse', content: '[Verse 2]\nContinue the narrative...' },
      { type: 'chorus', content: '[Chorus]\nRepeat emotional core...' },
    ],
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Rock Anthem',
    description: 'Intro-Verse-Chorus-Verse-Chorus-Solo-Bridge-Chorus-Outro',
    genre: 'Rock',
    blocks: [
      { type: 'intro', content: '[Intro]\nPowerful guitar riff...' },
      { type: 'verse', content: '[Verse 1]\nSet up the theme...' },
      { type: 'chorus', content: '[Chorus]\nBig, anthemic hook...' },
      { type: 'verse', content: '[Verse 2]\nExpand the theme...' },
      { type: 'chorus', content: '[Chorus]\nRepeat anthem...' },
      { type: 'bridge', content: '[Guitar Solo / Bridge]\nInstrumental break or breakdown...' },
      { type: 'bridge', content: '[Bridge]\nNew energy...' },
      { type: 'chorus', content: '[Chorus]\nFinal anthem (x2)...' },
      { type: 'outro', content: '[Outro]\nPowerful finish...' },
    ],
    icon: Zap,
    color: 'from-red-500 to-red-600',
  },
  {
    name: 'R&B Groove',
    description: 'Verse-Pre-Chorus-Chorus-Verse-Pre-Chorus-Chorus-Bridge-Chorus',
    genre: 'R&B',
    blocks: [
      { type: 'verse', content: '[Verse 1]\nSmooth, melodic verse...' },
      { type: 'pre-chorus', content: '[Pre-Chorus]\nBuild the groove...' },
      { type: 'chorus', content: '[Chorus]\nSoulful hook...' },
      { type: 'verse', content: '[Verse 2]\nDeepen the vibe...' },
      { type: 'pre-chorus', content: '[Pre-Chorus]\nBuild again...' },
      { type: 'chorus', content: '[Chorus]\nRepeat hook...' },
      { type: 'bridge', content: '[Bridge]\nVocal runs and ad-libs...' },
      { type: 'chorus', content: '[Chorus]\nFinal hook with ad-libs...' },
    ],
    icon: Music,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Blank Canvas',
    description: 'Start from scratch with no structure',
    genre: 'Custom',
    blocks: [
      { type: 'verse', content: '[Section 1]\nStart writing...' },
    ],
    icon: FileText,
    color: 'from-gray-600 to-gray-700',
  },
];

type SongTemplatePickerProps = {
  onSelectTemplate: (blocks: SongBlock[]) => void;
  onClose: () => void;
};

export function SongTemplatePicker({ onSelectTemplate, onClose }: SongTemplatePickerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<SongTemplate | null>(null);

  const applyTemplate = (template: SongTemplate) => {
    const blocksWithIds = template.blocks.map((block, idx) => ({
      ...block,
      id: `block-${Date.now()}-${idx}`,
    }));
    onSelectTemplate(blocksWithIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border-2 border-gray-800 bg-gradient-to-b from-gray-900 to-black p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-white">Choose Your Song Structure</h2>
          <p className="text-gray-400">
            Start with a proven template or build from scratch
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {SONG_TEMPLATES.map((template) => {
            const Icon = template.icon;
            const isSelected = selectedTemplate?.name === template.name;

            return (
              <Card
                key={template.name}
                className={`group cursor-pointer border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 scale-[1.02]'
                    : 'border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${template.color}`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{template.name}</h3>
                        <span className="text-xs font-medium text-gray-400">
                          {template.genre}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                        Selected
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mb-3 text-sm text-gray-300">{template.description}</p>

                  {/* Block count */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Music className="h-3 w-3" />
                    <span>{template.blocks.length} sections</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-gray-700 bg-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedTemplate) {
                applyTemplate(selectedTemplate);
                onClose();
              }
            }}
            disabled={!selectedTemplate}
            className={`flex-1 rounded-xl border-2 px-6 py-3 font-semibold transition ${
              selectedTemplate
                ? 'border-blue-500 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                : 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

