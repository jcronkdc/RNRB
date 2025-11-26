/**
 * Follow User Hook
 *
 * Sync your viewport with another user's viewport
 * See exactly what they're looking at in real-time
 *
 * Features:
 * - Follow/unfollow users
 * - Auto-scroll to match their position
 * - Auto-zoom to match their zoom level
 * - Auto-unfollow on manual interaction
 * - Visual indicator showing who you're following
 */

import { useEffect, useRef, useCallback, useState } from 'react';

import type { PresenceMember } from './use-enhanced-presence';

interface UseFollowUserOptions {
  members: PresenceMember[];
  onScrollTo?: (position: number) => void;
  onZoomTo?: (zoom: number) => void;
  onSectionChange?: (section: string) => void;
}

export function useFollowUser({
  members,
  onScrollTo,
  onZoomTo,
  onSectionChange,
}: UseFollowUserOptions) {
  const [followingUserId, setFollowingUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const followingMember = members.find((m) => m.userId === followingUserId);
  
  const userScrolledRef = useRef(false);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Follow a user
  const followUser = useCallback((userId: string) => {
    setFollowingUserId(userId);
    setIsFollowing(true);
    userScrolledRef.current = false;
  }, []);

  // Unfollow
  const unfollowUser = useCallback(() => {
    setFollowingUserId(null);
    setIsFollowing(false);
    userScrolledRef.current = false;
  }, []);

  // Toggle follow
  const toggleFollow = useCallback(
    (userId: string) => {
      if (followingUserId === userId) {
        unfollowUser();
      } else {
        followUser(userId);
      }
    },
    [followingUserId, followUser, unfollowUser]
  );

  // Sync viewport when following
  useEffect(() => {
    if (!isFollowing || !followingMember || !followingMember.viewport) return;

    const viewport = followingMember.viewport;

    // Don't sync if user manually scrolled
    if (userScrolledRef.current) return;

    // Sync scroll position
    if (onScrollTo && viewport.scroll !== undefined) {
      onScrollTo(viewport.scroll);
    }

    // Sync zoom level
    if (onZoomTo && viewport.zoom !== undefined) {
      onZoomTo(viewport.zoom);
    }

    // Sync section
    if (onSectionChange && viewport.section) {
      onSectionChange(viewport.section);
    }
  }, [followingMember, isFollowing, onScrollTo, onZoomTo, onSectionChange]);

  // Detect user interaction to auto-unfollow
  useEffect(() => {
    if (!isFollowing) return;

    const handleUserInteraction = () => {
      userScrolledRef.current = true;

      // Clear existing timeout
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }

      // Auto-unfollow after 2 seconds of interaction
      userInteractionTimeoutRef.current = setTimeout(() => {
        if (userScrolledRef.current) {
          unfollowUser();
        }
      }, 2000);
    };

    // Listen for user interactions
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);

    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);

      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, [isFollowing, unfollowUser]);

  // Auto-unfollow if followed user leaves
  useEffect(() => {
    if (isFollowing && followingUserId && !followingMember) {
      unfollowUser();
    }
  }, [isFollowing, followingUserId, followingMember, unfollowUser]);

  return {
    isFollowing,
    followingUserId,
    followingMember,
    followUser,
    unfollowUser,
    toggleFollow,
  };
}

