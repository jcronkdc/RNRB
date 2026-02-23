'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import {
  Video,
  MessageSquare,
  Share2,
  Users,
  Monitor,
  Shield,
  ChevronRight,
  ArrowRight,
  CheckCircle,
} from '@/components/ui/custom-icons';
import Link from 'next/link';

export default function CollaborationFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-6xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Real-Time Collaboration</span>
            </div>

            <h1 className="font-display mb-6 text-5xl font-bold md:text-6xl">
              Collaborate Like You're in the Same Room
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">
              Zoom-style HD video meetings with screen sharing, live streaming to fans,
              masterclasses from industry pros, and instant messaging powered by Daily.co and Ably.
              Work together on music from anywhere in the world.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/auth?signup=true">
                <Button className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                  Start Collaborating
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button className="rnrb-button-secondary rounded-xl px-8 py-4 text-lg font-semibold">
                  See Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="rnrb-container max-w-7xl px-4 py-20">
        <h2 className="font-display mb-12 text-center text-4xl font-bold">
          Everything You Need to Collaborate
        </h2>

        <div className="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Video,
              color: 'brand-primary',
              title: 'HD Video Calls',
              description:
                'Crystal-clear video powered by Daily.co. Up to 50 participants with low-latency streaming optimized for music collaboration.',
              features: ['Gallery & speaker views', 'Virtual backgrounds', 'Recording capability'],
            },
            {
              icon: Monitor,
              color: 'blue-400',
              title: 'Screen Sharing',
              description:
                'Share your DAW, lyrics doc, or any application. Perfect for showing your production process or getting real-time feedback.',
              features: ['High-quality streaming', 'Audio sharing support', 'Annotation tools'],
            },
            {
              icon: MessageSquare,
              color: 'purple-400',
              title: 'Instant Messaging',
              description:
                'Real-time chat powered by Ably. Send messages, files, and feedback instantly with typing indicators and read receipts.',
              features: ['End-to-end encryption', 'File sharing', 'Message history'],
            },
            {
              icon: Share2,
              color: 'green-400',
              title: 'Project Sync',
              description:
                'All collaborators see project updates in real-time. Changes sync instantly across all connected users.',
              features: ['Live cursors', 'Version control', 'Conflict resolution'],
            },
            {
              icon: Users,
              color: 'orange-400',
              title: 'Session Rooms',
              description:
                'Create dedicated rooms for bands or projects. Persistent spaces where your team can drop in anytime.',
              features: ['Always-on availability', 'Custom room URLs', 'Guest invitations'],
            },
            {
              icon: Shield,
              color: 'pink-400',
              title: 'Secure & Private',
              description:
                'Enterprise-grade security ensures your music and conversations stay private. GDPR compliant infrastructure.',
              features: ['Encrypted connections', 'Access controls', 'Data ownership'],
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
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-brand-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Use Cases */}
        <h2 className="font-display mb-12 text-center text-4xl font-bold">Perfect For</h2>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 lg:grid-cols-3">
          {[
            {
              icon: Users,
              gradient: 'from-orange-500 to-red-500',
              title: 'Remote Bands',
              description:
                'Keep your band tight even when members are in different cities. Practice, write, and record together.',
            },
            {
              icon: Share2,
              gradient: 'from-purple-500 to-indigo-500',
              title: 'Producer Sessions',
              description:
                'Work with artists anywhere. Share your screen to show production techniques and get instant feedback.',
            },
            {
              icon: MessageSquare,
              gradient: 'from-blue-500 to-cyan-500',
              title: 'Songwriting Teams',
              description:
                'Co-write in real-time. Share lyrics, chord progressions, and ideas as naturally as sitting in the same room.',
            },
            {
              icon: Video,
              gradient: 'from-red-500 to-pink-500',
              title: 'Live Streamers',
              description:
                'Stream performances, studio sessions, and behind-the-scenes content directly to your fans.',
            },
            {
              icon: Monitor,
              gradient: 'from-emerald-500 to-teal-500',
              title: 'Music Educators',
              description:
                'Teach masterclasses with screen sharing, run workshops, and monetize your expertise.',
            },
            {
              icon: Shield,
              gradient: 'from-indigo-500 to-violet-500',
              title: 'Label Teams',
              description:
                'Coordinate with artists, A&R, and marketing teams securely with enterprise-grade video.',
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
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${useCase.gradient}`}
              >
                <useCase.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">{useCase.title}</h3>
              <p className="text-muted-foreground">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quote Section */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-4xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display mb-4 text-3xl font-bold">
              "The video quality is incredible. It's like we're jamming in the same garage."
            </h2>
            <p className="text-lg text-muted-foreground">
              Rock & Roll Basement uses best-in-class infrastructure from Daily.co for video and
              Ably for messaging to ensure your collaboration experience is seamless.
            </p>
          </motion.div>
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
            <h2 className="font-display mb-4 text-4xl font-bold">Start Collaborating Today</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Free plan includes unlimited chat and 60-minute video sessions.
            </p>
            <Link href="/auth?signup=true">
              <Button className="rnrb-button-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                Create Your First Session
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
