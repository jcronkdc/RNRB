'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Users, Building2, AlertCircle } from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import Link from 'next/link';

const plans = [
  {
    name: 'Solo Artist',
    price: 29,
    description: 'Perfect for independent musicians and small projects',
    features: [
      '5 active projects',
      '10 GB storage',
      '50 hours recording/month',
      '10 hours streaming/month',
      'Basic analytics',
      'Email support',
      'Mobile app access',
      'Basic collaboration tools',
    ],
    limits: {
      recording: '50 hours/month (~$40 value)',
      streaming: '10 hours/month (~$9 value)',
      messaging: '10,000 messages/month',
      storage: '10 GB included, $5/10GB extra',
    },
    notIncluded: [
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
      'Team management',
    ],
    popular: false,
  },
  {
    name: 'Band Pro',
    price: 99,
    description: 'Ideal for bands and collaborative music projects',
    features: [
      '25 active projects',
      '100 GB storage',
      '200 hours recording/month',
      '50 hours streaming/month',
      'Advanced analytics',
      'Priority email support',
      'Team collaboration (10 members)',
      'Project templates',
      'Version control',
      'Guest collaborator access',
    ],
    limits: {
      recording: '200 hours/month (~$162 value)',
      streaming: '50 hours/month (~$45 value)',
      messaging: '100,000 messages/month',
      storage: '100 GB included, $3/10GB extra',
    },
    notIncluded: [
      'Phone support',
      'Custom domain',
      'White labeling',
      'Advanced API access',
    ],
    popular: true,
  },
  {
    name: 'Studio Business',
    price: 299,
    description: 'For professional studios and music organizations',
    features: [
      'Unlimited projects',
      '500 GB storage',
      '500 hours recording/month',
      '200 hours streaming/month',
      'Premium analytics & insights',
      '24/7 phone & email support',
      'Unlimited team members',
      'Advanced permissions',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    limits: {
      recording: '500 hours/month (~$405 value)',
      streaming: '200 hours/month (~$180 value)',
      messaging: 'Unlimited',
      storage: '500 GB included, $2/10GB extra',
    },
    notIncluded: [],
    popular: false,
  },
];

const costBreakdown = {
  recording: 0.81, // per hour
  streaming: 0.90, // per hour RTMP
  storage: 0.18, // per hour after 30 days
  videoCall: 0.24, // per hour per participant
  messaging: 0.00001, // per message (Ably estimate)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Recording:</strong> $0.81/hour (Daily.co)</p>
                <p><strong>Streaming:</strong> $0.90/hour RTMP (Daily.co)</p>
                <p><strong>Video Calls:</strong> $0.24/hour/participant (Daily.co)</p>
              </div>
              <div>
                <p><strong>Storage:</strong> $0.18/hour after 30 days</p>
                <p><strong>Messaging:</strong> ~$0.01 per 1,000 messages (Ably)</p>
                <p><strong>Infrastructure:</strong> ~15-20% of revenue</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Our pricing includes these costs plus platform development, support, and a sustainable margin.
            </p>
          </Card>
        )}

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
              
              <Card className={`p-8 h-full ${plan.popular ? 'border-2 border-purple-500/50' : ''}`}>
                <div className="mb-6">
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

        {/* Enterprise Section */}
        <Card className="p-12 text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10">
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
                You'll receive notifications at 80% and 100% usage. Overages are billed at: 
                Recording $1/hour, Streaming $1.20/hour, Storage $5/10GB. 
                You can upgrade anytime to avoid overages.
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
