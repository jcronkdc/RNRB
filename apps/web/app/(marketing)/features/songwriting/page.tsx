'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music2, Sparkles, FileText, ChevronRight, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';

export default function SongwritingFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-6xl relative z-10 py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-pink-500/10 border border-pink-500/20">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-pink-400 font-medium">AI-Powered</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Songwriting Studio
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Break through creative blocks with AI that understands music theory, 
              song structure, and your unique style.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth?signup=true">
                <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2">
                  Try It Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button className="rnrb-button-secondary px-8 py-4 rounded-xl text-lg font-semibold">
                  See How It Works
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="rnrb-container max-w-7xl py-20 px-4">
        <h2 className="text-4xl font-display font-bold text-center mb-12">
          Powerful Songwriting Tools
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Music2,
              color: 'brand-primary',
              title: 'Chord Progression AI',
              description: 'Generate progressions that fit your key, tempo, and genre. Includes common patterns and creative variations.'
            },
            {
              icon: FileText,
              color: 'purple-400',
              title: 'Smart Lyrics Assistant',
              description: 'Get lyric suggestions that match your melody and theme. Maintains consistent tone and rhyme schemes.'
            },
            {
              icon: Sparkles,
              color: 'blue-400',
              title: 'Melody Ideas',
              description: 'Generate melodic phrases that complement your chord progressions and lyrical rhythm.'
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
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div id="demo" className="border-t border-border/50 pt-20">
          <h2 className="text-4xl font-display font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                title: 'Set Your Parameters',
                description: 'Choose your key, tempo, genre, and mood. The AI adapts to your preferences.'
              },
              {
                step: 2,
                title: 'Generate & Iterate',
                description: 'Get instant suggestions for chords, lyrics, and melodies. Regenerate until it feels right.'
              },
              {
                step: 3,
                title: 'Refine & Export',
                description: 'Edit AI suggestions to match your vision. Export to your DAW or continue collaborating in-platform.'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-brand-primary/10 border-2 border-brand-primary/30">
                  <span className="text-3xl font-display font-bold text-brand-primary">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-4xl py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-12 h-12 text-brand-primary mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold mb-4">
              AI That Serves Your Creativity
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our AI tools are designed to assist, not replace. You stay in creative control while 
              getting suggestions that help you work faster and explore new directions.
            </p>
          </motion.div>
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
            <h2 className="text-4xl font-display font-bold mb-4">Start Writing Better Songs</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Free plan includes 50 AI assists per month - enough to write several songs.
            </p>
            <Link href="/auth?signup=true">
              <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2">
                Try Songwriting AI Free
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
