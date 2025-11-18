'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Music, Users, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import Link from 'next/link';

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
    description: "You're now part of a community where music comes alive. Let's get you started with the basics.",
    icon: Music,
  },
  {
    title: "Projects Are Your Creative Workspace",
    description: "Think of a project like an album, EP, or single. It's where you organize songs, collaborate with others, and manage everything in one place. Private by default.",
    icon: Music,
    action: {
      text: "Create Your First Project",
      href: "/projects/new"
    }
  },
  {
    title: "Collaborate in Real-Time",
    description: "Every project has built-in chat and video rooms. Invite collaborators, share ideas, get AI suggestions for chords and lyrics. Work together from anywhere.",
    icon: Users,
  },
  {
    title: "AI Tools That Serve Your Creativity",
    description: "Get chord suggestions in chat, auto-transcribe sessions, optimize tour routes. AI assists your creativity—it never replaces it.",
    icon: Sparkles,
  }
];

export function FirstTimeOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('rnrb_onboarding_complete');
    if (!hasSeenOnboarding && !dismissed) {
      setIsVisible(true);
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
    localStorage.setItem('rnrb_onboarding_complete', 'true');
    setIsVisible(false);
    setDismissed(true);
  };

  const handleComplete = () => {
    localStorage.setItem('rnrb_onboarding_complete', 'true');
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Onboarding Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="rnrb-card max-w-2xl w-full p-8 pointer-events-auto shadow-2xl border-2 border-brand-primary/30">
              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 mx-auto">
                <currentStepData.icon className="w-8 h-8 text-brand-primary" />
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                  {currentStepData.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
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
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Skip tour
                </button>

                {currentStepData.action ? (
                  <Link href={currentStepData.action.href} onClick={handleComplete}>
                    <Button className="rnrb-button-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                      {currentStepData.action.text}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="rnrb-button-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                  >
                    {currentStep < onboardingSteps.length - 1 ? 'Next' : 'Get Started'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Step Counter */}
              <p className="text-center mt-4 text-xs text-muted-foreground">
                Step {currentStep + 1} of {onboardingSteps.length}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

