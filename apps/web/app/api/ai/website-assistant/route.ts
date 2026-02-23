import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIAction {
  type: 'apply_theme' | 'add_section' | 'update_content' | 'navigate';
  label: string;
  payload: Record<string, unknown>;
}

// Theme configurations for suggestions
const THEMES = {
  noir: {
    name: 'Noir',
    description: 'Dark and elegant with red accents',
    colors: { primary: '#000000', accent: '#ff6347', text: '#ffffff' },
  },
  vinyl: {
    name: 'Vinyl',
    description: 'Warm vintage vibes with brown tones',
    colors: { primary: '#2d1b0e', accent: '#d4a574', text: '#f5e6d3' },
  },
  neon: {
    name: 'Neon',
    description: 'Cyberpunk aesthetic with cyan glow',
    colors: { primary: '#0a0a0a', accent: '#00ffff', text: '#ffffff' },
  },
  acoustic: {
    name: 'Acoustic',
    description: 'Light and organic feel',
    colors: { primary: '#f5f0e8', accent: '#8b6914', text: '#2c2416' },
  },
  arena: {
    name: 'Arena',
    description: 'Bold and dramatic for performers',
    colors: { primary: '#1a1a2e', accent: '#e94560', text: '#ffffff' },
  },
  editorial: {
    name: 'Editorial',
    description: 'Clean and minimal design',
    colors: { primary: '#ffffff', accent: '#000000', text: '#1a1a1a' },
  },
  outlaw: {
    name: 'Outlaw',
    description: 'Country/western aesthetic',
    colors: { primary: '#1c1610', accent: '#c9a962', text: '#e8dcc8' },
  },
  futura: {
    name: 'Futura',
    description: 'Modern and sleek with glass effects',
    colors: { primary: '#0d0d0d', accent: '#c0c0c0', text: '#ffffff' },
  },
};

// Section recommendations based on genre/type (used in system prompt)
const _SECTION_RECOMMENDATIONS = {
  musician: [
    'hero_image',
    'music_player',
    'tour_dates',
    'bio_split',
    'mailing_list',
    'contact_form',
  ],
  band: [
    'hero_video',
    'music_player',
    'band_members',
    'tour_dates',
    'photo_gallery',
    'merch_store',
  ],
  dj: ['hero_animated', 'streaming', 'tour_dates', 'photo_gallery', 'contact_form'],
  producer: ['hero_image', 'discography', 'streaming', 'bio_full', 'contact_form'],
  singer: ['hero_slideshow', 'music_player', 'bio_split', 'photo_gallery', 'mailing_list'],
};

// POST /api/ai/website-assistant
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, siteId, siteName, currentSection, systemContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Build the conversation with system context
    const conversationMessages: ChatMessage[] = [
      {
        role: 'system',
        content: `${systemContext}

Current context:
- Site ID: ${siteId || 'Not specified'}
- Site Name: ${siteName || 'Not specified'}
- Current Section: ${currentSection || 'None'}

Available themes: ${Object.entries(THEMES)
          .map(([id, t]) => `${id} (${t.description})`)
          .join(', ')}

When the user asks about themes, suggest specific ones from the list above.
When suggesting sections, be specific about which types would work best.
Always be encouraging and helpful.

IMPORTANT: At the end of your response, if there are clear actionable suggestions, include them in a special format:
[SUGGESTIONS]: suggestion1 | suggestion2 | suggestion3

If you can directly apply a change, include:
[ACTION:type:label]: payload_json

For example:
[ACTION:apply_theme:Apply Noir Theme]: {"templateId": "noir"}
[ACTION:add_section:Add Music Player]: {"sectionType": "music_player"}
[ACTION:navigate:Go to Theme Settings]: {"tab": "theme"}`,
      },
      ...messages,
    ];

    // Call OpenAI
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const responseContent =
      completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Parse suggestions and actions from response
    const suggestions: string[] = [];
    const actions: AIAction[] = [];
    let cleanedMessage = responseContent;

    // Extract suggestions
    const suggestionsMatch = responseContent.match(/\[SUGGESTIONS\]:\s*(.+?)(?=\[ACTION|$)/s);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1].trim();
      suggestions.push(
        ...suggestionsText
          .split('|')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s.length < 50)
      );
      cleanedMessage = cleanedMessage.replace(/\[SUGGESTIONS\]:.+?(?=\[ACTION|$)/s, '').trim();
    }

    // Extract actions
    const actionRegex = /\[ACTION:(\w+):([^\]]+)\]:\s*(\{[^}]+\})/g;
    let actionMatch;
    while ((actionMatch = actionRegex.exec(responseContent)) !== null) {
      try {
        const [fullMatch, type, label, payloadJson] = actionMatch;
        const payload = JSON.parse(payloadJson);
        actions.push({
          type: type as AIAction['type'],
          label,
          payload,
        });
        cleanedMessage = cleanedMessage.replace(fullMatch, '').trim();
      } catch {
        // Skip invalid action
      }
    }

    // Clean up any remaining markers
    cleanedMessage = cleanedMessage
      .replace(/\[SUGGESTIONS\]:.*/g, '')
      .replace(/\[ACTION:[^\]]+\]:.*/g, '')
      .trim();

    return NextResponse.json({
      message: cleanedMessage,
      suggestions: suggestions.slice(0, 3),
      actions: actions.slice(0, 2),
    });
  } catch (error) {
    console.error('[AI-ASSISTANT] Error:', error);

    // Fallback response if OpenAI fails
    return NextResponse.json({
      message:
        "I'm here to help you build your website! You can ask me about:\n\n- **Themes**: I can recommend color schemes that match your music style\n- **Sections**: I'll suggest what to add to make your site engaging\n- **Content**: I can help write your bio, descriptions, and more\n- **SEO**: Tips to help fans find you online\n\nWhat would you like to work on?",
      suggestions: ['Help me choose a theme', 'What sections should I add?', 'Improve my SEO'],
      actions: [],
    });
  }
}
