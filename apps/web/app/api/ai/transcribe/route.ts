import { NextRequest, NextResponse } from 'next/server';
import { transcribeSession, extractActionItems } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioUrl, extractActions } = body;

    if (!audioUrl || typeof audioUrl !== 'string') {
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Transcribe the session
    const transcription = await transcribeSession(audioUrl);

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription service unavailable' },
        { status: 503 }
      );
    }

    let actionItems = null;
    if (extractActions) {
      actionItems = await extractActionItems(transcription);
    }

    return NextResponse.json({
      transcription,
      actionItems,
      disclaimer: 'AI-generated transcription - verify accuracy'
    });
  } catch (error: any) {
    console.error('AI transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe session' },
      { status: 500 }
    );
  }
}

