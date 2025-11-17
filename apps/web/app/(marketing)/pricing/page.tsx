'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Users, Building2, AlertCircle } from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Try the platform with essential features',
    features: [
      '1 active project',
      '2 GB storage',
      '2 hours video calls/month',
      'Real-time messaging',
      'Project management',
      'Community support',
    ],
    aiFeatures: {
      included: false,
      note: 'AI features not included'
    },
    limits: {
      recording: 'Not available',
      streaming: 'Not available',
      messaging: '5,000 messages/month',
      storage: '2 GB max',
    },
    notIncluded: [
      'AI features',
      'Recording/streaming',
      'Team collaboration',
      'Priority support',
    ],
    popular: false,
  },
  {
    name: 'Starter',
    price: 29,
    description: 'Core collaboration features for solo artists',
    features: [
      '5 active projects',
      '10 GB storage',
      '10 hours video calls/month',
      '5 hours recording/month',
      '3 hours streaming/month',
      'Real-time messaging',
      'Email support',
    ],
    aiFeatures: {
      included: true,
      limits: '50 AI queries/month',
      note: 'Basic AI assistance'
    },
    limits: {
      recording: '5 hours included, then $0.99/hour',
      streaming: '3 hours included, then $1.49/hour',
      messaging: '20,000 messages/month',
      storage: '10 GB included, then $5/10GB',
      ai: '50 AI chat queries/month, then $0.10/query',
    },
    notIncluded: [
      'AI transcription',
      'AI tour routing',
      'AI content generator',
      'Team collaboration (5+ members)',
      'Advanced analytics',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: 99,
    description: 'Full AI suite + professional collaboration tools',
    features: [
      '20 active projects',
      '50 GB storage',
      '30 hours video calls/month',
      '15 hours recording/month',
      '8 hours streaming/month',
      'Advanced analytics',
      'Priority support',
      'Team collaboration (10 members)',
      '✨ ALL AI FEATURES INCLUDED',
      '500 AI queries/month',
      '10 hours AI transcription/month',
      'AI tour routing (unlimited)',
      'AI mix suggestions (20 songs/month)',
      'AI content generator (50 uses/month)',
    ],
    aiFeatures: {
      included: true,
      limits: '500 AI chat queries, 10hrs transcription, unlimited routing',
      highlight: true
    },
    limits: {
      recording: '15 hours included, then $0.89/hour',
      streaming: '8 hours included, then $1.29/hour',
      messaging: '200,000 messages/month',
      storage: '50 GB included, then $4/10GB',
      ai: '500 queries, 10hrs transcription, 20 mix assists/mo, then pay-as-you-go',
    },
    notIncluded: [
      'Phone support',
      'Custom domain',
      'White labeling',
    ],
    popular: true,
  },
  {
    name: 'Studio Pro',
    price: 299,
    description: 'For studios, labels, and teams with high AI usage',
    features: [
      'Unlimited projects',
      '500 GB storage',
      '100 hours video calls/month',
      '60 hours recording/month',
      '30 hours streaming/month',
      'Premium analytics & insights',
      '24/7 priority support',
      'Unlimited team members',
      '✨ UNLIMITED AI FEATURES',
      '2,000 AI queries/month',
      '40 hours AI transcription/month',
      'Unlimited AI tour routing',
      'Unlimited AI mix suggestions',
      'Unlimited AI content generation',
      'AI royalty split tracking',
      'Custom branding',
      'API access',
      'Priority AI processing',
    ],
    aiFeatures: {
      included: true,
      limits: '2,000 queries, 40hrs transcription, all features unlimited',
      highlight: true,
      priority: true
    },
    limits: {
      recording: '60 hours included, then $0.79/hour',
      streaming: '30 hours included, then $1.19/hour',
      messaging: 'Unlimited',
      storage: '500 GB included, then $2.50/10GB',
      ai: '2,000 queries, 40hrs transcription, unlimited mix/routing/content',
    },
    notIncluded: [],
    popular: false,
  },
];

const costBreakdown = {
  recording: 0.81, // per hour (Daily.co)
  streaming: 0.90, // per hour RTMP (Daily.co)
  storage: 0.18, // per GB/month after 30 days
  videoCall: 0.24, // per hour per participant (Daily.co)
  messaging: 0.00001, // per message (Ably)
  aiChatQuery: 0.005, // per query (GPT-4 Turbo avg)
  aiTranscription: 0.006, // per minute (Whisper API)
  aiMixAnalysis: 0.02, // per song analysis
  aiContentGen: 0.03, // per generation
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCostDetails, setShowCostDetails] = useState(false);

  const getPrice = (basePrice: number) => {
    return billingCycle === 'yearly' ? Math.floor(basePrice * 0.83) : basePrice;
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Transparent Pricing for Musicians
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            All plans include core features. Pay for what you use, with generous limits that cover most needs.
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-muted rounded-full transition-colors"
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-foreground rounded-full"
                animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </button>
            <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
              Yearly
              <span className="ml-2 text-sm text-green-500 font-normal">Save 17%</span>
            </span>
          </div>

          {/* Cost Transparency Button */}
          <button
            onClick={() => setShowCostDetails(!showCostDetails)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
          >
            <AlertCircle className="h-4 w-4" />
            {showCostDetails ? 'Hide' : 'Show'} actual service costs
          </button>
        </div>

        {/* Cost Details */}
        {showCostDetails && (
          <Card className="p-6 mb-8 bg-yellow-500/5 border-yellow-500/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Actual Service Costs (What We Pay)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-brand-primary mb-2">Video/Recording:</p>
                <p><strong>Recording:</strong> $0.81/hour</p>
                <p><strong>Streaming:</strong> $0.90/hour</p>
                <p><strong>Video Calls:</strong> $0.24/hr/person</p>
              </div>
              <div>
                <p className="font-semibold text-purple-400 mb-2">AI Services (NEW):</p>
                <p><strong>Chat Query:</strong> ~$0.005 each</p>
                <p><strong>Transcription:</strong> $0.006/min</p>
                <p><strong>Mix Analysis:</strong> $0.02/song</p>
                <p><strong>Content Gen:</strong> $0.03/use</p>
              </div>
              <div>
                <p className="font-semibold text-brand-primary mb-2">Infrastructure:</p>
                <p><strong>Storage:</strong> $0.18/GB/month</p>
                <p><strong>Messaging:</strong> $0.01/1K msgs</p>
                <p><strong>Platform:</strong> ~15-20% overhead</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              <strong>Our commitment:</strong> Transparent costs + sustainable 35-40% margin for development & support. No hidden fees, no price gouging.
            </p>
          </Card>
        )}

        {/* Value Proposition */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Fair, Sustainable Pricing</h2>
            <p className="text-lg mb-6">
              Start small and scale as you grow. Our pricing is designed to be sustainable for both you and us.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">💰 Pay for What You Use</h3>
                <p className="text-muted-foreground">
                  Reasonable included limits with transparent overage pricing
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📈 Volume Discounts</h3>
                <p className="text-muted-foreground">
                  Better rates as you upgrade - grow with confidence
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎯 No Surprises</h3>
                <p className="text-muted-foreground">
                  Clear notifications before hitting limits
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <Card className={`p-8 h-full ${plan.popular ? 'border-2 border-purple-500/50' : ''} ${plan.aiFeatures?.highlight ? 'bg-gradient-to-br from-purple-500/5 to-transparent' : ''}`}>
                <div className="mb-6">
                  {plan.aiFeatures?.highlight && (
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-400">AI POWERED</span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${getPrice(plan.price)}</span>
                    <span className="text-muted-foreground">/{billingCycle === 'yearly' ? 'mo' : 'month'}</span>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-green-500 mt-1">
                        ${plan.price * 12 - getPrice(plan.price) * 12} saved yearly
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Usage Limits */}
                <div className="border-t pt-4 mb-6">
                  <h4 className="font-semibold text-sm mb-3">Usage Limits</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Recording: {plan.limits.recording}</p>
                    <p>• Streaming: {plan.limits.streaming}</p>
                    <p>• Messaging: {plan.limits.messaging}</p>
                    <p>• Storage: {plan.limits.storage}</p>
                  </div>
                </div>

                {/* Not Included */}
                {plan.notIncluded.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {plan.notIncluded.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'secondary'}
                >
                  Get Started
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Add-On Option */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-2 border-purple-500/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
              <h2 className="text-3xl font-bold">AI Feature Add-On</h2>
            </div>
            <p className="text-center text-lg text-muted-foreground mb-8">
              Already have Free or Starter? Add AI features à la carte
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rnrb-card p-6 bg-purple-500/5">
                <h3 className="font-semibold mb-3 text-purple-400">AI Starter Pack - $15/month</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ 100 AI chat queries/month</li>
                  <li>✓ 2 hours AI transcription/month</li>
                  <li>✓ AI tour routing (5 routes/month)</li>
                  <li>✓ $0.10 per additional query</li>
                </ul>
              </div>
              
              <div className="rnrb-card p-6 bg-purple-500/5">
                <h3 className="font-semibold mb-3 text-purple-400">AI Pro Pack - $45/month</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ 500 AI chat queries/month</li>
                  <li>✓ 10 hours AI transcription/month</li>
                  <li>✓ Unlimited AI tour routing</li>
                  <li>✓ AI mix suggestions (20/month)</li>
                  <li>✓ AI content generator (30/month)</li>
                  <li>✓ Better overage rates</li>
                </ul>
              </div>
            </div>
            
            <p className="text-center mt-6 text-sm text-muted-foreground">
              💡 <strong>Note:</strong> Professional & Studio Pro plans include AI features - add-ons are for Free/Starter tiers only
            </p>
          </div>
        </Card>

        {/* Enterprise Section */}
        <Card className="p-12 text-center rnrb-card bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Enterprise & Custom Solutions
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Need higher limits, custom features, or on-premise deployment? 
              We offer flexible solutions for labels, large studios, and music organizations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <Building2 className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">White Label</h3>
                <p className="text-sm text-muted-foreground">
                  Your brand, our technology
                </p>
              </div>
              <div>
                <Users className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">Unlimited Scale</h3>
                <p className="text-sm text-muted-foreground">
                  No limits on usage or users
                </p>
              </div>
              <div>
                <Zap className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">Custom Features</h3>
                <p className="text-sm text-muted-foreground">
                  Tailored to your workflow
                </p>
              </div>
            </div>
            
            <Button size="lg" className="gap-2">
              Contact Sales
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What happens if I exceed my limits?</h3>
              <p className="text-muted-foreground">
                You'll receive notifications at 80% and 100% usage. Pay-as-you-go rates apply automatically - 
                no service interruption. Rates vary by plan (better rates at higher tiers). 
                Upgrade anytime to get more included hours and better overage rates.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes! Upgrade instantly and we'll prorate the difference. 
                Downgrades take effect at the next billing cycle to ensure you get full value.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you offer educational discounts?</h3>
              <p className="text-muted-foreground">
                Yes! Students and educators get 50% off any plan. 
                Music schools and institutions qualify for special pricing. Contact us with your .edu email.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What about non-profit organizations?</h3>
              <p className="text-muted-foreground">
                Registered non-profits receive 30% off all plans. 
                We also offer special grants for music education programs.
              </p>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
