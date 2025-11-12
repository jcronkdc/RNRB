import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@cronkwaters/auth';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    // Use NextAuth for authentication
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const _user = session.user; // TODO: Use for tracking

    const { prompt, projectId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional lyricist. Generate complete song lyrics with:
- Verse/Chorus/Bridge structure
- Rhyme scheme notation (AABB, ABAB, etc.)
- Stress map (marking stressed syllables with / and unstressed with x)
- Emotional tone matching the prompt

Format as JSON:
{
  "title": "Song Title",
  "verses": [{"lines": ["line1", "line2"], "rhymeScheme": "AA"}],
  "chorus": {"lines": ["line1", "line2"], "rhymeScheme": "ABAB"},
  "bridge": {"lines": ["line1", "line2"], "rhymeScheme": "AABB"},
  "stressMap": {"verse1": ["x/x/x", "x/x/x"]},
  "mood": "sad/energetic/etc"
}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const lyrics = JSON.parse(completion.choices[0]?.message?.content || '{}');

    // Save to database if projectId provided
    if (projectId) {
      // TODO: Replace with Prisma client call
      // await prisma.song.create({
      //   data: {
      //     projectId,
      //     title: lyrics.title || 'Untitled',
      //     lyrics: JSON.stringify(lyrics),
      //     createdById: user.id || '',
      //   }
      // });
    }

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error('AI lyrics error:', error);
    return NextResponse.json({ error: 'Failed to generate lyrics' }, { status: 500 });
  }
}

