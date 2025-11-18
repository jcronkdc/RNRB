import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, context } = body;

    if (!type || !['social', 'email', 'press'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be: social, email, or press' },
        { status: 400 }
      );
    }

    const content = await generateContent(type, context || {});

    if (!content) {
      return NextResponse.json(
        { error: 'AI content generation unavailable. Check OPENAI_API_KEY.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      content,
      type,
      isAiGenerated: true,
      disclaimer: 'AI-generated draft - edit before publishing'
    });
  } catch (error: any) {
    console.error('AI content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

