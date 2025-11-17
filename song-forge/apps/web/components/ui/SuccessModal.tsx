'use client';

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Confetti } from './Confetti';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function SuccessModal({
  open,
  onClose,
  title,
  message,
  action,
  duration = 3000
}: SuccessModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      headingRef.current?.focus();
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <>
      <Confetti show={showConfetti} />
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[99] flex items-center justify-center px-4 py-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full max-w-md rounded-3xl border-2 border-success/40 bg-surface/95 p-8 text-center shadow-soft backdrop-blur-sm"
            >
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={prefersReducedMotion ? {} : { scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20"
              >
                <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
              </motion.div>

              <h2
                id="success-title"
                ref={headingRef}
                tabIndex={-1}
                className="mb-2 text-2xl font-bold text-brand-foreground"
              >
                {title}
              </h2>
              <p className="mb-6 text-base text-muted-foreground">{message}</p>

              {action && (
                <Button
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  className="group"
                >
                  {action.label}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

