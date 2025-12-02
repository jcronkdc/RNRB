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
  BarChart3,
  Activity,
  Repeat,
  Package,
  Drum,
  Gift,
  MousePointer2,
  Layers,
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
    cyan: { bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4', glow: 'rgba(6, 182, 212, 0.2)' },
    amber: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' },
    indigo: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', glow: 'rgba(99, 102, 241, 0.2)' },
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
    // ==========================================
    // AI ASSISTANT - NEW CATEGORY
    // ==========================================
    {
      title: 'AI Assistant',
      subtitle:
        'Claude-powered AI that understands music. Get intelligent suggestions, instant answers, and creative assistance without ever losing control of your art.',
      icon: Brain,
      color: 'purple',
      features: [
        {
          name: 'Claude-Powered Intelligence',
          description:
            'Our AI is powered by Claude from Anthropic — the most thoughtful, nuanced AI available. It understands music theory, songwriting craft, and the business of music.',
          details: [
            'Trained on music theory & industry knowledge',
            'Natural conversation about your creative process',
            'Remembers context throughout your session',
            'Never generates generic or cookie-cutter responses',
            'Respects your creative vision — assists, never replaces',
          ],
          link: '/features/ai-music',
        },
        {
          name: 'Smart Song Analysis',
          description:
            'Get instant feedback on your songs. The AI analyzes structure, chord progressions, melody, and lyrics to provide actionable suggestions.',
          details: [
            'Chord progression analysis & alternatives',
            'Lyric theme & emotional arc review',
            'Melody contour suggestions',
            'Genre comparison & positioning',
            'Radio-readiness assessment',
          ],
        },
        {
          name: 'Music Theory Tutor',
          description:
            'Ask any music theory question and get clear, practical answers. Learn as you create with contextual explanations.',
          details: [
            'Explain any chord, scale, or mode',
            'Why does this progression work?',
            'What key am I in?',
            'How to modulate between keys',
            'Voice leading best practices',
          ],
        },
        {
          name: 'Business & Career Advice',
          description:
            'Get guidance on the music business. From contracts to marketing, royalties to touring — the AI knows the industry.',
          details: [
            'Understand contracts & licensing terms',
            'Marketing & promotion strategies',
            'Revenue optimization tips',
            'Tour planning guidance',
            'Sync licensing preparation',
          ],
        },
        {
          name: 'Platform Navigator',
          description:
            'Not sure where to find something? Ask the AI to guide you to any feature or explain how to accomplish your goal.',
          details: [
            'Find any feature instantly',
            'Step-by-step tutorials on demand',
            'Personalized workflow recommendations',
            'Shortcut and efficiency tips',
            'Integration help for external tools',
          ],
        },
        {
          name: 'Collaborative Ideation',
          description:
            "Brainstorm with AI when you're stuck. Get ideas for themes, concepts, arrangements, and more — all tailored to your style.",
          details: [
            'Song concept brainstorming',
            'Arrangement ideas by genre',
            'Album sequencing suggestions',
            'Band name & branding ideas',
            'Visual art direction concepts',
          ],
        },
      ],
    },
    // ==========================================
    // SONGWRITING & CREATION
    // ==========================================
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
            'All 12 keys with major/minor/modal options',
            'Genre-specific patterns (pop, rock, jazz, folk, country, R&B)',
            'Voice leading optimization for smooth transitions',
            'Secondary dominant & borrowed chord suggestions',
            'Roman numeral & chord symbol notation',
            'MIDI export for your DAW',
          ],
          link: '/features/songwriting',
        },
        {
          name: 'Smart Lyrics Assistant',
          description:
            'AI-powered lyric suggestions that match your melody, theme, and style while maintaining natural flow and consistent rhyme schemes.',
          details: [
            'Multiple rhyme scheme patterns (AABB, ABAB, ABCB, free verse)',
            'Syllable counting for melody matching',
            'Thematic consistency across verses & choruses',
            'Narrative, abstract, and storytelling modes',
            'Emotion and mood targeting',
            'Multi-language support',
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
            'Rhythmic variations (straight, syncopated, triplets)',
            'Stepwise vs leap motion options',
            'Motif development tools',
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
            'Synonym & antonym suggestions',
            'Word stress pattern analysis',
            'Context-aware suggestions',
            'Historical & literary word options',
          ],
        },
        {
          name: 'Song Structure Templates',
          description:
            'Pre-built templates for verse-chorus-bridge structures, or create your own custom arrangements.',
          details: [
            'Genre-specific templates (pop, rock, ballad, EDM)',
            'Custom section creation',
            'Drag-and-drop arrangement',
            'Time signature & tempo per section',
            'Intro/outro suggestions',
            'Key change planning',
          ],
        },
        {
          name: 'Voice Memo Capture',
          description:
            'Record ideas instantly with high-quality voice memos. Auto-transcription and organization by project.',
          details: [
            'One-tap recording from any screen',
            'Automatic speech-to-text transcription',
            'Project organization & tagging',
            'Timestamp markers for key moments',
            'Background recording support',
            'Humming-to-melody analysis',
          ],
        },
      ],
    },
    // ==========================================
    // RECORDING STUDIO - NEW CATEGORY
    // ==========================================
    {
      title: 'Recording Studio',
      subtitle:
        'Professional recording sessions right in your browser. Capture high-quality audio, collaborate in real-time, and export industry-standard files.',
      icon: Mic,
      color: 'red',
      features: [
        {
          name: 'Browser-Based Recording',
          description:
            'Record directly in your browser with professional-quality audio. No downloads or plugins required.',
          details: [
            'Up to 48kHz/24-bit recording quality',
            'Low-latency monitoring',
            'Multi-track recording support',
            'Real-time waveform visualization',
            'Automatic level detection',
            'Works with any USB audio interface',
          ],
          link: '/studio',
        },
        {
          name: 'Live Studio Sessions',
          description:
            'Invite collaborators to record together in real-time. Everyone can hear and contribute from anywhere in the world.',
          details: [
            'Up to 8 simultaneous participants',
            'Individual track recording per person',
            'Real-time chat during sessions',
            'Session recording & playback',
            'Latency compensation',
            'Screen sharing for sheet music/DAW',
          ],
        },
        {
          name: 'AI Stem Separator',
          description:
            'Upload any song and separate it into individual stems: vocals, drums, bass, and other instruments.',
          details: [
            'Vocal isolation (lead & backing)',
            'Drum extraction',
            'Bass separation',
            'Other instruments isolation',
            'High-quality AI separation',
            'Export each stem individually',
          ],
        },
        {
          name: 'Recording Guide',
          description:
            'Step-by-step guidance for getting professional-quality recordings at home. Microphone techniques, room treatment, and more.',
          details: [
            'Microphone placement guides',
            'Room acoustics basics',
            'Gain staging tutorials',
            'Equipment recommendations by budget',
            'Genre-specific recording tips',
            'Common mistake avoidance',
          ],
          link: '/studio/recording-guide',
        },
        {
          name: 'Session Notes',
          description:
            'Keep track of everything during your recording session. Capture take notes, settings, and ideas.',
          details: [
            'Per-take notes & ratings',
            'Equipment settings log',
            'Timestamped comments',
            'Photo attachment for setup',
            'Export session documentation',
            'Shareable with collaborators',
          ],
        },
        {
          name: 'Export & Integration',
          description:
            'Export your recordings in any format. Direct integration with your DAW and cloud storage.',
          details: [
            'WAV, MP3, FLAC, OGG export',
            'Automatic cloud backup',
            'Dropbox/Google Drive sync',
            'Direct DAW project export',
            'Metadata embedding',
            'Batch export options',
          ],
        },
      ],
    },
    // ==========================================
    // REAL-TIME COLLABORATION
    // ==========================================
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
          link: '/meet',
        },
        {
          name: 'Real-Time Document Editing',
          description:
            "See everyone's cursors, edits, and comments in real-time. Google Docs-style collaboration for lyrics, setlists, and notes.",
          details: [
            'Live cursor tracking with names',
            'Instant sync across all devices',
            'Comment threads on specific lines',
            'Version comparison & history',
            'Conflict resolution',
            'Works offline with auto-sync',
          ],
          link: '/features/collaboration',
        },
        {
          name: 'Screen Sharing',
          description:
            'Share your DAW, browser, or any app. Walk through mixes, review tracks, and give feedback in real-time.',
          details: [
            'Full screen or window sharing',
            'Share with system audio',
            'Remote control (with permission)',
            'Annotation tools for feedback',
            'Multi-monitor support',
            'HD quality sharing',
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
            'Timezone display',
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
            'Reminder notifications',
          ],
        },
        {
          name: 'Direct Messaging',
          description:
            'Private and group messaging built right in. Share files, voice messages, and stay connected.',
          details: [
            'Private 1:1 conversations',
            'Group chats for bands/projects',
            'Voice message recording',
            'File sharing (any type)',
            'Read receipts & typing indicators',
            'Message search & history',
          ],
          link: '/messages',
        },
      ],
    },
    // ==========================================
    // PROJECT MANAGEMENT
    // ==========================================
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
            'Custom labels ("Demo", "Final Mix", "Radio Edit")',
            'Side-by-side comparison',
            'One-click restore to any version',
            'Full audit trail',
            'Branch & merge for parallel ideas',
          ],
          link: '/features/project-management',
        },
        {
          name: 'Professional Stems Mixer',
          description:
            'Upload individual tracks (vocals, guitar, drums) and mix them with real-time faders, pan, solo, and mute controls.',
          details: [
            'Multi-track upload (WAV, MP3, AIFF, FLAC)',
            'Real-time volume faders',
            'Pan controls (L/R stereo field)',
            'Solo & mute per track',
            'Export stems or master mix',
            'Waveform visualization',
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
            'Blocker alerts & escalation',
            'Due date reminders',
            'Team assignment',
          ],
        },
        {
          name: 'Cloud Storage',
          description:
            'Drag-and-drop file uploads with generous storage. Organized by project with automatic tagging.',
          details: [
            '5GB free, 50GB Creator, Unlimited Studio',
            'Drag-and-drop uploads',
            'Automatic organization',
            'File previews (audio, images, docs)',
            'Shareable download links',
            'Version history for files',
          ],
        },
        {
          name: 'AI Project Insights',
          description:
            'Your AI project manager analyzes completion rate, detects blockers, and suggests next steps.',
          details: [
            'Completion score (0-100%)',
            'Automatic blocker detection',
            'Smart suggestions for next steps',
            'Velocity trends & predictions',
            'Estimated completion date',
            'Weekly progress reports',
          ],
        },
        {
          name: 'Smart Search & Filters',
          description:
            'Find any song, file, or project instantly. Save custom views and filters for quick access.',
          details: [
            'Full-text search across everything',
            'Filter by status, date, collaborator',
            'Saved search views',
            'Tag-based organization',
            'Recent & favorites',
            'Advanced query syntax',
          ],
        },
      ],
    },
    // ==========================================
    // SETLIST BUILDER - NEW DETAILED CATEGORY
    // ==========================================
    {
      title: 'Smart Setlist Builder',
      subtitle:
        'Build perfect setlists with AI-powered energy flow analysis, timing calculations, and performer teleprompter mode.',
      icon: ListMusic,
      color: 'pink',
      features: [
        {
          name: 'Drag & Drop Builder',
          description:
            'Create setlists by dragging songs from your library. Reorder on the fly with instant timing updates.',
          details: [
            'Drag-and-drop song ordering',
            'Automatic total duration calculation',
            'Copy setlists for variations',
            'Import from previous shows',
            'Song notes per setlist',
            'Infinite setlists',
          ],
          link: '/setlists',
        },
        {
          name: 'Energy Flow Analysis',
          description:
            'AI analyzes your setlist for energy dynamics. Get suggestions to optimize the emotional journey.',
          details: [
            'Energy level per song (1-10)',
            'Flow visualization graph',
            'Recommendations for peaks & valleys',
            'Opener & closer suggestions',
            'Encore planning',
            'Crowd engagement predictions',
          ],
        },
        {
          name: 'Performer Mode (Teleprompter)',
          description:
            'Full-screen lyrics display for live performance. Auto-scroll, foot pedal control, and customizable display.',
          details: [
            'Full-screen lyric display',
            'Adjustable auto-scroll speed',
            'Foot pedal / keyboard control',
            'Dark mode for stage visibility',
            'Font size customization',
            'Chord charts overlay option',
          ],
        },
        {
          name: 'Song Metadata Display',
          description:
            "See key, tempo, duration, and notes for every song at a glance. Know exactly what you're playing.",
          details: [
            'Key & tempo per song',
            'Duration tracking',
            'Custom notes (capo, tuning)',
            'Lyrics preview',
            'Last played date',
            'Audience favorites marking',
          ],
        },
        {
          name: 'Setlist Templates',
          description:
            'Save templates for different show types: club gig, festival, acoustic, etc. Start from templates and customize.',
          details: [
            'Save templates by venue type',
            'Genre-specific starter templates',
            'Band-specific defaults',
            'Duration presets (30, 45, 60, 90 min)',
            'Quick duplicate & modify',
            'Community shared templates',
          ],
        },
        {
          name: 'Share & Export',
          description:
            'Share setlists with your band or export for stage management. Print-friendly PDFs with all details.',
          details: [
            'Share link with band members',
            'Export to PDF for stage',
            'Send to venue/sound engineer',
            'iCal integration',
            'Spotify playlist generation',
            'Archive past setlists',
          ],
        },
      ],
    },
    // ==========================================
    // COPYRIGHT & ROYALTIES
    // ==========================================
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
            'Document preparation checklist',
            'Filing cost breakdown',
            'Status tracking',
            'Deadline reminders',
          ],
        },
        {
          name: 'Split Sheet Generator',
          description:
            'Create professional split sheets instantly. Track writer shares, publisher splits, and get digital signatures.',
          details: [
            'Automatic percentage calculation',
            'PRO affiliation tracking (ASCAP, BMI, SESAC)',
            'IPI/CAE number management',
            'Digital signature collection',
            'PDF export',
            'Amendment tracking',
          ],
        },
        {
          name: 'ISWC & ISRC Tracking',
          description:
            'Manage your International Standard Work Codes and Recording Codes. Essential for royalty collection.',
          details: [
            'ISWC management (compositions)',
            'ISRC tracking (recordings)',
            'Automatic code formatting',
            'Export for distributors',
            'Audit history',
            'Duplicate detection',
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
            'What-if scenarios',
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
            'Tax reporting preparation',
          ],
        },
        {
          name: 'Dispute Resolution',
          description:
            'Document and resolve split disputes with a clear workflow. Keep records for legal protection.',
          details: [
            'Dispute documentation templates',
            'Communication timeline tracking',
            'Resolution workflow',
            'Legal-ready exports',
            'Mediation resources',
            'Lawyer referral network',
          ],
        },
      ],
    },
    // ==========================================
    // TOUR MANAGEMENT
    // ==========================================
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
            'Route optimization algorithm',
            'Day-off planning',
          ],
          link: '/tours',
        },
        {
          name: 'Venue Database',
          description:
            'Access thousands of venues with capacity, contacts, and booking info. Save your own venue notes and contacts.',
          details: [
            '10,000+ venues nationwide',
            'Capacity & stage specifications',
            'Booking contact info',
            'Personal notes & history',
            'Rating & reviews from artists',
            'Payment history tracking',
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
            'Public show widget for your site',
            'iCal/Google Calendar export',
            'Timezone handling',
          ],
          link: '/shows/calendar',
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
            'Profit/loss per show',
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
            'Emergency contact info',
            'Shared documents & itineraries',
            'Availability tracking',
            'Communication channels',
          ],
        },
        {
          name: 'Tour Analytics',
          description:
            'Track performance across your tour. See which markets perform best and optimize future routing.',
          details: [
            'Attendance tracking',
            'Revenue per market',
            'Merch sales by location',
            'Social media engagement',
            'Year-over-year comparison',
            'Market potential scoring',
          ],
        },
      ],
    },
    // ==========================================
    // WEBSITE BUILDER
    // ==========================================
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
            'SEO optimization built-in',
            'Analytics integration',
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
            'Component library',
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
            'DNS management guidance',
            'Email forwarding setup',
            'Domain purchase links',
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
            'View tracking analytics',
          ],
          link: '/tools?tool=epk',
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
            'Embedded widget code',
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
            'GDPR compliance tools',
            'Double opt-in support',
          ],
        },
      ],
    },
    // ==========================================
    // LIVE STREAMING
    // ==========================================
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
            'Scheduled streams',
          ],
          link: '/live',
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
            'Slow mode for busy chats',
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
            'Tip leaderboards',
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
            'Retention graphs',
          ],
          link: '/live/analytics',
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
            'Per-platform chat aggregation',
            'Unified analytics',
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
            'Playlist organization',
          ],
        },
      ],
    },
    // ==========================================
    // SOCIAL FEED & ACTIVITY - NEW DETAILED CATEGORY
    // ==========================================
    {
      title: 'Social Feed & Activity',
      subtitle:
        'Stay connected with your musical community. Celebrate wins, share updates, and build your network of collaborators.',
      icon: Activity,
      color: 'cyan',
      features: [
        {
          name: 'Activity Feed',
          description:
            "See what's happening in your musical world. Song completions, milestones, collaboration announcements, and more.",
          details: [
            'Chronological activity stream',
            'Filter by activity type',
            'Personalized recommendations',
            "Celebrate others' achievements",
            'Comment & react',
            'Share to your profile',
          ],
          link: '/feed',
        },
        {
          name: 'Achievement Celebrations',
          description:
            'Get recognized when you hit milestones. Finished a song? Completed a project? The community celebrates with you.',
          details: [
            'Automatic milestone detection',
            'Community celebration reactions',
            'Shareable achievement cards',
            'Progress streaks',
            'Badges & recognition',
            'Year-in-review summaries',
          ],
        },
        {
          name: 'Following & Followers',
          description:
            'Build your network by following musicians you admire. Stay updated on their activity.',
          details: [
            'Follow any musician',
            'Follower notifications',
            'Activity from people you follow',
            'Mutual connection indicators',
            'Recommended follows',
            'Private profiles option',
          ],
        },
        {
          name: 'Post Updates',
          description:
            'Share text, images, audio, and video updates with your followers. Build your audience.',
          details: [
            'Rich media posts',
            'Audio snippet sharing',
            'Image galleries',
            'Video uploads',
            'Hashtag discovery',
            'Cross-post to socials',
          ],
        },
        {
          name: 'Hashtag Discovery',
          description:
            'Explore content by hashtag. Find musicians, songs, and collaborations in your niche.',
          details: [
            'Trending hashtags',
            'Genre-specific tags',
            'Location-based discovery',
            'Save favorite tags',
            'Tag-based notifications',
            'Create custom tags',
          ],
          link: '/feed/explore',
        },
        {
          name: 'Notifications Hub',
          description:
            'Never miss important updates. Customizable notifications for activity, mentions, and milestones.',
          details: [
            'Real-time notifications',
            'Email digest options',
            'Push notifications',
            'Notification preferences',
            'Mention alerts',
            'Collaboration invites',
          ],
          link: '/notifications',
        },
      ],
    },
    // ==========================================
    // COMMUNITY & DISCOVERY
    // ==========================================
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
            'Genre matching algorithm',
            'Location-based search',
            'Availability indicators',
            'Portfolio preview',
            'Compatibility scoring',
          ],
          link: '/discover',
        },
        {
          name: 'Collaboration Board',
          description:
            "Post what you're looking for and receive pitches. Or browse requests and offer your skills.",
          details: [
            'Post collaboration needs',
            'Receive & send pitches',
            'Filter by genre/instrument',
            'Built-in messaging',
            'Reference track sharing',
            'Deadline tracking',
          ],
          link: '/collaboration-needs',
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
            'New release notifications',
          ],
          link: '/library',
        },
        {
          name: 'Opportunities Board',
          description:
            'Find gigs, session work, band openings, and more. Post opportunities for your projects.',
          details: [
            'Gig listings',
            'Session musician calls',
            'Band member wanted posts',
            'Sync licensing opportunities',
            'Application tracking',
            'Deadline reminders',
          ],
          link: '/opportunities',
        },
        {
          name: 'User Profiles',
          description:
            'Showcase your work, skills, and availability. Your public profile is your musical resume.',
          details: [
            'Customizable profile page',
            'Portfolio showcase',
            'Skill & instrument listing',
            'Experience timeline',
            'Social links',
            'Contact preferences',
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
            'Event creation tools',
          ],
        },
      ],
    },
    // ==========================================
    // MUSICIAN'S TOOLBOX - ENHANCED
    // ==========================================
    {
      title: "Musician's Toolbox",
      subtitle:
        'Essential tools for every musician. 13 professional tools including tuner, metronome, stem separator, practice logger, and more — all in one place.',
      icon: Wrench,
      color: 'gold',
      features: [
        {
          name: 'Chromatic Tuner',
          description:
            'Precision chromatic tuner with cent accuracy. Works with any instrument via your device microphone.',
          details: [
            'Cent-accurate pitch detection',
            'Standard & alternate tunings',
            'Frequency readout (Hz)',
            'Visual tuning meter',
            'Works with any instrument',
            'Reference pitch adjustment (432/440Hz)',
          ],
          link: '/tools?tool=tuner',
        },
        {
          name: 'Click Track Generator',
          description:
            'Professional metronome with time signatures, subdivisions, accent patterns, and exportable click tracks.',
          details: [
            'BPM range 20-300',
            'Any time signature',
            'Subdivisions (8ths, 16ths, triplets)',
            'Accent patterns',
            'Tap tempo',
            'Export click track audio',
          ],
          link: '/tools?tool=click-track',
        },
        {
          name: 'Practice Logger',
          description:
            'Track your practice time, set goals, and build streaks. See your progress over time.',
          details: [
            'Session timing',
            'Goal setting (daily/weekly)',
            'Streak tracking',
            'Practice categories',
            'Progress charts',
            'Achievement badges',
          ],
          link: '/tools?tool=practice-logger',
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
            'Interactive learning',
          ],
          link: '/tools?tool=circle-of-fifths',
        },
        {
          name: 'AI Stem Separator',
          description:
            'Upload any song and separate it into individual stems using AI. Extract vocals, drums, bass, and more.',
          details: [
            'Vocal isolation',
            'Drum extraction',
            'Bass separation',
            'Other instruments',
            'High-quality AI separation',
            'Individual stem download',
          ],
          link: '/tools?tool=stem-separator',
        },
        {
          name: 'Loop/Slow Player',
          description:
            'Slow down audio without changing pitch to learn parts at any tempo. Loop sections for practice.',
          details: [
            'Speed adjustment (25%-200%)',
            'Pitch-preserved playback',
            'Loop point markers',
            'A-B repeat sections',
            'Waveform visualization',
            'Keyboard shortcuts',
          ],
          link: '/tools?tool=loop-player',
        },
        {
          name: 'Stage Plot Generator',
          description:
            'Create professional stage layouts for venues. Drag-and-drop equipment placement.',
          details: [
            'Drag-and-drop interface',
            'Equipment library (amps, drums, etc.)',
            'Input list generation',
            'PDF export',
            'Save templates',
            'Share with venues',
          ],
          link: '/tools?tool=stageplot',
        },
        {
          name: 'EPK Generator',
          description: 'One-click electronic press kit creation. Professional EPK in seconds.',
          details: [
            'Auto-pull from profile',
            'Photo gallery',
            'Embedded audio player',
            'Bio formatting',
            'Social stats',
            'Shareable link',
          ],
          link: '/tools?tool=epk',
        },
        {
          name: 'Gear Inventory',
          description: 'Track all your equipment, maintenance schedules, and insurance values.',
          details: [
            'Equipment catalog',
            'Serial number tracking',
            'Maintenance reminders',
            'Insurance valuation',
            'Photo documentation',
            'Export for insurance claims',
          ],
          link: '/tools?tool=gear-inventory',
        },
        {
          name: 'Contract Templates',
          description:
            'Legal templates for venues, sessions, and sync licensing. Customizable and download-ready.',
          details: [
            'Performance contracts',
            'Session musician agreements',
            'Sync licensing templates',
            'Collaboration agreements',
            'NDA templates',
            'PDF generation',
          ],
          link: '/tools?tool=contracts',
        },
        {
          name: 'Backing Track Creator',
          description:
            'Generate backing tracks by muting stems. Perfect for practice and live performance.',
          details: [
            'Stem-based muting',
            'Click track overlay',
            'Count-in options',
            'Section markers',
            'Export options',
            'BPM adjustment',
          ],
          link: '/tools?tool=backing-tracks',
        },
        {
          name: 'Session Notes',
          description: 'Digital notepad for recording sessions. Track takes, settings, and ideas.',
          details: [
            'Per-session notes',
            'Take ratings',
            'Equipment settings log',
            'Timestamp markers',
            'Photo attachments',
            'Shareable with team',
          ],
          link: '/tools?tool=session-notes',
        },
      ],
    },
    // ==========================================
    // ARTIST MERCH STORE - NEW CATEGORY
    // ==========================================
    {
      title: 'Artist Merch Store',
      subtitle:
        'Design and sell your own merchandise with zero upfront costs. Print-on-demand integration means no inventory, no risk.',
      icon: ShoppingBag,
      color: 'green',
      features: [
        {
          name: 'Print-on-Demand Integration',
          description:
            'Connect with Printful for print-on-demand fulfillment. No inventory, no upfront costs, no risk.',
          details: [
            'Printful API integration',
            'Automatic order fulfillment',
            'Global shipping',
            'Quality printing',
            'No minimum orders',
            'Automatic tracking updates',
          ],
          link: '/my-merch',
        },
        {
          name: 'Product Designer',
          description:
            'Design your merch with our visual editor. Upload artwork, add text, position elements.',
          details: [
            'Visual design editor',
            'Upload custom artwork',
            'Text & font options',
            'Multiple product views',
            'Design templates',
            'Mockup preview',
          ],
          link: '/my-merch/create',
        },
        {
          name: 'Product Catalog',
          description:
            'Access 300+ products from Printful. T-shirts, hoodies, hats, posters, phone cases, and more.',
          details: [
            'T-shirts & apparel',
            'Hoodies & outerwear',
            'Hats & accessories',
            'Posters & prints',
            'Phone cases',
            'Mugs & drinkware',
          ],
          link: '/my-merch/printful-catalog',
        },
        {
          name: 'Pricing Control',
          description:
            'Set your own retail prices and profit margins. See cost breakdown and earnings per sale.',
          details: [
            'Custom retail pricing',
            'Profit margin calculator',
            'Cost transparency',
            'Bulk pricing options',
            'Currency support',
            'Suggested pricing',
          ],
        },
        {
          name: 'Storefront',
          description:
            'Your merch automatically appears in the RNRB Store. Share direct links to your products.',
          details: [
            'Automatic store listing',
            'Product collections',
            'Direct product links',
            'Embed code for your site',
            'Social sharing',
            'SEO optimization',
          ],
          link: '/merch',
        },
        {
          name: 'Earnings Dashboard',
          description:
            'Track sales, revenue, and payouts. See your best-selling products and customer locations.',
          details: [
            'Sales tracking',
            'Revenue reports',
            'Payout history',
            'Best-seller analytics',
            'Customer geography',
            'Export reports',
          ],
          link: '/my-merch/earnings',
        },
      ],
    },
    // ==========================================
    // MARKETPLACE
    // ==========================================
    {
      title: 'Gear Marketplace',
      subtitle:
        'Buy and sell instruments, studio gear, and services. Connect with trusted sellers in the music community.',
      icon: Package,
      color: 'amber',
      features: [
        {
          name: 'Buy & Sell Gear',
          description:
            'List your instruments and gear for sale. Browse listings from other musicians.',
          details: [
            'Easy listing creation',
            'Multiple photos per listing',
            'Condition ratings',
            'Price negotiation',
            'Local or shipped options',
            'Save favorite listings',
          ],
          link: '/marketplace',
        },
        {
          name: 'Category Filters',
          description:
            'Browse by instrument type, brand, condition, and price range. Find exactly what you need.',
          details: [
            'Guitars, drums, keys, etc.',
            'Studio equipment',
            'Recording gear',
            'Accessories',
            'Pro audio',
            'Vintage & rare',
          ],
        },
        {
          name: 'Seller Profiles',
          description:
            'See seller history, ratings, and reviews. Buy with confidence from verified musicians.',
          details: [
            'Seller verification',
            'Transaction history',
            'Rating & reviews',
            'Response time indicator',
            'Location display',
            'Active listings count',
          ],
          link: '/marketplace/seller',
        },
        {
          name: 'Messaging',
          description:
            'Contact sellers directly through built-in messaging. Negotiate and arrange purchases.',
          details: [
            'Direct seller messaging',
            'Offer & counter-offer',
            'Photo sharing in chat',
            'Read receipts',
            'Message history',
            'Block & report options',
          ],
          link: '/marketplace/messages',
        },
        {
          name: 'Wanted Posts',
          description:
            "Post what you're looking for and let sellers come to you. Get quotes and compare.",
          details: [
            'Describe your needs',
            'Receive seller pitches',
            'Compare offers',
            'Set budget range',
            'Expiration dates',
            'Multiple responses',
          ],
          link: '/marketplace/wanted/create',
        },
        {
          name: 'My Listings',
          description: 'Manage your active listings. Edit, renew, or remove items easily.',
          details: [
            'Active/sold/expired views',
            'Edit listings anytime',
            'Bump to top option',
            'Analytics per listing',
            'Quick relist',
            'Bulk management',
          ],
          link: '/marketplace/my-listings',
        },
      ],
    },
    // ==========================================
    // PROFESSIONAL EMAIL
    // ==========================================
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
            'Custom alias options',
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
            'Keyboard shortcuts',
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
            'Setup guides included',
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
            'Two-factor authentication',
          ],
        },
        {
          name: 'Storage & Features',
          description:
            'Generous storage quotas with all the features you need. Auto-reply, forwarding, signatures, and more.',
          details: [
            '1GB storage (Creator), 10GB (Studio)',
            'Custom email signature',
            'Auto-reply for tours',
            'Email forwarding',
            'Contact management',
            'Attachment preview',
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
            'Priority support',
          ],
        },
      ],
    },
    // ==========================================
    // REVENUE & ANALYTICS - NEW CATEGORY
    // ==========================================
    {
      title: 'Revenue & Analytics',
      subtitle:
        'Track every dollar you earn from music. Revenue dashboard, payment tracking, and insights to grow your income.',
      icon: BarChart3,
      color: 'green',
      features: [
        {
          name: 'Revenue Dashboard',
          description:
            'See all your music income in one place. Gigs, streaming, merch, teaching, sync licensing, and more.',
          details: [
            'Unified income view',
            'Income by source breakdown',
            'Monthly/yearly trends',
            'Goal tracking',
            'Export for taxes',
            'Multi-currency support',
          ],
          link: '/revenue',
        },
        {
          name: 'Income Categories',
          description:
            'Track revenue from every source. Gig fees, streaming royalties, merch sales, session work, and more.',
          details: [
            'Gig & performance income',
            'Streaming royalties',
            'Merch sales',
            'Session/teaching income',
            'Sync licensing',
            'Tips & donations',
          ],
        },
        {
          name: 'Analytics Insights',
          description:
            "Understand your music business with data. See what's working and what needs attention.",
          details: [
            'Revenue trends over time',
            'Best performing income streams',
            'Seasonal patterns',
            'Growth rate tracking',
            'Comparison periods',
            'Forecasting',
          ],
        },
        {
          name: 'Project Analytics',
          description:
            'See stats for your projects and songs. Track completion rates, collaboration activity, and more.',
          details: [
            'Project completion rates',
            'Songs created over time',
            'Collaboration frequency',
            'Version history stats',
            'Time spent per project',
            'Productivity trends',
          ],
        },
        {
          name: 'Usage Tracking',
          description:
            'Monitor your platform usage. AI credits, storage, meeting minutes, and more.',
          details: [
            'AI credits used/remaining',
            'Storage consumption',
            'Meeting minutes used',
            'Image generation credits',
            'Usage by feature',
            'Reset date tracking',
          ],
          link: '/credits',
        },
        {
          name: 'Export & Reports',
          description:
            'Export your data for accounting and tax preparation. Generate professional reports.',
          details: [
            'CSV/Excel export',
            'Tax-ready reports',
            'Quarterly summaries',
            'Annual reports',
            'Custom date ranges',
            'Scheduled reports',
          ],
        },
      ],
    },
    // ==========================================
    // AFFILIATE PROGRAM - NEW CATEGORY
    // ==========================================
    {
      title: 'Affiliate Program',
      subtitle:
        "Earn money by sharing Rock N' Roll Basement with fellow musicians. Generous commissions and tiered rewards.",
      icon: Gift,
      color: 'indigo',
      features: [
        {
          name: 'Referral Dashboard',
          description:
            'Track your referrals, earnings, and performance. See your affiliate tier and progress.',
          details: [
            'Total earnings display',
            'Pending payouts',
            'Click tracking',
            'Conversion rate',
            'Referral history',
            'Performance graphs',
          ],
          link: '/affiliate',
        },
        {
          name: 'Tiered Commissions',
          description:
            'Earn more as you refer more. Start at 10% and climb to 25% as an Ambassador.',
          details: [
            'Starter: 10% commission',
            'Bronze (10+ referrals): 12%',
            'Silver (25+ referrals): 15%',
            'Gold (50+ referrals): 18%',
            'Platinum (100+ referrals): 22%',
            'Ambassador (250+ referrals): 25%',
          ],
        },
        {
          name: 'Unique Referral Link',
          description:
            'Get your personalized referral link to share. Track which links convert best.',
          details: [
            'Unique tracking code',
            'Custom vanity links',
            'UTM parameter support',
            'Link click analytics',
            'Multiple links allowed',
            'QR code generation',
          ],
        },
        {
          name: 'Marketing Assets',
          description:
            'Access banners, graphics, and copy to promote RNRB. Everything you need to share effectively.',
          details: [
            'Social media graphics',
            'Email templates',
            'Banner ads',
            'Video assets',
            'Copy suggestions',
            'Brand guidelines',
          ],
        },
        {
          name: 'Streamer Setup',
          description:
            'Special tools for streamers. Overlay graphics, chat commands, and integration guides.',
          details: [
            'OBS overlay graphics',
            'Twitch/YouTube integration',
            'Chat bot commands',
            'Promo code generation',
            'Stream alerts',
            'Affiliate badge display',
          ],
          link: '/affiliate/stream-setup',
        },
        {
          name: 'Payout Options',
          description:
            'Get paid via PayPal, bank transfer, or platform credit. Monthly payouts with no minimum.',
          details: [
            'PayPal payouts',
            'Bank transfer option',
            'Platform credit bonus',
            'Monthly payout cycle',
            'No minimum threshold',
            'Payout history',
          ],
        },
      ],
    },
    // ==========================================
    // MASTERCLASSES & LEARNING
    // ==========================================
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
            'Lifetime access',
          ],
          link: '/masterclasses',
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
            'Instructor feedback',
          ],
        },
        {
          name: 'Become an Instructor',
          description: 'Share your expertise and earn. Apply to become a verified instructor.',
          details: [
            'Application process',
            'Revenue share model (70/30)',
            'Course creation tools',
            'Student analytics',
            'Instructor community',
            'Marketing support',
          ],
          link: '/masterclasses/become-instructor',
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
            'Prizes for winners',
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
            'Industry contacts',
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
            'Messaging between sessions',
          ],
        },
      ],
    },
    // ==========================================
    // LABS & EXPERIMENTS
    // ==========================================
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
            'Exclusive previews',
          ],
          link: '/labs',
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
            'Priority consideration',
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
            'Flexible scheduling',
          ],
          link: '/labs/research',
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
            'Recognition program',
          ],
          link: '/labs/contribute',
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
            'Contributor recognition',
          ],
          link: '/labs/experiment',
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
            'Leadership opportunities',
          ],
          link: '/labs/volunteer',
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
                100+ Features in One Platform
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
              you covered. AI-powered songwriting, real-time collaboration, copyright protection,
              touring tools, live streaming, merch creation, and so much more — all in one place.
            </p>

            {/* Stats */}
            <div className="mb-10 flex flex-wrap justify-center gap-8">
              {[
                { value: '100+', label: 'Features' },
                { value: '18', label: 'Categories' },
                { value: '100%', label: 'Your Rights' },
                { value: '0', label: 'Lock-in' },
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
