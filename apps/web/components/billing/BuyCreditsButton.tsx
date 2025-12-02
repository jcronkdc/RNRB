'use client';

import { Button } from '@cronkwaters/ui';
import { useTransition } from 'react';

import { useToast } from '@/hooks/useToast';
import { createCreditCheckout, type CreditProductKey } from '@/lib/actions/credits';

const PRODUCT_CONFIG: Record<
  CreditProductKey,
  { label: string; shortLabel: string; icon: string; price: string }
> = {
  // AI
  ai_100: { label: '+100 AI Credits', shortLabel: '+100', icon: '⚡', price: '$6' },

  // Video Packs (tiered)
  video_120: { label: 'Starter (2hr)', shortLabel: '2hr', icon: '🎬', price: '$5' },
  video_600: { label: 'Band Practice (10hr)', shortLabel: '10hr', icon: '🎬', price: '$20' },
  video_1800: { label: 'Studio Sessions (30hr)', shortLabel: '30hr', icon: '🎬', price: '$50' },

  // Images
  image_25: { label: '+25 Images', shortLabel: '+25', icon: '🎨', price: '$4' },
  image_100: { label: '+100 Images', shortLabel: '+100', icon: '🎨', price: '$12' },

  // Storage
  storage_25: { label: '+25 GB Storage', shortLabel: '+25GB', icon: '💾', price: '$6' },
  storage_100: { label: '+100 GB Storage', shortLabel: '+100GB', icon: '💾', price: '$15' },
  storage_250: { label: '+250 GB Storage', shortLabel: '+250GB', icon: '💎', price: '$30' },
};

interface BuyCreditsButtonProps {
  product: CreditProductKey;
  className?: string;
  compact?: boolean;
}

export function BuyCreditsButton({ product, className, compact }: BuyCreditsButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const config = PRODUCT_CONFIG[product];

  const handleClick = () => {
    startTransition(async () => {
      try {
        const url = await createCreditCheckout(product);
        showToast('Redirecting to secure checkout…', 'success');
        if (url) {
          window.location.href = url;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to start checkout';
        console.error('Failed to start checkout', err);
        showToast(message || 'Unable to start checkout. Please try again.', 'error');
      }
    });
  };

  if (compact) {
    return (
      <Button onClick={handleClick} disabled={isPending} size="sm" className={className}>
        {isPending ? '...' : `${config.shortLabel} ${config.price}`}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className={`relative overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <span className="flex items-center justify-center gap-2">
        {isPending ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{config.icon}</span>
            <span className="font-semibold">{config.label}</span>
            <span className="rounded bg-white/20 px-2 py-0.5 text-sm font-bold">
              {config.price}
            </span>
          </>
        )}
      </span>
    </Button>
  );
}
