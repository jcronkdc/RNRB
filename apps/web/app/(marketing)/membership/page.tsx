'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Crown,
  Music,
  Users,
  Mic2,
  FileText,
  Cloud,
  Headphones,
  Bot,
  Shield,
  Heart,
  Star
} from 'lucide-react';

const plans = [
  {
    name: "Explorer",
    price: "Free",
    description: "Perfect for trying out The CronkWaters Project",
    icon: Music,
    color: "from-gray-500 to-gray-600",
    features: [
      { text: "1 Active Project", included: true },
      { text: "Basic Audio Upload (5MB limit)", included: true },
      { text: "View Public Projects", included: true },
      { text: "Join 1 Organization", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Community Support", included: true },
      { text: "AI Features (10 credits/month)", included: true },
      { text: "Revenue Splits", included: false },
      { text: "Unlimited Storage", included: false },
      { text: "Live Sessions", included: false },
      { text: "Priority Support", included: false },
      { text: "Advanced Analytics", included: false }
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Creator",
    price: "$9.99",
    period: "/month",
    description: "For serious musicians and small teams",
    icon: Zap,
    color: "from-brand-primary to-brand-secondary",
    features: [
      { text: "Unlimited Projects", included: true },
      { text: "Pro Audio Upload (500MB limit)", included: true },
      { text: "Private & Public Projects", included: true },
      { text: "Join 5 Organizations", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Email Support", included: true },
      { text: "AI Features (500 credits/month)", included: true },
      { text: "Revenue Splits Management", included: true },
      { text: "50GB Cloud Storage", included: true },
      { text: "Live Sessions (2 hours/month)", included: true },
      { text: "CSV/PDF Exports", included: true },
      { text: "Custom Branding", included: false }
    ],
    cta: "Go Creator",
    popular: true
  },
  {
    name: "Studio",
    price: "$29.99",
    period: "/month",
    description: "For labels, studios, and power users",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    features: [
      { text: "Everything in Creator", included: true },
      { text: "Lossless Audio Upload (No limit)", included: true },
      { text: "Unlimited Organizations", included: true },
      { text: "White-label Options", included: true },
      { text: "Priority Support", included: true },
      { text: "AI Features (Unlimited)", included: true },
      { text: "Advanced Revenue Analytics", included: true },
      { text: "500GB Cloud Storage", included: true },
      { text: "Unlimited Live Sessions", included: true },
      { text: "API Access", included: true },
      { text: "Custom Integrations", included: true },
      { text: "Dedicated Account Manager", included: true }
    ],
    cta: "Go Studio",
    popular: false
  }
];

const aiFeatures = [
  {
    icon: Bot,
    title: "AI Lyrics Generation",
    description: "Transform ideas into professional lyrics with our AI co-writer"
  },
  {
    icon: Mic2,
    title: "Voice Synthesis",
    description: "Create demo vocals with AI-powered voice technology"
  },
  {
    icon: Headphones,
    title: "Smart Mastering",
    description: "AI-enhanced mastering suggestions for your tracks"
  },
  {
    icon: FileText,
    title: "Metadata Generation",
    description: "Automatic metadata and description generation"
  }
];

// eslint-disable-next-line import/no-default-export
export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/50 to-background">
      {/* Hero Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Choose Your Creative Path
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From free exploration to professional studio features, we have a plan that grows with your music journey.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm">
            <Heart className="w-4 h-4" />
            <span>100% of revenue supports independent musicians</span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-3xl border ${
                plan.popular ? 'border-brand-primary shadow-xl scale-105' : 'border-border/50'
              } bg-surface/80 backdrop-blur p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm rounded-full font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} p-4`}>
                  <plan.icon className="w-full h-full text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href="/auth"
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-lg'
                    : 'border-2 border-border hover:border-brand-primary hover:bg-surface'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* AI Credits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Creative Tools</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every plan includes AI credits to enhance your creative process. 
              Higher tiers get more credits for unlimited experimentation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6 text-center"
              >
                <feature.icon className="w-12 h-12 text-brand-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Operating Costs Transparency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-24 rounded-3xl border border-border/50 bg-surface/80 backdrop-blur p-12"
        >
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-brand-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We believe in complete transparency. Your membership directly supports our mission 
              and covers the real costs of providing professional music creation tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Cloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Infrastructure</h3>
              <p className="text-sm text-muted-foreground">
                Servers, storage, and CDN for reliable performance
              </p>
            </div>
            <div>
              <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI models for lyrics, voice, and mastering
              </p>
            </div>
            <div>
              <Users className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Community Support</h3>
              <p className="text-sm text-muted-foreground">
                Development, support staff, and platform improvements
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6">
              <h3 className="font-semibold mb-2">What are AI credits?</h3>
              <p className="text-muted-foreground">
                AI credits are used for features like lyric generation, voice synthesis, and smart mastering. 
                Each AI operation consumes credits based on complexity. Unused credits don&apos;t roll over.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. We use bank-level encryption for all data, secure cloud storage, and never share 
                your music or personal information without explicit permission.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6">
              <h3 className="font-semibold mb-2">What if I need more storage?</h3>
              <p className="text-muted-foreground">
                Additional storage can be purchased as an add-on to any plan. Contact support for custom 
                storage solutions beyond our standard offerings.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Start Creating?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of musicians who are already using The CronkWaters Project to bring their music to life.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/auth"
              className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-semibold hover:shadow-xl transition-all"
            >
              Start Free Today
            </Link>
            <Link 
              href="/vision"
              className="px-8 py-4 border-2 border-brand-primary text-brand-primary rounded-2xl font-semibold hover:bg-brand-primary/10 transition-all"
            >
              Learn Our Story
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            <Star className="w-4 h-4 inline mr-1" />
            No credit card required for Explorer plan
          </p>
        </motion.div>
      </section>
    </div>
  );
}

