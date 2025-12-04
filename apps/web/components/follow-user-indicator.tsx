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
import { Eye, X, UserCheck } from '@/components/ui/custom-icons';

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
          className={`fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border border-brand-primary bg-brand-primary/10 px-4 py-2 shadow-lg ${className}`}
        >
          {/* Following indicator */}
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-brand-primary" />
            <span className="text-sm font-medium text-foreground">
              Following {followingMember.userName}
            </span>
          </div>

          {/* Activity */}
          {followingMember.activity && (
            <div className="border-l border-border/50 pl-3">
              <p className="text-xs text-muted-foreground">{followingMember.activity}</p>
            </div>
          )}

          {/* Section */}
          {followingMember.viewport?.section && (
            <div className="border-l border-border/50 pl-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
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
