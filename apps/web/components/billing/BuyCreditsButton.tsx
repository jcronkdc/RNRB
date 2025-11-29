'use client';

import { Button } from '@cronkwaters/ui';
import { useTransition } from 'react';

import { useToast } from '@/hooks/useToast';
import { createCreditCheckout, type CreditProductKey } from '@/lib/actions/credits';

const LABELS: Record<CreditProductKey, string> = {
  ai_100: 'Buy +100 AI Requests ($5)',
  video_600: 'Buy +10 Hours Video ($8)',
  storage_25: 'Add +25 GB Storage ($5)',
  storage_100: 'Add +100 GB Storage ($12)',
  storage_250: 'Add +250 GB Storage ($25)',
};

interface BuyCreditsButtonProps {
  product: CreditProductKey;
  className?: string;
}

export function BuyCreditsButton({ product, className }: BuyCreditsButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const url = await createCreditCheckout(product);
        showToast('Redirecting to secure checkout…', 'success');
        if (url) {
          window.location.href = url;
        }
      } catch (err: any) {
        console.error('Failed to start checkout', err);
        showToast(err?.message || 'Unable to start checkout. Please try again.', 'error');
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} className={className}>
      {isPending ? 'Starting Checkout…' : LABELS[product]}
    </Button>
  );
}
