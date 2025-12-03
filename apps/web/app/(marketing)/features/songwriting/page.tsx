'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Music2,
  Sparkles,
  FileText,
  ChevronRight,
  ArrowRight,
  CheckCircle,
} from '@/components/ui/custom-icons';
import Link from 'next/link';

export default function SongwritingFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-6xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-400">AI-Powered</span>
            </div>

            <h1 className="font-display mb-6 text-5xl font-bold md:text-6xl">Songwriting Studio</h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">
              Break through creative blocks with AI that understands music theory, song structure,
              and your unique style.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/songwriting">
                <Button className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                  Launch Studio
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button className="rnrb-button-secondary rounded-xl px-8 py-4 text-lg font-semibold">
                  See How It Works
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="rnrb-container max-w-7xl px-4 py-20">
        <h2 className="font-display mb-4 text-center text-4xl font-bold">
          Everything You Need to Write Great Songs
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
          Professional-grade AI tools that understand music theory, lyrical structure, and your
          creative vision
        </p>

        <div className="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Music2,
              color: 'brand-primary',
              title: 'Chord Progression AI',
              description:
                'Generate progressions that fit your key, tempo, and genre. Get instant suggestions from I-IV-V basics to jazz extensions.',
              features: [
                'All 12 keys',
                'Major & minor modes',
                'Genre-specific patterns',
                'Voice leading suggestions',
              ],
            },
            {
              icon: FileText,
              color: 'purple-400',
              title: 'Smart Lyrics Assistant',
              description:
                'AI-powered lyric suggestions that match your melody, theme, and style. Maintains consistent rhyme schemes and natural flow.',
              features: [
                'Rhyme suggestions',
                'Syllable matching',
                'Theme consistency',
                'Multiple writing styles',
              ],
            },
            {
              icon: Sparkles,
              color: 'blue-400',
              title: 'Melody Generator',
              description:
                'Create melodic phrases that perfectly complement your chords and lyrics. Export as MIDI to your DAW.',
              features: [
                'Vocal range aware',
                'Scale-locked notes',
                'Rhythm variations',
                'MIDI export',
              ],
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className="rnrb-card h-full p-6 transition-all hover:border-brand-primary/50">
                <div
                  className={`bg- mb-4 flex h-12 w-12 items-center justify-center rounded-lg${feature.color.split('-')[0]}-500/10`}
                >
                  <feature.icon className={`text- h-6 w-6${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="mb-4 text-muted-foreground">{feature.description}</p>
                <div className="space-y-2">
                  {feature.features.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-brand-primary" />
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
          <h2 className="font-display mb-4 text-center text-4xl font-bold">How It Works</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
            From blank page to finished song in minutes, with AI assistance at every step
          </p>

          <div className="mx-auto mb-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              {
                step: 1,
                title: 'Set Your Parameters',
                description:
                  'Choose your key, tempo, genre, and mood. The AI learns your style over time and adapts suggestions.',
                details: [
                  'Select from 12 keys',
                  'Set BPM (40-200)',
                  'Pick genre tags',
                  'Define emotional tone',
                ],
              },
              {
                step: 2,
                title: 'Generate & Iterate',
                description:
                  'Get instant suggestions for chords, lyrics, and melodies. Regenerate individual sections or the entire song.',
                details: [
                  'One-click generation',
                  'Refine by section',
                  'Lock what works',
                  'Try variations',
                ],
              },
              {
                step: 3,
                title: 'Refine & Export',
                description:
                  'Edit AI suggestions to match your vision. Export chord charts to PDF, melodies to MIDI, or continue in-platform.',
                details: ['Manual editing', 'MIDI export', 'PDF chord charts', 'Share with band'],
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-primary/30 bg-brand-primary/10">
                  <span className="font-display text-3xl font-bold text-brand-primary">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="mb-4 text-muted-foreground">{step.description}</p>
                <div className="space-y-2">
                  {step.details.map((detail) => (
                    <div
                      key={detail}
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary"></span>
                      {detail}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Real Example */}
          <div className="mx-auto max-w-4xl">
            <Card className="rnrb-card border-brand-primary/20 bg-surface-elevated p-8">
              <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Sparkles className="h-6 w-6 text-brand-primary" />
                See It In Action
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-semibold text-purple-400">Input:</h4>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm text-muted-foreground">Key: C Major</p>
                    <p className="text-sm text-muted-foreground">Tempo: 120 BPM</p>
                    <p className="text-sm text-muted-foreground">Genre: Folk Rock</p>
                    <p className="text-sm text-muted-foreground">Mood: Hopeful</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-brand-primary">AI Output:</h4>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="mb-1 font-mono text-sm">Verse: C - Am - F - G</p>
                    <p className="mb-1 font-mono text-sm">Chorus: F - G - Am - C</p>
                    <p className="mb-1 font-mono text-sm">Bridge: Dm - G - C - Am</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      + melody suggestions + lyric ideas
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  <strong>Real musicians love it:</strong> "Cut my songwriting time in half while
                  exploring ideas I'd never have tried" - Sarah K., Nashville
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-4xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <Sparkles className="mx-auto mb-6 h-12 w-12 text-brand-primary" />
            <h2 className="font-display mb-4 text-3xl font-bold">AI That Serves Your Creativity</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Our AI tools are designed to assist, not replace. You stay in creative control while
              getting suggestions that help you work faster and explore new directions.
            </p>
          </motion.div>

          {/* What Makes It Different */}
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="rnrb-card p-6">
              <h3 className="mb-3 text-xl font-semibold">Understands Music Theory</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Voice leading principles</li>
                <li>• Harmonic function</li>
                <li>• Common progressions (I-IV-V, ii-V-I)</li>
                <li>• Modal interchange options</li>
                <li>• Secondary dominants</li>
              </ul>
            </Card>

            <Card className="rnrb-card p-6">
              <h3 className="mb-3 text-xl font-semibold">Lyrical Intelligence</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Natural language flow</li>
                <li>• Rhyme scheme awareness (AABB, ABAB, etc.)</li>
                <li>• Syllable counting for melodies</li>
                <li>• Thematic consistency</li>
                <li>• Multiple writing styles (narrative, abstract, storytelling)</li>
              </ul>
            </Card>

            <Card className="rnrb-card p-6">
              <h3 className="mb-3 text-xl font-semibold">🎼 Melody Generation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Scale-locked note suggestions</li>
                <li>• Vocal range consideration</li>
                <li>• Rhythmic variations (eighth, sixteenth notes)</li>
                <li>• Stepwise vs leap motion</li>
                <li>• Export to MIDI for your DAW</li>
              </ul>
            </Card>

            <Card className="rnrb-card p-6">
              <h3 className="mb-3 text-xl font-semibold">🔄 Workflow Integration</h3>
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
        <div className="rnrb-container max-w-3xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display mb-4 text-4xl font-bold">Start Writing Better Songs</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Free plan includes 50 AI assists per month - enough to write several songs.
            </p>
            <Link href="/songwriting">
              <Button className="rnrb-button-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                Launch Songwriting Studio
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
