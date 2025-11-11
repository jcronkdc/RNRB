import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, projectId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
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
      const { error } = await supabase.from('songs').insert({
        project_id: projectId,
        title: lyrics.title || 'Untitled',
        lyrics: JSON.stringify(lyrics),
        created_by: user.id,
      });

      if (error) {
        console.error('Failed to save lyrics:', error);
      }
    }

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error('AI lyrics error:', error);
    return NextResponse.json({ error: 'Failed to generate lyrics' }, { status: 500 });
  }
}

