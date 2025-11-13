import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

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
    
    const user = session.user;

    const { prompt, projectId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      // Return a fallback response when OpenAI is not configured
      const fallbackLyrics = {
        title: "AI Generated Song",
        verses: [
          {
            lines: ["This is a demo verse", "Without OpenAI configured"],
            rhymeScheme: "AA"
          }
        ],
        chorus: {
          lines: ["This is the chorus part", "Where emotions start"],
          rhymeScheme: "AA"
        },
        bridge: {
          lines: ["Bridge section here", "Making feelings clear"],
          rhymeScheme: "AA"
        },
        mood: "demo"
      };
      return NextResponse.json({ lyrics: fallbackLyrics });
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
    if (projectId && user.id) {
      try {
        // Verify project exists and user has access
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            org: {
              memberships: {
                some: {
                  userId: user.id
                }
              }
            }
          }
        });

        if (project) {
          // Create the song with AI-generated lyrics
          await prisma.song.create({
            data: {
              projectId,
              title: lyrics.title || 'AI Generated Song',
              key: lyrics.key || 'C major',
              tempo: lyrics.tempo || 120,
              lyrics: lyrics.verses?.map((v: { lines: string[] }) => v.lines.join('\n')).join('\n\n') || ''
            }
          });
        }
      } catch (dbError) {
        console.error('Failed to save lyrics to database:', dbError);
        // Continue anyway - don't fail the request
      }
    }

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error('AI lyrics error:', error);
    return NextResponse.json({ error: 'Failed to generate lyrics' }, { status: 500 });
  }
}

