'use client';

import { Crown, Shield, Star, Zap } from 'lucide-react';

type PartnerTier = 'STARTER' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'AMBASSADOR';

interface PartnerBadgeProps {
  tier: PartnerTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const tierConfig: Record<
  PartnerTier,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: typeof Star;
  }
> = {
  STARTER: {
    label: 'Partner',
    color: 'var(--muted)',
    bgColor: 'var(--muted)20',
    icon: Star,
  },
  BRONZE: {
    label: 'Bronze Partner',
    color: '#CD7F32',
    bgColor: '#CD7F3220',
    icon: Shield,
  },
  SILVER: {
    label: 'Silver Partner',
    color: '#C0C0C0',
    bgColor: '#C0C0C020',
    icon: Shield,
  },
  GOLD: {
    label: 'Gold Partner',
    color: 'var(--gold)',
    bgColor: 'var(--gold-dim)',
    icon: Crown,
  },
  PLATINUM: {
    label: 'Platinum Partner',
    color: '#E5E4E2',
    bgColor: '#E5E4E220',
    icon: Crown,
  },
  AMBASSADOR: {
    label: 'Ambassador',
    color: 'var(--accent)',
    bgColor: 'var(--accent-dim)',
    icon: Zap,
  },
};

const sizeConfig = {
  sm: {
    badge: 'h-5 px-2 text-xs gap-1',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'h-7 px-3 text-sm gap-1.5',
    icon: 'h-4 w-4',
  },
  lg: {
    badge: 'h-9 px-4 text-base gap-2',
    icon: 'h-5 w-5',
  },
};

export function PartnerBadge({
  tier,
  size = 'md',
  showLabel = true,
  className = '',
}: PartnerBadgeProps) {
  const config = tierConfig[tier];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${sizes.badge} ${className}`}
      style={{
        background: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
      title={config.label}
    >
      <Icon className={sizes.icon} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

// Compact version for profile cards
export function PartnerBadgeCompact({ tier }: { tier: PartnerTier }) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div
      className="flex h-6 w-6 items-center justify-center rounded-full"
      style={{
        background: config.bgColor,
        border: `1px solid ${config.color}40`,
      }}
      title={config.label}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
    </div>
  );
}

// For use in user lists/search results
export function PartnerIndicator({ tier }: { tier: PartnerTier | null }) {
  if (!tier) return null;

  const config = tierConfig[tier];
  const Icon = config.icon;

  return <Icon className="h-4 w-4" style={{ color: config.color }} title={config.label} />;
}
