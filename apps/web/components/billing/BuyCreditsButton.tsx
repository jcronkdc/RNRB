'use client';

import { Button } from '@cronkwaters/ui';
import { Zap, Video, Palette, HardDrive, Gem, AudioLines } from 'lucide-react';
import { useTransition, ReactNode } from 'react';

import { useToast } from '@/hooks/useToast';
import { createCreditCheckout, type CreditProductKey } from '@/lib/actions/credits';

// Icon components for each credit type (no emojis allowed per project rules)
const ICONS: Record<string, ReactNode> = {
  ai: <Zap className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  image: <Palette className="h-4 w-4" />,
  storage: <HardDrive className="h-4 w-4" />,
  storagePremium: <Gem className="h-4 w-4" />,
  stems: <AudioLines className="h-4 w-4" />,
};

const PRODUCT_CONFIG: Record<
  CreditProductKey,
  { label: string; shortLabel: string; iconKey: keyof typeof ICONS; price: string }
> = {
  // AI
  ai_100: { label: '+100 AI Credits', shortLabel: '+100', iconKey: 'ai', price: '$6' },

  // Video Packs (tiered)
  video_120: { label: 'Starter (2hr)', shortLabel: '2hr', iconKey: 'video', price: '$5' },
  video_600: { label: 'Band Practice (10hr)', shortLabel: '10hr', iconKey: 'video', price: '$20' },
  video_1800: {
    label: 'Studio Sessions (30hr)',
    shortLabel: '30hr',
    iconKey: 'video',
    price: '$50',
  },

  // Images
  image_25: { label: '+25 Images', shortLabel: '+25', iconKey: 'image', price: '$4' },
  image_100: { label: '+100 Images', shortLabel: '+100', iconKey: 'image', price: '$12' },

  // Storage
  storage_25: { label: '+25 GB Storage', shortLabel: '+25GB', iconKey: 'storage', price: '$6' },
  storage_100: { label: '+100 GB Storage', shortLabel: '+100GB', iconKey: 'storage', price: '$15' },
  storage_250: {
    label: '+250 GB Storage',
    shortLabel: '+250GB',
    iconKey: 'storagePremium',
    price: '$30',
  },

  // Stem Separation
  stems_10: { label: '+10 Stem Credits', shortLabel: '+10', iconKey: 'stems', price: '$2.99' },
  stems_25: { label: '+25 Stem Credits', shortLabel: '+25', iconKey: 'stems', price: '$5.99' },
  stems_50: { label: '+50 Stem Credits', shortLabel: '+50', iconKey: 'stems', price: '$9.99' },
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
            <span className="inline-block animate-spin">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{ICONS[config.iconKey]}</span>
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
