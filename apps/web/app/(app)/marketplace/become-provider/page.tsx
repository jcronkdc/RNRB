'use client';

/**
 * BECOME A PROVIDER
 *
 * Onboarding flow for service providers to join the marketplace
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import {
  Sparkles,
  CheckCircle,
  DollarSign,
  Users,
  Star,
  ArrowRight,
  Camera,
  Briefcase,
  Music,
  CreditCard,
  Loader2,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STEPS = [
  {
    id: 'profile',
    title: 'Create Your Profile',
    description: 'Add your bio, skills, and portfolio samples',
    icon: Camera,
  },
  {
    id: 'services',
    title: 'List Your Services',
    description: 'Define what you offer and set your prices',
    icon: Briefcase,
  },
  {
    id: 'portfolio',
    title: 'Showcase Your Work',
    description: 'Upload audio samples and past projects',
    icon: Music,
  },
  {
    id: 'payment',
    title: 'Connect Payments',
    description: 'Set up Stripe to receive payouts',
    icon: CreditCard,
  },
];

const BENEFITS = [
  {
    icon: DollarSign,
    title: 'Set Your Own Rates',
    description: 'You control your pricing. Keep 90-95% of every booking.',
  },
  {
    icon: Users,
    title: 'Reach New Clients',
    description: 'Connect with thousands of musicians looking for professional services.',
  },
  {
    icon: Star,
    title: 'Build Your Reputation',
    description: 'Collect reviews and ratings to stand out in the marketplace.',
  },
];

export default function BecomeProviderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    tagline: '',
    category: '',
  });

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/providers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/marketplace/providers/${data.slug}/edit`);
      }
    } catch (error) {
      console.error('Failed to create provider profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <header className="from-brand-primary/10 border-b border-white/10 bg-linear-to-r via-purple-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={48}
                height={48}
                className="transition-opacity hover:opacity-80"
              />
            </Link>
            <div>
              <h1 className="font-display text-foreground text-2xl font-bold">Become a Provider</h1>
              <p className="text-muted-foreground text-sm">
                Share your skills and grow your music business
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="from-brand-primary mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-r to-purple-500">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-foreground mb-4 text-4xl font-bold">Turn Your Talent Into Income</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Join our marketplace of professional engineers, producers, and session musicians.
            Connect with artists who need your expertise and get paid doing what you love.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full p-6 text-center">
                  <div className="bg-brand-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon className="text-brand-primary h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-foreground mb-8 text-center text-2xl font-bold">How It Works</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="relative"
                >
                  {index < STEPS.length - 1 && (
                    <div className="from-border absolute top-8 right-0 hidden h-0.5 w-full translate-x-1/2 bg-linear-to-r to-transparent md:block" />
                  )}
                  <Card className="relative z-10 p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="bg-brand-primary flex h-10 w-10 items-center justify-center rounded-full text-white">
                        {index + 1}
                      </div>
                      <Icon className="text-muted-foreground h-6 w-6" />
                    </div>
                    <h4 className="text-foreground mb-2 font-semibold">{step.title}</h4>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mx-auto max-w-lg overflow-hidden">
            <div className="from-brand-primary/20 bg-linear-to-r to-purple-500/20 p-6">
              <h3 className="text-foreground text-xl font-bold">Get Started</h3>
              <p className="text-muted-foreground text-sm">
                Create your provider profile in minutes
              </p>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  placeholder="e.g. John Smith Audio"
                  className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Grammy-nominated mixing engineer"
                  className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Primary Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="border-border bg-surface text-foreground focus:border-brand-primary w-full rounded-lg border px-4 py-3 focus:outline-hidden"
                >
                  <option value="">Select category...</option>
                  <option value="mixing">Mixing</option>
                  <option value="mastering">Mastering</option>
                  <option value="production">Production</option>
                  <option value="session-musicians">Session Musicians</option>
                  <option value="vocal-services">Vocal Services</option>
                  <option value="songwriting">Songwriting</option>
                  <option value="live-sound">Live Sound</option>
                  <option value="video-production">Video Production</option>
                </select>
              </div>
              <Button
                onClick={handleStart}
                disabled={loading || !formData.displayName}
                className="bg-brand-primary hover:bg-brand-primary/90 w-full py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Create Provider Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Trust Badges */}
        <div className="text-muted-foreground mt-12 flex flex-wrap items-center justify-center gap-8 text-center text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>No monthly fees</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>90-95% earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Secure payments via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
