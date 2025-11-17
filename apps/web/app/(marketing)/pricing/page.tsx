'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Users, Building2, AlertCircle, ChevronDown, ChevronUp, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
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
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const getPrice = (basePrice: number) => {
    return billingCycle === 'yearly' ? Math.floor(basePrice * 0.83) : basePrice;
  };

  const scrollToDetails = () => {
    document.getElementById('feature-details')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-purple-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-7xl relative z-10 py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">AI-Powered Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Transparent Pricing for Musicians
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Fair pricing with AI features included. No hidden fees, no price gouging - just sustainable margins for continuous development.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-16 h-8 bg-surface-muted rounded-full transition-colors border border-border"
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-7 h-7 bg-brand-primary rounded-full shadow-lg"
                  animate={{ x: billingCycle === 'yearly' ? 30 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              </button>
              <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
                Yearly
                <span className="ml-2 text-sm text-green-500 font-normal">Save 17%</span>
              </span>
            </div>

            <button
              onClick={() => setShowCostDetails(!showCostDetails)}
              className="text-sm text-brand-primary hover:text-brand-primary/80 flex items-center gap-2 mx-auto transition"
            >
              <AlertCircle className="h-4 w-4" />
              {showCostDetails ? 'Hide' : 'See'} our actual costs & margins
            </button>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl py-16 px-4">

        {/* Cost Details */}
        {showCostDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
          <Card className="p-8 rnrb-card bg-yellow-500/5 border-yellow-500/20">
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
          </motion.div>
        )}

        {/* Value Proposition - No Emojis */}
        <Card className="p-8 mb-12 rnrb-card bg-gradient-to-br from-brand-primary/5 to-purple-500/5">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-bold mb-4">Fair, Sustainable Pricing</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start small and scale as you grow. Our pricing is designed to be sustainable for both you and us.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rnrb-card p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Check className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold mb-2">Pay for What You Use</h3>
                <p className="text-sm text-muted-foreground">
                  Generous included limits with transparent overage pricing
                </p>
              </div>
              <div className="rnrb-card p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold mb-2">Volume Discounts</h3>
                <p className="text-sm text-muted-foreground">
                  Better rates as you upgrade - grow with confidence
                </p>
              </div>
              <div className="rnrb-card p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold mb-2">No Surprises</h3>
                <p className="text-sm text-muted-foreground">
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
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.includes('✨') ? (
                        <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Expand for More Details Button */}
                <button
                  onClick={() => setExpandedPlan(expandedPlan === plan.name ? null : plan.name)}
                  className="w-full py-2 text-sm text-brand-primary hover:text-brand-primary/80 font-medium flex items-center justify-center gap-2 transition mb-4"
                >
                  {expandedPlan === plan.name ? (
                    <><ChevronUp className="w-4 h-4" /> Hide Details</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> See Full Details</>
                  )}
                </button>

                {/* Expanded Details */}
                {expandedPlan === plan.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 space-y-4"
                  >
                    {/* Usage Limits */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-3">Usage Limits & Overages</h4>
                      <div className="space-y-2 text-xs text-muted-foreground bg-surface/50 p-3 rounded-lg">
                        <p>• Recording: {plan.limits.recording}</p>
                        <p>• Streaming: {plan.limits.streaming}</p>
                        <p>• Messaging: {plan.limits.messaging}</p>
                        <p>• Storage: {plan.limits.storage}</p>
                        {plan.limits.ai && <p>• AI: {plan.limits.ai}</p>}
                      </div>
                    </div>

                    {/* Not Included */}
                    {plan.notIncluded.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-3">Not Included in This Plan</h4>
                        <div className="space-y-2">
                          {plan.notIncluded.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 text-xs">
                              <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <Link href="/auth">
                  <Button 
                    className={`w-full ${plan.popular ? 'rnrb-button-primary' : 'rnrb-button-secondary'} px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2`}
                  >
                    {plan.price === 0 ? 'Start Free' : 'Get Started'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
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
      </div>
    </div>
  );
}
