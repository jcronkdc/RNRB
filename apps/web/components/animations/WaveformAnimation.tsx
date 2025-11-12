'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface WaveformAnimationProps {
  className?: string;
  color?: string;
  isPlaying?: boolean;
  bars?: number;
}

export function WaveformAnimation({ 
  className = '',
  color = 'currentColor',
  isPlaying = true,
  bars = 64,
}: WaveformAnimationProps) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('animate');
    }
  }, [isInView, controls]);

  return (
    <div ref={ref} className={`flex items-end justify-center gap-[2px] ${className}`}>
      {Array.from({ length: bars }, (_, i) => {
        const baseHeight = 20 + Math.sin(i * 0.3) * 15;
        const randomFactor = 0.5 + Math.random() * 0.5;
        
        return (
          <motion.div
            key={i}
            className="w-1 origin-bottom rounded-full"
            style={{ backgroundColor: color }}
            initial={{ height: 4, opacity: 0 }}
            animate={controls}
            variants={{
              animate: {
                height: isPlaying 
                  ? [
                      baseHeight * randomFactor,
                      baseHeight * (0.2 + Math.random() * 0.8),
                      baseHeight * (0.3 + Math.random() * 0.7),
                      baseHeight * randomFactor,
                    ]
                  : 4,
                opacity: 1,
                transition: {
                  height: {
                    duration: isPlaying ? 0.8 + Math.random() * 0.4 : 0.3,
                    repeat: isPlaying ? Infinity : 0,
                    ease: 'easeInOut',
                    delay: i * 0.01,
                  },
                  opacity: {
                    duration: 0.3,
                    delay: i * 0.02,
                  },
                },
              },
            }}
          />
        );
      })}
    </div>
  );
}

