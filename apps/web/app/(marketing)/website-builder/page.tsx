'use client';

import {
  Sparkles,
  Palette,
  Globe,
  Bot,
  Image,
  Music,
  Calendar,
  Mail,
  ShoppingBag,
  BarChart,
  Shield,
  Check,
  ArrowRight,
  Play,
  Star,
  Monitor,
  Smartphone,
  Tablet,
  Wand2,
  PenTool,
  Layout,
  Type,
  Search,
  TrendingUp,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// Animated counter component
function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={countRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-900/50 p-8 transition-all duration-500 hover:scale-[1.02] hover:bg-gray-900/80">
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: gradient }}
      />
      <div className="relative z-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
        <p className="leading-relaxed text-gray-400">{description}</p>
      </div>
    </div>
  );
}

// Testimonial card
function TestimonialCard({
  quote,
  author,
  authorRole,
  avatar,
  rating,
}: {
  quote: string;
  author: string;
  authorRole: string;
  avatar: string;
  rating: number;
}) {
  return (
    <div className="rounded-2xl bg-gray-900/50 p-8 backdrop-blur-sm">
      <div className="mb-4 flex gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-orange-500 text-orange-500" />
        ))}
      </div>
      <p className="mb-6 text-lg leading-relaxed text-gray-300">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
            {avatar}
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">{author}</p>
          <p className="text-sm text-gray-500">{authorRole}</p>
        </div>
      </div>
    </div>
  );
}

// Pricing card
function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
        popular
          ? 'bg-gradient-to-br from-orange-500/20 to-pink-500/20 ring-2 ring-orange-500'
          : 'bg-gray-900/50'
      }`}
    >
      {popular && (
        <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">
          MOST POPULAR
        </div>
      )}
      <h3 className="mb-2 text-2xl font-bold text-white">{name}</h3>
      <p className="mb-6 text-gray-400">{description}</p>
      <div className="mb-6">
        <span className="text-5xl font-bold text-white">{price}</span>
        <span className="text-gray-500">/{period}</span>
      </div>
      <ul className="mb-8 space-y-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/sites"
        className={`block w-full rounded-xl py-4 text-center font-semibold transition-all hover:scale-[1.02] ${
          popular
            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

export default function WebsiteBuilderLanding() {
  const [activePreview, setActivePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-pink-500/20" />
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-orange-500/30 blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-500/30 blur-[128px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-24">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-orange-300">AI-Powered Website Builder for Musicians</span>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-center text-5xl font-bold leading-tight md:text-7xl">
            Build Your Music Website
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              In Minutes, Not Months
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-center text-xl text-gray-400">
            The only website builder designed specifically for musicians. AI-powered tools, stunning
            templates, and everything you need to grow your fanbase.
          </p>

          {/* CTA buttons */}
          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sites"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-4 text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
            >
              Start Building Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-lg font-semibold transition-all hover:bg-white/10">
              <Play className="h-5 w-5" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: 10000, suffix: '+', label: 'Artists Using CronkWaters' },
              { value: 50000, suffix: '+', label: 'Websites Created' },
              { value: 99, suffix: '%', label: 'Uptime Guaranteed' },
              { value: 4.9, suffix: '/5', label: 'Average Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mb-2 text-4xl font-bold text-white">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Preview mockup */}
          <div className="relative mx-auto max-w-5xl">
            {/* Device selector */}
            <div className="mb-6 flex justify-center gap-2">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'tablet', icon: Tablet, label: 'Tablet' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map((device) => (
                <button
                  key={device.id}
                  onClick={() => setActivePreview(device.id as typeof activePreview)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${
                    activePreview === device.id
                      ? 'bg-white/20 text-white'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <device.icon className="h-4 w-4" />
                  {device.label}
                </button>
              ))}
            </div>

            {/* Browser mockup */}
            <div
              className={`mx-auto overflow-hidden rounded-2xl bg-gray-900 shadow-2xl shadow-orange-500/10 transition-all duration-500 ${
                activePreview === 'desktop'
                  ? 'w-full'
                  : activePreview === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[375px]'
              }`}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-gray-800 px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <div className="mx-auto inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-1 text-sm text-gray-400">
                    <Globe className="h-4 w-4" />
                    yourband.cronkwaters.com
                  </div>
                </div>
              </div>

              {/* Preview content */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-900 to-black">
                {/* Fake website preview */}
                <div className="absolute inset-0 flex flex-col">
                  {/* Hero area */}
                  <div className="relative flex-1 bg-gradient-to-br from-orange-900/50 to-pink-900/50">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <h2 className="mb-4 text-4xl font-bold text-white">THE MIDNIGHT</h2>
                      <p className="mb-6 text-xl text-orange-300">Synthwave | Los Angeles</p>
                      <div className="flex gap-4">
                        <div className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white">
                          Listen Now
                        </div>
                        <div className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white">
                          Tour Dates
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bottom sections preview */}
                  <div className="flex h-24 gap-4 bg-gray-900 p-4">
                    <div className="flex-1 rounded-lg bg-gray-800" />
                    <div className="flex-1 rounded-lg bg-gray-800" />
                    <div className="flex-1 rounded-lg bg-gray-800" />
                  </div>
                </div>

                {/* AI Assistant indicator */}
                <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Stand Out
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-400">
              Built specifically for musicians, with features that actually matter for your career.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Bot}
              title="AI Website Assistant"
              description="Get instant help building your site. Our AI understands music industry needs and can write your bio, suggest sections, and optimize for fans."
              gradient="linear-gradient(135deg, rgba(249,115,22,0.1) 0%, transparent 100%)"
            />
            <FeatureCard
              icon={Wand2}
              title="AI Content Generator"
              description="Generate compelling artist bios, press releases, and social media posts in seconds. Trained on thousands of successful musician websites."
              gradient="linear-gradient(135deg, rgba(236,72,153,0.1) 0%, transparent 100%)"
            />
            <FeatureCard
              icon={Palette}
              title="8 Stunning Themes"
              description="From dark and moody to bright and clean. Every theme is designed for musicians with perfect mobile responsiveness."
              gradient="linear-gradient(135deg, rgba(168,85,247,0.1) 0%, transparent 100%)"
            />
            <FeatureCard
              icon={Music}
              title="Music Integration"
              description="Embed from Spotify, Apple Music, SoundCloud, Bandcamp, and more. Your music, front and center."
              gradient="linear-gradient(135deg, rgba(34,197,94,0.1) 0%, transparent 100%)"
            />
            <FeatureCard
              icon={Calendar}
              title="Tour Date Management"
              description="Keep fans informed with an always-updated tour calendar. Automatic ticket links and venue info."
              gradient="linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 100%)"
            />
            <FeatureCard
              icon={ShoppingBag}
              title="Built-in Merch Store"
              description="Sell merchandise directly to fans. No third-party fees, just pure profit for your music career."
              gradient="linear-gradient(135deg, rgba(245,158,11,0.1) 0%, transparent 100%)"
            />
            <FeatureCard
              icon={Mail}
              title="Mailing List Builder"
              description="Grow your fanbase with built-in email collection. Export anytime, no lock-in."
              gradient="linear-gradient(135deg, rgba(239,68,68,0.1) 0%, transparent 100%)"
            />
            <FeatureCard
              icon={BarChart}
              title="Fan Analytics"
              description="Understand your audience with detailed analytics. See where fans come from and what they love."
              gradient="linear-gradient(135deg, rgba(20,184,166,0.1) 0%, transparent 100%)"
            />
            <FeatureCard
              icon={Globe}
              title="Custom Domains"
              description="Use your own domain name for a professional look. Free SSL certificate included."
              gradient="linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 100%)"
            />
          </div>
        </div>
      </section>

      {/* AI Features Deep Dive */}
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-2 text-sm text-orange-300">
              <Sparkles className="h-4 w-4" />
              Powered by AI
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Your Personal{' '}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                AI Creative Director
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-400">
              Our AI understands music. It knows what makes a great artist website and can help you
              create one in minutes.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* AI Chat Preview */}
            <div className="rounded-2xl bg-gray-900/50 p-8">
              <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                <Bot className="h-8 w-8 text-orange-500" />
                AI Website Assistant
              </h3>
              <div className="space-y-4">
                <div className="rounded-2xl rounded-bl-md bg-gray-800 p-4">
                  <p className="text-gray-300">
                    I want my website to feel dark and moody, like my synthwave music. Can you help?
                  </p>
                </div>
                <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-orange-500/20 to-pink-500/20 p-4">
                  <p className="text-gray-200">
                    Perfect choice! I recommend the <strong>Noir</strong> or <strong>Neon</strong>{' '}
                    theme for synthwave. Noir gives you an elegant, cinematic feel with red accents,
                    while Neon adds that cyberpunk glow. Want me to apply one?
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white">
                      Apply Noir Theme
                    </button>
                    <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white">
                      Apply Neon Theme
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Capabilities List */}
            <div className="space-y-6">
              {[
                {
                  icon: PenTool,
                  title: 'Bio & Content Writing',
                  description:
                    'Generate compelling artist bios, press releases, and descriptions that capture your unique sound.',
                },
                {
                  icon: Layout,
                  title: 'Smart Section Suggestions',
                  description:
                    'AI analyzes your genre and suggests the perfect sections for your website.',
                },
                {
                  icon: Search,
                  title: 'SEO Optimization',
                  description:
                    'Get AI-powered suggestions to help fans find you on Google and social media.',
                },
                {
                  icon: Image,
                  title: 'Image Enhancement',
                  description:
                    'AI suggests the best crops, filters, and placements for your photos.',
                },
                {
                  icon: Type,
                  title: 'Copy Improvement',
                  description:
                    'Paste any text and get instant suggestions to make it more engaging.',
                },
                {
                  icon: TrendingUp,
                  title: 'Growth Recommendations',
                  description:
                    'Get personalized tips to grow your fanbase based on your analytics.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 rounded-xl bg-gray-900/50 p-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-white">{item.title}</h4>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Loved by{' '}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Musicians Worldwide
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-400">
              Join thousands of artists who&apos;ve transformed their online presence.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              quote="Finally, a website builder that gets musicians. The AI wrote my bio better than I ever could, and the tour date integration is seamless."
              author="Sarah Chen"
              authorRole="Indie Artist, 50K Monthly Listeners"
              avatar="SC"
              rating={5}
            />
            <TestimonialCard
              quote="We went from no website to a professional EPK in under an hour. Booking agents love it, and we've landed 3 festivals since launching."
              author="The Velvet Underground"
              authorRole="Rock Band, Austin TX"
              avatar="VU"
              rating={5}
            />
            <TestimonialCard
              quote="The merch store alone paid for the subscription in the first week. Plus the AI assistant helped me write press releases that actually got coverage."
              author="DJ Phantom"
              authorRole="Electronic Producer"
              avatar="DP"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Simple,{' '}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-400">
              Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <PricingCard
              name="Starter"
              price="$0"
              period="forever"
              description="Perfect for getting started"
              features={[
                'CronkWaters subdomain',
                '3 website sections',
                'Basic themes',
                'Music embeds',
                'Mobile responsive',
                'Community support',
              ]}
              cta="Start Free"
            />
            <PricingCard
              name="Pro"
              price="$15"
              period="month"
              description="Everything you need to grow"
              features={[
                'Custom domain',
                'Unlimited sections',
                'All 8 premium themes',
                'AI Website Assistant',
                'AI Content Generator',
                'Mailing list (1,000 subscribers)',
                'Basic analytics',
                'Priority support',
              ]}
              cta="Start Pro Trial"
              popular
            />
            <PricingCard
              name="Studio"
              price="$35"
              period="month"
              description="For serious artists & labels"
              features={[
                'Everything in Pro',
                'Multiple websites',
                'Advanced AI features',
                'Merch store (0% fees)',
                'Unlimited mailing list',
                'Advanced analytics',
                'Custom CSS/code',
                'White-label option',
                'Dedicated support',
              ]}
              cta="Start Studio Trial"
            />
          </div>

          {/* Money back guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-6 py-3 text-green-400">
              <Shield className="h-5 w-5" />
              30-day money-back guarantee on all paid plans
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/30 blur-[128px]" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-6xl">
            Ready to Build Your
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Dream Website?
            </span>
          </h2>
          <p className="mb-12 text-xl text-gray-300">
            Join 10,000+ musicians who&apos;ve already made the switch. Start building for free
            today.
          </p>
          <Link
            href="/sites"
            className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-5 text-xl font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
          >
            Start Building Free
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-6 text-gray-500">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">CronkWaters</span>
            </div>
            <div className="flex gap-8 text-gray-500">
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link href="/support" className="hover:text-white">
                Support
              </Link>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
            </div>
            <p className="text-gray-500">© 2024 CronkWaters. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
