import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateWebsiteRequest {
  artistInfo: {
    name: string;
    location?: string;
    description?: string;
  };
  genres: string[];
  goals: string[];
  style: string;
  existingSections?: string[];
}

interface GeneratedSection {
  type: string;
  content: Record<string, unknown>;
  order: number;
}

// Map goals to recommended sections
const GOAL_SECTIONS: Record<string, string[]> = {
  streams: ['hero_image', 'music_player', 'streaming', 'mailing_list'],
  bookings: ['hero_image', 'bio_split', 'tour_dates', 'contact_form', 'photo_gallery'],
  fans: ['hero_image', 'mailing_list', 'social_links', 'bio_split'],
  merch: ['hero_image', 'merch_store', 'mailing_list'],
  press: ['hero_image', 'bio_full', 'photo_gallery', 'contact_form', 'achievements'],
  epk: ['hero_image', 'bio_full', 'music_player', 'photo_gallery', 'tour_dates', 'contact_form'],
};

// Map styles to themes
const STYLE_THEMES: Record<string, string> = {
  dark: 'noir',
  light: 'acoustic',
  colorful: 'arena',
  vintage: 'vinyl',
  minimal: 'editorial',
  neon: 'neon',
};

// POST /api/ai/generate-website
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      artistInfo,
      genres,
      goals,
      style,
      existingSections = [],
    } = (await request.json()) as GenerateWebsiteRequest;

    // Determine which sections to create based on goals
    const sectionTypes = new Set<string>();

    // Always include header and footer
    sectionTypes.add('header');

    // Add sections based on goals
    goals.forEach((goal) => {
      GOAL_SECTIONS[goal]?.forEach((section) => {
        if (!existingSections.includes(section)) {
          sectionTypes.add(section);
        }
      });
    });

    sectionTypes.add('footer');

    // Generate content for each section using AI
    const sectionsToGenerate = Array.from(sectionTypes);
    const generatedSections: GeneratedSection[] = [];

    // Generate bio content
    let bioContent = '';
    if (sectionsToGenerate.includes('bio_split') || sectionsToGenerate.includes('bio_full')) {
      const bioResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional music industry copywriter. Write compelling, authentic artist bios.',
          },
          {
            role: 'user',
            content: `Write a compelling artist bio for ${artistInfo.name}.
Genre: ${genres.join(', ')}
Location: ${artistInfo.location || 'Not specified'}
Additional info: ${artistInfo.description || 'Not specified'}

Write 2-3 paragraphs that capture their essence. Be authentic and engaging.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });
      bioContent = bioResponse.choices[0]?.message?.content || '';
    }

    // Generate tagline
    let tagline = '';
    const taglineResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a creative copywriter. Write short, punchy taglines.',
        },
        {
          role: 'user',
          content: `Create a short tagline (5-10 words) for ${artistInfo.name}, a ${genres.join('/')} artist${artistInfo.location ? ` from ${artistInfo.location}` : ''}.`,
        },
      ],
      max_tokens: 50,
      temperature: 0.9,
    });
    tagline = taglineResponse.choices[0]?.message?.content?.replace(/"/g, '') || '';

    // Build sections with content
    let order = 0;
    for (const sectionType of sectionsToGenerate) {
      const section: GeneratedSection = {
        type: sectionType,
        content: {},
        order: order++,
      };

      switch (sectionType) {
        case 'header':
          section.content = {
            logo: artistInfo.name,
            navItems: ['Music', 'Tour', 'About', 'Contact'],
          };
          break;

        case 'hero_image':
          section.content = {
            title: artistInfo.name,
            subtitle: tagline,
            ctaText: goals.includes('streams')
              ? 'Listen Now'
              : goals.includes('bookings')
                ? 'Book Us'
                : 'Learn More',
            ctaLink: goals.includes('streams')
              ? '#music'
              : goals.includes('bookings')
                ? '#contact'
                : '#about',
            backgroundImage: '', // User will add their own
          };
          break;

        case 'music_player':
        case 'streaming':
          section.content = {
            title: 'Listen',
            subtitle: 'Stream our music on your favorite platform',
            spotifyUrl: '',
            appleMusicUrl: '',
            soundcloudUrl: '',
          };
          break;

        case 'bio_split':
        case 'bio_full':
          section.content = {
            title: 'About',
            content: bioContent,
            imagePosition: 'right',
          };
          break;

        case 'tour_dates':
          section.content = {
            title: 'Tour Dates',
            subtitle: 'Catch us live',
            events: [],
          };
          break;

        case 'photo_gallery':
          section.content = {
            title: 'Gallery',
            subtitle: 'Behind the scenes and live moments',
            images: [],
          };
          break;

        case 'mailing_list':
          section.content = {
            title: 'Stay Connected',
            subtitle: 'Get exclusive updates, early access to tickets, and more.',
            buttonText: 'Subscribe',
            placeholder: 'Enter your email',
          };
          break;

        case 'contact_form':
          section.content = {
            title: 'Get in Touch',
            subtitle: 'For bookings and inquiries',
            fields: ['name', 'email', 'subject', 'message'],
          };
          break;

        case 'merch_store':
          section.content = {
            title: 'Merch',
            subtitle: 'Official merchandise',
            products: [],
          };
          break;

        case 'social_links':
          section.content = {
            title: 'Follow Us',
            platforms: ['instagram', 'twitter', 'facebook', 'youtube', 'tiktok'],
          };
          break;

        case 'achievements':
          section.content = {
            title: 'Highlights',
            items: [
              { label: 'Monthly Listeners', value: '0' },
              { label: 'Shows Played', value: '0' },
              { label: 'Countries', value: '0' },
            ],
          };
          break;

        case 'footer':
          section.content = {
            copyright: `© ${new Date().getFullYear()} ${artistInfo.name}. All rights reserved.`,
            links: ['Privacy', 'Terms'],
          };
          break;
      }

      generatedSections.push(section);
    }

    // Return generated sections with theme recommendation
    return NextResponse.json({
      sections: generatedSections,
      theme: STYLE_THEMES[style] || 'noir',
      tagline,
    });
  } catch (error) {
    console.error('[AI-WEBSITE] Error:', error);

    // Return fallback sections on error
    return NextResponse.json({
      sections: [
        { type: 'header', content: { logo: 'My Website' }, order: 0 },
        {
          type: 'hero_image',
          content: { title: 'Welcome', subtitle: 'Your music journey starts here' },
          order: 1,
        },
        {
          type: 'bio_split',
          content: { title: 'About', content: 'Tell your story here.' },
          order: 2,
        },
        { type: 'contact_form', content: { title: 'Contact' }, order: 3 },
        { type: 'footer', content: { copyright: '© 2024' }, order: 4 },
      ],
      theme: 'noir',
    });
  }
}
