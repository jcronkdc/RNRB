import { NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';

import { createClient } from '../../../lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Use NextAuth for authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const supabase = await createClient();

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      await response.text(); // Read error response but don't use it
      return NextResponse.json({ error: 'ElevenLabs API error' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const fileName = `voice-${Date.now()}.mp3`;
    const filePath = `voice/${user.id || 'anonymous'}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('audio').getPublicUrl(filePath);

    return NextResponse.json({ audioUrl: publicUrl });
  } catch (error) {
    console.error('ElevenLabs error:', error);
    return NextResponse.json({ error: 'Failed to generate voice' }, { status: 500 });
  }
}

