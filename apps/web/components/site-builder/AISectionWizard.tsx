'use client';

import {
  Wand2,
  X,
  Sparkles,
  ChevronRight,
  Check,
  Music,
  Users,
  Calendar,
  Image,
  ShoppingBag,
  MessageSquare,
  Play,
  Mic,
  Radio,
  Star,
  Zap,
  ArrowRight,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface AISectionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSections: (sections: GeneratedSection[]) => void;
  siteName?: string;
  existingSections?: string[];
}

interface GeneratedSection {
  type: string;
  content: Record<string, unknown>;
  order: number;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'genre', title: 'Your Music', description: 'Tell us about your sound' },
  { id: 'goals', title: 'Your Goals', description: 'What do you want to achieve?' },
  { id: 'style', title: 'Your Style', description: 'Choose your vibe' },
  { id: 'generate', title: 'Generate', description: 'AI creates your website' },
];

const GENRES = [
  { id: 'rock', label: 'Rock', icon: Music },
  { id: 'pop', label: 'Pop', icon: Star },
  { id: 'hiphop', label: 'Hip-Hop', icon: Mic },
  { id: 'electronic', label: 'Electronic', icon: Radio },
  { id: 'country', label: 'Country', icon: Music },
  { id: 'jazz', label: 'Jazz', icon: Music },
  { id: 'classical', label: 'Classical', icon: Music },
  { id: 'rnb', label: 'R&B', icon: Music },
  { id: 'metal', label: 'Metal', icon: Music },
  { id: 'indie', label: 'Indie', icon: Music },
  { id: 'folk', label: 'Folk', icon: Music },
  { id: 'other', label: 'Other', icon: Music },
];

const GOALS = [
  {
    id: 'streams',
    label: 'Get More Streams',
    icon: Play,
    description: 'Drive listeners to your music',
  },
  {
    id: 'bookings',
    label: 'Get Booked',
    icon: Calendar,
    description: 'Attract venues and festivals',
  },
  { id: 'fans', label: 'Build Fanbase', icon: Users, description: 'Grow your mailing list' },
  { id: 'merch', label: 'Sell Merch', icon: ShoppingBag, description: 'Monetize your brand' },
  { id: 'press', label: 'Get Press', icon: MessageSquare, description: 'Attract media attention' },
  { id: 'epk', label: 'Professional EPK', icon: Image, description: 'Impress industry pros' },
];

const STYLES = [
  { id: 'dark', label: 'Dark & Moody', colors: ['#000', '#1a1a1a', '#ff6347'] },
  { id: 'light', label: 'Light & Clean', colors: ['#fff', '#f5f5f5', '#000'] },
  { id: 'colorful', label: 'Bold & Colorful', colors: ['#1a1a2e', '#e94560', '#00ffff'] },
  { id: 'vintage', label: 'Warm & Vintage', colors: ['#2d1b0e', '#d4a574', '#f5e6d3'] },
  { id: 'minimal', label: 'Minimal & Editorial', colors: ['#fff', '#f8f8f8', '#000'] },
  { id: 'neon', label: 'Neon & Cyberpunk', colors: ['#0a0a0a', '#00ffff', '#ff00ff'] },
];

export function AISectionWizard({
  isOpen,
  onClose,
  onCreateSections,
  siteName,
  existingSections = [],
}: AISectionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [artistInfo, setArtistInfo] = useState({
    name: siteName || '',
    location: '',
    description: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<GeneratedSection[]>([]);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id].slice(0, 3)
    );
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id].slice(0, 3)
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedGenres.length > 0 && artistInfo.name;
      case 1:
        return selectedGoals.length > 0;
      case 2:
        return selectedStyle !== null;
      default:
        return true;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/ai/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistInfo,
          genres: selectedGenres,
          goals: selectedGoals,
          style: selectedStyle,
          existingSections,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setGeneratedSections(data.sections);
      setProgress(100);
    } catch (error) {
      console.error('Website generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
      handleGenerate();
    } else if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleApply = () => {
    onCreateSections(generatedSections);
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Artist Name */}
            <div>
              <label
                htmlFor="artist-name"
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                Artist / Band Name *
              </label>
              <input
                id="artist-name"
                type="text"
                value={artistInfo.name}
                onChange={(e) => setArtistInfo({ ...artistInfo, name: e.target.value })}
                placeholder="The Midnight"
                className="w-full rounded-xl px-4 py-3"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                Location (optional)
              </label>
              <input
                id="location"
                type="text"
                value={artistInfo.location}
                onChange={(e) => setArtistInfo({ ...artistInfo, location: e.target.value })}
                placeholder="Los Angeles, CA"
                className="w-full rounded-xl px-4 py-3"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>

            {/* Genre Selection */}
            <div>
              <span className="mb-3 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                Genre (select up to 3) *
              </span>
              <div className="grid grid-cols-3 gap-3">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`flex items-center gap-2 rounded-xl p-3 transition-all ${
                      selectedGenres.includes(genre.id)
                        ? 'ring-2 ring-orange-500'
                        : 'hover:bg-white/5'
                    }`}
                    style={{
                      background: selectedGenres.includes(genre.id)
                        ? 'rgba(249,115,22,0.2)'
                        : 'var(--panel)',
                      color: 'var(--text)',
                    }}
                  >
                    <genre.icon size={18} style={{ color: 'var(--accent)' }} />
                    <span className="text-sm">{genre.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brief Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                Brief Description (optional)
              </label>
              <textarea
                id="description"
                value={artistInfo.description}
                onChange={(e) => setArtistInfo({ ...artistInfo, description: e.target.value })}
                placeholder="Tell us a bit about your music and what makes you unique..."
                rows={3}
                className="w-full rounded-xl px-4 py-3"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <p className="mb-6" style={{ color: 'var(--muted)' }}>
              What are your main goals? This helps us prioritize the right sections for your
              website.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`flex items-start gap-4 rounded-xl p-4 text-left transition-all ${
                    selectedGoals.includes(goal.id) ? 'ring-2 ring-orange-500' : 'hover:bg-white/5'
                  }`}
                  style={{
                    background: selectedGoals.includes(goal.id)
                      ? 'rgba(249,115,22,0.2)'
                      : 'var(--panel)',
                  }}
                >
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: selectedGoals.includes(goal.id) ? 'var(--accent)' : 'var(--bg)',
                    }}
                  >
                    <goal.icon
                      size={24}
                      style={{
                        color: selectedGoals.includes(goal.id) ? '#fff' : 'var(--accent)',
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      {goal.label}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {goal.description}
                    </p>
                  </div>
                  {selectedGoals.includes(goal.id) && (
                    <Check size={20} className="ml-auto text-orange-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="mb-6" style={{ color: 'var(--muted)' }}>
              Choose a visual style that matches your brand. You can customize everything later.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`overflow-hidden rounded-xl transition-all ${
                    selectedStyle === style.id ? 'ring-2 ring-orange-500' : 'hover:scale-[1.02]'
                  }`}
                  style={{ background: 'var(--panel)' }}
                >
                  {/* Color Preview */}
                  <div className="flex h-24">
                    {style.colors.map((color, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      {style.label}
                    </h4>
                  </div>
                  {selectedStyle === style.id && (
                    <div className="absolute right-2 top-2 rounded-full bg-orange-500 p-1">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {isGenerating ? (
              <>
                <div className="relative mb-8">
                  <div className="h-32 w-32 rounded-full border-4 border-white/10">
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500"
                      style={{
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={40} className="text-orange-500" />
                  </div>
                </div>
                <h3 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  Creating Your Website
                </h3>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>
                  AI is generating your personalized sections...
                </p>
                <div
                  className="h-2 w-64 overflow-hidden rounded-full"
                  style={{ background: 'var(--panel)' }}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                  {progress}% complete
                </p>
              </>
            ) : generatedSections.length > 0 ? (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                  <Check size={40} className="text-green-500" />
                </div>
                <h3 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  Website Ready!
                </h3>
                <p className="mb-8" style={{ color: 'var(--muted)' }}>
                  We&apos;ve created {generatedSections.length} sections for your website.
                </p>

                {/* Section Preview */}
                <div className="mb-8 w-full max-w-md space-y-3">
                  {generatedSections.map((section, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl p-4"
                      style={{ background: 'var(--panel)' }}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ background: 'var(--accent)' }}
                      >
                        <Zap size={18} className="text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium capitalize" style={{ color: 'var(--text)' }}>
                          {section.type.replace(/_/g, ' ')}
                        </h4>
                      </div>
                      <Check size={18} className="text-green-500" />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleApply}
                  className="flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                    color: '#fff',
                  }}
                >
                  Apply to My Website
                  <ArrowRight size={20} />
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--muted)' }}>Something went wrong. Please try again.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="presentation"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
              <Wand2 size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                AI Website Wizard
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Create your perfect website in minutes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 p-4" style={{ background: 'var(--bg)' }}>
          {WIZARD_STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < currentStep
                    ? 'bg-green-500 text-white'
                    : i === currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-gray-500'
                }`}
              >
                {i < currentStep ? <Check size={16} /> : i + 1}
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div
                  className="mx-2 h-0.5 w-12"
                  style={{
                    background: i < currentStep ? 'var(--accent)' : 'var(--border)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <div className="p-6 pb-0 text-center">
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {WIZARD_STEPS[currentStep].title}
          </h3>
          <p style={{ color: 'var(--muted)' }}>{WIZARD_STEPS[currentStep].description}</p>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto p-6">{renderStep()}</div>

        {/* Footer */}
        {currentStep < 3 && (
          <div
            className="flex items-center justify-between p-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-30"
              style={{ color: 'var(--muted)' }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                color: '#fff',
              }}
            >
              {currentStep === 2 ? (
                <>
                  <Sparkles size={18} />
                  Generate Website
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
