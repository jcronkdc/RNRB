import { NextRequest, NextResponse } from 'next/server';
import { optimizeTourRoute } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { venues } = body;

    if (!venues || !Array.isArray(venues) || venues.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 venues required' },
        { status: 400 }
      );
    }

    const optimizedRoute = await optimizeTourRoute(venues);

    if (!optimizedRoute) {
      return NextResponse.json(
        { error: 'Tour routing service unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      optimizedRoute,
      method: 'AI ant colony optimization (Tokyo subway model)',
      disclaimer: 'AI-suggested routing - verify travel times and logistics'
    });
  } catch (error: any) {
    console.error('AI tour router error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize tour route' },
      { status: 500 }
    );
  }
}

