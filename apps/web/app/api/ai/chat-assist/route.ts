import { NextRequest, NextResponse } from 'next/server';
import { getChatAssistance } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const aiResponse = await getChatAssistance(message, context || {});

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      suggestion: aiResponse,
      isAiGenerated: true,
      disclaimer: 'AI suggestion - use your creative judgment'
    });
  } catch (error: any) {
    console.error('AI chat assist error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI assistance' },
      { status: 500 }
    );
  }
}

