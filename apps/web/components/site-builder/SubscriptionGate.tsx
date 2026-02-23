'use client';

import { Lock, X, Zap, Crown, Check, ArrowRight, Shield } from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useState } from 'react';

interface SubscriptionGateProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan: 'pro' | 'studio';
  currentPlan?: 'free' | 'pro' | 'studio';
}

const PLAN_FEATURES = {
  pro: {
    name: 'Pro',
    icon: Zap,
    price: '$12/mo',
    features: [
      'Custom domain',
      'Unlimited sections',
      'All 8 premium themes',
      'AI Website Assistant',
      'AI Content Generator',
      'Mailing list (1,000 subs)',
      'Basic analytics',
      'Priority support',
    ],
    gradient: 'from-orange-500 to-pink-500',
  },
  studio: {
    name: 'Studio',
    icon: Crown,
    price: '$29/mo',
    features: [
      'Everything in Pro',
      'Multiple websites (up to 5)',
      'Advanced AI features',
      'AI Website Wizard',
      'Merch store (0% fees)',
      'Unlimited mailing list',
      'Advanced analytics',
      'Custom CSS/code',
    ],
    gradient: 'from-purple-500 to-blue-500',
  },
};

export function SubscriptionGate({
  isOpen,
  onClose,
  feature,
  requiredPlan,
  currentPlan = 'free',
}: SubscriptionGateProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'studio'>(requiredPlan);

  if (!isOpen) return null;

  const plan = PLAN_FEATURES[selectedPlan];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="presentation"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        {/* Header */}
        <div className="relative overflow-hidden p-8 text-center">
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-linear-to-br ${plan.gradient} opacity-10`} />

          {/* Lock icon */}
          <div className="relative">
            <div
              className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br ${plan.gradient}`}
            >
              <Lock size={40} className="text-white" />
            </div>

            <h2 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Unlock {feature}
            </h2>
            <p style={{ color: 'var(--muted)' }}>
              This feature requires a {PLAN_FEATURES[requiredPlan].name} plan or higher.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Plan selector (if studio is required, don't show pro) */}
        {requiredPlan === 'pro' && (
          <div className="flex gap-2 px-8">
            <button
              onClick={() => setSelectedPlan('pro')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all ${
                selectedPlan === 'pro' ? 'ring-2 ring-orange-500' : ''
              }`}
              style={{
                background: selectedPlan === 'pro' ? 'rgba(249,115,22,0.2)' : 'var(--bg)',
                color: 'var(--text)',
              }}
            >
              <Zap size={18} />
              Pro
            </button>
            <button
              onClick={() => setSelectedPlan('studio')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all ${
                selectedPlan === 'studio' ? 'ring-2 ring-purple-500' : ''
              }`}
              style={{
                background: selectedPlan === 'studio' ? 'rgba(168,85,247,0.2)' : 'var(--bg)',
                color: 'var(--text)',
              }}
            >
              <Crown size={18} />
              Studio
            </button>
          </div>
        )}

        {/* Features */}
        <div className="p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <plan.icon size={20} style={{ color: 'var(--accent)' }} />
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {plan.name} Plan
              </span>
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {plan.price}
            </span>
          </div>

          <ul className="mb-6 space-y-3">
            {plan.features.map((feat, i) => (
              <li key={i} className="flex items-center gap-3">
                <Check size={16} className="shrink-0 text-green-500" />
                <span className="text-sm" style={{ color: 'var(--text)' }}>
                  {feat}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/website-builder/pricing"
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r py-4 font-semibold text-white transition-all hover:scale-[1.02] ${plan.gradient}`}
          >
            Upgrade to {plan.name}
            <ArrowRight size={18} />
          </Link>

          {/* Guarantee */}
          <div
            className="mt-4 flex items-center justify-center gap-2 text-sm"
            style={{ color: 'var(--muted)' }}
          >
            <Shield size={14} />
            30-day money-back guarantee
          </div>
        </div>

        {/* Current plan info */}
        {currentPlan !== 'free' && (
          <div
            className="p-4 text-center text-sm"
            style={{ background: 'var(--bg)', color: 'var(--muted)' }}
          >
            You&apos;re currently on the <strong>{currentPlan}</strong> plan.
            {currentPlan === 'pro' && selectedPlan === 'studio' && (
              <span> Upgrade to unlock this feature.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to check subscription status
export function useSubscription() {
  // In production, this would fetch from API/context
  const [subscription] = useState<{
    plan: 'free' | 'pro' | 'studio';
    features: string[];
  }>({
    plan: 'free',
    features: [],
  });

  const canAccess = (feature: string, requiredPlan: 'pro' | 'studio') => {
    if (subscription.plan === 'studio') return true;
    if (subscription.plan === 'pro' && requiredPlan === 'pro') return true;
    return false;
  };

  const getRequiredPlan = (feature: string): 'pro' | 'studio' => {
    const studioFeatures = [
      'ai_wizard',
      'multiple_sites',
      'merch_store',
      'advanced_analytics',
      'custom_css',
      'white_label',
    ];
    return studioFeatures.includes(feature) ? 'studio' : 'pro';
  };

  return {
    plan: subscription.plan,
    canAccess,
    getRequiredPlan,
    isPro: subscription.plan === 'pro' || subscription.plan === 'studio',
    isStudio: subscription.plan === 'studio',
  };
}
