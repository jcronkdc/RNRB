'use client';

import { Button } from '@cronkwater/ui';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CronkWater',
    description: 'Your creative workspace for organizing songs, tracking splits, and collaborating with your team. Let\'s take a quick tour.',
    action: {
      label: 'Start Tour',
      onClick: () => {}
    }
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Organize your work into projects. Each project can contain songs, assets, splits, and licenses.',
    target: '[data-tour="projects"]',
    position: 'bottom'
  },
  {
    id: 'new-project',
    title: 'Create Your First Project',
    description: 'Click here to create a new project. Give it a name and set the visibility—private, organization, or public.',
    target: '[data-tour="new-project"]',
    position: 'bottom',
    action: {
      label: 'Create Project',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('ui:new-project'));
      }
    }
  },
  {
    id: 'sidebar',
    title: 'Navigation',
    description: 'Access all your workspaces from the sidebar: Projects, Sessions, Assets, Splits, and Licenses.',
    target: '[data-tour="sidebar"]',
    position: 'right'
  },
  {
    id: 'search',
    title: 'Quick Search',
    description: 'Press "/" or click here to search across all your projects, songs, and assets.',
    target: '[data-tour="search"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description: 'You\'re ready to start creating. Create your first project to begin organizing your music.',
    action: {
      label: 'Create Project',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('ui:new-project'));
      }
    }
  }
];

interface OnboardingTourProps {
  onComplete?: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Check if user has completed tour
    const hasCompletedTour = localStorage.getItem('cronkwater-tour-completed');
    if (!hasCompletedTour) {
      setIsOpen(true);
    }
  }, []);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem('cronkwater-tour-completed', 'true');
      setIsOpen(false);
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('cronkwater-tour-completed', 'true');
    setIsOpen(false);
    onComplete?.();
  };

  if (!isOpen || !step) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Spotlight */}
          {step.target && (
            <div
              className="shadow-glow fixed z-[201] rounded-lg border-2 border-brand-primary"
              style={{
                // Position will be calculated by JS
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            className="fixed z-[202] w-full max-w-md rounded-3xl border-2 border-brand-primary/40 bg-surface/95 p-6 shadow-soft backdrop-blur-sm"
            style={{
              // Position will be calculated dynamically
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-brand-primary/10 p-2 text-brand-primary">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.32em] text-brand-primary">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="rounded-full p-1 text-muted-foreground transition hover:text-brand-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                aria-label="Skip tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mb-2 text-xl font-bold text-brand-foreground">{step.title}</h3>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                className="text-sm font-medium text-muted-foreground transition hover:text-brand-foreground"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {step.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (step.action?.onClick) {
                        step.action.onClick();
                      }
                      if (step.action?.href) {
                        window.location.href = step.action.href;
                      }
                    }}
                  >
                    {step.action.label}
                  </Button>
                )}
                <Button onClick={handleNext} className="group">
                  {isLastStep ? 'Get Started' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

