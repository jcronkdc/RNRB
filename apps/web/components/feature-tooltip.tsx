import { motion, AnimatePresence } from 'motion/react';
import { Info, X, ChevronRight, ChevronLeft } from '@/components/ui/custom-icons';
import { useState, type ReactNode, useCallback } from 'react';

interface FeatureTooltipProps {
  title: string;
  description: string;
  children: ReactNode;
  icon?: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Feature Tooltip Component
 * Provides contextual help for dashboard actions and features
 */
export function FeatureTooltip({
  title,
  description,
  children,
  icon,
  placement = 'top',
}: FeatureTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const placementStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="group relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 10 : -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${placementStyles[placement]} pointer-events-none w-80`}
          >
            <div className="rounded-xl border border-orange-500/30 bg-zinc-900/95 p-4 shadow-xl">
              <div className="mb-2 flex items-start gap-2">
                {icon && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                    {icon}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-white">{title}</h4>
                  <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
                </div>
              </div>

              {/* Arrow */}
              <div
                className={`absolute h-3 w-3 rotate-45 border border-orange-500/30 bg-zinc-900/95 ${
                  placement === 'top'
                    ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-r border-b'
                    : placement === 'bottom'
                      ? 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l'
                      : placement === 'left'
                        ? 'top-1/2 right-[-6px] -translate-y-1/2 border-t border-r'
                        : 'top-1/2 left-[-6px] -translate-y-1/2 border-b border-l'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface InfoButtonProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

/**
 * Inline Info Button with Tooltip
 * For use inside action cards and buttons
 */
export function InfoButton({ title, description, icon }: InfoButtonProps) {
  return (
    <FeatureTooltip title={title} description={description} icon={icon}>
      <button
        className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
        onClick={(e) => e.preventDefault()}
      >
        <Info className="h-3 w-3" />
      </button>
    </FeatureTooltip>
  );
}

interface OnboardingStep {
  target: string;
  title: string;
  content: string;
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Onboarding Tour Component
 * Provides a step-by-step guided tour of features
 */
export function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="mx-4 w-full max-w-md rounded-2xl border border-orange-500/30 bg-zinc-900/95 p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium tracking-wide text-orange-400 uppercase">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h3 className="mt-1 text-xl font-bold text-white">{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <p className="mb-6 leading-relaxed text-zinc-300">{step.content}</p>

          {/* Progress dots */}
          <div className="mb-6 flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-orange-500'
                    : index < currentStep
                      ? 'bg-orange-500/50'
                      : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
