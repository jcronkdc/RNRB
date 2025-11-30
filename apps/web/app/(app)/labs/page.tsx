'use client';

/**
 * R&R Labs - Research Division
 *
 * Building the future of collaborative AI music creation
 * Our goal: An AI that ASSISTS musicians, not replaces them
 *
 * Key principles:
 * 1. Human-AI Collaboration - AI generates stems, humans replace/refine
 * 2. Copyright Clarity - Track human contribution for legal ownership
 * 3. Real-time Collaboration - Multiple musicians work together with AI
 * 4. Open Research - Transparent about our methods and progress
 */

import { Card, Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Sparkles,
  Users,
  Brain,
  Music,
  Layers,
  GitBranch,
  Lightbulb,
  Target,
  Rocket,
  Shield,
  CheckCircle,
  ArrowRight,
  Mail,
  Clock,
  Zap,
  Database,
  Cpu,
  CircuitBoard,
  FileAudio,
  Mic,
  Guitar,
  Drum,
  Piano,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';

// Research phases for the roadmap
const RESEARCH_PHASES = [
  {
    phase: 1,
    title: 'Data Collection',
    status: 'active',
    description:
      'Gathering volunteer recordings, MIDI files, and musical preferences to train our model',
    progress: 15,
    icon: Database,
    color: 'orange',
    tasks: [
      { name: 'Volunteer onboarding system', done: false },
      { name: 'Audio upload pipeline', done: false },
      { name: 'Musical preference surveys', done: false },
      { name: 'MIDI contribution portal', done: false },
    ],
  },
  {
    phase: 2,
    title: 'Model Architecture',
    status: 'upcoming',
    description: 'Designing a stem-based generation model optimized for collaboration',
    progress: 0,
    icon: CircuitBoard,
    color: 'purple',
    tasks: [
      { name: 'Transformer architecture design', done: false },
      { name: 'Stem separation integration', done: false },
      { name: 'Real-time inference optimization', done: false },
      { name: 'Multi-instrument conditioning', done: false },
    ],
  },
  {
    phase: 3,
    title: 'Training & Iteration',
    status: 'upcoming',
    description: 'Training on volunteer data with continuous feedback loops',
    progress: 0,
    icon: Cpu,
    color: 'blue',
    tasks: [
      { name: 'Initial model training', done: false },
      { name: 'Volunteer feedback integration', done: false },
      { name: 'A/B testing variations', done: false },
      { name: 'Quality benchmarking', done: false },
    ],
  },
  {
    phase: 4,
    title: 'Beta Release',
    status: 'upcoming',
    description: 'Rolling out to volunteers for real-world collaborative testing',
    progress: 0,
    icon: Rocket,
    color: 'green',
    tasks: [
      { name: 'Integration with RNRB platform', done: false },
      { name: 'Real-time collaboration features', done: false },
      { name: 'Copyright tracking system', done: false },
      { name: 'Public beta launch', done: false },
    ],
  },
];

// Stem types we want to generate
const STEM_TYPES = [
  { name: 'Drums', icon: Drum, color: 'red' },
  { name: 'Bass', icon: Guitar, color: 'orange' },
  { name: 'Guitar', icon: Guitar, color: 'yellow' },
  { name: 'Keys/Piano', icon: Piano, color: 'green' },
  { name: 'Synth/Pads', icon: Layers, color: 'blue' },
  { name: 'Vocals', icon: Mic, color: 'purple' },
];

export default function LabsPage() {
  const { user, loading } = useRequireAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  const handleVolunteerSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/labs/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        // Reset after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
          setEmail('');
        }, 3000);
      } else {
        console.error('Signup failed:', data.error);
        alert(data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div className="relative flex min-h-screen items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <FlaskConical
              className="mx-auto mb-4 h-16 w-16 animate-pulse"
              style={{ color: 'var(--accent)' }}
            />
            <p className="text-lg" style={{ color: 'var(--muted)' }}>
              Entering the lab...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Link href="/" className="group mb-6 inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={160}
              height={65}
              priority
              className="transition-transform group-hover:scale-105"
            />
          </Link>

          <div
            className="mb-4 inline-flex items-center gap-3 rounded-full px-6 py-3"
            style={{ background: 'rgba(255, 99, 71, 0.15)', border: '1px solid var(--border)' }}
          >
            <FlaskConical className="h-6 w-6" style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
              R&R LABS
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl" style={{ color: 'var(--text)' }}>
            Building the Future of <span style={{ color: 'var(--accent)' }}>AI Music</span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg md:text-xl" style={{ color: 'var(--muted)' }}>
            Our mission: Create an AI that <strong style={{ color: 'var(--text)' }}>assists</strong>{' '}
            musicians, not replaces them. We're building the first truly collaborative AI music
            platform.
          </p>
        </motion.div>

        {/* Core Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 grid gap-6 md:grid-cols-3"
        >
          {[
            {
              icon: Users,
              title: 'Human-AI Collaboration',
              description:
                'AI generates individual stems. Musicians replace what they want with their own recordings. The result: human creativity enhanced by AI.',
            },
            {
              icon: Shield,
              title: 'Copyright Clarity',
              description:
                'Every human contribution is tracked. When you replace an AI stem with your recording, you own that part completely.',
            },
            {
              icon: Zap,
              title: 'Real-Time Together',
              description:
                'Your whole band sees AI generations instantly via Ably. Iterate together, not separately. True collaborative creation.',
            },
          ].map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card
                className="group h-full overflow-hidden rounded-2xl p-6 transition-all"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(255, 99, 71, 0.15)' }}
                >
                  <principle.icon className="h-7 w-7" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
                  {principle.title}
                </h3>
                <p style={{ color: 'var(--muted)' }}>{principle.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* What We're Building */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-white">What We're Building</h2>
            <p className="text-gray-400">
              An AI that generates music stem-by-stem, designed for replacement
            </p>
          </div>

          <Card className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 p-8 backdrop-blur-xl">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Stem Types */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                  <Layers className="h-5 w-5 text-purple-400" />
                  Individual Stem Generation
                </h3>
                <p className="mb-6 text-gray-400">
                  Unlike Suno or Udio that generate a single mixed track, our AI creates separate
                  stems that you can individually regenerate or replace:
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {STEM_TYPES.map((stem, index) => (
                    <motion.div
                      key={stem.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className={`flex items-center gap-2 rounded-xl border border-${stem.color}-500/30 bg-${stem.color}-500/10 p-3`}
                    >
                      <stem.icon className={`h-5 w-5 text-${stem.color}-400`} />
                      <span className="text-sm font-medium text-white">{stem.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Workflow Diagram */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                  <GitBranch className="h-5 w-5 text-orange-400" />
                  Collaborative Workflow
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      text: 'Enter creative direction: "Upbeat indie rock, 120 BPM, key of G"',
                    },
                    {
                      step: 2,
                      text: 'AI generates 5 stems instantly (drums, bass, guitar, keys, synth)',
                    },
                    { step: 3, text: 'Team members see results in real-time via Ably' },
                    {
                      step: 4,
                      text: 'Don\'t like the guitar? Click "Regenerate" or upload YOUR recording',
                    },
                    { step: 5, text: "Iterate infinitely until it's perfect" },
                    { step: 6, text: 'Export final mix with copyright tracking' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-sm font-bold text-orange-400">
                        {item.step}
                      </div>
                      <p className="text-sm text-gray-300">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Research Roadmap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-white">Research Roadmap</h2>
            <p className="text-gray-400">Our journey to building a collaborative AI music model</p>
          </div>

          {/* Phase Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {RESEARCH_PHASES.map((phase, index) => (
              <button
                key={phase.phase}
                onClick={() => setActivePhase(index)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  activePhase === index
                    ? `bg-${phase.color}-500 text-white`
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <phase.icon className="h-4 w-4" />
                Phase {phase.phase}
                {phase.status === 'active' && (
                  <span className="ml-1 h-2 w-2 animate-pulse rounded-full bg-green-400" />
                )}
              </button>
            ))}
          </div>

          {/* Active Phase Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-start gap-6">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-${RESEARCH_PHASES[activePhase].color}-500/20`}
                  >
                    {(() => {
                      const PhaseIcon = RESEARCH_PHASES[activePhase].icon;
                      return (
                        <PhaseIcon
                          className={`h-8 w-8 text-${RESEARCH_PHASES[activePhase].color}-400`}
                        />
                      );
                    })()}
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-white">
                        Phase {RESEARCH_PHASES[activePhase].phase}:{' '}
                        {RESEARCH_PHASES[activePhase].title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          RESEARCH_PHASES[activePhase].status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {RESEARCH_PHASES[activePhase].status}
                      </span>
                    </div>

                    <p className="mb-6 text-gray-400">{RESEARCH_PHASES[activePhase].description}</p>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-medium text-white">
                          {RESEARCH_PHASES[activePhase].progress}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${RESEARCH_PHASES[activePhase].progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full bg-gradient-to-r from-${RESEARCH_PHASES[activePhase].color}-500 to-${RESEARCH_PHASES[activePhase].color}-400`}
                        />
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {RESEARCH_PHASES[activePhase].tasks.map((task, index) => (
                        <div
                          key={task.name}
                          className="flex items-center gap-2 rounded-lg bg-white/5 p-3"
                        >
                          {task.done ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
                          )}
                          <span className={task.done ? 'text-gray-400 line-through' : 'text-white'}>
                            {task.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Volunteer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Card className="overflow-hidden rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10 p-8 md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-orange-500">
                <Users className="h-8 w-8 text-white" />
              </div>

              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Help Us Build the Future
              </h2>

              <p className="mb-8 text-lg text-gray-400">
                We need musicians like you to help train our model. Contribute recordings, provide
                feedback, and be among the first to use AI Music Together.
              </p>

              {/* Benefits */}
              <div className="mb-8 grid gap-4 text-left sm:grid-cols-2 md:grid-cols-3">
                {[
                  { icon: Sparkles, text: 'Early access to AI features' },
                  { icon: Brain, text: 'Direct input on model training' },
                  { icon: Users, text: 'Recognition in research credits' },
                  { icon: FileAudio, text: 'Free storage for contributions' },
                  { icon: Lightbulb, text: 'Shape the product roadmap' },
                  { icon: Target, text: 'Priority support' },
                ].map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-2">
                    <benefit.icon className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-gray-300">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Signup Form */}
              <form onSubmit={handleVolunteerSignup} className="mx-auto flex max-w-md gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                <Button
                  type="submit"
                  disabled={submitted}
                  className={`rounded-xl px-6 py-3 font-semibold transition-all ${
                    submitted
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-orange-500 text-white hover:from-purple-600 hover:to-orange-600'
                  }`}
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Joined!
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Join R&R Labs
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-4 text-sm text-gray-500">
                {submitted
                  ? "We'll be in touch soon with next steps!"
                  : "We'll never spam you. Just important updates about R&R Labs."}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Technical Approach */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-white">Our Technical Approach</h2>
            <p className="text-gray-400">How we're different from Suno, Udio, and others</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: 'Stem-Based Generation',
                description:
                  'Instead of generating a single mixed audio file, our model outputs individual stems (drums, bass, guitar, etc.) that can be independently regenerated or replaced.',
                icon: Layers,
                gradient: 'from-purple-500/20 to-purple-500/5',
              },
              {
                title: 'Collaborative-First Architecture',
                description:
                  'Built from the ground up for real-time collaboration. Multiple musicians can prompt, regenerate, and replace stems simultaneously.',
                icon: Users,
                gradient: 'from-orange-500/20 to-orange-500/5',
              },
              {
                title: 'Human Contribution Tracking',
                description:
                  'Every replacement of an AI stem with a human recording is tracked, building a clear copyright chain for the final work.',
                icon: Shield,
                gradient: 'from-green-500/20 to-green-500/5',
              },
              {
                title: 'Open Research Philosophy',
                description:
                  "We're transparent about our training data, methods, and progress. Volunteers can see exactly how their contributions help.",
                icon: FlaskConical,
                gradient: 'from-blue-500/20 to-blue-500/5',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card
                  className={`h-full rounded-2xl border border-white/10 bg-gradient-to-br ${item.gradient} p-6 backdrop-blur-xl`}
                >
                  <item.icon className="mb-4 h-8 w-8 text-white" />
                  <h3 className="mb-2 text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ / Why Not Just Use Suno */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <Card className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h3 className="mb-6 text-2xl font-bold text-white">"Why not just use Suno or Udio?"</h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-1 w-1 shrink-0 translate-y-3 rounded-full bg-purple-400" />
                <div>
                  <p className="font-medium text-white">They generate final mixes, not stems</p>
                  <p className="text-gray-400">
                    If you want to replace the drums with your own recording, you can't. With R&R
                    Labs, you get individual stems and can swap any of them.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-1 w-1 shrink-0 translate-y-3 rounded-full bg-purple-400" />
                <div>
                  <p className="font-medium text-white">They're designed for solo creators</p>
                  <p className="text-gray-400">
                    There's no real-time collaboration. With R&R Labs, your whole band sees AI
                    generations instantly and can iterate together.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-1 w-1 shrink-0 translate-y-3 rounded-full bg-purple-400" />
                <div>
                  <p className="font-medium text-white">Copyright is unclear</p>
                  <p className="text-gray-400">
                    When the AI generates everything, who owns it? With R&R Labs, human
                    contributions are tracked, building clear ownership for the parts you recorded
                    yourself.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-1 w-1 shrink-0 translate-y-3 rounded-full bg-purple-400" />
                <div>
                  <p className="font-medium text-white">
                    They're not integrated with your workflow
                  </p>
                  <p className="text-gray-400">
                    R&R Labs is built into Rock N' Roll Basement. Your AI-assisted songs live
                    alongside your regular projects, with the same collaboration, versioning, and
                    export tools.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="mb-16"
        >
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">Explore R&R Labs</h2>
            <p className="text-gray-400">Dive deeper into our research</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/labs/experiment">
              <Card className="group h-full rounded-xl border border-orange-500/30 bg-orange-500/10 p-6 transition-all hover:border-orange-500/50 hover:bg-orange-500/20">
                <Sparkles className="mb-3 h-8 w-8 text-orange-400 transition-transform group-hover:scale-110" />
                <h3 className="mb-1 font-bold text-white">AI Experiment</h3>
                <p className="text-sm text-gray-400">Try the interactive stem generator demo</p>
              </Card>
            </Link>

            <Link href="/labs/volunteer">
              <Card className="group h-full rounded-xl border border-green-500/30 bg-green-500/10 p-6 transition-all hover:border-green-500/50 hover:bg-green-500/20">
                <Users className="mb-3 h-8 w-8 text-green-400 transition-transform group-hover:scale-110" />
                <h3 className="mb-1 font-bold text-white">Volunteer Portal</h3>
                <p className="text-sm text-gray-400">Join the research program</p>
              </Card>
            </Link>

            <Link href="/labs/contribute">
              <Card className="group h-full rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 transition-all hover:border-purple-500/50 hover:bg-purple-500/20">
                <FileAudio className="mb-3 h-8 w-8 text-purple-400 transition-transform group-hover:scale-110" />
                <h3 className="mb-1 font-bold text-white">Contribute Files</h3>
                <p className="text-sm text-gray-400">Upload audio & MIDI to train our model</p>
              </Card>
            </Link>

            <Link href="/labs/research">
              <Card className="group h-full rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 transition-all hover:border-blue-500/50 hover:bg-blue-500/20">
                <Brain className="mb-3 h-8 w-8 text-blue-400 transition-transform group-hover:scale-110" />
                <h3 className="mb-1 font-bold text-white">Research Dashboard</h3>
                <p className="text-sm text-gray-400">Track our progress in real-time</p>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <p className="mb-4 text-gray-400">Questions? Want to contribute in other ways?</p>
          <a
            href="mailto:labs@cronkwaters.com"
            className="inline-flex items-center gap-2 text-purple-400 transition-colors hover:text-purple-300"
          >
            <Mail className="h-5 w-5" />
            labs@cronkwaters.com
            <ExternalLink className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
