'use client';

import { InstallAppButton } from '@/components/install-app-button';
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  Globe,
  Layers,
  Music,
  Shield,
  Users,
  XCircle,
  Zap,
} from '@/components/ui/custom-icons';
import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import Link from 'next/link';

const competitors = [
  {
    name: 'Traditional DAWs',
    examples: 'Pro Tools, Logic, Ableton',
    hasFeature: {
      recording: true,
      collaboration: false,
      streaming: false,
      touring: false,
      rights: false,
      revenue: false,
      messaging: false,
      nativeApp: true,
      integrated: false,
    },
  },
  {
    name: 'Streaming Platforms',
    examples: 'OBS, Streamlabs',
    hasFeature: {
      recording: true,
      collaboration: false,
      streaming: true,
      touring: false,
      rights: false,
      revenue: false,
      messaging: false,
      nativeApp: true,
      integrated: false,
    },
  },
  {
    name: 'Collaboration Tools',
    examples: 'Splice, BandLab',
    hasFeature: {
      recording: false,
      collaboration: true,
      streaming: false,
      touring: false,
      rights: false,
      revenue: false,
      messaging: true,
      nativeApp: false,
      integrated: false,
    },
  },
  {
    name: 'Tour Management',
    examples: 'Master Tour, Eventric',
    hasFeature: {
      recording: false,
      collaboration: false,
      streaming: false,
      touring: true,
      rights: false,
      revenue: true,
      messaging: false,
      nativeApp: false,
      integrated: false,
    },
  },
  {
    name: 'Rights Management',
    examples: 'Songtrust, CD Baby Pro',
    hasFeature: {
      recording: false,
      collaboration: false,
      streaming: false,
      touring: false,
      rights: true,
      revenue: true,
      messaging: false,
      nativeApp: false,
      integrated: false,
    },
  },
];

const features = [
  { key: 'recording', label: 'Studio Recording' },
  { key: 'collaboration', label: 'Real-time Collaboration' },
  { key: 'streaming', label: 'Live Streaming' },
  { key: 'touring', label: 'Tour Management' },
  { key: 'rights', label: 'Rights & Royalties' },
  { key: 'revenue', label: 'Revenue Tracking' },
  { key: 'messaging', label: 'Team Messaging' },
  { key: 'nativeApp', label: 'Native App (All Devices)' },
  { key: 'integrated', label: 'All-in-One Platform' },
];

export default function WhyRNRBPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            The Only Platform That Does It All
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-muted-foreground">
            Rock N' Roll Basement is the world's first and only platform that combines professional
            studio recording, live streaming, tour management, rights tracking, and revenue
            management in one integrated system.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="secondary">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Comparison Table */}
        <Card className="mb-16 overflow-x-auto p-8">
          <h2 className="mb-8 text-center text-3xl font-bold">Why Musicians Need 5+ Apps Today</h2>

          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 pr-4 text-left">Platform Type</th>
                  {features.map((feature) => (
                    <th key={feature.key} className="px-2 py-4 text-center text-sm">
                      <div className="flex flex-col items-center gap-1">
                        {feature.label.split(' ').map((word, i) => (
                          <span key={i}>{word}</span>
                        ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4 pr-4">
                      <div>
                        <p className="font-semibold">{competitor.name}</p>
                        <p className="text-sm text-muted-foreground">{competitor.examples}</p>
                      </div>
                    </td>
                    {features.map((feature) => (
                      <td key={feature.key} className="px-2 py-4 text-center">
                        {competitor.hasFeature[
                          feature.key as keyof typeof competitor.hasFeature
                        ] ? (
                          <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="mx-auto h-5 w-5 text-gray-300" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Rock N' Roll Basement Row */}
                <tr className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <td className="py-6 pr-4">
                    <div>
                      <p className="text-lg font-bold">Rock N' Roll Basement</p>
                      <p className="text-sm font-semibold text-green-600">All-in-One Platform</p>
                    </div>
                  </td>
                  {features.map((feature) => (
                    <td key={feature.key} className="px-2 py-6 text-center">
                      <CheckCircle className="mx-auto h-6 w-6 text-green-600" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-center text-muted-foreground">
            Stop juggling multiple subscriptions. Get everything in one place.
          </p>
        </Card>

        {/* Unique Features */}
        <div className="mb-16">
          <h2 className="mb-12 text-center text-3xl font-bold">What Makes Us Truly Unique</h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <Layers className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold">Integrated Workflow</h3>
                  <p className="mb-4 text-muted-foreground">
                    Record a song, stream the session, schedule the tour, track the royalties, and
                    manage the revenue—all without switching platforms.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Seamless data flow between features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>One login, one subscription, infinite possibilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Unified analytics across all activities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold">Built for Modern Musicians</h3>
                  <p className="mb-4 text-muted-foreground">
                    Today's artists are creators, performers, and entrepreneurs. Our platform
                    reflects that reality.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Stream concerts while tracking ticket sales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Collaborate remotely with HD video and audio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Manage rights for streaming and sync licensing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold">Financial Transparency</h3>
                  <p className="mb-4 text-muted-foreground">
                    See exactly where your money comes from and where it goes, all in real-time.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Automated royalty calculations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Tour revenue vs. expenses tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Streaming income consolidation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-500/10 p-3">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold">Industry-Grade Security</h3>
                  <p className="mb-4 text-muted-foreground">
                    Your music, your data, your revenue—protected with the same security used by
                    major labels.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>End-to-end encryption for all sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>Secure contract and rights storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>GDPR and CCPA compliant</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Use Anywhere - Full Width Card */}
          <Card className="mt-8 border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5 p-8">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="rounded-lg bg-green-500/15 p-4">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2L12 8M12 8L9 5M12 8L15 5"
                  />
                  <rect x="4" y="10" width="16" height="12" rx="2" />
                  <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">
                  Install as a Native App on Any Device
                </h3>
                <p className="mb-4 text-muted-foreground">
                  Rock N' Roll Basement works like a native app on Mac, PC, iPhone, iPad, and
                  Android—no app store required. Install directly from your browser for instant
                  access from your dock or home screen.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    Mac & Windows
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    iPhone & Android
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    Works Offline
                  </span>
                </div>
                <div className="mt-4 flex justify-center md:justify-start">
                  <InstallAppButton />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* The Problem We Solve */}
        <Card className="mb-16 bg-gradient-to-r from-red-500/10 to-orange-500/10 p-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold">The Problem With Today's Music Industry</h2>
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div>
                <div className="mb-2 text-4xl font-bold text-red-500">7+</div>
                <p className="text-sm text-muted-foreground">
                  Average number of apps musicians use daily
                </p>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-red-500">$180</div>
                <p className="text-sm text-muted-foreground">
                  Average monthly cost for all subscriptions
                </p>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-red-500">40%</div>
                <p className="text-sm text-muted-foreground">
                  Time wasted switching between platforms
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Musicians shouldn't need a degree in software engineering to manage their career. We
              built Rock N' Roll Basement to solve this once and for all.
            </p>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="mb-16">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Musicians Trust Us</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card className="p-6 text-center">
              <Music className="mx-auto mb-3 h-8 w-8 text-purple-500" />
              <h3 className="mb-2 font-semibold">Built by Musicians</h3>
              <p className="text-sm text-muted-foreground">
                We understand your workflow because we've lived it
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Zap className="mx-auto mb-3 h-8 w-8 text-yellow-500" />
              <h3 className="mb-2 font-semibold">Always Improving</h3>
              <p className="text-sm text-muted-foreground">
                Regular updates based on your feedback
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-blue-500" />
              <h3 className="mb-2 font-semibold">Community First</h3>
              <p className="text-sm text-muted-foreground">
                Join thousands of artists already on the platform
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="mx-auto mb-3 h-8 w-8 text-green-500" />
              <h3 className="mb-2 font-semibold">Your Rights Protected</h3>
              <p className="text-sm text-muted-foreground">
                You own your music, data, and creative work
              </p>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Simplify Your Music Career?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Join the revolution. One platform, unlimited possibilities. No credit card required to
            start.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Free for 14 days • No credit card required • Cancel anytime
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
