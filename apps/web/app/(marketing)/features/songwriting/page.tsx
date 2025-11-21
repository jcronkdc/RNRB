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
              <Link href="/songwriting">
                <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2">
                  Launch Studio
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
        <h2 className="text-4xl font-display font-bold text-center mb-4">
          Everything You Need to Write Great Songs
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
          Professional-grade AI tools that understand music theory, lyrical structure, and your creative vision
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Music2,
              color: 'brand-primary',
              title: 'Chord Progression AI',
              description: 'Generate progressions that fit your key, tempo, and genre. Get instant suggestions from I-IV-V basics to jazz extensions.',
              features: ['All 12 keys', 'Major & minor modes', 'Genre-specific patterns', 'Voice leading suggestions']
            },
            {
              icon: FileText,
              color: 'purple-400',
              title: 'Smart Lyrics Assistant',
              description: 'AI-powered lyric suggestions that match your melody, theme, and style. Maintains consistent rhyme schemes and natural flow.',
              features: ['Rhyme suggestions', 'Syllable matching', 'Theme consistency', 'Multiple writing styles']
            },
            {
              icon: Sparkles,
              color: 'blue-400',
              title: 'Melody Generator',
              description: 'Create melodic phrases that perfectly complement your chords and lyrics. Export as MIDI to your DAW.',
              features: ['Vocal range aware', 'Scale-locked notes', 'Rhythm variations', 'MIDI export']
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className="p-6 rnrb-card h-full hover:border-brand-primary/50 transition-all">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-${feature.color.split('-')[0]}-500/10`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.features.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-brand-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div id="demo" className="border-t border-border/50 pt-20">
          <h2 className="text-4xl font-display font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            From blank page to finished song in minutes, with AI assistance at every step
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {[
              {
                step: 1,
                title: 'Set Your Parameters',
                description: 'Choose your key, tempo, genre, and mood. The AI learns your style over time and adapts suggestions.',
                details: ['Select from 12 keys', 'Set BPM (40-200)', 'Pick genre tags', 'Define emotional tone']
              },
              {
                step: 2,
                title: 'Generate & Iterate',
                description: 'Get instant suggestions for chords, lyrics, and melodies. Regenerate individual sections or the entire song.',
                details: ['One-click generation', 'Refine by section', 'Lock what works', 'Try variations']
              },
              {
                step: 3,
                title: 'Refine & Export',
                description: 'Edit AI suggestions to match your vision. Export chord charts to PDF, melodies to MIDI, or continue in-platform.',
                details: ['Manual editing', 'MIDI export', 'PDF chord charts', 'Share with band']
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
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <div className="space-y-2">
                  {step.details.map((detail) => (
                    <div key={detail} className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                      {detail}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Real Example */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 rnrb-card bg-surface-elevated border-brand-primary/20">
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-primary" />
                See It In Action
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-purple-400">Input:</h4>
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Key: C Major</p>
                    <p className="text-sm text-muted-foreground">Tempo: 120 BPM</p>
                    <p className="text-sm text-muted-foreground">Genre: Folk Rock</p>
                    <p className="text-sm text-muted-foreground">Mood: Hopeful</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-brand-primary">AI Output:</h4>
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <p className="text-sm font-mono mb-1">Verse: C - Am - F - G</p>
                    <p className="text-sm font-mono mb-1">Chorus: F - G - Am - C</p>
                    <p className="text-sm font-mono mb-1">Bridge: Dm - G - C - Am</p>
                    <p className="text-xs text-muted-foreground mt-2">+ melody suggestions + lyric ideas</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  🎯 <strong>Real musicians love it:</strong> "Cut my songwriting time in half while exploring ideas I'd never have tried" - Sarah K., Nashville
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-4xl py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Sparkles className="w-12 h-12 text-brand-primary mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold mb-4">
              AI That Serves Your Creativity
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Our AI tools are designed to assist, not replace. You stay in creative control while 
              getting suggestions that help you work faster and explore new directions.
            </p>
          </motion.div>
          
          {/* What Makes It Different */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 rnrb-card">
              <h3 className="text-xl font-semibold mb-3">🎵 Understands Music Theory</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Voice leading principles</li>
                <li>• Harmonic function</li>
                <li>• Common progressions (I-IV-V, ii-V-I)</li>
                <li>• Modal interchange options</li>
                <li>• Secondary dominants</li>
              </ul>
            </Card>
            
            <Card className="p-6 rnrb-card">
              <h3 className="text-xl font-semibold mb-3">✍️ Lyrical Intelligence</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Natural language flow</li>
                <li>• Rhyme scheme awareness (AABB, ABAB, etc.)</li>
                <li>• Syllable counting for melodies</li>
                <li>• Thematic consistency</li>
                <li>• Multiple writing styles (narrative, abstract, storytelling)</li>
              </ul>
            </Card>
            
            <Card className="p-6 rnrb-card">
              <h3 className="text-xl font-semibold mb-3">🎼 Melody Generation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Scale-locked note suggestions</li>
                <li>• Vocal range consideration</li>
                <li>• Rhythmic variations (eighth, sixteenth notes)</li>
                <li>• Stepwise vs leap motion</li>
                <li>• Export to MIDI for your DAW</li>
              </ul>
            </Card>
            
            <Card className="p-6 rnrb-card">
              <h3 className="text-xl font-semibold mb-3">🔄 Workflow Integration</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Export to PDF (chord charts + lyrics)</li>
                <li>• MIDI file export for DAWs</li>
                <li>• Share with band members instantly</li>
                <li>• Version control (save multiple drafts)</li>
                <li>• Real-time collaboration</li>
              </ul>
            </Card>
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
            <h2 className="text-4xl font-display font-bold mb-4">Start Writing Better Songs</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Free plan includes 50 AI assists per month - enough to write several songs.
            </p>
            <Link href="/songwriting">
              <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2">
                Launch Songwriting Studio
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
