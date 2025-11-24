'use client';

import { Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Check,
  Crown,
  Zap,
  ExternalLink,
  CreditCard,
  AlertCircle,
  Sparkles,
  Music,
  X,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  createSubscriptionCheckout,
  createBillingPortalSession,
  cancelUserSubscription,
  reactivateUserSubscription,
} from '@/lib/actions/subscriptions';


interface BillingDashboardProps {
  subscription: {
    id: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    subscriptionTier: string;
    subscriptionStatus: string | null;
    subscriptionStartedAt: Date | null;
    subscriptionEndsAt: Date | null;
    subscriptionCanceledAt: Date | null;
    subscriptionRenewsAt: Date | null;
  };
}

const PLAN_FEATURES = {
  free: [
    '1 Active Project',
    'Basic Audio Upload (5MB)',
    'View Public Projects',
    'Join 1 Organization',
    'Basic Analytics',
    'Community Support',
    'AI Features (10 credits/month)',
  ],
  creator: [
    'Unlimited Projects',
    'Pro Audio Upload (500MB)',
    'Private & Public Projects',
    'Join 5 Organizations',
    'Advanced Analytics',
    'Email Support',
    'AI Features (500 credits/month)',
    'Revenue Splits Management',
    '50GB Cloud Storage',
    'Live Sessions (2 hours/month)',
    'CSV/PDF Exports',
  ],
  studio: [
    'Everything in Creator',
    'Lossless Audio Upload (No limit)',
    'Unlimited Organizations',
    'White-label Options',
    'Priority Support',
    'AI Features (Unlimited)',
    'Advanced Revenue Analytics',
    '500GB Cloud Storage',
    'Unlimited Live Sessions',
    'API Access',
    'Custom Integrations',
    'Dedicated Account Manager',
  ],
};

const PLAN_INFO = {
  free: {
    name: 'Explorer',
    price: 'Free',
    period: undefined,
    icon: Music,
    color: 'from-gray-500 to-gray-600',
  },
  creator: {
    name: 'Creator',
    price: '$9.99',
    period: '/month',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
  },
  studio: {
    name: 'Studio',
    price: '$29.99',
    period: '/month',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
  },
};

export function BillingDashboard({ subscription }: BillingDashboardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const currentTier = subscription.subscriptionTier as 'free' | 'creator' | 'studio';
  const status = subscription.subscriptionStatus;
  const isCanceled = subscription.subscriptionCanceledAt !== null;
  const isActive = status === 'active' || status === 'trialing';

  const handleUpgrade = async (tier: 'creator' | 'studio') => {
    setIsLoading(tier);
    setError(null);

    try {
      const checkoutUrl = await createSubscriptionCheckout(tier);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setIsLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading('portal');
    setError(null);

    try {
      const portalUrl = await createBillingPortalSession();
      window.location.href = portalUrl;
    } catch (err) {
      console.error('Portal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setIsLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading('cancel');
    setError(null);

    try {
      await cancelUserSubscription();
      setShowCancelDialog(false);
      router.refresh();
    } catch (err) {
      console.error('Cancel error:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(null);
    }
  };

  const handleReactivate = async () => {
    setIsLoading('reactivate');
    setError(null);

    try {
      await reactivateUserSubscription();
      router.refresh();
    } catch (err) {
      console.error('Reactivate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
      setIsLoading(null);
    }
  };

  const planInfo = PLAN_INFO[currentTier];
  const PlanIcon = planInfo.icon;

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Current Plan Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border rounded-xl border bg-gradient-to-r from-gray-900 to-black p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-xl bg-gradient-to-br ${planInfo.color} flex items-center justify-center`}
            >
              <PlanIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                {planInfo.name} Plan
                {currentTier !== 'free' && isActive && !isCanceled && (
                  <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                    Active
                  </span>
                )}
                {isCanceled && (
                  <span className="rounded-full bg-orange-500/20 px-2 py-1 text-xs text-orange-400">
                    Canceling
                  </span>
                )}
              </h2>
              <p className="mt-1 text-3xl font-bold text-white">
                {planInfo.price}
                {planInfo.period && (
                  <span className="text-lg text-gray-400">{planInfo.period}</span>
                )}
              </p>
              {subscription.subscriptionEndsAt && (
                <p className="mt-2 text-sm text-gray-400">
                  {isCanceled ? 'Access until' : 'Renews on'}{' '}
                  {new Date(subscription.subscriptionEndsAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          {currentTier !== 'free' && (
            <div className="flex gap-3">
              {isCanceled && isActive ? (
                <Button
                  onClick={handleReactivate}
                  disabled={isLoading === 'reactivate'}
                  variant="solid"
                >
                  {isLoading === 'reactivate' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reactivating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Reactivate Plan
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleManageBilling}
                  disabled={isLoading === 'portal'}
                  variant="outline"
                >
                  {isLoading === 'portal' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Available Plans */}
      <div>
        <h2 className="mb-6 text-xl font-semibold text-white">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl p-6 ${
              currentTier === 'free'
                ? 'border-2 border-orange-500 bg-gradient-to-br from-orange-500/10 to-red-500/10'
                : 'border-border border bg-gray-900'
            }`}
          >
            <div className="mb-4 flex items-center gap-2">
              <Music className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Explorer</h3>
            </div>
            <p className="mb-2 text-3xl font-bold text-white">Free</p>
            <p className="mb-6 text-sm text-gray-400">Perfect for trying out the platform</p>

            <ul className="mb-6 space-y-2.5">
              {PLAN_FEATURES.free.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {currentTier === 'free' && (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            )}
          </motion.div>

          {/* Creator Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`relative rounded-xl p-6 ${
              currentTier === 'creator'
                ? 'border-2 border-orange-500 bg-gradient-to-br from-orange-500/10 to-red-500/10'
                : 'border-border border bg-gray-900'
            }`}
          >
            {currentTier !== 'creator' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                POPULAR
              </div>
            )}
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-white">Creator</h3>
            </div>
            <p className="mb-2 text-3xl font-bold text-white">
              $9.99<span className="text-sm font-normal text-gray-400">/month</span>
            </p>
            <p className="mb-6 text-sm text-gray-400">For serious musicians</p>

            <ul className="mb-6 space-y-2.5">
              {PLAN_FEATURES.creator.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {currentTier === 'creator' ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            ) : currentTier === 'free' ? (
              <Button
                onClick={() => handleUpgrade('creator')}
                disabled={!!isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isLoading === 'creator' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Upgrade to Creator'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleManageBilling}
                disabled={!!isLoading}
                variant="outline"
                className="w-full"
              >
                Downgrade to Creator
              </Button>
            )}
          </motion.div>

          {/* Studio Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-6 ${
              currentTier === 'studio'
                ? 'border-2 border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                : 'border-border border bg-gray-900'
            }`}
          >
            <div className="mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-white">Studio</h3>
            </div>
            <p className="mb-2 text-3xl font-bold text-white">
              $29.99<span className="text-sm font-normal text-gray-400">/month</span>
            </p>
            <p className="mb-6 text-sm text-gray-400">For professionals</p>

            <ul className="mb-6 space-y-2.5">
              {PLAN_FEATURES.studio.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {currentTier === 'studio' ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button
                onClick={() =>
                  currentTier === 'free' ? handleUpgrade('studio') : handleManageBilling()
                }
                disabled={!!isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading === 'studio' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : currentTier === 'free' ? (
                  'Upgrade to Studio'
                ) : (
                  'Upgrade to Studio'
                )}
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Manage Billing Section */}
      {currentTier !== 'free' && subscription.stripeCustomerId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-border rounded-xl border bg-gray-900 p-6"
        >
          <h2 className="mb-4 text-xl font-semibold text-white">Manage Your Subscription</h2>
          <p className="mb-6 text-gray-400">
            Update payment methods, view invoices, download receipts, or make changes to your
            subscription.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleManageBilling} disabled={!!isLoading} variant="outline">
              {isLoading === 'portal' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Open Billing Portal
                  <ExternalLink className="ml-2 h-3 w-3" />
                </>
              )}
            </Button>

            {isActive && !isCanceled && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                disabled={!!isLoading}
                variant="ghost"
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Cancel Subscription
              </Button>
            )}
          </div>

          {isCanceled && subscription.subscriptionEndsAt && (
            <div className="mt-6 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
              <p className="text-sm text-orange-400">
                <strong>Your subscription is scheduled to cancel.</strong> You'll continue to have
                access until{' '}
                {new Date(subscription.subscriptionEndsAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                .
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowCancelDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="border-border w-full max-w-md rounded-xl border bg-gray-900 p-6"
          >
            <h3 className="mb-4 text-xl font-bold text-white">Cancel Your Subscription?</h3>
            <p className="mb-6 text-gray-400">
              You'll continue to have access until{' '}
              {subscription.subscriptionEndsAt &&
                new Date(subscription.subscriptionEndsAt).toLocaleDateString()}
              . After that, you'll be moved to the Explorer (Free) plan.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCancelDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={isLoading === 'cancel'}
                variant="solid"
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {isLoading === 'cancel' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Subscription Benefits */}
      {currentTier === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6"
        >
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 flex-shrink-0 text-orange-500" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-white">Unlock More with Creator</h3>
              <p className="mb-4 text-sm text-gray-300">
                Get unlimited projects, 50GB storage, AI features, and priority support for just
                $9.99/month.
              </p>
              <Button
                onClick={() => handleUpgrade('creator')}
                disabled={!!isLoading}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isLoading === 'creator' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}






