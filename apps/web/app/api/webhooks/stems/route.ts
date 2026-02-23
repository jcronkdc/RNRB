import { NextResponse } from 'next/server';

/**
 * POST /api/webhooks/stems
 * Replicate webhook for stem separation completion.
 *
 * This is called by Replicate when a stem separation prediction completes.
 * The client also polls /api/stems/status/[predictionId] as a fallback.
 *
 * For now this acknowledges the webhook. The actual result is fetched
 * by the client via the status polling endpoint.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Replicate sends: { id, status, output, error, ... }
    const { id, status, output, error } = body;

    if (status === 'failed' || error) {
      console.error(`[Stems Webhook] Prediction ${id} failed:`, error);
    } else if (status === 'succeeded') {
      console.log(`[Stems Webhook] Prediction ${id} completed successfully`);
      // The client will pick up the result via /api/stems/status/[id]
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stems Webhook] Error processing webhook:', err);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
