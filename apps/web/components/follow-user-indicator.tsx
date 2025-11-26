'use client';

/**
 * Follow User Indicator Component
 *
 * Shows who you're currently following
 * Provides controls to stop following
 *
 * Displays at top of screen when actively following someone
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, UserCheck } from 'lucide-react';

import type { PresenceMember } from '@/hooks/use-enhanced-presence';

interface FollowUserIndicatorProps {
  followingMember: PresenceMember | null;
  onUnfollow: () => void;
  className?: string;
}

export function FollowUserIndicator({
  followingMember,
  onUnfollow,
  className = '',
}: FollowUserIndicatorProps) {
  return (
    <AnimatePresence>
      {followingMember && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`border-border bg-brand-primary/10 border-brand-primary fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border px-4 py-2 shadow-lg backdrop-blur-sm ${className}`}
        >
          {/* Following indicator */}
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-brand-primary" />
            <span className="text-foreground text-sm font-medium">
              Following {followingMember.userName}
            </span>
          </div>

          {/* Activity */}
          {followingMember.activity && (
            <div className="border-border/50 border-l pl-3">
              <p className="text-muted-foreground text-xs">{followingMember.activity}</p>
            </div>
          )}

          {/* Section */}
          {followingMember.viewport?.section && (
            <div className="border-border/50 border-l pl-3">
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <Eye className="h-3 w-3" />
                {followingMember.viewport.section}
              </p>
            </div>
          )}

          {/* Unfollow button */}
          <Button onClick={onUnfollow} variant="secondary" size="sm" className="ml-2">
            <X className="h-3 w-3" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

