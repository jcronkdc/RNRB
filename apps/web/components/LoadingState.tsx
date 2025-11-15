'use client';

import { motion } from 'framer-motion';
import { AudioLines } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  message = 'Loading...', 
  fullScreen = false,
  size = 'md' 
}: LoadingStateProps) {
  const iconSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative"
      >
        <AudioLines className={`${iconSize} text-brand-primary`} />
        <motion.div 
          className="absolute inset-0 blur-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AudioLines className={`${iconSize} text-brand-primary`} />
        </motion.div>
      </motion.div>
      
      <motion.p 
        className="text-muted-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}

// Skeleton loader for content
export function ContentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-1/3 bg-muted/20 rounded-lg" />
      <div className="h-4 w-full bg-muted/20 rounded-lg" />
      <div className="h-4 w-5/6 bg-muted/20 rounded-lg" />
      <div className="h-4 w-4/6 bg-muted/20 rounded-lg" />
    </div>
  );
}

// Music card skeleton
export function MusicCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/50 backdrop-blur p-6 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-muted/20 mb-4" />
      <div className="h-6 w-2/3 bg-muted/20 rounded-lg mb-2" />
      <div className="h-4 w-full bg-muted/20 rounded-lg mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted/20 rounded" />
        <div className="h-3 w-5/6 bg-muted/20 rounded" />
        <div className="h-3 w-4/6 bg-muted/20 rounded" />
      </div>
    </div>
  );
}

