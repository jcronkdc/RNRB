'use client';

import {
  Book,
  X,
  ChevronRight,
  Search,
  Palette,
  Globe,
  Sparkles,
  Play,
  CheckCircle,
  ArrowRight,
  Layers,
  BarChart,
  Zap,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  articles: GuideArticle[];
}

interface GuideArticle {
  id: string;
  title: string;
  duration: string;
  content: string;
  steps?: string[];
  tips?: string[];
  videoUrl?: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Play,
    description: 'Learn the basics of building your website',
    articles: [
      {
        id: 'welcome',
        title: 'Welcome to Website Builder',
        duration: '3 min',
        content: `Welcome to CronkWaters Website Builder! This powerful tool lets you create a stunning professional website for your music career in minutes.

**What you can build:**
- A complete artist website with your music, bio, and tour dates
- A professional EPK (Electronic Press Kit) for booking agents
- A merch store to sell your products
- A mailing list to grow your fanbase

**Key features:**
- Drag-and-drop section editor
- 8 beautiful pre-designed themes
- Mobile-responsive design
- Built-in SEO optimization
- Custom domain support
- Real-time analytics`,
        steps: [
          'Choose a theme that matches your style',
          'Add sections for your content (music, bio, tour dates)',
          'Customize colors and fonts',
          'Add your content (text, images, music)',
          'Preview and publish your site',
        ],
        tips: [
          'Start with a theme close to your vision - you can customize everything later',
          'Less is more - focus on your best content',
          'Use high-quality images for the best results',
        ],
      },
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        duration: '5 min',
        content: `Get your website live in under 10 minutes with this quick start guide.

**Step 1: Choose Your Theme**
Navigate to the Theme tab and select a theme that matches your music style. Each theme includes carefully selected colors, fonts, and layouts.

**Step 2: Set Up Your Hero Section**
Your hero section is the first thing visitors see. Add a compelling image or video, your artist name, and a tagline.

**Step 3: Add Your Music**
Use the Music Player section to embed your tracks from Spotify, Apple Music, SoundCloud, or upload directly.

**Step 4: Write Your Bio**
Tell your story! A good bio connects you with fans and industry professionals.

**Step 5: Add Tour Dates**
Keep fans informed about where they can see you perform.

**Step 6: Publish**
Click the Publish button to make your site live!`,
        steps: [
          'Select theme from Theme tab',
          'Upload hero image in Sections > Hero',
          'Add music player section',
          'Write your artist bio',
          'Add upcoming shows',
          'Click Publish',
        ],
      },
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        duration: '2 min',
        content: `Speed up your workflow with these keyboard shortcuts:

**Saving & Editing**
- **Cmd/Ctrl + S** - Save changes
- **Cmd/Ctrl + Z** - Undo last change
- **Cmd/Ctrl + Shift + Z** - Redo

**Navigation**
- **Cmd/Ctrl + P** - Toggle preview
- **Cmd/Ctrl + R** - Refresh preview
- **?** - Show keyboard shortcuts help

**Tips:**
- Auto-save is enabled by default, but manual saves ensure your work is secure
- Use undo/redo freely - you have up to 50 levels of history
- Preview mode shows exactly how your site will look to visitors`,
      },
    ],
  },
  {
    id: 'themes',
    title: 'Themes & Styling',
    icon: Palette,
    description: 'Customize your website appearance',
    articles: [
      {
        id: 'choosing-theme',
        title: 'Choosing the Right Theme',
        duration: '4 min',
        content: `Your theme sets the visual foundation for your entire website. Here's how to choose the perfect one:

**Noir** - Dark and elegant
Best for: Rock, metal, electronic, hip-hop
Features: High contrast, dramatic feel, red accents

**Vinyl** - Warm and vintage
Best for: Soul, jazz, indie, folk
Features: Earthy tones, classic feel, warm colors

**Neon** - Cyberpunk aesthetic
Best for: EDM, synthwave, electronic
Features: Glowing effects, cyan accents, futuristic

**Acoustic** - Light and organic
Best for: Singer-songwriter, folk, acoustic
Features: Light background, natural feel, readable

**Arena** - Bold and dramatic
Best for: Pop, rock, performers
Features: Bold colors, high energy, impactful

**Editorial** - Clean and minimal
Best for: Classical, jazz, sophisticated artists
Features: Minimal design, focus on content

**Outlaw** - Country/western
Best for: Country, americana, roots
Features: Rustic textures, gold accents

**Futura** - Modern and sleek
Best for: Pop, R&B, contemporary
Features: Glass effects, modern feel`,
        tips: [
          'Preview each theme before committing',
          'Consider your genre and target audience',
          'You can always customize colors after selecting a theme',
        ],
      },
      {
        id: 'custom-colors',
        title: 'Customizing Colors',
        duration: '3 min',
        content: `Make your website uniquely yours by customizing the color scheme.

**Primary Color**
The main background color of your site. Dark colors work well for most music websites.

**Accent Color**
Used for buttons, links, and highlights. Choose something that pops against your primary color.

**Text Color**
Make sure there's enough contrast with your background for readability.

**Secondary Color**
Used for cards, panels, and secondary backgrounds.

**Muted Color**
For less important text like captions and metadata.

**Pro Tips:**
- Use your album artwork colors for brand consistency
- Stick to 2-3 main colors for a cohesive look
- Test your colors on both desktop and mobile`,
      },
      {
        id: 'typography',
        title: 'Typography Settings',
        duration: '2 min',
        content: `The right fonts can dramatically impact your website's feel.

**Heading Font**
Used for titles and section headers. Choose something bold and distinctive.

**Body Font**
Used for paragraphs and regular text. Prioritize readability.

**Popular Combinations:**
- Playfair Display + Inter (elegant)
- Oswald + Roboto (bold)
- Bebas Neue + Montserrat (modern)
- Merriweather + Source Serif Pro (classic)

**Tips:**
- Limit yourself to 2 fonts maximum
- Ensure body text is at least 16px for readability
- Test fonts with your actual content`,
      },
    ],
  },
  {
    id: 'sections',
    title: 'Website Sections',
    icon: Layers,
    description: 'Add and customize content sections',
    articles: [
      {
        id: 'hero-section',
        title: 'Hero Section',
        duration: '4 min',
        content: `Your hero section is the most important part of your website - it's the first thing visitors see.

**Hero Types:**
- **Image Hero** - A striking photo with text overlay
- **Video Hero** - YouTube or Vimeo background video
- **Slideshow** - Multiple images that rotate
- **Animated** - Subtle motion effects
- **Split** - Image on one side, text on the other

**Best Practices:**
- Use high-resolution images (at least 1920x1080)
- Keep text minimal - just your name and a tagline
- Include a clear call-to-action button
- Optimize images for fast loading

**What to Include:**
- Your artist/band name
- A compelling tagline or latest release title
- A call-to-action (Listen Now, Tour Dates, etc.)`,
        tips: [
          'Use professional photos when possible',
          'Video backgrounds should be subtle, not distracting',
          'Test on mobile - hero sections often need adjustment',
        ],
      },
      {
        id: 'music-section',
        title: 'Music & Streaming',
        duration: '5 min',
        content: `Showcase your music with embedded players and streaming links.

**Music Player Section**
Embed tracks directly on your website. Supports:
- Spotify embeds
- Apple Music embeds
- SoundCloud embeds
- YouTube music videos
- Direct audio files

**Streaming Links Section**
Link to all platforms where fans can find your music:
- Spotify
- Apple Music
- Amazon Music
- YouTube Music
- SoundCloud
- Bandcamp
- Tidal
- Deezer

**Tips for Maximum Streams:**
- Feature your latest release prominently
- Include a "Smart Link" that detects user's preferred platform
- Add album artwork for visual appeal
- Update regularly with new releases`,
      },
      {
        id: 'tour-dates',
        title: 'Tour Dates',
        duration: '3 min',
        content: `Keep fans informed about your live performances.

**What to Include:**
- Date and time
- Venue name and city
- Ticket link
- Special notes (sold out, VIP available, etc.)

**Features:**
- Automatic past show archiving
- Ticket link integration
- Map view option
- Calendar export

**Best Practices:**
- Update immediately when shows are announced
- Remove or archive past dates regularly
- Include ticket links for every show
- Add venue addresses for easy navigation`,
      },
      {
        id: 'bio-section',
        title: 'Bio & About',
        duration: '4 min',
        content: `Tell your story and connect with fans and industry professionals.

**Bio Layouts:**
- **Full Width** - Long-form storytelling
- **Split** - Image on one side, text on the other
- **Band Members** - Individual profiles for each member

**Writing Tips:**
- Start with a hook - your most impressive achievement
- Write in third person for press use
- Include genre, influences, and notable achievements
- Keep it scannable with short paragraphs
- Update regularly with new accomplishments

**What to Include:**
- Your origin story
- Musical influences
- Notable achievements (streams, awards, press)
- What makes you unique
- Current projects`,
        tips: [
          'Have both a short (100 words) and long version',
          'Include pull quotes for press',
          'Add high-res photos for download',
        ],
      },
      {
        id: 'contact-booking',
        title: 'Contact & Booking',
        duration: '3 min',
        content: `Make it easy for fans and professionals to reach you.

**Contact Form**
A simple form that sends inquiries to your email:
- Name
- Email
- Subject
- Message

**Booking Section**
For professional inquiries:
- Booking agent contact
- Management contact
- Press contact
- General inquiries

**Best Practices:**
- Respond to inquiries within 24-48 hours
- Set up email notifications
- Include expected response time
- Separate fan mail from business inquiries`,
      },
      {
        id: 'mailing-list',
        title: 'Mailing List',
        duration: '3 min',
        content: `Build your fanbase with email collection.

**Why Email Matters:**
- You own your email list (unlike social followers)
- Direct communication with fans
- Higher engagement than social media
- Essential for release announcements

**What to Offer:**
- Exclusive content
- Early access to tickets
- Free downloads
- Behind-the-scenes updates

**Best Practices:**
- Offer something valuable in exchange for signup
- Keep the form simple (just email, maybe name)
- Set expectations for email frequency
- Always deliver on promises`,
      },
      {
        id: 'merch-store',
        title: 'Merch Store',
        duration: '4 min',
        content: `Sell merchandise directly to your fans.

**What to Sell:**
- T-shirts and apparel
- Vinyl records and CDs
- Posters and prints
- Digital downloads
- Bundles and special editions

**Setting Up Products:**
- High-quality product photos
- Clear descriptions
- Multiple size options
- Accurate pricing

**Tips for Success:**
- Feature new items prominently
- Create limited editions for urgency
- Bundle items for higher order values
- Offer free shipping thresholds`,
      },
    ],
  },
  {
    id: 'seo',
    title: 'SEO & Discovery',
    icon: Globe,
    description: 'Help fans find you online',
    articles: [
      {
        id: 'seo-basics',
        title: 'SEO Basics for Musicians',
        duration: '5 min',
        content: `Search Engine Optimization helps fans find you when they search online.

**Page Title**
What shows in browser tabs and search results:
- Include your artist name
- Add your genre or location
- Keep under 60 characters
- Example: "The Midnight | Synthwave Band | Official Website"

**Meta Description**
The snippet shown in search results:
- Summarize what visitors will find
- Include key terms (genre, location)
- Keep under 160 characters
- Include a call to action

**Best Practices:**
- Use your real artist name consistently
- Include your city/region
- Mention your genre
- Update for new releases`,
        tips: [
          'Search for yourself and see what comes up',
          'Use Google Search Console to track performance',
          'Update meta descriptions for new releases',
        ],
      },
      {
        id: 'social-integration',
        title: 'Social Media Integration',
        duration: '3 min',
        content: `Connect your website with your social presence.

**Social Links Section**
Add links to all your profiles:
- Instagram
- Twitter/X
- Facebook
- TikTok
- YouTube
- Spotify

**Open Graph Settings**
Control how your site appears when shared:
- Featured image
- Title
- Description

**Best Practices:**
- Use consistent branding across platforms
- Link back to your website from social profiles
- Share your website link in bios`,
      },
    ],
  },
  {
    id: 'domains',
    title: 'Custom Domains',
    icon: Globe,
    description: 'Use your own domain name',
    articles: [
      {
        id: 'adding-domain',
        title: 'Adding a Custom Domain',
        duration: '5 min',
        content: `Use your own domain name instead of yourname.cronkwaters.com.

**Step 1: Purchase a Domain**
Buy from registrars like:
- Namecheap
- Google Domains
- GoDaddy
- Cloudflare

**Step 2: Add Domain in Settings**
Go to Domain tab and enter your domain name.

**Step 3: Configure DNS**
Add these records at your registrar:

**CNAME Record (Recommended)**
- Type: CNAME
- Name: @ or www
- Value: cname.vercel-dns.com

**A Record (Alternative)**
- Type: A
- Name: @
- Value: 76.76.21.21

**Step 4: Verify**
Click "Verify Domain" - DNS changes can take up to 48 hours.

**Step 5: SSL Certificate**
Automatic HTTPS is enabled once verified.`,
        steps: [
          'Purchase domain from a registrar',
          'Add domain in Settings > Domain',
          'Add DNS records at your registrar',
          'Wait for propagation (up to 48 hours)',
          'Click Verify Domain',
        ],
        tips: [
          'Choose a domain that matches your artist name',
          '.com is most recognized but .music, .band work too',
          'Keep your domain registration current',
        ],
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart,
    description: 'Track your website performance',
    articles: [
      {
        id: 'understanding-analytics',
        title: 'Understanding Your Analytics',
        duration: '4 min',
        content: `Track how visitors interact with your website.

**Key Metrics:**

**Page Views**
Total number of pages viewed. Higher is better, but quality matters more.

**Unique Visitors**
Individual people who visited. This is your true reach.

**Top Pages**
Which sections get the most attention. Use this to prioritize content.

**Devices**
Desktop vs mobile breakdown. Ensure your site works well on both.

**Referrers**
Where your traffic comes from:
- Social media
- Search engines
- Direct visits
- Other websites

**Using Analytics:**
- Track spikes around releases or announcements
- See which content resonates most
- Identify where to focus your promotion
- Monitor trends over time`,
      },
    ],
  },
];

interface UserGuidesProps {
  isOpen: boolean;
  onClose: () => void;
  initialArticle?: string;
}

export function UserGuides({ isOpen, onClose, initialArticle }: UserGuidesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);

  if (!isOpen) return null;

  // Find initial article if provided
  if (initialArticle && !selectedArticle) {
    for (const section of GUIDE_SECTIONS) {
      const article = section.articles.find((a) => a.id === initialArticle);
      if (article) {
        setSelectedSection(section.id);
        setSelectedArticle(article);
        break;
      }
    }
  }

  // Filter sections and articles based on search
  const filteredSections = GUIDE_SECTIONS.map((section) => ({
    ...section,
    articles: section.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.articles.length > 0 || !searchQuery);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className="flex h-[80vh] w-full max-w-5xl overflow-hidden rounded-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div
          className="w-72 shrink-0 overflow-y-auto"
          style={{ borderRight: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-4" style={{ background: 'var(--panel)' }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Book size={20} style={{ color: 'var(--accent)' }} />
                <h2 className="font-bold" style={{ color: 'var(--text)' }}>
                  Help Center
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                style={{ color: 'var(--muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides..."
                className="w-full rounded-lg py-2 pl-9 pr-4 text-sm"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-1 p-2">
            {filteredSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() =>
                    setSelectedSection(selectedSection === section.id ? null : section.id)
                  }
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <section.icon size={18} style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {section.title}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${selectedSection === section.id ? 'rotate-90' : ''}`}
                    style={{ color: 'var(--muted)' }}
                  />
                </button>

                {selectedSection === section.id && (
                  <div
                    className="ml-4 space-y-1 border-l py-1 pl-4"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {section.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          selectedArticle?.id === article.id ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                        style={{
                          color:
                            selectedArticle?.id === article.id ? 'var(--accent)' : 'var(--text)',
                        }}
                      >
                        <span>{article.title}</span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>
                          {article.duration}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg)' }}>
          {selectedArticle ? (
            <div className="mx-auto max-w-2xl">
              {/* Article Header */}
              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {selectedArticle.duration} read
                  </span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {selectedArticle.title}
                </h1>
              </div>

              {/* Article Content */}
              <div className="prose prose-invert max-w-none">
                {selectedArticle.content.split('\n\n').map((paragraph, i) => {
                  // Handle headers
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h3
                        key={i}
                        className="mb-4 mt-8 text-xl font-bold"
                        style={{ color: 'var(--text)' }}
                      >
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }

                  // Handle bullet lists
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n');
                    return (
                      <ul key={i} className="mb-4 space-y-2">
                        {items.map((item, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2"
                            style={{ color: 'var(--text)' }}
                          >
                            <CheckCircle
                              size={16}
                              className="mt-1 shrink-0"
                              style={{ color: 'var(--accent)' }}
                            />
                            <span
                              dangerouslySetInnerHTML={{
                                __html: item
                                  .slice(2)
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  // Regular paragraph with bold support
                  return (
                    <p
                      key={i}
                      className="mb-4 leading-relaxed"
                      style={{ color: 'var(--text)' }}
                      dangerouslySetInnerHTML={{
                        __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                      }}
                    />
                  );
                })}
              </div>

              {/* Steps */}
              {selectedArticle.steps && (
                <div
                  className="mt-8 rounded-xl p-6"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  <h3
                    className="mb-4 flex items-center gap-2 font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    <Zap size={18} style={{ color: 'var(--accent)' }} />
                    Quick Steps
                  </h3>
                  <ol className="space-y-3">
                    {selectedArticle.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                          style={{ background: 'var(--accent)', color: '#fff' }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ color: 'var(--text)' }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tips */}
              {selectedArticle.tips && (
                <div
                  className="mt-6 rounded-xl p-6"
                  style={{ background: 'var(--accent)', opacity: 0.1 }}
                >
                  <h3
                    className="mb-4 flex items-center gap-2 font-bold"
                    style={{ color: 'var(--accent)' }}
                  >
                    <Sparkles size={18} />
                    Pro Tips
                  </h3>
                  <ul className="space-y-2">
                    {selectedArticle.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2"
                        style={{ color: 'var(--text)' }}
                      >
                        <ArrowRight
                          size={16}
                          className="mt-1 shrink-0"
                          style={{ color: 'var(--accent)' }}
                        />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // Welcome screen
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: 'var(--accent)', opacity: 0.2 }}
              >
                <Book size={40} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                Welcome to Help Center
              </h2>
              <p className="mb-8 max-w-md" style={{ color: 'var(--muted)' }}>
                Select a topic from the sidebar to get started, or search for specific help.
              </p>

              {/* Popular Articles */}
              <div className="grid w-full max-w-lg gap-3">
                <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Popular Articles
                </p>
                {[
                  { id: 'quick-start', title: 'Quick Start Guide', section: 'getting-started' },
                  { id: 'choosing-theme', title: 'Choosing the Right Theme', section: 'themes' },
                  { id: 'hero-section', title: 'Hero Section Setup', section: 'sections' },
                ].map((article) => {
                  const section = GUIDE_SECTIONS.find((s) => s.id === article.section);
                  const fullArticle = section?.articles.find((a) => a.id === article.id);
                  return (
                    <button
                      key={article.id}
                      onClick={() => {
                        setSelectedSection(article.section);
                        if (fullArticle) setSelectedArticle(fullArticle);
                      }}
                      className="flex items-center justify-between rounded-lg p-4 text-left transition-all hover:scale-[1.02]"
                      style={{
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ color: 'var(--text)' }}>{article.title}</span>
                      <ChevronRight size={18} style={{ color: 'var(--muted)' }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
