'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Video, MessageSquare, Share2, Users, Monitor, Shield, ChevronRight, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';

export default function CollaborationFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-6xl relative z-10 py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-blue-500/10 border border-blue-500/20">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Real-Time Collaboration</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Collaborate Like You're in the Same Room
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              HD video calls, screen sharing, and instant messaging powered by Daily.co and Ably. 
              Work together on music from anywhere in the world.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth?signup=true">
                <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2">
                  Start Collaborating
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button className="rnrb-button-secondary px-8 py-4 rounded-xl text-lg font-semibold">
                  See Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="rnrb-container max-w-7xl py-20 px-4">
        <h2 className="text-4xl font-display font-bold text-center mb-12">
          Everything You Need to Collaborate
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Video,
              color: 'brand-primary',
              title: 'HD Video Calls',
              description: 'Crystal-clear video powered by Daily.co. Up to 50 participants with low-latency streaming optimized for music collaboration.',
              features: ['Gallery & speaker views', 'Virtual backgrounds', 'Recording capability']
            },
            {
              icon: Monitor,
              color: 'blue-400',
              title: 'Screen Sharing',
              description: 'Share your DAW, lyrics doc, or any application. Perfect for showing your production process or getting real-time feedback.',
              features: ['High-quality streaming', 'Audio sharing support', 'Annotation tools']
            },
            {
              icon: MessageSquare,
              color: 'purple-400',
              title: 'Instant Messaging',
              description: 'Real-time chat powered by Ably. Send messages, files, and feedback instantly with typing indicators and read receipts.',
              features: ['End-to-end encryption', 'File sharing', 'Message history']
            },
            {
              icon: Share2,
              color: 'green-400',
              title: 'Project Sync',
              description: 'All collaborators see project updates in real-time. Changes sync instantly across all connected users.',
              features: ['Live cursors', 'Version control', 'Conflict resolution']
            },
            {
              icon: Users,
              color: 'orange-400',
              title: 'Session Rooms',
              description: 'Create dedicated rooms for bands or projects. Persistent spaces where your team can drop in anytime.',
              features: ['Always-on availability', 'Custom room URLs', 'Guest invitations']
            },
            {
              icon: Shield,
              color: 'pink-400',
              title: 'Secure & Private',
              description: 'Enterprise-grade security ensures your music and conversations stay private. GDPR compliant infrastructure.',
              features: ['Encrypted connections', 'Access controls', 'Data ownership']
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

        {/* Use Cases */}
        <h2 className="text-4xl font-display font-bold text-center mb-12">Perfect For</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Users,
              gradient: 'from-orange-500 to-red-500',
              title: 'Remote Bands',
              description: 'Keep your band tight even when members are in different cities. Practice, write, and record together.'
            },
            {
              icon: Share2,
              gradient: 'from-purple-500 to-indigo-500',
              title: 'Producer Sessions',
              description: 'Work with artists anywhere. Share your screen to show production techniques and get instant feedback.'
            },
            {
              icon: MessageSquare,
              gradient: 'from-blue-500 to-cyan-500',
              title: 'Songwriting Teams',
              description: 'Co-write in real-time. Share lyrics, chord progressions, and ideas as naturally as sitting in the same room.'
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

      {/* Quote Section */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-4xl py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-display font-bold mb-4">
              "The video quality is incredible. It's like we're jamming in the same garage."
            </h2>
            <p className="text-muted-foreground text-lg">
              Rock & Roll Basement uses best-in-class infrastructure from Daily.co for video 
              and Ably for messaging to ensure your collaboration experience is seamless.
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
            <h2 className="text-4xl font-display font-bold mb-4">Start Collaborating Today</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Free plan includes unlimited chat and 60-minute video sessions.
            </p>
            <Link href="/auth?signup=true">
              <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2">
                Create Your First Session
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
