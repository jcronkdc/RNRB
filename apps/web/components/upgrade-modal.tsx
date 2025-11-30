'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Zap, Crown, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { FEATURE_DESCRIPTIONS } from '@/lib/subscription-constants';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  title?: string;
  description?: string;
  requiredTier?: 'creator' | 'studio';
}

const TIER_INFO = {
  creator: {
    name: 'Creator',
    price: '$9.99',
    period: '/month',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    features: [
      'Unlimited Projects',
      'Smart Setlist Management',
      'Tour & Gig Tracking',
      'Advanced Analytics',
      'Live Collaboration (2hrs/month)',
      '500 AI Credits/month',
      '50GB Storage',
    ],
  },
  studio: {
    name: 'Studio',
    price: '$29.99',
    period: '/month',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Everything in Creator',
      'Unlimited Live Collaboration',
      'Unlimited AI Credits',
      'Custom Branding',
      'API Access',
      'Priority Support',
      '500GB Storage',
    ],
  },
};

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  title,
  description,
  requiredTier = 'creator',
}: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<'creator' | 'studio'>(requiredTier);

  // Get feature details if feature key is provided
  const featureInfo = feature ? FEATURE_DESCRIPTIONS[feature] : null;
  const displayTitle = title || featureInfo?.title || 'Upgrade Required';
  const displayDescription =
    description ||
    featureInfo?.description ||
    'This feature is only available on paid plans. Upgrade to unlock unlimited potential.';

  const tier = TIER_INFO[selectedTier];
  const TierIcon = tier.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${tier.color} p-8 text-white`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{displayTitle}</h2>
                    <p className="text-sm text-white/80">Premium Feature</p>
                  </div>
                </div>
                <p className="text-white/90">{displayDescription}</p>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Tier Selector */}
                <div className="mb-6 flex gap-4">
                  <button
                    onClick={() => setSelectedTier('creator')}
                    className={`flex-1 rounded-xl border p-4 transition-all ${
                      selectedTier === 'creator'
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Zap
                        className={`h-5 w-5 ${selectedTier === 'creator' ? 'text-orange-500' : 'text-gray-400'}`}
                      />
                      <span
                        className={`font-semibold ${selectedTier === 'creator' ? 'text-white' : 'text-gray-400'}`}
                      >
                        Creator
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white">$9.99</div>
                    <div className="text-sm text-gray-400">/month</div>
                  </button>

                  <button
                    onClick={() => setSelectedTier('studio')}
                    className={`flex-1 rounded-xl border p-4 transition-all ${
                      selectedTier === 'studio'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Crown
                        className={`h-5 w-5 ${selectedTier === 'studio' ? 'text-purple-500' : 'text-gray-400'}`}
                      />
                      <span
                        className={`font-semibold ${selectedTier === 'studio' ? 'text-white' : 'text-gray-400'}`}
                      >
                        Studio
                      </span>
                      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                        Best Value
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white">$29.99</div>
                    <div className="text-sm text-gray-400">/month</div>
                  </button>
                </div>

                {/* Features List */}
                <div className="mb-6 rounded-xl border border-gray-800 bg-gray-800/50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <TierIcon
                      className={`h-5 w-5 bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}
                    />
                    <h3 className="font-semibold text-white">{tier.name} Plan Includes:</h3>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                        <span className="text-sm text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link href={`/settings/billing?upgrade=${selectedTier}`}>
                  <button
                    className={`group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${tier.color} px-6 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20`}
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Upgrade to {tier.name}</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>

                {/* Footer */}
                <div className="mt-4 text-center text-xs text-gray-500">
                  Cancel anytime. No long-term contracts.
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook for managing upgrade modal state
 */
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Partial<UpgradeModalProps>>({});

  const isClient = typeof window !== 'undefined';

  const showUpgradeModal = (props?: Partial<UpgradeModalProps>) => {
    if (!isClient) return;
    setModalProps(props || {});
    setIsOpen(true);
  };

  const hideUpgradeModal = () => {
    if (!isClient) return;
    setIsOpen(false);
    setTimeout(() => setModalProps({}), 300); // Clear props after animation
  };

  return {
    isOpen,
    showUpgradeModal,
    hideUpgradeModal,
    modalProps,
  };
}
