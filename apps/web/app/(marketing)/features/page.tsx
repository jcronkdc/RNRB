'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Music2,
  Sparkles,
  FileText,
  Users,
  Video,
  Globe,
  Calendar,
  ShieldCheck,
  DollarSign,
  Mic,
  Headphones,
  Radio,
  ListMusic,
  GitBranch,
  Sliders,
  MapPin,
  Ticket,
  Target,
  MessageCircle,
  Share2,
  Palette,
  Layout,
  Zap,
  Brain,
  Clock,
  Folder,
  Upload,
  Download,
  Search,
  Bell,
  Settings,
  Award,
  TrendingUp,
  ShoppingBag,
  GraduationCap,
  FlaskConical,
  Wrench,
  Book,
  Compass,
  Heart,
  Star,
  Crown,
  Flame,
  Coffee,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Play,
  Smartphone,
  Monitor,
  Wifi,
  Mail,
} from '@/components/ui/custom-icons';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Feature Category Component
function FeatureCategory({
  title,
  subtitle,
  icon: Icon,
  color,
  features,
  index,
}: {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  features: {
    name: string;
    description: string;
    details: string[];
    link?: string;
  }[];
  index: number;
}) {
  const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
    accent: { bg: 'rgba(232, 93, 59, 0.1)', text: 'var(--accent)', glow: 'rgba(232, 93, 59, 0.2)' },
    gold: { bg: 'rgba(212, 168, 75, 0.1)', text: 'var(--gold)', glow: 'rgba(212, 168, 75, 0.2)' },
    sage: { bg: 'rgba(123, 145, 120, 0.1)', text: 'var(--sage)', glow: 'rgba(123, 145, 120, 0.2)' },
    purple: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.2)' },
    pink: { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899', glow: 'rgba(236, 72, 153, 0.2)' },
    blue: { bg: 'rgba(107, 155, 195, 0.1)', text: 'var(--sky)', glow: 'rgba(107, 155, 195, 0.2)' },
    sky: { bg: 'rgba(56, 189, 248, 0.1)', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.2)' },
    green: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', glow: 'rgba(34, 197, 94, 0.2)' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.2)' },
  };

  const colors = colorMap[color] || colorMap.accent;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="py-20"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="rnrb-container max-w-7xl">
        {/* Category Header */}
        <div className="mb-12 flex items-start gap-6">
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ background: colors.bg, boxShadow: `0 0 40px ${colors.glow}` }}
          >
            <Icon className="h-8 w-8" style={{ color: colors.text }} />
          </div>
          <div>
            <h2 className="font-display mb-2 text-3xl font-bold" style={{ color: 'var(--text)' }}>
              {title}
            </h2>
            <p className="max-w-2xl text-lg" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <h3
                className="mb-3 text-xl font-semibold transition-colors group-hover:text-white"
                style={{ color: colors.text }}
              >
                {feature.name}
              </h3>
              <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.details.map((detail, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: 'var(--muted)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: colors.text }}
                    />
                    {detail}
                  </li>
                ))}
              </ul>
              {feature.link && (
                <Link
                  href={feature.link}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:gap-2"
                  style={{ color: colors.text }}
                >
                  Learn more <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default function FeaturesPage() {
  const featureCategories = [
    {
      title: 'Songwriting & Creation',
      subtitle:
        'AI-powered tools that understand music theory, help you break through creative blocks, and capture ideas the moment they strike.',
      icon: Music2,
      color: 'accent',
      features: [
        {
          name: 'AI Chord Progression Generator',
          description:
            'Generate progressions that match your key, tempo, and genre. From I-IV-V basics to jazz extensions and modal interchange.',
          details: [
            'All 12 keys with major/minor modes',
            'Genre-specific patterns (pop, rock, jazz, folk, etc.)',
            'Voice leading optimization',
            'Secondary dominant suggestions',
            'Roman numeral & chord symbol notation',
          ],
          link: '/features/songwriting',
        },
        {
          name: 'Smart Lyrics Assistant',
          description:
            'AI-powered lyric suggestions that match your melody, theme, and style while maintaining natural flow and consistent rhyme schemes.',
          details: [
            'Multiple rhyme scheme patterns (AABB, ABAB, ABCB)',
            'Syllable counting for melody matching',
            'Thematic consistency across verses',
            'Narrative, abstract, and storytelling styles',
            'Emotion and mood targeting',
          ],
          link: '/features/songwriting',
        },
        {
          name: 'Melody Generator',
          description:
            'Create melodic phrases that complement your chords and lyrics. Scale-locked notes, vocal range awareness, and MIDI export.',
          details: [
            'Vocal range consideration (soprano to bass)',
            'Scale-locked note suggestions',
            'Rhythmic variations (eighth, sixteenth, triplets)',
            'Stepwise vs leap motion options',
            'Export to MIDI for your DAW',
          ],
          link: '/features/songwriting',
        },
        {
          name: 'Rhyme Finder & Thesaurus',
          description:
            'Find perfect rhymes, near rhymes, and creative alternatives. Built-in thesaurus for finding exactly the right word.',
          details: [
            'Perfect, near, and slant rhymes',
            'Multi-syllable rhyme patterns',
            'Synonym suggestions',
            'Word stress patterns',
            'Context-aware suggestions',
          ],
        },
        {
          name: 'Song Structure Templates',
          description:
            'Pre-built templates for verse-chorus-bridge structures, or create your own custom arrangements.',
          details: [
            'Genre-specific templates',
            'Custom section creation',
            'Drag-and-drop arrangement',
            'Time signature support',
            'Intro/outro suggestions',
          ],
        },
        {
          name: 'Voice Memo Capture',
          description:
            'Record ideas instantly with high-quality voice memos. Auto-transcription and organization by project.',
          details: [
            'One-tap recording',
            'Automatic transcription',
            'Project organization',
            'Timestamp markers',
            'Background recording support',
          ],
        },
      ],
    },
    {
      title: 'Real-Time Collaboration',
      subtitle:
        'Work together with bandmates, producers, and collaborators anywhere in the world with zero latency creative sessions.',
      icon: Users,
      color: 'gold',
      features: [
        {
          name: 'HD Video Meetings',
          description:
            'Crystal-clear video calls with up to 50 participants. Perfect for band rehearsals, production sessions, and team meetings.',
          details: [
            'Up to 50 participants per call',
            '1080p HD video quality',
            'Background noise cancellation',
            'Virtual backgrounds',
            'Screen sharing with audio',
            'Recording & transcription',
          ],
          link: '/collaboration',
        },
        {
          name: 'Real-Time Document Editing',
          description:
            "See everyone's cursors, edits, and comments in real-time. Google Docs-style collaboration for lyrics, setlists, and notes.",
          details: [
            'Live cursor tracking',
            'Instant sync across devices',
            'Comment threads on specific lines',
            'Version comparison',
            'Conflict resolution',
          ],
        },
        {
          name: 'Screen Sharing',
          description:
            'Share your DAW, browser, or any app. Walk through mixes, review tracks, and give feedback in real-time.',
          details: [
            'Full screen or window sharing',
            'Share with system audio',
            'Remote control (with permission)',
            'Annotation tools',
            'Multi-monitor support',
          ],
        },
        {
          name: 'Presence Indicators',
          description:
            "See who's online, what they're working on, and get notifications when collaborators join your projects.",
          details: [
            'Online/offline status',
            'Active project indicator',
            'Last activity timestamps',
            'Custom status messages',
            'Do not disturb mode',
          ],
        },
        {
          name: 'Scheduling & Calendar',
          description:
            'Schedule sessions with shareable links. Automatic timezone conversion and calendar integration.',
          details: [
            'Shareable meeting links',
            'Timezone auto-detection',
            'Google/Apple/Outlook sync',
            'Recurring meetings',
            'RSVP tracking',
          ],
        },
        {
          name: 'Direct Messaging',
          description:
            'Private and group messaging built right in. Share files, voice messages, and stay connected.',
          details: [
            'Private 1:1 conversations',
            'Group chats',
            'Voice message recording',
            'File sharing (any type)',
            'Read receipts & typing indicators',
          ],
        },
      ],
    },
    {
      title: 'Project Management',
      subtitle:
        'Git-like version control for songs, professional stems management, milestone tracking, and AI-powered project insights.',
      icon: Folder,
      color: 'sage',
      features: [
        {
          name: 'Version Control (Time Machine)',
          description:
            'Save unlimited versions with labels. Compare any two versions, restore previous saves, and never lose an idea again.',
          details: [
            'Unlimited version history',
            'Custom labels ("Demo", "Final Mix")',
            'Side-by-side comparison',
            'One-click restore',
            'Full audit trail',
          ],
        },
        {
          name: 'Professional Stems Mixer',
          description:
            'Upload individual tracks (vocals, guitar, drums) and mix them with real-time faders, pan, solo, and mute controls.',
          details: [
            'Multi-track upload (any format)',
            'Real-time volume faders',
            'Pan controls (L/R stereo)',
            'Solo & mute per track',
            'Export stems or master mix',
          ],
        },
        {
          name: 'Milestone Timeline',
          description:
            'Gantt-style roadmap with dependencies, progress tracking, and blocker detection. Like Asana, but for music.',
          details: [
            'Visual Gantt timeline',
            'Task dependencies',
            'Progress tracking (0-100%)',
            'Blocker alerts',
            'Due date reminders',
          ],
        },
        {
          name: 'Cloud Storage',
          description:
            'Drag-and-drop file uploads with unlimited storage for Pro users. Organized by project with automatic tagging.',
          details: [
            'Unlimited storage (Pro)',
            'Drag-and-drop uploads',
            'Automatic organization',
            'File previews (audio, images, docs)',
            'Shareable download links',
          ],
        },
        {
          name: 'AI Project Insights',
          description:
            'Your AI project manager analyzes completion rate, detects blockers, and suggests next steps.',
          details: [
            'Completion score (0-100%)',
            'Automatic blocker detection',
            'Smart suggestions',
            'Velocity trends',
            'Estimated completion date',
          ],
        },
        {
          name: 'Smart Search & Filters',
          description:
            'Find any song, file, or project instantly. Save custom views and filters for quick access.',
          details: [
            'Full-text search',
            'Filter by status, date, collaborator',
            'Saved search views',
            'Tag-based organization',
            'Recent & favorites',
          ],
        },
      ],
    },
    {
      title: 'Copyright & Royalties',
      subtitle:
        'Protect your work, manage splits, and track royalties. Everything you need to ensure you get paid for your music.',
      icon: ShieldCheck,
      color: 'purple',
      features: [
        {
          name: 'Copyright Registration Guidance',
          description:
            'Step-by-step guidance for registering your songs with the Copyright Office. Pre-filled forms and document generation.',
          details: [
            'U.S. Copyright Office guidance',
            'Pre-filled registration forms',
            'Document preparation',
            'Filing checklist',
            'Status tracking',
          ],
        },
        {
          name: 'Split Sheet Generator',
          description:
            'Create professional split sheets instantly. Track writer shares, publisher splits, and get digital signatures.',
          details: [
            'Automatic percentage calculation',
            'PRO affiliation tracking',
            'IPI number management',
            'Digital signature collection',
            'PDF export',
          ],
        },
        {
          name: 'ISWC & ISRC Tracking',
          description:
            'Manage your International Standard Work Codes and Recording Codes. Essential for royalty collection.',
          details: [
            'ISWC management (compositions)',
            'ISRC tracking (recordings)',
            'Automatic code assignment',
            'Export for distributors',
            'Audit history',
          ],
        },
        {
          name: 'Royalty Calculator',
          description:
            'Estimate earnings from streaming, radio, and sync placements. See how splits affect your take-home.',
          details: [
            'Streaming revenue estimates',
            'Radio play calculations',
            'Sync licensing projections',
            'Split impact analysis',
            'Historical comparisons',
          ],
        },
        {
          name: 'Payment Tracking',
          description:
            "Track royalty payments from all sources. See what you're owed and reconcile with your PRO statements.",
          details: [
            'Payment history by source',
            'PRO statement reconciliation',
            'Outstanding balance alerts',
            'Export for accounting',
            'Multi-currency support',
          ],
        },
        {
          name: 'Dispute Resolution',
          description:
            'Document and resolve split disputes with a clear workflow. Keep records for legal protection.',
          details: [
            'Dispute documentation',
            'Communication timeline',
            'Resolution workflow',
            'Legal-ready exports',
            'Mediation resources',
          ],
        },
      ],
    },
    {
      title: 'Tour Management',
      subtitle:
        'Plan your tour from first show to final encore. Smart routing, venue database, and everything you need to hit the road.',
      icon: MapPin,
      color: 'accent',
      features: [
        {
          name: 'Smart Route Planning',
          description:
            'AI-powered tour routing that minimizes travel time and costs. See distances, drive times, and suggested stops.',
          details: [
            'Drag-and-drop route builder',
            'Mileage & time calculations',
            'Gas cost estimates',
            'Rest stop suggestions',
            'Route optimization',
          ],
        },
        {
          name: 'Venue Database',
          description:
            'Access thousands of venues with capacity, contacts, and booking info. Save your own venue notes and contacts.',
          details: [
            '10,000+ venues nationwide',
            'Capacity & stage specs',
            'Booking contact info',
            'Personal notes & history',
            'Rating & reviews',
          ],
        },
        {
          name: 'Smart Setlist Builder',
          description:
            'Create setlists with drag-and-drop, energy flow analysis, and automatic timing. Share with your band.',
          details: [
            'Drag-and-drop ordering',
            'Song duration tracking',
            'Energy flow visualization',
            'Key & tempo display',
            'Share with band members',
          ],
        },
        {
          name: 'Gig Calendar',
          description:
            'All your shows in one place with load-in times, soundcheck, and performance schedules. Never miss a detail.',
          details: [
            'Visual calendar view',
            'Load-in & soundcheck times',
            'Day sheet generation',
            'Public show widget',
            'iCal export',
          ],
        },
        {
          name: 'Budget & Expenses',
          description:
            "Track tour finances with expense logging, per diems, and profit/loss reports. Know if you're making money.",
          details: [
            'Expense categories',
            'Receipt photo upload',
            'Per diem tracking',
            'Income vs expenses',
            'Tax-ready exports',
          ],
        },
        {
          name: 'Team & Crew Management',
          description:
            'Manage your touring party with contact info, roles, and emergency details. Everyone stays in the loop.',
          details: [
            'Role assignments',
            'Contact directory',
            'Emergency info',
            'Shared documents',
            'Availability tracking',
          ],
        },
      ],
    },
    {
      title: 'Website Builder',
      subtitle:
        'Launch a stunning artist website in 60 seconds. No code required. Custom domains, EPK, and everything you need to look pro.',
      icon: Globe,
      color: 'blue',
      features: [
        {
          name: 'Instant Site Generation',
          description:
            'Enter your artist name and genre, and get a beautiful website instantly. Customize everything after.',
          details: [
            'One-click site creation',
            'Genre-specific templates',
            'Auto-import from Spotify/Bandcamp',
            'Mobile-responsive design',
            'SEO optimization',
          ],
          link: '/features/website-builder',
        },
        {
          name: 'Drag & Drop Editor',
          description:
            'Customize every element with an intuitive visual editor. No coding skills required.',
          details: [
            'Block-based editing',
            'Real-time preview',
            'Custom colors & fonts',
            'Image optimization',
            'Undo/redo history',
          ],
        },
        {
          name: 'Custom Domains',
          description:
            'Connect your own domain or get a free subdomain. SSL certificates included for security.',
          details: [
            'Custom domain connection',
            'Free .rnrb.io subdomain',
            'SSL certificates (HTTPS)',
            'DNS management',
            'Email forwarding',
          ],
        },
        {
          name: 'Electronic Press Kit (EPK)',
          description:
            'Generate a professional EPK with your bio, photos, music, and press quotes. One link to share with bookers.',
          details: [
            'One-page EPK generator',
            'High-res photo gallery',
            'Embedded music player',
            'Press quote highlights',
            'Download links for assets',
          ],
        },
        {
          name: 'Tour Date Widget',
          description:
            "Automatically display upcoming shows from your calendar. Fans see where you're playing next.",
          details: [
            'Auto-sync from calendar',
            'Ticket link integration',
            'RSVP tracking',
            'Map view option',
            'Past shows archive',
          ],
        },
        {
          name: 'Mailing List Integration',
          description:
            'Grow your email list with embedded signup forms. Export to Mailchimp, ConvertKit, or download CSV.',
          details: [
            'Embedded signup forms',
            'Pop-up forms',
            'Mailchimp/ConvertKit sync',
            'CSV export',
            'GDPR compliance',
          ],
        },
      ],
    },
    {
      title: 'Live Streaming',
      subtitle:
        'Stream performances, studio sessions, and behind-the-scenes content to fans worldwide. Built-in tipping and chat.',
      icon: Radio,
      color: 'red',
      features: [
        {
          name: 'One-Click Go Live',
          description:
            'Start streaming instantly from browser or mobile. No OBS or external software required.',
          details: [
            'Browser-based streaming',
            'Mobile app support',
            'Webcam & screen sharing',
            'Multi-source mixing',
            'Instant replay clips',
          ],
        },
        {
          name: 'Fan Interaction',
          description: 'Live chat, reactions, and Q&A. Keep fans engaged with polls and shoutouts.',
          details: [
            'Real-time chat',
            'Emoji reactions',
            'Polls & voting',
            'Shoutout alerts',
            'Moderation tools',
          ],
        },
        {
          name: 'Tipping & Virtual Gifts',
          description:
            'Fans can support you directly during streams. Multiple payment options with low fees.',
          details: [
            'One-click tipping',
            'Virtual gift animations',
            'Tip goal tracking',
            'Payment via card/Apple Pay',
            '85% goes to artist',
          ],
        },
        {
          name: 'Stream Analytics',
          description:
            'See viewer counts, peak times, and engagement metrics. Learn what content resonates.',
          details: [
            'Real-time viewer count',
            'Peak viewership tracking',
            'Engagement metrics',
            'Revenue breakdown',
            'Audience demographics',
          ],
        },
        {
          name: 'Multi-Platform Simulcast',
          description:
            'Stream to RNRB, YouTube, Twitch, and Facebook simultaneously. One stream, multiple platforms.',
          details: [
            'YouTube Live integration',
            'Twitch streaming',
            'Facebook Live',
            'Custom RTMP destinations',
            'Per-platform chat',
          ],
        },
        {
          name: 'VOD & Archives',
          description:
            'Streams are automatically saved for replay. Clip highlights and share best moments.',
          details: [
            'Automatic stream recording',
            'Highlight clip creation',
            'Download option',
            'Privacy controls',
            'Embed code generation',
          ],
        },
      ],
    },
    {
      title: 'Community & Discovery',
      subtitle:
        "Find collaborators, discover new music, and build your network. The musician community you've been looking for.",
      icon: Compass,
      color: 'pink',
      features: [
        {
          name: 'Musician Discovery',
          description:
            'Find collaborators by instrument, genre, location, and availability. Smart matching based on your profile.',
          details: [
            'Instrument & skill filters',
            'Genre matching',
            'Location-based search',
            'Availability indicators',
            'Portfolio preview',
          ],
        },
        {
          name: 'Social Feed',
          description:
            'Share updates, new releases, and behind-the-scenes content. Follow artists you love.',
          details: [
            'Post text, images, audio, video',
            'Like, comment, share',
            'Following & followers',
            'Hashtag discovery',
            'Curated recommendations',
          ],
        },
        {
          name: 'Collaboration Requests',
          description:
            "Post what you're looking for and receive pitches. Or browse requests and offer your skills.",
          details: [
            'Post collaboration needs',
            'Receive & send pitches',
            'Filter by genre/instrument',
            'Built-in messaging',
            'Reference track sharing',
          ],
        },
        {
          name: 'Music Library',
          description:
            'Discover and stream songs from the community. Save favorites and create playlists.',
          details: [
            'Browse by genre/mood',
            'Save to favorites',
            'Create playlists',
            'Share discoveries',
            'Similar artist suggestions',
          ],
        },
        {
          name: 'Opportunities Board',
          description:
            'Find gigs, session work, band openings, and more. Post opportunities for your projects.',
          details: [
            'Gig listings',
            'Session musician calls',
            'Band member wanted',
            'Sync licensing opportunities',
            'Application tracking',
          ],
        },
        {
          name: 'Events & Workshops',
          description:
            'Discover local and virtual events, workshops, and masterclasses. RSVP and connect.',
          details: [
            'Local event discovery',
            'Virtual workshops',
            'RSVP management',
            'Calendar integration',
            'Post-event networking',
          ],
        },
      ],
    },
    {
      title: "Musician's Toolbox",
      subtitle:
        'Essential tools for every musician. Tuner, metronome, chord charts, scales, and more — all in one place.',
      icon: Wrench,
      color: 'gold',
      features: [
        {
          name: 'Precision Tuner',
          description:
            'Chromatic tuner with cent accuracy. Works with any instrument via your device microphone.',
          details: [
            'Chromatic tuning',
            'Cent-accurate display',
            'Standard & alternate tunings',
            'Frequency readout',
            'Works with any instrument',
          ],
        },
        {
          name: 'Advanced Metronome',
          description:
            'Customizable click with time signatures, subdivisions, and accent patterns.',
          details: [
            'BPM range 20-300',
            'Any time signature',
            'Subdivisions (8ths, 16ths, triplets)',
            'Accent patterns',
            'Tap tempo',
          ],
        },
        {
          name: 'Circle of Fifths',
          description:
            'Interactive circle of fifths for understanding key relationships, relative minors, and chord families.',
          details: [
            'Visual key relationships',
            'Relative major/minor',
            'Chord family display',
            'Enharmonic spellings',
            'Mode exploration',
          ],
        },
        {
          name: 'Chord & Scale Reference',
          description:
            'Comprehensive library of chords and scales with fingerings for guitar, piano, and more.',
          details: [
            'All chord types',
            'Scale library',
            'Guitar fingerings',
            'Piano diagrams',
            'Audio playback',
          ],
        },
        {
          name: 'BPM Analyzer',
          description:
            'Tap or upload audio to detect tempo. Perfect for matching songs or setting metronome.',
          details: [
            'Tap-to-detect BPM',
            'Audio file analysis',
            'Microphone tempo detection',
            'Tempo history',
            'Copy to metronome',
          ],
        },
        {
          name: 'Key Detector',
          description:
            'Upload a song or play live and detect the key. Helpful for jamming along or transcription.',
          details: [
            'Audio file analysis',
            'Live input detection',
            'Major/minor identification',
            'Confidence percentage',
            'Modal suggestions',
          ],
        },
      ],
    },
    {
      title: 'Marketplace',
      subtitle:
        'Buy and sell beats, samples, gear, and services. Connect with trusted sellers in the music community.',
      icon: ShoppingBag,
      color: 'green',
      features: [
        {
          name: 'Beat Marketplace',
          description:
            'Buy and sell beats with instant delivery. License types from leasing to exclusive.',
          details: [
            'Preview before purchase',
            'Multiple license tiers',
            'Instant download',
            'Stems included options',
            'Seller ratings & reviews',
          ],
        },
        {
          name: 'Sample Packs',
          description:
            'High-quality sample packs from producers. Royalty-free for your productions.',
          details: [
            'Royalty-free licensing',
            'Genre-specific packs',
            'One-shots & loops',
            'Preview samples',
            'Commercial use rights',
          ],
        },
        {
          name: 'Services',
          description:
            'Hire mixing engineers, session musicians, vocalists, and more. Vetted professionals.',
          details: [
            'Mixing & mastering',
            'Session recording',
            'Vocal production',
            'Arrangement services',
            'Video/photo services',
          ],
        },
        {
          name: 'Gear Exchange',
          description:
            'Buy and sell used instruments, studio gear, and accessories. Local and shipped options.',
          details: [
            'Instruments & gear listings',
            'Condition ratings',
            'Price negotiation',
            'Shipping or local pickup',
            'Seller verification',
          ],
        },
        {
          name: 'Wanted Posts',
          description:
            "Post what you're looking for and let sellers come to you. Get quotes and compare.",
          details: [
            'Describe your needs',
            'Receive seller pitches',
            'Compare quotes',
            'Direct messaging',
            'Hire with confidence',
          ],
        },
        {
          name: 'Secure Payments',
          description:
            "All transactions protected with escrow. Funds released when you're satisfied.",
          details: [
            'Escrow protection',
            'Multiple payment methods',
            'Dispute resolution',
            'Refund policy',
            'Transaction history',
          ],
        },
      ],
    },
    {
      title: 'Professional Email',
      subtitle:
        'Get your own @rnrb.me professional email address. Works with any mail app. Included free with paid membership.',
      icon: Mail,
      color: 'sky',
      features: [
        {
          name: 'Your @rnrb.me Address',
          description:
            'Claim your professional email address. yourname@rnrb.me looks better than a personal Gmail on booking inquiries.',
          details: [
            'Professional musician email',
            'Instant setup - no DNS required',
            'Included FREE with paid membership',
            'Works with iPhone, Android, desktop',
            'Full webmail access',
          ],
          link: '/settings/email',
        },
        {
          name: 'Full Webmail',
          description:
            'Access your email from anywhere with our beautiful web interface. Musician-specific folders for bookings, fan mail, and press.',
          details: [
            'Modern, fast interface',
            'Booking inquiries folder',
            'Fan mail organization',
            'Press & media folder',
            'Collaboration requests folder',
          ],
          link: '/mail',
        },
        {
          name: 'Works Everywhere',
          description:
            'Connect to your favorite email app - iPhone Mail, Gmail app, Outlook, Thunderbird, or any standard email client.',
          details: [
            'IMAP & SMTP support',
            'Secure SSL/TLS encryption',
            'App-specific passwords',
            'Push notifications',
            'Sync across all devices',
          ],
        },
        {
          name: 'Spam & Security',
          description:
            'Enterprise-grade spam filtering and security. SPF, DKIM, and DMARC configured for reliable delivery.',
          details: [
            'Advanced spam filtering',
            'Phishing protection',
            'SPF/DKIM/DMARC configured',
            'Encryption in transit',
            'No tracking or ads',
          ],
        },
        {
          name: 'Storage & Features',
          description:
            'Generous storage quotas with all the features you need. Auto-reply, forwarding, signatures, and more.',
          details: [
            '1GB storage (Basic), 10GB (Pro)',
            'Custom email signature',
            'Auto-reply for tours',
            'Email forwarding',
            'Contact management',
          ],
        },
        {
          name: 'Email Pro Upgrade',
          description:
            'Need more? Upgrade to Email Pro for 10GB storage, unlimited accounts, and priority support.',
          details: [
            '10GB storage per account',
            'Multiple email accounts',
            'Priority delivery',
            'Advanced filtering rules',
            'Only $3/month add-on',
          ],
        },
      ],
    },
    {
      title: 'Masterclasses & Learning',
      subtitle:
        'Learn from industry pros with on-demand courses and live workshops. Level up your skills.',
      icon: GraduationCap,
      color: 'purple',
      features: [
        {
          name: 'On-Demand Courses',
          description:
            'Pre-recorded masterclasses from Grammy winners, platinum producers, and touring pros.',
          details: [
            'Industry expert instructors',
            'HD video lessons',
            'Downloadable resources',
            'Progress tracking',
            'Completion certificates',
          ],
        },
        {
          name: 'Live Workshops',
          description:
            'Interactive live sessions with Q&A. Limited seats for personalized attention.',
          details: [
            'Real-time instruction',
            'Live Q&A sessions',
            'Limited enrollment',
            'Replay access',
            'Homework assignments',
          ],
        },
        {
          name: 'Become an Instructor',
          description: 'Share your expertise and earn. Apply to become a verified instructor.',
          details: [
            'Application process',
            'Revenue share model',
            'Course creation tools',
            'Student analytics',
            'Instructor community',
          ],
        },
        {
          name: 'Practice Challenges',
          description: 'Weekly challenges to push your skills. Compete with peers and earn badges.',
          details: [
            'Weekly new challenges',
            'Community submissions',
            'Peer voting',
            'Achievement badges',
            'Leaderboards',
          ],
        },
        {
          name: 'Resource Library',
          description:
            'Downloadable templates, guides, and cheat sheets. Quick references for common tasks.',
          details: [
            'Chord chart templates',
            'Mixing checklists',
            'Contract templates',
            'Genre guides',
            'Gear recommendations',
          ],
        },
        {
          name: 'Mentorship Program',
          description:
            'Connect with experienced mentors for one-on-one guidance. Paid sessions with vetted pros.',
          details: [
            'Verified mentor profiles',
            'Video call sessions',
            'Session notes',
            'Progress goals',
            'Flexible scheduling',
          ],
        },
      ],
    },
    {
      title: 'Labs & Experiments',
      subtitle:
        'Help shape the future of music creation. Test new features, provide feedback, and contribute to open-source tools.',
      icon: FlaskConical,
      color: 'accent',
      features: [
        {
          name: 'Beta Features',
          description:
            'Early access to features before public release. Help us test and refine new tools.',
          details: [
            'First access to new features',
            'Provide direct feedback',
            'Shape product direction',
            'Beta tester badge',
            'Community recognition',
          ],
        },
        {
          name: 'Feature Voting',
          description: 'Vote on what we build next. Your voice directly influences our roadmap.',
          details: [
            'Submit feature ideas',
            'Vote on proposals',
            'See implementation status',
            'Comment & discuss',
            'Track your requests',
          ],
        },
        {
          name: 'Research Participation',
          description: 'Participate in user research sessions. Help us understand musician needs.',
          details: [
            'Interview opportunities',
            'Survey participation',
            'Usability testing',
            'Focus groups',
            'Compensation available',
          ],
        },
        {
          name: 'Open Source Tools',
          description:
            'Contribute to our open-source music tools. Build something for the community.',
          details: [
            'GitHub repositories',
            'Contribution guidelines',
            'API documentation',
            'Developer community',
            'Hackathon events',
          ],
        },
        {
          name: 'AI Training',
          description:
            'Help train our AI models with your (anonymized) feedback. Make the AI smarter.',
          details: [
            'Feedback on AI suggestions',
            'Quality ratings',
            'Anonymized data contribution',
            'Opt-in only',
            'Transparency reports',
          ],
        },
        {
          name: 'Volunteer Program',
          description:
            'Help fellow musicians as a community volunteer. Moderate, support, and guide.',
          details: [
            'Community moderation',
            'New user onboarding help',
            'Forum support',
            'Volunteer badge',
            'Special recognition',
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-12 pt-24">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="gradient-orb gradient-orb-1 opacity-30" />
          <div className="gradient-orb gradient-orb-2 opacity-30" />
          <div className="hero-grid-pattern" />
        </div>

        <div className="rnrb-container relative z-10 max-w-7xl">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={180}
                height={73}
                priority
                className="mx-auto"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
                }}
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            {/* Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: 'rgba(232, 93, 59, 0.1)',
                border: '1px solid rgba(232, 93, 59, 0.3)',
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                75+ Features in One Platform
              </span>
            </div>

            <h1
              className="font-display mb-6 text-4xl font-bold md:text-5xl lg:text-6xl"
              style={{ color: 'var(--text)' }}
            >
              Every Tool You Need.
              <br />
              <span className="hero-text-gradient">Nothing You Don't.</span>
            </h1>

            <p
              className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed md:text-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              From the first spark of an idea to your sold-out world tour, Rock N' Roll Basement has
              you covered. Songwriting, collaboration, copyright, touring, streaming, and so much
              more — all in one place.
            </p>

            {/* Stats */}
            <div className="mb-10 flex flex-wrap justify-center gap-8">
              {[
                { value: '75+', label: 'Features' },
                { value: '0', label: 'Lock-in' },
                { value: '100%', label: 'Your Rights' },
                { value: '1', label: 'Platform' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div
                    className="font-display text-3xl font-bold md:text-4xl"
                    style={{ color: 'var(--accent)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth?signup=true"
                className="button inline-flex items-center gap-2 text-lg"
              >
                Start Creating Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="button secondary inline-flex items-center gap-2 text-lg"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Badges */}
      <section className="pb-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="rnrb-container max-w-4xl py-8">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: Monitor, label: 'Mac & PC', color: 'var(--gold)' },
              { icon: Smartphone, label: 'iOS & Android', color: 'var(--accent)' },
              { icon: Wifi, label: 'Works Offline', color: 'var(--sage)' },
              { icon: Globe, label: 'Web Access', color: 'var(--sky)' },
            ].map((platform, i) => (
              <div
                key={platform.label}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                }}
              >
                <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{platform.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section
        className="sticky top-0 z-40 py-4"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="rnrb-container max-w-7xl">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            {featureCategories.map((category, i) => (
              <a
                key={category.title}
                href={`#${category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all hover:bg-white/5"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <category.icon className="h-4 w-4" />
                {category.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, index) => (
        <div key={category.title} id={category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
          <FeatureCategory
            title={category.title}
            subtitle={category.subtitle}
            icon={category.icon}
            color={category.color}
            features={category.features}
            index={index}
          />
        </div>
      ))}

      {/* Final CTA */}
      <section className="py-24" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="rnrb-container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Flame className="mx-auto mb-6 h-12 w-12" style={{ color: 'var(--accent)' }} />
            <h2
              className="font-display mb-4 text-3xl font-bold md:text-4xl lg:text-5xl"
              style={{ color: 'var(--text)' }}
            >
              Ready to Build Your Workshop?
            </h2>
            <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of musicians who've made Rock N' Roll Basement their creative home.
              Start free, upgrade when you're ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth?signup=true"
                className="button inline-flex items-center gap-2 px-8 py-4 text-lg"
              >
                Enter Your Workshop
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="button secondary inline-flex items-center gap-2 px-8 py-4 text-lg"
              >
                Compare Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Link */}
      <section className="pb-16 text-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Have questions?{' '}
          <Link href="/pricing" className="underline" style={{ color: 'var(--accent)' }}>
            View Pricing
          </Link>{' '}
          •{' '}
          <Link href="/why-rnrb" className="underline" style={{ color: 'var(--accent)' }}>
            Why RNRB
          </Link>{' '}
          •{' '}
          <Link href="/terms" className="underline" style={{ color: 'var(--accent)' }}>
            Terms
          </Link>
        </p>
      </section>
    </div>
  );
}
