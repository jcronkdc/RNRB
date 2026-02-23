'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Music,
  Sparkles,
  Wand2,
  Layers,
  ChevronRight,
  ArrowRight,
  CheckCircle,
} from '@/components/ui/custom-icons';
import Link from 'next/link';

export default function AIMusicFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-linear-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/3 top-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-6xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2">
              <Wand2 className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">BETA - Coming Soon</span>
            </div>

            <h1 className="font-display mb-6 text-5xl font-bold md:text-6xl">
              AI Music Generation
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">
              Create full instrumental tracks with AI, then replace stems with your own recordings.
              Perfect for demos, songwriting sessions, or learning production.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/auth?signup=true">
                <Button className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                  Join Beta Waitlist
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button className="rnrb-button-secondary rounded-xl px-8 py-4 text-lg font-semibold">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="rnrb-container max-w-7xl px-4 py-20">
        <h2 className="font-display mb-12 text-center text-4xl font-bold">What You Can Create</h2>

        <div className="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Music,
              color: 'brand-primary',
              title: 'Full Instrumental Tracks',
              description:
                'Generate complete backing tracks in any genre. Choose tempo, key, instruments, and mood to match your vision.',
              features: ['200+ instrument sounds', '50+ genre templates', 'Custom arrangements'],
            },
            {
              icon: Layers,
              color: 'purple-400',
              title: 'Stem-by-Stem Control',
              description:
                'Export each instrument as a separate stem. Replace AI drums with your live kit, or add your guitar over AI bass.',
              features: ['Individual stem export', 'Mix-ready quality', 'DAW-friendly formats'],
            },
            {
              icon: Wand2,
              color: 'orange-400',
              title: 'Variation Engine',
              description:
                'Generate multiple versions of the same idea. Perfect for finding the right vibe or A/B testing arrangements.',
              features: ['Instant variations', 'Preserve song structure', 'Infinite iterations'],
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className="rnrb-card h-full p-6">
                <div
                  className={`bg- mb-4 flex h-12 w-12 items-center justify-center rounded-lg${feature.color.split('-')[0]}-500/10`}
                >
                  <feature.icon className={`text- h-6 w-6${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="mb-4 text-muted-foreground">{feature.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0 text-brand-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="border-t border-border/50 pt-20">
          <h2 className="font-display mb-12 text-center text-4xl font-bold">How It Works</h2>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
            {[
              {
                step: 1,
                title: 'Describe Your Track',
                description:
                  'Set genre, tempo, key, and describe the mood or reference songs you like.',
              },
              {
                step: 2,
                title: 'AI Generates Music',
                description:
                  'Our AI creates a full instrumental track in seconds. Listen and iterate until it feels right.',
              },
              {
                step: 3,
                title: 'Export Stems',
                description:
                  'Download individual stems (drums, bass, keys, etc.) in WAV or MP3 format.',
              },
              {
                step: 4,
                title: 'Replace & Mix',
                description:
                  'Import into your DAW. Replace AI stems with your recordings or use as-is for demos.',
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-primary/30 bg-brand-primary/10">
                  <span className="font-display text-3xl font-bold text-brand-primary">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-6xl px-4 py-20">
          <h2 className="font-display mb-12 text-center text-4xl font-bold">Perfect For</h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Music,
                gradient: 'from-brand-primary to-orange-500',
                title: 'Songwriters',
                description:
                  'Create professional demos without hiring session musicians. Focus on melody and lyrics while AI handles the arrangement.',
              },
              {
                icon: Layers,
                gradient: 'from-purple-500 to-pink-500',
                title: 'Producers',
                description:
                  'Generate quick backing tracks for clients. Replace stems as they send recordings, keeping the workflow moving.',
              },
              {
                icon: Wand2,
                gradient: 'from-blue-500 to-cyan-500',
                title: 'Learning Musicians',
                description:
                  'Study production by dissecting AI-generated stems. See how professional arrangements are built layer by layer.',
              },
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                className="text-center"
              >
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br ${useCase.gradient}`}
                >
                  <useCase.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border/50">
        <div className="rnrb-container max-w-3xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="mx-auto mb-6 h-12 w-12 text-brand-primary" />
            <h2 className="font-display mb-4 text-4xl font-bold">Join the Beta</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              AI Music Generation is in active development. Join the waitlist to get early access
              and help shape the feature with your feedback.
            </p>
            <Link href="/auth?signup=true">
              <Button className="rnrb-button-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                Join Beta Waitlist
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
