'use client';

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Music, Users, Sparkles } from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type OnboardingStep = {
  title: string;
  description: string;
  icon: any;
  action?: {
    text: string;
    href: string;
  };
};

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to Rock N' Roll Basement",
    description:
      "You're now part of a community where music comes alive. Let's get you started with the basics.",
    icon: Music,
  },
  {
    title: 'Projects Are Your Creative Workspace',
    description:
      "Think of a project like an album, EP, or single. It's where you organize songs, collaborate with others, and manage everything in one place. Private by default.",
    icon: Music,
    action: {
      text: 'Create Your First Project',
      href: '/projects/new',
    },
  },
  {
    title: 'Collaborate in Real-Time',
    description:
      'Every project has built-in chat and video rooms. Invite collaborators, share ideas, get AI suggestions for chords and lyrics. Work together from anywhere.',
    icon: Users,
  },
  {
    title: 'AI Tools That Serve Your Creativity',
    description:
      'Get chord suggestions in chat, auto-transcribe sessions, optimize tour routes. AI assists your creativity—it never replaces it.',
    icon: Sparkles,
  },
];

export function FirstTimeOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    try {
      const hasSeenOnboarding = localStorage.getItem('rnrb_onboarding_complete');
      if (!hasSeenOnboarding && !dismissed) {
        setIsVisible(true);
      }
    } catch (error) {
      console.warn('Failed to read onboarding status from localStorage:', error);
      // Show onboarding if we can't determine status
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [dismissed]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('rnrb_onboarding_complete', 'true');
    } catch (error) {
      console.warn('Failed to save onboarding status to localStorage:', error);
      // Continue - onboarding is still dismissed
    }
    setIsVisible(false);
    setDismissed(true);
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('rnrb_onboarding_complete', 'true');
    } catch (error) {
      console.warn('Failed to save onboarding status to localStorage:', error);
      // Continue - onboarding is still dismissed
    }
    setIsVisible(false);
    setDismissed(true);
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90"
            onClick={handleSkip}
          />

          {/* Onboarding Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="rnrb-card pointer-events-auto w-full max-w-2xl border-2 border-brand-primary/30 p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute right-4 top-4 text-muted-foreground transition hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-brand-primary/10">
                <currentStepData.icon className="h-8 w-8 text-brand-primary" />
              </div>

              {/* Content */}
              <div className="mb-8 text-center">
                <h2 className="font-display mb-4 text-2xl font-bold md:text-3xl">
                  {currentStepData.title}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {currentStepData.description}
                </p>
              </div>

              {/* Progress Dots */}
              <div className="mb-6 flex items-center justify-center gap-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-brand-primary'
                        : index < currentStep
                          ? 'w-2 bg-brand-primary/50'
                          : 'w-2 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  Skip tour
                </button>

                {currentStepData.action ? (
                  <Link href={currentStepData.action.href} onClick={handleComplete}>
                    <Button className="rnrb-button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold">
                      {currentStepData.action.text}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="rnrb-button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
                  >
                    {currentStep < onboardingSteps.length - 1 ? 'Next' : 'Get Started'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Step Counter */}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Step {currentStep + 1} of {onboardingSteps.length}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
