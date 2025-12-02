'use client';

import {
  Heart,
  Coffee,
  Gift,
  CreditCard,
  Check,
  ExternalLink,
  Users,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface SupportTier {
  id: string;
  name: string;
  amount: number;
  currency?: string;
  description?: string;
  perks?: string[];
  popular?: boolean;
  oneTime?: boolean;
}

interface SupportSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    // Platform Links
    patreonUrl?: string;
    kofiUrl?: string;
    buyMeACoffeeUrl?: string;
    paypalUrl?: string;
    venmoHandle?: string;
    cashappHandle?: string;
    // Custom Tiers
    tiers?: SupportTier[];
    // One-time amounts
    oneTimeAmounts?: number[];
    customAmount?: boolean;
    // Stats
    supporterCount?: number;
    monthlyGoal?: number;
    currentAmount?: number;
    // Messages
    thankYouMessage?: string;
    // Styling
    showGoalProgress?: boolean;
    showSupporterCount?: boolean;
  };
  theme?: Record<string, unknown>;
  siteId?: string;
}

const DEFAULT_TIERS: SupportTier[] = [
  {
    id: 'coffee',
    name: 'Buy a Coffee',
    amount: 5,
    description: 'A small token of appreciation',
    perks: ['Supporter shoutout', 'Our eternal gratitude'],
    oneTime: true,
  },
  {
    id: 'supporter',
    name: 'Supporter',
    amount: 10,
    description: 'Monthly support',
    perks: ['Exclusive updates', 'Behind-the-scenes content', 'Early access'],
    popular: true,
  },
  {
    id: 'superfan',
    name: 'Superfan',
    amount: 25,
    description: 'VIP monthly support',
    perks: ['All Supporter perks', 'Monthly video calls', 'Credits on releases', 'Free merch'],
  },
];

export function SupportSection({ content, theme }: SupportSectionProps) {
  const {
    headline = 'Support Our Music',
    subheadline = 'Help us create more music and keep the dream alive',
    patreonUrl = '',
    kofiUrl = '',
    buyMeACoffeeUrl = '',
    paypalUrl = '',
    venmoHandle = '',
    cashappHandle = '',
    tiers = DEFAULT_TIERS,
    oneTimeAmounts = [5, 10, 25, 50],
    customAmount = true,
    supporterCount = 0,
    monthlyGoal = 0,
    currentAmount = 0,
    thankYouMessage = 'Thank you for supporting independent music! Your contribution helps us create, record, and share our art with the world.',
    showGoalProgress = true,
    showSupporterCount = true,
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const progressPercentage =
    monthlyGoal > 0 ? Math.min((currentAmount / monthlyGoal) * 100, 100) : 0;

  const platformLinks = [
    { id: 'patreon', label: 'Patreon', url: patreonUrl, color: '#FF424D', icon: Heart },
    { id: 'kofi', label: 'Ko-fi', url: kofiUrl, color: '#13C3FF', icon: Coffee },
    {
      id: 'buymeacoffee',
      label: 'Buy Me a Coffee',
      url: buyMeACoffeeUrl,
      color: '#FFDD00',
      textColor: '#000',
      icon: Coffee,
    },
    { id: 'paypal', label: 'PayPal', url: paypalUrl, color: '#003087', icon: CreditCard },
  ].filter((p) => p.url);

  const directPayments = [
    { id: 'venmo', label: 'Venmo', handle: venmoHandle, color: '#008CFF' },
    { id: 'cashapp', label: 'Cash App', handle: cashappHandle, color: '#00D632' },
  ].filter((p) => p.handle);

  const handleCustomSupport = async () => {
    const amount = selectedAmount || parseFloat(customValue);
    if (!amount || amount <= 0) return;

    setIsProcessing(true);

    // In production, this would integrate with Stripe or another payment processor
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowThankYou(true);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showThankYou) {
    return (
      <section className="py-20" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: `${accentColor}20` }}
          >
            <Heart size={40} style={{ color: accentColor }} />
          </div>
          <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Thank You!
          </h2>
          <p className="mb-8 text-lg" style={{ color: 'var(--muted)' }}>
            {thankYouMessage}
          </p>
          <button
            onClick={() => setShowThankYou(false)}
            className="rounded-xl px-6 py-3 font-medium transition-colors hover:bg-white/10"
            style={{ background: 'var(--panel)', color: 'var(--text)' }}
          >
            Back to Support Options
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: `${accentColor}20` }}
            >
              <Heart size={32} style={{ color: accentColor }} />
            </div>
          </div>
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        {/* Goal Progress */}
        {showGoalProgress && monthlyGoal > 0 && (
          <div className="mb-12 rounded-2xl p-6" style={{ background: 'var(--panel)' }}>
            <div className="mb-4 flex items-center justify-between">
              <span style={{ color: 'var(--text)' }}>Monthly Goal</span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>
                ${currentAmount.toLocaleString()} / ${monthlyGoal.toLocaleString()}
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%`, background: accentColor }}
              />
            </div>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              {progressPercentage.toFixed(0)}% of monthly goal reached
            </p>
          </div>
        )}

        {/* Supporter Count */}
        {showSupporterCount && supporterCount > 0 && (
          <div
            className="mb-8 flex items-center justify-center gap-2"
            style={{ color: 'var(--muted)' }}
          >
            <Users size={18} />
            <span>
              <strong style={{ color: 'var(--text)' }}>{supporterCount.toLocaleString()}</strong>{' '}
              supporters
            </span>
          </div>
        )}

        {/* Platform Links */}
        {platformLinks.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-center text-xl font-semibold" style={{ color: 'var(--text)' }}>
              Support via Platform
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {platformLinks.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                  style={{
                    background: platform.color,
                    color: platform.textColor || '#fff',
                  }}
                >
                  <platform.icon size={20} />
                  {platform.label}
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Membership Tiers */}
        {tiers.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-center text-xl font-semibold" style={{ color: 'var(--text)' }}>
              Membership Tiers
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--panel)',
                    border: tier.popular ? `2px solid ${accentColor}` : '1px solid var(--border)',
                  }}
                >
                  {tier.popular && (
                    <div
                      className="absolute -right-8 top-6 rotate-45 px-10 py-1 text-xs font-semibold text-white"
                      style={{ background: accentColor }}
                    >
                      Popular
                    </div>
                  )}

                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                      {tier.name}
                    </h3>
                    {tier.oneTime && (
                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                        One-time
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                      ${tier.amount}
                    </span>
                    {!tier.oneTime && <span style={{ color: 'var(--muted)' }}>/month</span>}
                  </div>

                  {tier.description && (
                    <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                      {tier.description}
                    </p>
                  )}

                  {tier.perks && tier.perks.length > 0 && (
                    <ul className="mb-6 space-y-2">
                      {tier.perks.map((perk, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: accentColor }}
                          />
                          <span style={{ color: 'var(--text)' }}>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => setSelectedAmount(tier.amount)}
                    className="w-full rounded-xl py-3 font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: accentColor, color: '#fff' }}
                  >
                    {tier.oneTime ? 'Give' : 'Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* One-time Support */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--panel)' }}>
          <h2 className="mb-6 text-center text-xl font-semibold" style={{ color: 'var(--text)' }}>
            One-time Support
          </h2>

          {/* Quick Amounts */}
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {oneTimeAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomValue('');
                }}
                className={`rounded-xl px-6 py-3 font-semibold transition-all ${
                  selectedAmount === amount ? 'scale-105' : 'hover:bg-white/5'
                }`}
                style={{
                  background: selectedAmount === amount ? accentColor : 'var(--bg)',
                  color: selectedAmount === amount ? '#fff' : 'var(--text)',
                }}
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          {customAmount && (
            <div className="mb-6">
              <div className="mx-auto flex max-w-xs items-center gap-2">
                <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  placeholder="Custom amount"
                  value={customValue}
                  onChange={(e) => {
                    setCustomValue(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="flex-1 rounded-xl px-4 py-3 text-center"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Support Button */}
          <div className="text-center">
            <button
              onClick={handleCustomSupport}
              disabled={isProcessing || (!selectedAmount && !customValue)}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: accentColor, color: '#fff' }}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Gift size={20} />
                  Support with ${selectedAmount || customValue || '0'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct Payments */}
        {directPayments.length > 0 && (
          <div className="mt-8 text-center">
            <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
              Or send directly via:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {directPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-2 rounded-lg px-4 py-2"
                  style={{ background: 'var(--panel)' }}
                >
                  <span style={{ color: payment.color }}>{payment.label}:</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>
                    {payment.handle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
