import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Log the metric (in production, you'd send to analytics service)
    console.log('[Web Vitals]', {
      metric: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
    });

    // You can send to analytics services here:
    // - Vercel Analytics (built-in)
    // - Google Analytics
    // - DataDog
    // - Sentry
    // - Custom analytics endpoint

    // Example: Filter out poor metrics for alerts
    if (metric.rating === 'poor') {
      console.warn(`[Web Vitals Alert] ${metric.name} is poor: ${metric.value}`);
      
      // Send alert to monitoring service
      // await sendAlertToSlack(metric);
    }

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('[Web Vitals Error]', error);
    return NextResponse.json(
      { success: false, error: 'Invalid metric data' },
      { status: 400 }
    );
  }
}

// Reject GET requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}


