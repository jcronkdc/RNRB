'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function Confetti({ show, onComplete, duration = 2000 }: ConfettiProps) {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    if (prefersReducedMotion) {
      // Skip animation for reduced motion
      setTimeout(() => onComplete?.(), duration);
      return;
    }

    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.5 + Math.random() * 0.5
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onComplete, prefersReducedMotion]);

  if (prefersReducedMotion || !show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute top-0 h-3 w-3 rounded-full"
            style={{
              left: `${particle.x}%`,
              backgroundColor: ['hsl(var(--sf-color-brand-primary))', 'hsl(var(--sf-color-accent))', 'hsl(var(--sf-color-success))'][particle.id % 3]
            }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{
              y: window.innerHeight + 100,
              opacity: [0, 1, 1, 0],
              rotate: 360,
              x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

