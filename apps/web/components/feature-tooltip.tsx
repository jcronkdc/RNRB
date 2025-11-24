'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

type TooltipProps = {
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
};

export function FeatureTooltip({ id, title, description, position = 'top', children }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if this tooltip has been dismissed before
    const dismissedTooltips = JSON.parse(localStorage.getItem('dismissed-tooltips') || '[]');
    if (dismissedTooltips.includes(id)) {
      setDismissed(true);
      return;
    }

    // Show tooltip after a short delay on first visit
    const timer = setTimeout(() => {
      setShow(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    
    // Save to localStorage
    const dismissedTooltips = JSON.parse(localStorage.getItem('dismissed-tooltips') || '[]');
    dismissedTooltips.push(id);
    localStorage.setItem('dismissed-tooltips', JSON.stringify(dismissedTooltips));
  };

  if (dismissed || !show) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-blue-600',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-blue-600',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-blue-600',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-blue-600',
  };

  return (
    <div className="relative">
      {children}
      
      {/* Tooltip */}
      <div
        className={`absolute z-50 ${positionClasses[position]} w-72 rounded-lg border-2 border-blue-500 bg-blue-600 p-4 shadow-2xl shadow-blue-500/50 animate-in fade-in slide-in-from-bottom-2 duration-300`}
      >
        {/* Arrow */}
        <div
          className={`absolute h-0 w-0 border-8 border-transparent ${arrowClasses[position]}`}
        />
        
        {/* Content */}
        <div className="relative">
          <button
            onClick={handleDismiss}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
          >
            <X className="h-3 w-3" />
          </button>
          
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-blue-900">
              NEW
            </span>
            <h4 className="font-bold text-white">{title}</h4>
          </div>
          
          <p className="text-sm text-blue-100">{description}</p>
          
          <button
            onClick={handleDismiss}
            className="mt-3 w-full rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/30"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// Onboarding Tour Component
type TourStep = {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector
};

export function OnboardingTour({ steps }: { steps: TourStep[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem('onboarding-tour-completed');
    if (!tourCompleted) {
      setShow(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    setShow(false);
    localStorage.setItem('onboarding-tour-completed', 'true');
  };

  const handleComplete = () => {
    setShow(false);
    localStorage.setItem('onboarding-tour-completed', 'true');
  };

  if (!show) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      
      {/* Tour Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 p-8 shadow-2xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <span className="mb-2 inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-blue-900">
                NEW FEATURES
              </span>
              <h2 className="text-3xl font-bold text-white">{step.title}</h2>
            </div>
            <button
              onClick={handleSkip}
              className="text-white/60 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <p className="mb-6 text-lg text-blue-100">{step.description}</p>
          
          {/* Progress */}
          <div className="mb-6 flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Skip Tour
            </button>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="rounded-lg border-2 border-white/30 bg-white/10 px-6 py-2 font-semibold text-white transition hover:bg-white/20"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="rounded-lg bg-white px-6 py-2 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


