'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  className?: string;
  variant?: 'gradient' | 'particles' | 'waves';
  intensity?: 'low' | 'medium' | 'high';
}

export function AnimatedBackground({ 
  className = '',
  variant = 'gradient',
  intensity = 'medium',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant !== 'particles') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    const particleCount = intensity === 'high' ? 100 : intensity === 'medium' ? 50 : 25;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 113, 113, ${particle.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [variant, intensity]);

  if (variant === 'gradient') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <motion.div
          className="absolute -inset-[100%] opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(248, 113, 113, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(250, 204, 21, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 20%, rgba(248, 113, 113, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(248, 113, 113, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: intensity === 'high' ? 10 : intensity === 'medium' ? 15 : 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -inset-[100%] opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 80% 80%, rgba(251, 146, 60, 0.4) 0%, transparent 40%)',
              'radial-gradient(circle at 20% 20%, rgba(250, 204, 21, 0.4) 0%, transparent 40%)',
              'radial-gradient(circle at 80% 20%, rgba(248, 113, 113, 0.4) 0%, transparent 40%)',
              'radial-gradient(circle at 20% 80%, rgba(251, 146, 60, 0.4) 0%, transparent 40%)',
              'radial-gradient(circle at 80% 80%, rgba(251, 146, 60, 0.4) 0%, transparent 40%)',
            ],
          }}
          transition={{
            duration: intensity === 'high' ? 12 : intensity === 'medium' ? 18 : 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  if (variant === 'particles') {
    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${className}`}
        style={{ mixBlendMode: 'screen' }}
      />
    );
  }

  if (variant === 'waves') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1200 800"
        >
          {[0, 1, 2].map((index) => (
            <motion.path
              key={index}
              d="M0,400 C200,350 400,450 600,400 C800,350 1000,450 1200,400 L1200,800 L0,800 Z"
              fill={`rgba(248, 113, 113, ${0.1 - index * 0.03})`}
              animate={{
                d: [
                  'M0,400 C200,350 400,450 600,400 C800,350 1000,450 1200,400 L1200,800 L0,800 Z',
                  'M0,450 C200,400 400,350 600,450 C800,400 1000,350 1200,450 L1200,800 L0,800 Z',
                  'M0,350 C200,450 400,400 600,350 C800,450 1000,400 1200,350 L1200,800 L0,800 Z',
                  'M0,400 C200,350 400,450 600,400 C800,350 1000,450 1200,400 L1200,800 L0,800 Z',
                ],
              }}
              transition={{
                duration: 10 + index * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.5,
              }}
            />
          ))}
        </svg>
      </div>
    );
  }

  return null;
}
