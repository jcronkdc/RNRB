'use client';

import {
  Star,
  Lock,
  Crown,
  Music,
  Video,
  Image,
  Download,
  Calendar,
  Gift,
  MessageSquare,
  Users,
  Check,
  ArrowRight,
  Play,
  Heart,
} from 'lucide-react';
import { useState } from 'react';

interface ExclusiveContent {
  id: string;
  title: string;
  description?: string;
  type: 'audio' | 'video' | 'image' | 'download' | 'post' | 'livestream';
  thumbnail?: string;
  date: string;
  tier: 'free' | 'supporter' | 'vip' | 'superfan';
  url?: string;
  previewUrl?: string;
}

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  icon: 'star' | 'crown' | 'heart';
  benefits: string[];
  color: string;
}

interface FanClubSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    // Membership
    tiers?: MembershipTier[];
    memberCount?: number;
    // Content
    exclusiveContent?: ExclusiveContent[];
    // Features
    showMemberCount?: boolean;
    showContentPreview?: boolean;
    maxPreviewItems?: number;
    // Join Link
    joinUrl?: string;
    platform?: 'patreon' | 'kofi' | 'buymeacoffee' | 'custom';
  };
  theme?: Record<string, unknown>;
  isAuthenticated?: boolean;
  userTier?: string;
}

const TIER_ICONS = {
  star: Star,
  crown: Crown,
  heart: Heart,
};

const CONTENT_TYPE_ICONS = {
  audio: Music,
  video: Video,
  image: Image,
  download: Download,
  post: MessageSquare,
  livestream: Play,
};

const DEFAULT_TIERS: MembershipTier[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    price: 5,
    period: 'month',
    icon: 'star',
    color: '#f97316',
    benefits: [
      'Exclusive posts & updates',
      'Behind-the-scenes content',
      'Early access to announcements',
      'Supporter badge',
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 15,
    period: 'month',
    icon: 'crown',
    color: '#8b5cf6',
    benefits: [
      'Everything in Supporter',
      'Unreleased demos & tracks',
      'Monthly exclusive livestreams',
      'Discounts on merch',
      'VIP badge',
    ],
  },
  {
    id: 'superfan',
    name: 'Superfan',
    price: 30,
    period: 'month',
    icon: 'heart',
    color: '#ec4899',
    benefits: [
      'Everything in VIP',
      'Personal video shoutouts',
      'Credits on releases',
      'Free signed merch annually',
      'Direct message access',
      'Superfan badge',
    ],
  },
];

export function FanClubSection({
  content,
  theme,
  isAuthenticated = false,
  userTier,
}: FanClubSectionProps) {
  const {
    headline = 'Join the Fan Club',
    subheadline = 'Get exclusive access to unreleased content, behind-the-scenes, and more',
    tiers = DEFAULT_TIERS,
    memberCount = 0,
    exclusiveContent = [],
    showMemberCount = true,
    showContentPreview = true,
    maxPreviewItems = 6,
    joinUrl = '',
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';

  const canAccessContent = (contentTier: string) => {
    if (!isAuthenticated) return false;
    const tierOrder = ['free', 'supporter', 'vip', 'superfan'];
    const userTierIndex = tierOrder.indexOf(userTier || 'free');
    const contentTierIndex = tierOrder.indexOf(contentTier);
    return userTierIndex >= contentTierIndex;
  };

  const getContentTypeIcon = (type: string) => {
    return CONTENT_TYPE_ICONS[type as keyof typeof CONTENT_TYPE_ICONS] || MessageSquare;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: `${accentColor}20` }}
            >
              <Crown size={32} style={{ color: accentColor }} />
            </div>
          </div>
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
          {showMemberCount && memberCount > 0 && (
            <p
              className="mt-4 flex items-center justify-center gap-2"
              style={{ color: 'var(--muted)' }}
            >
              <Users size={18} />
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {memberCount.toLocaleString()}
              </span>{' '}
              members
            </p>
          )}
        </div>

        {/* Membership Tiers */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const TierIcon = TIER_ICONS[tier.icon] || Star;

            return (
              <div
                key={tier.id}
                className="relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--panel)',
                  border: `2px solid ${tier.color}40`,
                }}
              >
                {/* Popular Badge */}
                {tier.id === 'vip' && (
                  <div
                    className="absolute -right-8 top-6 rotate-45 px-10 py-1 text-xs font-semibold text-white"
                    style={{ background: tier.color }}
                  >
                    Popular
                  </div>
                )}

                {/* Icon */}
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${tier.color}20` }}
                >
                  <TierIcon size={24} style={{ color: tier.color }} />
                </div>

                {/* Name & Price */}
                <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    ${tier.price}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>/{tier.period}</span>
                </div>

                {/* Benefits */}
                <ul className="mb-6 space-y-3">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check
                        size={18}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: tier.color }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text)' }}>
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Join Button */}
                <a
                  href={joinUrl || '#'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: tier.color, color: '#fff' }}
                >
                  Join {tier.name}
                  <ArrowRight size={18} />
                </a>
              </div>
            );
          })}
        </div>

        {/* Exclusive Content Preview */}
        {showContentPreview && exclusiveContent.length > 0 && (
          <div>
            <h2 className="mb-8 text-center text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Exclusive Content
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {exclusiveContent.slice(0, maxPreviewItems).map((item) => {
                const ContentIcon = getContentTypeIcon(item.type);
                const hasAccess = canAccessContent(item.tier);
                const tierInfo = tiers.find((t) => t.id === item.tier);

                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl"
                    style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${
                            !hasAccess ? 'blur-sm' : ''
                          }`}
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{ background: 'var(--bg)' }}
                        >
                          <ContentIcon size={48} style={{ color: 'var(--muted)' }} />
                        </div>
                      )}

                      {/* Lock Overlay */}
                      {!hasAccess && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                          <Lock size={32} className="mb-2 text-white" />
                          <span className="text-sm font-medium text-white">
                            {tierInfo?.name || 'Members'} Only
                          </span>
                        </div>
                      )}

                      {/* Type Badge */}
                      <div
                        className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                        style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                      >
                        <ContentIcon size={12} />
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </div>

                      {/* Tier Badge */}
                      {tierInfo && (
                        <div
                          className="absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-medium"
                          style={{ background: tierInfo.color, color: '#fff' }}
                        >
                          {tierInfo.name}
                        </div>
                      )}
                    </div>

                    {/* Content Info */}
                    <div className="p-4">
                      <h3 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mb-2 line-clamp-2 text-sm" style={{ color: 'var(--muted)' }}>
                          {item.description}
                        </p>
                      )}
                      <div
                        className="flex items-center gap-2 text-xs"
                        style={{ color: 'var(--muted)' }}
                      >
                        <Calendar size={12} />
                        {formatDate(item.date)}
                      </div>
                    </div>

                    {/* Action */}
                    {hasAccess ? (
                      <a
                        href={item.url || '#'}
                        className="absolute inset-0"
                        aria-label={`View ${item.title}`}
                      />
                    ) : (
                      <a
                        href={joinUrl || '#'}
                        className="absolute inset-0"
                        aria-label={`Join to access ${item.title}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* View More */}
            {exclusiveContent.length > maxPreviewItems && (
              <div className="mt-8 text-center">
                <a
                  href={joinUrl || '#'}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  View All {exclusiveContent.length} Items
                  <ArrowRight size={18} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Benefits Summary */}
        <div className="mt-16 rounded-2xl p-8" style={{ background: 'var(--panel)' }}>
          <h2 className="mb-6 text-center text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Member Benefits
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Music,
                title: 'Exclusive Music',
                desc: 'Unreleased tracks, demos, and acoustic versions',
              },
              {
                icon: Video,
                title: 'Behind the Scenes',
                desc: 'Studio sessions, tour footage, and more',
              },
              {
                icon: Gift,
                title: 'Member Perks',
                desc: 'Discounts, early access, and special offers',
              },
              {
                icon: MessageSquare,
                title: 'Direct Access',
                desc: 'Chat, Q&As, and personal interactions',
              },
            ].map((benefit, i) => (
              <div key={i} className="text-center">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${accentColor}20` }}
                >
                  <benefit.icon size={24} style={{ color: accentColor }} />
                </div>
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                  {benefit.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
