/**
 * Subscription Hook
 *
 * Client-side hook to check user's subscription tier and feature access
 */

import { useCallback } from 'react';
import useSWR from 'swr';

type SubscriptionTier = 'free' | 'creator' | 'studio';

interface SubscriptionData {
  authenticated: boolean;
  tier: SubscriptionTier;
  tierName: string;
  features: {
    aiChatAssist: boolean;
    aiTranscription: boolean;
    aiContentGeneration: boolean;
    aiTourRouter: boolean;
    aiAssistant: boolean;
    videoCalls: boolean;
    collaborationLimit: number;
    projectLimit: number;
    storageGB: number;
    aiRequestsLimit: number;
    videoMinutesLimit: number;
    videoParticipantMinutesLimit: number;
    maxVideoParticipants: number;
  };
  featureAccess: Record<string, boolean>;
  usage: {
    aiRequests: { used: number; limit: number };
    videoMinutes: { used: number; limit: number };
    storage: { used: number; limit: number };
  };
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook to get user's subscription information
 */
export function useSubscription() {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionData>(
    '/api/subscription/access',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    subscription: data,
    tier: data?.tier || 'free',
    tierName: data?.tierName || 'Explorer',
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    error,
    refresh,

    // Convenience accessors
    features: data?.features,
    featureAccess: data?.featureAccess || {},
    usage: data?.usage,
    isPaid: data?.tier !== 'free',
    isCreator: data?.tier === 'creator' || data?.tier === 'studio',
    isStudio: data?.tier === 'studio',
  };
}

/**
 * Hook to check access to a specific feature
 */
export function useFeatureAccess(feature: string) {
  const { featureAccess, tier, isLoading } = useSubscription();

  return {
    hasAccess: featureAccess[feature] ?? false,
    tier,
    isLoading,
  };
}

/**
 * Hook for checking setlist feature access specifically
 */
export function useSetlistAccess() {
  const { tier, isLoading, isCreator, isStudio } = useSubscription();

  return {
    hasAccess: isCreator || isStudio,
    tier,
    isLoading,
    requiredTier: 'creator' as SubscriptionTier,
  };
}

/**
 * Hook for checking AI feature access
 */
export function useAIAccess() {
  const { tier, isLoading, isCreator, isStudio, usage } = useSubscription();

  const hasAccess = isCreator || isStudio;
  const aiUsage = usage?.aiRequests;
  const hasRemainingCredits = aiUsage ? aiUsage.used < aiUsage.limit : false;

  return {
    hasAccess,
    hasRemainingCredits,
    tier,
    isLoading,
    usage: aiUsage,
    canUseAI: hasAccess && hasRemainingCredits,
  };
}

/**
 * Hook for checking video call access
 */
export function useVideoAccess() {
  const { tier, isLoading, isStudio, usage, features } = useSubscription();

  const hasAccess = isStudio;
  const videoUsage = usage?.videoMinutes;
  const hasRemainingMinutes = videoUsage ? videoUsage.used < videoUsage.limit : false;

  return {
    hasAccess,
    hasRemainingMinutes,
    tier,
    isLoading,
    usage: videoUsage,
    maxParticipants: features?.maxVideoParticipants || 0,
    canStartCall: hasAccess && hasRemainingMinutes,
  };
}

/**
 * Hook for checking storage access
 */
export function useStorageAccess() {
  const { tier, isLoading, usage, features } = useSubscription();

  const storageUsage = usage?.storage;
  const hasRemainingStorage = storageUsage ? storageUsage.used < storageUsage.limit : true;

  const percentUsed = storageUsage ? (storageUsage.used / storageUsage.limit) * 100 : 0;

  return {
    tier,
    isLoading,
    usage: storageUsage,
    limit: features?.storageGB || 1,
    hasRemainingStorage,
    percentUsed,
    isNearLimit: percentUsed >= 80,
    isAtLimit: percentUsed >= 100,
  };
}

/**
 * Hook for checking collaboration limits
 */
export function useCollaborationAccess() {
  const { tier, isLoading, features, isStudio } = useSubscription();

  const limit = features?.collaborationLimit || 1;
  const isUnlimited = limit === -1 || isStudio;

  return {
    tier,
    isLoading,
    limit: isUnlimited ? Infinity : limit,
    isUnlimited,
    canAdd: (currentCount: number) => isUnlimited || currentCount < limit,
  };
}

/**
 * Hook for checking project limits
 */
export function useProjectAccess() {
  const { tier, isLoading, features, isStudio } = useSubscription();

  const limit = features?.projectLimit || 3;
  const isUnlimited = limit === -1 || isStudio;

  return {
    tier,
    isLoading,
    limit: isUnlimited ? Infinity : limit,
    isUnlimited,
    canCreate: (currentCount: number) => isUnlimited || currentCount < limit,
  };
}
