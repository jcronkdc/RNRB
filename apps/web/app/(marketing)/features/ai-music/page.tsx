'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Sparkles, Wand2, Layers, ChevronRight, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';

export default function AIMusicFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-6xl relative z-10 py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-orange-500/10 border border-orange-500/20">
              <Wand2 className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">BETA - Coming Soon</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              AI Music Generation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Create full instrumental tracks with AI, then replace stems with your own recordings. 
              Perfect for demos, songwriting sessions, or learning production.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth?signup=true">
                <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2">
                  Join Beta Waitlist
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button className="rnrb-button-secondary px-8 py-4 rounded-xl text-lg font-semibold">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="rnrb-container max-w-7xl py-20 px-4">
        <h2 className="text-4xl font-display font-bold text-center mb-12">
          What You Can Create
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Music,
              color: 'brand-primary',
              title: 'Full Instrumental Tracks',
              description: 'Generate complete backing tracks in any genre. Choose tempo, key, instruments, and mood to match your vision.',
              features: ['200+ instrument sounds', '50+ genre templates', 'Custom arrangements']
            },
            {
              icon: Layers,
              color: 'purple-400',
              title: 'Stem-by-Stem Control',
              description: 'Export each instrument as a separate stem. Replace AI drums with your live kit, or add your guitar over AI bass.',
              features: ['Individual stem export', 'Mix-ready quality', 'DAW-friendly formats']
            },
            {
              icon: Wand2,
              color: 'orange-400',
              title: 'Variation Engine',
              description: 'Generate multiple versions of the same idea. Perfect for finding the right vibe or A/B testing arrangements.',
              features: ['Instant variations', 'Preserve song structure', 'Infinite iterations']
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className="p-6 rnrb-card h-full">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-${feature.color.split('-')[0]}-500/10`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-primary flex-shrink-0" />
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
          <h2 className="text-4xl font-display font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: 1,
                title: 'Describe Your Track',
                description: 'Set genre, tempo, key, and describe the mood or reference songs you like.'
              },
              {
                step: 2,
                title: 'AI Generates Music',
                description: 'Our AI creates a full instrumental track in seconds. Listen and iterate until it feels right.'
              },
              {
                step: 3,
                title: 'Export Stems',
                description: 'Download individual stems (drums, bass, keys, etc.) in WAV or MP3 format.'
              },
              {
                step: 4,
                title: 'Replace & Mix',
                description: 'Import into your DAW. Replace AI stems with your recordings or use as-is for demos.'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-brand-primary/10 border-2 border-brand-primary/30">
                  <span className="text-3xl font-display font-bold text-brand-primary">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-6xl py-20 px-4">
          <h2 className="text-4xl font-display font-bold text-center mb-12">Perfect For</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Music,
                gradient: 'from-brand-primary to-orange-500',
                title: 'Songwriters',
                description: 'Create professional demos without hiring session musicians. Focus on melody and lyrics while AI handles the arrangement.'
              },
              {
                icon: Layers,
                gradient: 'from-purple-500 to-pink-500',
                title: 'Producers',
                description: 'Generate quick backing tracks for clients. Replace stems as they send recordings, keeping the workflow moving.'
              },
              {
                icon: Wand2,
                gradient: 'from-blue-500 to-cyan-500',
                title: 'Learning Musicians',
                description: 'Study production by dissecting AI-generated stems. See how professional arrangements are built layer by layer.'
              }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${useCase.gradient}`}>
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border/50">
        <div className="rnrb-container max-w-3xl py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-12 h-12 text-brand-primary mx-auto mb-6" />
            <h2 className="text-4xl font-display font-bold mb-4">Join the Beta</h2>
            <p className="text-xl text-muted-foreground mb-8">
              AI Music Generation is in active development. Join the waitlist to get early access 
              and help shape the feature with your feedback.
            </p>
            <Link href="/auth?signup=true">
              <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2">
                Join Beta Waitlist
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

