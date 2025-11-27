'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Globe,
  Palette,
  Zap,
  Music,
  Calendar,
  Mail,
  Layout,
  Eye,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function WebsiteBuilderFeaturePage() {
  const templateCardClass =
    'rnrb-card group relative w-full overflow-hidden rounded-2xl border border-white/5 p-0 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.45)]';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 mx-auto max-w-6xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2">
              <Globe className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-medium text-sky-400">Website Builder</span>
            </div>

            <h1 className="font-display mb-6 text-5xl font-bold md:text-6xl">
              Your Music. Your Website. One Click.
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">
              Build a stunning musician website in seconds. Choose from 8 professional templates,
              auto-sync your music and tour dates, and publish to your own subdomain instantly.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/auth?signup=true">
                <Button className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                  <Sparkles className="h-5 w-5" />
                  Build My Website
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#templates">
                <Button className="rnrb-button-secondary rounded-xl px-8 py-4 text-lg font-semibold">
                  View Templates
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Templates Showcase */}
      <div id="templates" className="border-b border-border/50 bg-surface/30">
        <div className="rnrb-container mx-auto max-w-7xl px-4 py-20">
          <h2 className="font-display mb-4 text-center text-4xl font-bold">
            8 Pro Templates Built for Musicians
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
            Each template is designed by professionals to showcase your music, tour dates, and story
            in the best possible light.
          </p>

          <div className="mx-auto mb-12 grid w-full max-w-6xl justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* NOIR - Cinematic dark */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <Card className={templateCardClass}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-t-xl"
                  style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)' }}
                >
                  {/* Mock website preview */}
                  <div className="flex h-full flex-col p-4">
                    <div className="mb-2 h-1 w-8 rounded bg-white/20"></div>
                    <div className="flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <div
                          className="mx-auto mb-2 h-12 w-12 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #333 0%, #111 100%)',
                            boxShadow: '0 0 20px rgba(255,255,255,0.1)',
                          }}
                        ></div>
                        <div className="mx-auto mb-1 h-2 w-20 rounded bg-white/80"></div>
                        <div className="mx-auto h-1.5 w-14 rounded bg-white/30"></div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-1">
                      <div className="h-1 w-6 rounded bg-white/20"></div>
                      <div className="h-1 w-6 rounded bg-white/20"></div>
                      <div className="h-1 w-6 rounded bg-white/20"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">NOIR</h3>
                      <p className="text-xs text-muted-foreground">Cinematic dark theme</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                      Dark
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* VINYL - Retro record store */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className={templateCardClass}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-t-xl"
                  style={{ background: 'linear-gradient(180deg, #1a1612 0%, #2d2318 100%)' }}
                >
                  <div className="flex h-full flex-col p-4">
                    <div className="mb-2 h-1 w-8 rounded" style={{ background: '#d4a574' }}></div>
                    <div className="flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <div
                          className="mx-auto mb-2 h-14 w-14 rounded-full border-4"
                          style={{
                            borderColor: '#8b7355',
                            background:
                              'radial-gradient(circle, #1a1612 30%, #8b7355 31%, #8b7355 45%, #1a1612 46%)',
                          }}
                        >
                          <div className="flex h-full w-full items-center justify-center rounded-full">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ background: '#d4a574' }}
                            ></div>
                          </div>
                        </div>
                        <div
                          className="mx-auto mb-1 h-2 w-16 rounded"
                          style={{ background: '#d4a574' }}
                        ></div>
                        <div
                          className="mx-auto h-1.5 w-12 rounded"
                          style={{ background: 'rgba(212,165,116,0.4)' }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      <div
                        className="h-1 w-8 rounded"
                        style={{ background: 'rgba(212,165,116,0.3)' }}
                      ></div>
                      <div
                        className="h-1 w-8 rounded"
                        style={{ background: 'rgba(212,165,116,0.3)' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">VINYL</h3>
                      <p className="text-xs text-muted-foreground">Retro record store vibe</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                      Dark
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* NEON - Cyberpunk glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card className={templateCardClass}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-t-xl"
                  style={{ background: 'linear-gradient(180deg, #0d0015 0%, #1a0025 100%)' }}
                >
                  <div className="flex h-full flex-col p-4">
                    <div
                      className="mb-2 h-1 w-8 rounded"
                      style={{ background: '#ff00ff', boxShadow: '0 0 8px #ff00ff' }}
                    ></div>
                    <div className="flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <div
                          className="mx-auto mb-2 h-12 w-12 rounded-lg"
                          style={{
                            background: 'transparent',
                            border: '2px solid #00ffff',
                            boxShadow: '0 0 15px #00ffff, inset 0 0 15px rgba(0,255,255,0.2)',
                          }}
                        ></div>
                        <div
                          className="mx-auto mb-1 h-2 w-20 rounded"
                          style={{ background: '#ff00ff', boxShadow: '0 0 10px #ff00ff' }}
                        ></div>
                        <div
                          className="mx-auto h-1.5 w-14 rounded"
                          style={{ background: 'rgba(0,255,255,0.5)' }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-1">
                      <div
                        className="h-1 w-4 rounded"
                        style={{ background: '#ff00ff', boxShadow: '0 0 5px #ff00ff' }}
                      ></div>
                      <div
                        className="h-1 w-4 rounded"
                        style={{ background: '#00ffff', boxShadow: '0 0 5px #00ffff' }}
                      ></div>
                      <div
                        className="h-1 w-4 rounded"
                        style={{ background: '#ff00ff', boxShadow: '0 0 5px #ff00ff' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">NEON</h3>
                      <p className="text-xs text-muted-foreground">Cyberpunk glow</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                      Dark
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ACOUSTIC - Warm organic */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className={templateCardClass}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-t-xl"
                  style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%)' }}
                >
                  <div className="flex h-full flex-col p-4">
                    <div className="mb-2 h-1 w-8 rounded" style={{ background: '#8b7355' }}></div>
                    <div className="flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <div
                          className="mx-auto mb-2 h-12 w-12 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #c4a77d 0%, #8b7355 100%)',
                          }}
                        ></div>
                        <div
                          className="mx-auto mb-1 h-2 w-20 rounded"
                          style={{ background: '#4a3f35' }}
                        ></div>
                        <div
                          className="mx-auto h-1.5 w-14 rounded"
                          style={{ background: 'rgba(74,63,53,0.4)' }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      <div
                        className="h-1 w-6 rounded"
                        style={{ background: 'rgba(139,115,85,0.4)' }}
                      ></div>
                      <div
                        className="h-1 w-6 rounded"
                        style={{ background: 'rgba(139,115,85,0.4)' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">ACOUSTIC</h3>
                      <p className="text-xs text-muted-foreground">Warm, organic feel</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                      Light
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ARENA - Stadium energy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card className={templateCardClass}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-t-xl"
                  style={{ background: 'linear-gradient(180deg, #0f0f0f 0%, #1f1f1f 100%)' }}
                >
                  <div className="relative flex h-full flex-col p-4">
                    {/* Spotlight effect */}
                    <div
                      className="absolute left-1/2 top-0 h-32 w-20 -translate-x-1/2"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(255,200,0,0.3) 0%, transparent 100%)',
                      }}
                    ></div>
                    <div className="relative z-10 mb-2 h-1 w-8 rounded bg-white/30"></div>
                    <div className="relative z-10 flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <div
                          className="mx-auto mb-2 h-12 w-12 rounded"
                          style={{
                            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                            boxShadow: '0 0 20px rgba(255,200,0,0.5)',
                          }}
                        ></div>
                        <div className="mx-auto mb-1 h-2 w-20 rounded bg-white"></div>
                        <div className="mx-auto h-1.5 w-14 rounded bg-white/40"></div>
                      </div>
                    </div>
                    <div className="relative z-10 flex justify-center gap-1">
                      <div className="h-1 w-3 rounded" style={{ background: '#ffd700' }}></div>
                      <div className="h-1 w-3 rounded" style={{ background: '#ff8c00' }}></div>
                      <div className="h-1 w-3 rounded" style={{ background: '#ffd700' }}></div>
                      <div className="h-1 w-3 rounded" style={{ background: '#ff8c00' }}></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">ARENA</h3>
                      <p className="text-xs text-muted-foreground">Stadium energy</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                      Dark
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* EDITORIAL - Gallery minimal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className={templateCardClass}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-t-xl"
                  style={{ background: '#ffffff' }}
                >
                  <div className="flex h-full flex-col p-4">
                    <div className="mb-2 h-0.5 w-6 rounded bg-black"></div>
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      <div className="rounded bg-gray-200"></div>
                      <div className="flex flex-col gap-2">
                        <div className="flex-1 rounded bg-gray-100"></div>
                        <div className="h-2 w-full rounded bg-black"></div>
                        <div className="h-1 w-3/4 rounded bg-gray-400"></div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-center gap-4">
                      <div className="h-0.5 w-4 rounded bg-black"></div>
                      <div className="h-0.5 w-4 rounded bg-gray-300"></div>
                      <div className="h-0.5 w-4 rounded bg-gray-300"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">EDITORIAL</h3>
                      <p className="text-xs text-muted-foreground">Gallery minimal</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                      Light
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* OUTLAW - Weathered americana */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Card className={templateCardClass}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-t-xl"
                  style={{ background: 'linear-gradient(180deg, #1a1510 0%, #2a2015 100%)' }}
                >
                  <div className="relative flex h-full flex-col p-4">
                    {/* Texture overlay */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                      }}
                    ></div>
                    <div
                      className="relative z-10 mb-2 h-1 w-10 rounded"
                      style={{ background: '#c9a66b' }}
                    ></div>
                    <div className="relative z-10 flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <div
                          className="mx-auto mb-2 text-2xl"
                          style={{ color: '#c9a66b', fontFamily: 'serif' }}
                        >
                          ★
                        </div>
                        <div
                          className="mx-auto mb-1 h-2 w-16 rounded"
                          style={{ background: '#c9a66b' }}
                        ></div>
                        <div
                          className="mx-auto h-1 w-20 rounded"
                          style={{ background: 'rgba(201,166,107,0.4)' }}
                        ></div>
                      </div>
                    </div>
                    <div className="relative z-10 flex justify-center gap-1">
                      <div
                        className="h-0.5 w-8 rounded"
                        style={{ background: 'rgba(201,166,107,0.5)' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">OUTLAW</h3>
                      <p className="text-xs text-muted-foreground">Weathered americana</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                      Dark
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* FUTURA - Chrome & glass */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className={templateCardClass}>
                <div
                  className="aspect-[4/3] overflow-hidden rounded-t-xl"
                  style={{
                    background: 'linear-gradient(135deg, #0a0a0f 0%, #15151f 50%, #0a0a0f 100%)',
                  }}
                >
                  <div className="relative flex h-full flex-col p-4">
                    {/* Glass reflection */}
                    <div
                      className="absolute right-0 top-0 h-full w-1/2"
                      style={{
                        background:
                          'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                      }}
                    ></div>
                    <div
                      className="relative z-10 mb-2 h-0.5 w-8 rounded"
                      style={{ background: 'linear-gradient(90deg, #888 0%, #fff 50%, #888 100%)' }}
                    ></div>
                    <div className="relative z-10 flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <div
                          className="mx-auto mb-2 h-12 w-12 rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, #333 0%, #666 50%, #333 100%)',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        ></div>
                        <div
                          className="mx-auto mb-1 h-2 w-20 rounded"
                          style={{
                            background: 'linear-gradient(90deg, #666 0%, #fff 50%, #666 100%)',
                          }}
                        ></div>
                        <div
                          className="mx-auto h-1.5 w-14 rounded"
                          style={{ background: 'rgba(255,255,255,0.2)' }}
                        ></div>
                      </div>
                    </div>
                    <div className="relative z-10 flex justify-center gap-2">
                      <div
                        className="h-0.5 w-6 rounded"
                        style={{ background: 'rgba(255,255,255,0.3)' }}
                      ></div>
                      <div
                        className="h-0.5 w-6 rounded"
                        style={{ background: 'rgba(255,255,255,0.3)' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">FUTURA</h3>
                      <p className="text-xs text-muted-foreground">Chrome & glass</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                      Dark
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="rnrb-container mx-auto max-w-7xl px-4 py-20">
        <h2 className="font-display mb-12 text-center text-4xl font-bold">
          Everything You Need to Shine Online
        </h2>

        <div className="mx-auto mb-20 grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Zap,
              color: 'sky',
              title: 'One-Click Creation',
              description:
                'Start with Quick Start and have a fully functional website in under 30 seconds. We automatically import your profile, music, and tour dates.',
              features: ['Instant setup', 'Auto-import content', 'No coding required'],
            },
            {
              icon: Music,
              color: 'pink',
              title: 'Auto-Sync Music',
              description:
                "Your songs from Rock N' Roll Basement automatically appear on your website. Update once, sync everywhere.",
              features: ['Embedded player', 'Album artwork', 'Streaming links'],
            },
            {
              icon: Calendar,
              color: 'orange',
              title: 'Tour Dates Integration',
              description:
                'Shows from your tour management sync automatically. Fans always see your latest gigs without you lifting a finger.',
              features: ['Live calendar', 'Ticket links', 'Venue info'],
            },
            {
              icon: Palette,
              color: 'purple',
              title: 'Full Customization',
              description:
                'Customize every aspect—colors, fonts, layouts. Make it uniquely yours while keeping it professional.',
              features: ['Color themes', 'Custom fonts', 'Section reordering'],
            },
            {
              icon: Layout,
              color: 'green',
              title: 'Drag & Drop Sections',
              description:
                'Add, remove, and reorder sections with ease. Hero images, bio, band members, contact forms, and more.',
              features: ['12+ section types', 'Visibility toggle', 'Custom animations'],
            },
            {
              icon: Mail,
              color: 'cyan',
              title: 'Built-In Marketing',
              description:
                'Mailing list signup, contact forms, and social media links all built in. Grow your fanbase effortlessly.',
              features: ['Email capture', 'Social links', 'SEO optimization'],
            },
            {
              icon: Globe,
              color: 'amber',
              title: 'Custom Domains & Analytics',
              description:
                'Connect your own domain with guided DNS instructions, automatic SSL, and real-time visitor analytics.',
              features: [
                'Guided DNS + verification',
                'Auto HTTPS certificates',
                'Daily visitor & section insights',
              ],
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className="rnrb-card h-full rounded-2xl border border-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}-500/10`}
                >
                  <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
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

        {/* How It Works */}
        <h2 className="font-display mb-12 text-center text-4xl font-bold">How It Works</h2>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {[
            {
              step: '1',
              gradient: 'from-sky-500 to-cyan-500',
              title: 'Choose a Template',
              description:
                'Pick from 8 stunning templates designed for musicians. Dark or light, minimal or bold.',
            },
            {
              step: '2',
              gradient: 'from-purple-500 to-pink-500',
              title: 'Customize Everything',
              description:
                'Add your colors, fonts, and content. Drag sections around. Make it uniquely yours.',
            },
            {
              step: '3',
              gradient: 'from-orange-500 to-red-500',
              title: 'Publish & Share',
              description:
                'Hit publish and get your own yourname.cronkwaters.com URL. Share it everywhere.',
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
              className="text-center"
            >
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient}`}
              >
                <span className="text-2xl font-bold text-white">{item.step}</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Proof */}
      <div className="border-t border-border/50 bg-surface/30">
        <div className="rnrb-container max-w-4xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display mb-4 text-3xl font-bold">
              "I had a pro website in 5 minutes. My old site took me weeks."
            </h2>
            <p className="text-lg text-muted-foreground">
              Our website builder is designed specifically for musicians. Every template, every
              feature, every detail is crafted to help you connect with fans and book more gigs.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Preview Feature */}
      <div className="border-t border-border/50">
        <div className="rnrb-container max-w-6xl px-4 py-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display mb-6 text-4xl font-bold">Real-Time Preview</h2>
              <p className="mb-6 text-lg text-muted-foreground">
                See your changes instantly. Every color tweak, every section rearrangement, every
                text edit shows up immediately in the live preview.
              </p>
              <ul className="space-y-3">
                {[
                  'Live preview while editing',
                  'Mobile-responsive by default',
                  'Fast loading speeds',
                  'SEO-optimized pages',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-sky-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="rnrb-card overflow-hidden p-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-foreground">
                    yourband.cronkwaters.com
                  </div>
                </div>
                <div className="mt-3 flex aspect-video items-center justify-center rounded-lg bg-surface/50">
                  <div className="text-center">
                    <Eye className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Live Preview</p>
                  </div>
                </div>
              </Card>
            </motion.div>
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
            <h2 className="font-display mb-4 text-4xl font-bold">Build Your Website Today</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Free plan includes a full-featured website. No credit card required.
            </p>
            <Link href="/auth?signup=true">
              <Button className="rnrb-button-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                <Sparkles className="h-5 w-5" />
                Create My Website
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
