'use client';

import { motion } from 'framer-motion';
import { 
  CreditCard,
  Sparkles,
  Check,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    credits: 50,
    features: [
      '50 credits per month',
      'Basic AI models',
      'MP3 downloads',
      '30-second tracks',
      'Community support'
    ],
    current: true
  },
  {
    name: 'Pro',
    price: '$19',
    credits: 500,
    features: [
      '500 credits per month',
      'Advanced AI models',
      'WAV + MP3 downloads',
      'Up to 3-minute tracks',
      'Stem separation',
      'Priority support',
      'Commercial license'
    ],
    popular: true
  },
  {
    name: 'Studio',
    price: '$49',
    credits: 2000,
    features: [
      '2000 credits per month',
      'All AI models',
      'All export formats',
      'Unlimited track length',
      'Advanced stem control',
      'API access',
      'Dedicated support',
      'Full commercial rights'
    ]
  }
];

const creditUsage = [
  { action: 'Generate track', cost: 10 },
  { action: 'Extend track', cost: 5 },
  { action: 'Get stems', cost: 8 },
  { action: 'Remix/variation', cost: 7 },
  { action: 'High quality export', cost: 3 }
];

export default function CreditsPage() {
  const currentCredits = 150;
  const maxCredits = 500;
  const creditPercentage = (currentCredits / maxCredits) * 100;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-brand-primary" />
          Credits & Billing
        </h1>
        <p className="text-foreground-muted mt-1">
          Manage your subscription and track credit usage
        </p>
      </div>

      {/* Current Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Current Usage</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-foreground-muted">Credits remaining</span>
              <span className="text-2xl font-bold">{currentCredits} / {maxCredits}</span>
            </div>
            <div className="h-3 bg-surface-hover rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary"
                initial={{ width: 0 }}
                animate={{ width: `${creditPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              Resets on December 1st
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-foreground-muted">Used this month</p>
              <p className="text-xl font-semibold">{maxCredits - currentCredits}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Average daily use</p>
              <p className="text-xl font-semibold">12</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Credit Costs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Credit Costs</h2>
        
        <div className="space-y-3">
          {creditUsage.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm">{item.action}</span>
              <span className="text-sm font-medium text-foreground-muted">
                {item.cost} credits
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Subscription Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className={`
                card p-6 relative
                ${plan.popular ? 'border-2 border-brand-primary' : ''}
                ${plan.current ? 'bg-surface-hover' : ''}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-primary text-background text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-foreground-muted">/month</span>
                </div>
                <p className="text-sm text-foreground-muted mt-1">
                  {plan.credits.toLocaleString()} credits
                </p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.current ? (
                <button className="btn-secondary w-full" disabled>
                  Current Plan
                </button>
              ) : (
                <button className="btn-primary w-full">
                  Upgrade to {plan.name}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Recent Credit Usage</h2>
        
        <div className="space-y-3">
          {[
            { action: 'Generated "Summer Vibes"', cost: -10, time: '2 hours ago' },
            { action: 'Extended "Midnight Drive"', cost: -5, time: '5 hours ago' },
            { action: 'Extracted stems', cost: -8, time: 'Yesterday' },
            { action: 'Monthly refill', cost: +500, time: '3 days ago' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${activity.cost > 0 ? 'bg-success/20' : 'bg-surface-hover'}
                `}>
                  {activity.cost > 0 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-foreground-muted" />
                  )}
                </div>
                <div>
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-foreground-muted">{activity.time}</p>
                </div>
              </div>
              <span className={`
                text-sm font-medium
                ${activity.cost > 0 ? 'text-success' : 'text-foreground-muted'}
              `}>
                {activity.cost > 0 ? '+' : ''}{Math.abs(activity.cost)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
