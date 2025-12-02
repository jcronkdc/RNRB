'use client';

import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Palette,
  Layers,
  Eye,
  Save,
  Globe,
  Rocket,
  CheckCircle,
  ArrowRight,
} from '@/components/ui/custom-icons';
import { useState, useEffect, useCallback } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Website Builder! 🎉',
    description:
      "Let's take a quick tour to help you build an amazing website for your music. This will only take 2 minutes.",
    position: 'center',
    icon: Sparkles,
  },
  {
    id: 'sections',
    title: 'Sections Tab',
    description:
      'This is where you manage your website content. Add, edit, reorder, and delete sections like your hero, music player, bio, and more.',
    target: '[data-tour="sections-tab"]',
    position: 'right',
    action: 'Click to explore your sections',
    icon: Layers,
  },
  {
    id: 'theme',
    title: 'Theme & Colors',
    description:
      'Customize your website appearance here. Choose from 8 beautiful themes and adjust colors, fonts, and more to match your style.',
    target: '[data-tour="theme-tab"]',
    position: 'right',
    action: 'Click to customize your theme',
    icon: Palette,
  },
  {
    id: 'preview',
    title: 'Live Preview',
    description:
      'See your changes in real-time! The preview updates automatically as you edit. Toggle between desktop and mobile views.',
    target: '[data-tour="preview-panel"]',
    position: 'left',
    icon: Eye,
  },
  {
    id: 'save',
    title: 'Auto-Save & Manual Save',
    description:
      'Your work is automatically saved, but you can also save manually anytime. Use Cmd/Ctrl+S for quick saves.',
    target: '[data-tour="save-button"]',
    position: 'bottom',
    icon: Save,
  },
  {
    id: 'publish',
    title: 'Publish Your Site',
    description:
      "When you're ready, click Publish to make your website live. You can update it anytime after publishing.",
    target: '[data-tour="publish-button"]',
    position: 'bottom',
    icon: Globe,
  },
  {
    id: 'complete',
    title: "You're All Set! 🚀",
    description:
      'You now know the basics. Start by choosing a theme, then add your content. Need help? Click the AI Assistant button or visit Help Center anytime.',
    position: 'center',
    icon: Rocket,
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  // Update highlight position
  const updateHighlight = useCallback(() => {
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    } else {
      setHighlightRect(null);
    }
  }, [step.target]);

  useEffect(() => {
    if (!isOpen) return;
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);
    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [isOpen, currentStep, updateHighlight]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (step.position === 'center' || !highlightRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 20;
    const tooltipWidth = 400;
    const tooltipHeight = 250;

    switch (step.position) {
      case 'right':
        return {
          position: 'fixed',
          top: Math.max(
            padding,
            Math.min(highlightRect.top, window.innerHeight - tooltipHeight - padding)
          ),
          left: highlightRect.right + padding,
        };
      case 'left':
        return {
          position: 'fixed',
          top: Math.max(
            padding,
            Math.min(highlightRect.top, window.innerHeight - tooltipHeight - padding)
          ),
          left: highlightRect.left - tooltipWidth - padding,
        };
      case 'bottom':
        return {
          position: 'fixed',
          top: highlightRect.bottom + padding,
          left: Math.max(
            padding,
            Math.min(highlightRect.left, window.innerWidth - tooltipWidth - padding)
          ),
        };
      case 'top':
        return {
          position: 'fixed',
          top: highlightRect.top - tooltipHeight - padding,
          left: Math.max(
            padding,
            Math.min(highlightRect.left, window.innerWidth - tooltipWidth - padding)
          ),
        };
      default:
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100]">
        {/* Dark overlay with cutout for highlighted element */}
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.8)"
            mask="url(#tour-mask)"
          />
        </svg>

        {/* Highlight ring */}
        {highlightRect && (
          <div
            className="absolute rounded-lg ring-4 ring-orange-500 ring-offset-4 ring-offset-transparent"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
              animation: 'pulse 2s infinite',
            }}
          />
        )}

        {/* Tooltip */}
        <div
          className="z-[101] w-[400px] rounded-2xl p-6 shadow-2xl"
          style={{
            ...getTooltipStyle(),
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Progress bar */}
          <div
            className="mb-4 h-1 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--bg)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'var(--accent)' }}
            />
          </div>

          {/* Step indicator */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--muted)' }}
            >
              Skip tour
            </button>
          </div>

          {/* Icon */}
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'var(--accent)', opacity: 0.2 }}
          >
            <step.icon size={24} style={{ color: 'var(--accent)' }} />
          </div>

          {/* Content */}
          <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
            {step.title}
          </h3>
          <p className="mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {step.description}
          </p>

          {/* Action hint */}
          {step.action && (
            <div
              className="mb-4 flex items-center gap-2 rounded-lg p-3"
              style={{ background: 'var(--bg)' }}
            >
              <ArrowRight size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text)' }}>
                {step.action}
              </span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-30"
              style={{ color: 'var(--muted)' }}
            >
              <ChevronLeft size={18} />
              Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-all hover:scale-105"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {isLastStep ? (
                <>
                  <CheckCircle size={18} />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pulse animation - using standard style tag */}
      <style>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}

// Hook to manage tour state
export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user has completed the tour
    const completed = localStorage.getItem('cronkwaters_tour_completed');
    if (completed) {
      setHasCompletedTour(true);
    } else {
      // Show tour for first-time users after a short delay
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem('cronkwaters_tour_completed', 'true');
    setHasCompletedTour(true);
    setShowTour(false);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem('cronkwaters_tour_completed');
    setHasCompletedTour(false);
    setShowTour(true);
  }, []);

  return {
    showTour,
    setShowTour,
    hasCompletedTour,
    completeTour,
    resetTour,
  };
}
