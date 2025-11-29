import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { getCurrentUserId } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequest {
  templateId: string;
  formData: Record<string, string>;
  context?: {
    currentSection?: string;
    existingContent?: string;
  };
}

// Template-specific prompts
const TEMPLATE_PROMPTS: Record<string, (data: Record<string, string>) => string> = {
  bio_short: (
    data
  ) => `Write a compelling 2-3 sentence artist bio for ${data.name || 'this artist'}.

Genre: ${data.genre || 'Not specified'}
Location: ${data.location || 'Not specified'}
Key Highlights: ${data.highlights || 'Not specified'}

Requirements:
- Write in third person
- Make it punchy and memorable
- Include genre and location naturally
- Highlight their unique selling point
- Keep it under 50 words`,

  bio_long: (data) => `Write a comprehensive artist biography for ${data.name || 'this artist'}.

Genre: ${data.genre || 'Not specified'}
Origin Story: ${data.origin_story || 'Not specified'}
Influences: ${data.influences || 'Not specified'}
Achievements: ${data.achievements || 'Not specified'}
Current Project: ${data.current_project || 'Not specified'}

Requirements:
- Write in third person (suitable for press)
- 3-4 paragraphs
- Start with a compelling hook
- Include their origin story
- Mention influences naturally
- Highlight achievements and milestones
- End with current projects and future direction
- Professional tone but not boring
- Around 250-350 words`,

  press_release: (data) => `Write a professional press release for ${data.name || 'this artist'}.

Announcement: ${data.announcement || 'Not specified'}
Release/Event Date: ${data.release_date || 'Not specified'}
Artist Quote: ${data.quotes || 'Not provided'}

Requirements:
- Standard press release format
- Attention-grabbing headline
- Lead paragraph with who, what, when, where, why
- Include the artist quote if provided
- Background paragraph about the artist
- Contact information placeholder at the end
- Professional, newsworthy tone
- Around 300-400 words`,

  social_post: (
    data
  ) => `Write an engaging social media post for ${data.platform || 'social media'}.

Topic: ${data.topic || 'Not specified'}
Tone: ${data.tone || 'Excited'}
Call to Action: ${data.include_cta || 'Not specified'}

Requirements:
- Platform-appropriate length (${data.platform === 'Twitter/X' ? '280 characters max' : data.platform === 'Instagram' ? 'medium length with line breaks' : 'engaging length'})
- Match the specified tone
- Include relevant emojis
- Add a clear call to action
- Use hashtags appropriately for the platform
- Make it shareable and engaging`,

  email_newsletter: (data) => `Write an email newsletter for a musician's mailing list.

Subject Line: ${data.subject || 'Not specified'}
Main Message: ${data.main_content || 'Not specified'}
Call to Action: ${data.cta || 'Not specified'}

Requirements:
- Warm, personal tone (like writing to friends)
- Compelling subject line if not provided
- Engaging opening that hooks the reader
- Clear main message
- Strong call to action
- Sign off warmly
- Around 200-300 words`,

  seo_description: (data) => `Write an SEO-optimized meta description for a musician's website.

Artist Name: ${data.name || 'Not specified'}
Genre: ${data.genre || 'Not specified'}
Location: ${data.location || 'Not specified'}
Keywords to include: ${data.keywords || 'Not specified'}

Requirements:
- Exactly 150-160 characters
- Include the artist name
- Mention genre and location
- Include a call to action
- Natural keyword integration
- Compelling and click-worthy`,

  tagline: (data) => `Create 5 catchy taglines/slogans for ${data.name || 'this artist'}.

Vibe: ${data.vibe || 'Not specified'}
Genre: ${data.genre || 'Not specified'}

Requirements:
- Short and memorable (3-8 words each)
- Capture the artist's essence
- Could work on merchandise, social media, or website
- Mix of different styles (clever, emotional, bold)
- Number them 1-5`,

  tour_announcement: (
    data
  ) => `Write an exciting tour announcement for ${data.name || 'this artist'}.

Tour Name: ${data.tour_name || 'Not specified'}
Cities/Venues: ${data.cities || 'Not specified'}
Date Range: ${data.dates || 'Not specified'}
Ticket Info: ${data.ticket_info || 'Not specified'}

Requirements:
- Exciting, energetic tone
- Build anticipation
- List cities/dates clearly
- Include ticket information
- Add a personal touch
- Encourage fans to share
- Around 150-200 words`,
};

// POST /api/ai/generate-content
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ SECURITY: Check subscription access
    try {
      await requireFeatureAccess('aiContentGeneration');
    } catch (error: unknown) {
      const err = error as { message?: string; tier?: string };
      return NextResponse.json(
        {
          error: err.message || 'Upgrade to Creator or Studio plan to access AI content generation',
          requiresUpgrade: true,
          currentTier: err.tier || 'free',
        },
        { status: 403 }
      );
    }

    // 🔒 RATE LIMITING: Check usage quota
    try {
      await requireUsageQuota('aiRequests', 1);
    } catch (error: unknown) {
      const err = error as {
        code?: string;
        message?: string;
        tier?: string;
        used?: number;
        limit?: number;
        resetDate?: Date;
      };
      if (err.code === 'QUOTA_EXCEEDED') {
        return NextResponse.json(
          {
            error: err.message,
            requiresUpgrade: true,
            tier: err.tier,
            used: err.used,
            limit: err.limit,
            resetDate: err.resetDate,
          },
          { status: 429 } // Too Many Requests
        );
      }
      throw error;
    }

    const { templateId, formData, context } = (await request.json()) as GenerateRequest;

    if (!templateId || !TEMPLATE_PROMPTS[templateId]) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
    }

    // Build the prompt
    const templatePrompt = TEMPLATE_PROMPTS[templateId](formData);

    // Add context if available
    let contextInfo = '';
    if (context?.existingContent) {
      contextInfo = `\n\nExisting content for reference (improve upon this):\n${context.existingContent}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional copywriter specializing in the music industry. You write compelling, authentic content that helps musicians connect with their audience and industry professionals.

Key principles:
- Write authentically, not generic
- Understand music industry terminology
- Balance professionalism with personality
- Make content that stands out
- Focus on what makes each artist unique`,
        },
        {
          role: 'user',
          content: templatePrompt + contextInfo,
        },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content || 'Failed to generate content.';

    // 📊 Track successful usage
    const userId = await getCurrentUserId();
    if (userId) {
      await trackUsage(userId, 'aiRequests', 1);
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('[AI-CONTENT] Error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
