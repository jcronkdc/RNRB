'use client';

import { motion } from 'framer-motion';
import { 
  Music, 
  Heart, 
  Shield,
  Zap,
  Users,
  FileText,
  GitBranch,
  BarChart3,
  FolderOpen,
  Radio,
  DollarSign,
  Lightbulb,
  Code,
  Database,
  Palette,
  Gauge,
  Lock,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const featureReasons = [
  {
    icon: GitBranch,
    title: 'Why Split Sheets Matter',
    situation: "You're in the studio at 2 AM. The song just clicked. Everyone says 'we should do splits.' Then... awkward silence.",
    why: "Because friendships end over money, but they shouldn't end over confusion.",
    truth: "Musicians are artists first, not lawyers. Split sheets protect the art by handling the business, so you can focus on creating.",
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: FolderOpen,
    title: 'Why Project Organization Matters',
    situation: "47 voice memos, 12 rough mixes, 8 lyric drafts. Your producer asks 'which version?' and you don't even know.",
    why: "Because creative chaos is beautiful, but disorganization kills momentum.",
    truth: "Organization isn't boring—it's the difference between 'I had this great idea once' and 'Here, let me play it for you right now.'",
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FileText,
    title: 'Why Licensing Tools Matter',
    situation: "Someone wants to sample your track. You want to say yes, but... what are the terms? What rights do they get?",
    why: "Because saying 'yes' to opportunities shouldn't feel risky.",
    truth: "Clear agreements create space for creative trust. When everyone knows what they're signing up for, they can focus on the art.",
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Radio,
    title: 'Why Session Hosting Matters',
    situation: "You try Zoom for a listening party, but the audio quality sucks. Discord confuses half the people. Someone's eating chips on a hot mic.",
    why: "Because music deserves better than a conference call.",
    truth: "The experience of sharing music shapes how people feel about it. Great session hosting doesn't just play audio—it creates moments.",
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: BarChart3,
    title: 'Why Analytics Matter',
    situation: "You release a track. You see some streams, some likes. But who's actually listening? Where? When?",
    why: "Because 'doing okay' isn't the same as knowing what's working.",
    truth: "Data without context is noise. We build analytics that tell you stories about real people connecting with your art.",
    color: 'from-violet-500 to-purple-500'
  },
  {
    icon: Users,
    title: 'Why Community Tools Matter',
    situation: "You're juggling Instagram DMs, email lists, Patreon, Discord. Your fans want to support you but don't know how.",
    why: "Because your community is your career, and they deserve a real home.",
    truth: "Superfans want to belong, not just consume. When you give people a space to connect, they become collaborators in your journey.",
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: DollarSign,
    title: 'Why Donations/Foundation Matters',
    situation: "You need funds to finish the album. You could Kickstarter it, GoFundMe it, Patreon it—but you're managing multiple platforms.",
    why: "Because asking for support shouldn't feel like begging.",
    truth: "People want to help artists they believe in. Foundation tools reframe donations as investment in art.",
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Why Security & Privacy Matter',
    situation: "You upload unreleased music. Sensitive contracts. Personal info. In the back of your mind: 'What if this leaks?'",
    why: "Because your trust is earned, not assumed.",
    truth: "Security isn't a feature; it's a promise. When you upload that demo, we protect it like it's ours because your music is your livelihood.",
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: Palette,
    title: 'Why Beautiful Design Matters',
    situation: "You're navigating yet another music platform. Gray boxes. Tiny text. Buttons that don't do what you expect. It works, but feels soulless.",
    why: "Because musicians deserve tools as creative as their work.",
    truth: "Ugly tools make you feel like a user. Beautiful tools make you feel like an artist.",
    color: 'from-indigo-500 to-purple-500'
  }
];

const techDecisions = [
  {
    icon: Lock,
    title: 'NextAuth.js vs Supabase Auth',
    reason: "Because switching contexts between your solo work and your band shouldn't require logging out. You need to be YOU across all your organizations.",
    tech: ['Organization-aware sessions', 'Full control over auth flow', 'Multi-provider support'],
    color: 'from-blue-600 to-cyan-600'
  },
  {
    icon: Database,
    title: 'PostgreSQL vs MongoDB',
    reason: "Because when you're dealing with splits and licenses, 'eventual consistency' isn't good enough. Your money needs to be exactly right, not 'mostly right.'",
    tech: ['ACID transactions', 'Proper relationships', 'Data integrity'],
    color: 'from-green-600 to-emerald-600'
  },
  {
    icon: Code,
    title: 'TypeScript vs JavaScript',
    reason: "Because shipping a bug that breaks split calculations or loses someone's music isn't acceptable. TypeScript catches those bugs before users see them.",
    tech: ['Type safety', 'Better autocomplete', 'Refactoring confidence'],
    color: 'from-purple-600 to-pink-600'
  },
  {
    icon: Zap,
    title: 'Optimistic Updates',
    reason: "Because when you're in flow creating music, every delay breaks your focus. Optimistic updates make the app feel like it's keeping up with your thoughts.",
    tech: ['Instant feedback', 'Better UX', 'Rollback on error'],
    color: 'from-orange-600 to-red-600'
  },
  {
    icon: Globe,
    title: 'Progressive Enhancement',
    reason: "Because not everyone has a fast device or perfect internet. When your app works for the musician on a 3-year-old phone at a coffee shop, you're accessible to everyone.",
    tech: ['Works without JS', 'Faster initial load', 'SEO-friendly'],
    color: 'from-teal-600 to-cyan-600'
  },
  {
    icon: Gauge,
    title: 'Three Themes (Light/Dark/Warm)',
    reason: "Because late-night studio sessions don't need blinding white OR harsh black. They need warm, amber tones that feel like the golden hour—creative, focused, cozy.",
    tech: ['Mood-based design', 'Brand personality', 'User choice'],
    color: 'from-amber-600 to-orange-600'
  }
];

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/50 to-background">
      {/* Hero Section */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-8">
            <Lightbulb className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-medium text-brand-primary">The Philosophy Behind Every Decision</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Why It Matters
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Every feature exists for a reason—a <strong>personal, human reason</strong>. 
            This is the story behind our decisions, told in the real language of musicians 
            who've been frustrated, inspired, and driven to create something better.
          </p>
        </motion.div>

        {/* Big Why */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-24 p-12 rounded-3xl bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-purple-600/10 border border-brand-primary/20"
        >
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 text-brand-primary mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">The Ultimate Why</h2>
          </div>
          
          <div className="space-y-6 text-center">
            <p className="text-2xl font-semibold text-foreground">
              Making music is hard enough. Everything else should be easy.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We're not just building features. We're removing friction. Eliminating confusion. 
              Creating clarity. Protecting trust. Celebrating art.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
              {['Confident', 'Organized', 'Empowered', 'Connected', 'Inspired'].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="px-6 py-3 bg-surface border border-brand-primary/30 rounded-full text-lg font-medium"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Reasons */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Features Exist
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every tool solves a real frustration. Here's the honest truth behind what we build.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureReasons.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group relative rounded-3xl border border-border/50 bg-surface/80 backdrop-blur p-8 hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6 group-hover:scale-110 transition-transform`}>
                <div className="w-full h-full rounded-2xl bg-surface/90 backdrop-blur flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-foreground" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-primary transition-colors">
                {feature.title}
              </h3>

              {/* The Situation */}
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  The Situation
                </span>
                <p className="text-sm text-muted-foreground italic">
                  "{feature.situation}"
                </p>
              </div>

              {/* The Why */}
              <div className="mb-4 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-2 block">
                  The Personal Why
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {feature.why}
                </p>
              </div>

              {/* The Truth */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  The Deeper Truth
                </span>
                <p className="text-sm text-muted-foreground">
                  {feature.truth}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="px-6 py-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <Sparkles className="w-6 h-6 text-brand-primary" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>

      {/* Tech Decisions */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why This vs That
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The technical choices that shape your experience. Every decision has a human reason.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techDecisions.map((decision, index) => (
            <motion.div
              key={decision.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-6 hover:border-brand-primary/50 hover:shadow-xl transition-all"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${decision.color} flex items-center justify-center mb-4`}>
                <decision.icon className="w-6 h-6 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold mb-3">{decision.title}</h3>

              {/* Reason */}
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {decision.reason}
              </p>

              {/* Tech Points */}
              <ul className="space-y-2">
                {decision.tech.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom Message */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center p-12 rounded-3xl bg-gradient-to-br from-surface/80 to-surface/60 backdrop-blur border border-border/50"
        >
          <Music className="w-16 h-16 text-brand-primary mx-auto mb-6" />
          
          <h2 className="text-4xl font-bold mb-6">
            Every Feature Has a Heartbeat
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            We're not "just another platform." We start with <strong>why</strong>, not <strong>what</strong>. 
            Every pixel, every line of code, every decision exists because it respects your craft.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link 
              href="/vision"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-brand-primary text-brand-primary rounded-2xl font-semibold hover:bg-brand-primary/10 transition-all"
            >
              Read Our Vision
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-semibold hover:shadow-xl transition-all"
            >
              Start Creating
              <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
