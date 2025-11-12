'use server';

import { prisma } from '@cronkwaters/db';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  mood: z.string().optional(),
  prompt: z.string().min(1, 'Prompt is required')
});

const OPENAI_MODEL = 'gpt-4o-mini';
const encoder = new TextEncoder();
const STEM_TYPES = ['vocals', 'drums', 'bass', 'melody'] as const;

type StreamMessage =
  | { type: 'status'; value: 'thinking' | 'writing' | 'stems' | 'finalizing' }
  | { type: 'lyrics'; value: string }
  | { type: 'complete'; value: { songId: string; vocalUrl: string; stems: Array<{ type: string; url: string }> } }
  | { type: 'error'; value: string };

function streamFromMessage(message: StreamMessage) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`${JSON.stringify(message)}\n`));
      controller.close();
    }
  });
}

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // ignore failures when invoked during SSR batching
          }
        }
      }
    }
  );
}

async function mockLyrics(input: { title: string; prompt: string; mood?: string }) {
  const moodLine = input.mood ? `Mood: ${input.mood}\n` : '';
  return `${moodLine}Verse 1:\n${input.prompt}\n\nChorus:\n${input.title} (echo)\n${input.title} (rise)\n\nBridge:\nHeartbeat kicks, the forge ignites again.`;
}

function mockStemUrl(songId: string, stemType: string) {
  return `https://cronkwaters.example/stems/${songId}/${stemType}.mp3`;
}

function encodeMetadata(meta: Record<string, unknown>) {
  return JSON.stringify(meta);
}

type LyricsInput = {
  title: string;
  prompt: string;
  mood?: string;
};

async function streamOpenAiLyrics(input: LyricsInput, push: (message: StreamMessage) => void) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const lyrics = await mockLyrics(input);
    push({ type: 'lyrics', value: lyrics });
    return lyrics;
  }

  const client = new OpenAI({ apiKey });
  let lyrics = '';

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.85,
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'You are CronkWaters Lyric Architect, crafting structured pop lyrics with clear sections. Output sections labeled Verse, Chorus, and Bridge, and include rhyme hints when possible.'
        },
        {
          role: 'user',
          content: `Title: ${input.title}\nMood: ${input.mood ?? 'not specified'}\nPrompt: ${input.prompt}`
        }
      ]
    });

    for await (const part of completion) {
      const token = part.choices[0]?.delta?.content ?? '';
      if (token) {
        lyrics += token;
        push({ type: 'lyrics', value: lyrics });
      }
    }

    if (!lyrics.trim()) {
      throw new Error('OpenAI returned empty lyrics');
    }

    return lyrics;
  } catch (error) {
    console.error('OpenAI lyric generation failed', error);
    const fallback = await mockLyrics(input);
    push({ type: 'lyrics', value: fallback });
    return fallback;
  }
}

type StemResult = { type: string; url: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureSunoBaseUrl(value?: string) {
  if (!value || !value.trim()) {
    return 'https://api.suno.ai/v1';
  }
  const trimmed = value.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function collectStemCandidates(payload: unknown): StemResult[] {
  const results: StemResult[] = [];
  if (!payload || typeof payload !== 'object') return results;

  const extractArray = (candidate: unknown): unknown[] => {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') {
      const values: unknown[] = [];
      for (const value of Object.values(candidate as Record<string, unknown>)) {
        if (Array.isArray(value)) {
          values.push(...value);
        }
      }
      return values;
    }
    return [];
  };

  type PayloadItem = Record<string, unknown> & {
    stem_type?: string;
    type?: string;
    name?: string;
    stem_url?: string;
    url?: string;
    audio_url?: string;
    audioUrl?: string;
    href?: string;
  };

  type PayloadStructure = Record<string, unknown> & {
    stems?: unknown;
    outputs?: { stems?: unknown };
    result?: { stems?: unknown };
    tracks?: unknown;
    clips?: unknown;
    audio?: unknown;
    sources?: unknown;
    parts?: unknown;
    audio_url?: string;
    audioUrl?: string;
    track_url?: string;
    url?: string;
  };

  const typedPayload = payload as PayloadStructure;
  const maybeArrays = [
    typedPayload.stems,
    typedPayload.outputs?.stems,
    typedPayload.result?.stems,
    typedPayload.tracks,
    typedPayload.clips,
    typedPayload.audio,
    typedPayload.sources,
    typedPayload.parts
  ];

  for (const candidate of maybeArrays) {
    for (const item of extractArray(candidate)) {
      if (!item || typeof item !== 'object') continue;
      const typedItem = item as PayloadItem;
      const type = (typedItem.stem_type ?? typedItem.type ?? typedItem.name ?? '').toString().toLowerCase();
      const url =
        typedItem.stem_url ??
        typedItem.url ??
        typedItem.audio_url ??
        typedItem.audioUrl ??
        typedItem.href ??
        null;
      if (typeof url === 'string' && url) {
        results.push({ type, url });
      }
    }
  }

  const directUrls = [
    typedPayload.audio_url,
    typedPayload.audioUrl,
    typedPayload.track_url,
    typedPayload.url
  ];

  for (const directUrl of directUrls) {
    if (typeof directUrl === 'string' && directUrl) {
      results.push({ type: 'mix', url: directUrl });
    }
  }

  return results;
}

function ensureCanonicalStems(songId: string, candidates: StemResult[]): StemResult[] {
  if (!candidates.length) {
    return [];
  }

  const urlByType = new Map<string, string>();
  for (const candidate of candidates) {
    const typeKey = (candidate.type || '').toLowerCase();
    if (candidate.url && !urlByType.has(typeKey)) {
      urlByType.set(typeKey, candidate.url);
    }
  }

  const primaryInstrumental =
    urlByType.get('instrumental') ??
    urlByType.get('mix') ??
    urlByType.get('full') ??
    urlByType.get('song') ??
    candidates[0]?.url ??
    null;

  return STEM_TYPES.map((stemType) => {
    const key = stemType.toLowerCase();
    const specificUrl =
      key === 'vocals'
        ? urlByType.get('vocals') ??
          urlByType.get('vocal') ??
          urlByType.get('lead') ??
          urlByType.get('acapella') ??
          urlByType.get('acappella')
        : urlByType.get(key) ?? urlByType.get(`${key}s`);

    const fallbackUrl = specificUrl ?? primaryInstrumental;
    return {
      type: stemType,
      url: typeof fallbackUrl === 'string' && fallbackUrl
        ? fallbackUrl
        : mockStemUrl(songId, stemType)
    };
  });
}

async function generateSunoStems(
  songId: string,
  input: { title: string; prompt: string; mood?: string; lyrics: string },
  push: (message: StreamMessage) => void
): Promise<StemResult[] | null> {
  const apiKey = process.env.SUNO_API_KEY ?? process.env.UDIO_API_KEY;
  if (!apiKey) {
    return null;
  }

  const baseUrl = ensureSunoBaseUrl(process.env.SUNO_API_BASE ?? process.env.UDIO_API_BASE);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`
  };

  try {
    const createResponse = await fetch(`${baseUrl}/tracks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: input.title,
        prompt: input.prompt,
        lyrics: input.lyrics,
        mood: input.mood
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Suno create failed: ${createResponse.status} ${errorText}`);
    }

    const createPayload = await createResponse.json();
    let stems = ensureCanonicalStems(songId, collectStemCandidates(createPayload));
    const jobId = createPayload?.job_id ?? createPayload?.jobId ?? createPayload?.id ?? createPayload?.taskId ?? null;

    if ((!stems || stems.length === 0) && jobId) {
      for (let attempt = 0; attempt < 12; attempt += 1) {
        await sleep(2500);
        push({ type: 'status', value: 'stems' });

        const statusResponse = await fetch(`${baseUrl}/tracks/${jobId}`, {
          method: 'GET',
          headers
        });

        if (!statusResponse.ok) {
          const statusText = await statusResponse.text();
          throw new Error(`Suno status failed: ${statusResponse.status} ${statusText}`);
        }

        const statusPayload = await statusResponse.json();
        const statusValue = statusPayload?.status ?? statusPayload?.state ?? statusPayload?.result?.status;

        if (statusValue === 'failed') {
          throw new Error('Suno job failed');
        }

        stems = ensureCanonicalStems(songId, collectStemCandidates(statusPayload));

        if (stems && stems.length) {
          break;
        }
      }
    }

    if (!stems || stems.length === 0) {
      throw new Error('Suno job returned no stems');
    }

    return stems;
  } catch (error) {
    console.error('Suno stem generation failed', error);
    return null;
  }
}

async function generateStems(
  songId: string,
  input: { title: string; prompt: string; mood?: string; lyrics: string },
  push: (message: StreamMessage) => void
): Promise<StemResult[]> {
  const generated = await generateSunoStems(songId, input, push);
  if (generated && generated.length) {
    return generated;
  }

  return STEM_TYPES.map((stemType) => ({
    type: stemType,
    url: mockStemUrl(songId, stemType)
  }));
}

export async function createSongAction(formData: FormData) {
  const parsed = formSchema.safeParse({
    title: formData.get('title'),
    mood: formData.get('mood'),
    prompt: formData.get('prompt')
  });

  if (!parsed.success) {
    return streamFromMessage({ type: 'error', value: parsed.error.flatten().fieldErrors.prompt?.[0] ?? 'Invalid input' });
  }

  const { title, mood, prompt } = parsed.data;

  const supabase = await getSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return streamFromMessage({ type: 'error', value: 'You need to be signed in to create a song.' });
  }

  const userId = session.user.id;

  const project = await prisma.project.findFirst({
    where: {
      org: {
        memberships: {
          some: { userId }
        }
      }
    },
    select: { id: true }
  });

  if (!project) {
    return streamFromMessage({ type: 'error', value: 'You are not a member of any projects yet.' });
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (message: StreamMessage) => controller.enqueue(encoder.encode(`${JSON.stringify(message)}\n`));

      try {
        push({ type: 'status', value: 'thinking' });

        const initialMetadata = {
          status: 'generating',
          prompt,
          mood: mood ?? null,
          vocalUrl: null,
          stems: []
        };

        const song = await prisma.song.create({
          data: {
            projectId: project.id,
            title,
            description: encodeMetadata(initialMetadata)
          }
        });

        push({ type: 'status', value: 'writing' });

        const lyrics = await streamOpenAiLyrics({ title, prompt, mood: mood || undefined }, push);

        push({ type: 'status', value: 'stems' });
        const stems = await generateStems(song.id, { title, prompt, mood: mood || undefined, lyrics }, push);
        const vocalUrl = stems.find((stem) => stem.type === 'vocals')?.url ?? mockStemUrl(song.id, 'vocals');

        push({ type: 'status', value: 'finalizing' });

        const finalMetadata = {
          status: 'ready',
          prompt,
          mood: mood ?? null,
          vocalUrl,
          stems
        };

        await prisma.song.update({
          where: { id: song.id },
          data: {
            lyrics,
            description: encodeMetadata(finalMetadata)
          }
        });

        revalidatePath('/dashboard');

        push({ type: 'complete', value: { songId: song.id, vocalUrl, stems } });
      } catch (error) {
        console.error('createSongAction failed', error);
        push({ type: 'error', value: 'We hit a snag while creating your song. Try again.' });
      } finally {
        controller.close();
      }
    }
  });
}
