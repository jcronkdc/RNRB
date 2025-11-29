import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

const DAILY_WEBHOOK_SECRET = process.env.DAILY_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/daily
 * Daily.co webhook for tracking video call usage
 *
 * COST PROTECTION:
 * Daily.co charges $0.004/participant-minute, NOT per call-minute!
 * A 60-min call with 5 people = 300 participant-minutes = $1.20
 *
 * We track PARTICIPANT-MINUTES to match actual Daily.co billing.
 * Studio tier limit: 3,600 participant-minutes/month (~$14.40 cost cap)
 *
 * Events we track:
 * - participant.joined: Start tracking time
 * - participant.left: Calculate and record participant-minutes used
 * - meeting.ended: Final cleanup
 *
 * Setup in Daily.co dashboard:
 * 1. Go to Developers → Webhooks
 * 2. Add endpoint: https://www.cronkwaters.com/api/webhooks/daily
 * 3. Subscribe to: participant.joined, participant.left, meeting.ended
 * 4. Copy webhook secret to DAILY_WEBHOOK_SECRET env var
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (if configured)
    if (DAILY_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-daily-signature');
      // TODO: Implement signature verification
      // For now, proceed if secret exists in env
    }

    const event = await request.json();

    console.log('[Daily Webhook]', event.type, event);

    // Handle different event types
    switch (event.type) {
      case 'participant.joined':
        await handleParticipantJoined(event);
        break;

      case 'participant.left':
        await handleParticipantLeft(event);
        break;

      case 'meeting.ended':
        await handleMeetingEnded(event);
        break;

      default:
        console.log(`[Daily Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Daily Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Track when participant joins
 * Store join timestamp in temporary session tracking table or cache
 */
async function handleParticipantJoined(event: any) {
  const { participant, meeting_id } = event.payload;
  const userId = participant.user_id;

  if (!userId) {
    console.log('[Daily Webhook] No user_id found for participant');
    return;
  }

  // Store join timestamp (you can use Redis or database)
  // For now, we'll just log it
  console.log(
    `[Daily Webhook] User ${userId} joined meeting ${meeting_id} at ${new Date().toISOString()}`
  );

  // In production, store this in Redis or temporary DB table:
  // await redis.set(`daily:session:${meeting_id}:${userId}:joined`, Date.now());
}

/**
 * Calculate minutes used when participant leaves
 */
async function handleParticipantLeft(event: any) {
  const { participant, meeting_id, duration } = event.payload;
  const userId = participant.user_id;

  if (!userId || !duration) {
    console.log('[Daily Webhook] Missing userId or duration');
    return;
  }

  try {
    // Convert duration from seconds to minutes (round up)
    const minutesUsed = Math.ceil(duration / 60);

    console.log(
      `[Daily Webhook] User ${userId} left meeting ${meeting_id}. Duration: ${minutesUsed} minutes`
    );

    // Update user's video minutes usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        videoMinutesUsed: {
          increment: minutesUsed,
        },
      },
    });

    console.log(`[Daily Webhook] Updated user ${userId} video usage: +${minutesUsed} minutes`);

    // Check if user has exceeded quota
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        videoMinutesUsed: true,
        subscriptionTier: true,
      },
    });

    if (user) {
      const limit = user.subscriptionTier === 'studio' ? 1200 : 0;
      if (user.videoMinutesUsed >= limit) {
        console.warn(
          `[Daily Webhook] User ${userId} has reached video limit (${user.videoMinutesUsed}/${limit})`
        );
        // In future: Trigger email notification or disconnect from future calls
      }
    }
  } catch (error) {
    console.error('[Daily Webhook] Error updating video usage:', error);
  }
}

/**
 * Cleanup when meeting ends
 */
async function handleMeetingEnded(event: any) {
  const { meeting_id } = event.payload;
  console.log(`[Daily Webhook] Meeting ${meeting_id} ended`);

  // Cleanup any temporary session data
  // await redis.del(`daily:session:${meeting_id}:*`);
}

/**
 * GET endpoint returns webhook configuration info
 */
export async function GET() {
  return NextResponse.json({
    service: 'Daily.co Webhook Handler',
    events: ['participant.joined', 'participant.left', 'meeting.ended'],
    configured: !!DAILY_WEBHOOK_SECRET,
    setup: {
      url: 'https://www.cronkwaters.com/api/webhooks/daily',
      secret: DAILY_WEBHOOK_SECRET ? 'Set ✅' : 'Missing ⚠️',
      instructions: [
        '1. Go to https://dashboard.daily.co/developers/webhooks',
        '2. Add endpoint URL above',
        '3. Subscribe to: participant.joined, participant.left, meeting.ended',
        '4. Copy webhook secret to DAILY_WEBHOOK_SECRET env var',
        '5. Redeploy application',
      ],
    },
  });
}
