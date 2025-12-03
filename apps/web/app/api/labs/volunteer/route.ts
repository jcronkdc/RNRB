/**
 * R&R Labs Volunteer Signup API
 *
 * Collects volunteer signups for the AI music research program
 * Stores email and preferences for future outreach
 *
 * NOTE: Until the schema migration is run, this uses localStorage fallback
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';
import { handleApiError } from '@/lib/errors';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

// In-memory store for pre-migration signups (will be migrated later)
// This is temporary until the Prisma schema migration is deployed
const pendingSignups: Map<
  string,
  {
    email: string;
    userId?: string;
    interests?: string[];
    musicianType?: string;
    experience?: string;
    createdAt: Date;
  }
> = new Map();

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 signups per minute per IP
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    await checkRateLimit(standardLimiter, `labs-volunteer:${ip}`);

    const body = await request.json();
    const { email, interests, musicianType, experience } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Get authenticated user if logged in
    const session = await auth();
    const userId = session?.user?.id;

    // Try database first, fall back to in-memory
    let usedDatabase = false;
    try {
      const { prisma: db } = await import('@cronkwaters/db');

      // Check if already signed up
      const existingVolunteer = await db.labsVolunteer.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingVolunteer) {
        // Update existing record with new interests
        await db.labsVolunteer.update({
          where: { email: email.toLowerCase() },
          data: {
            interests: interests || existingVolunteer.interests,
            musicianType: musicianType || existingVolunteer.musicianType,
            experience: experience || existingVolunteer.experience,
            userId: userId || existingVolunteer.userId,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Your preferences have been updated!',
          isUpdate: true,
        });
      }

      // Create new volunteer record
      await db.labsVolunteer.create({
        data: {
          email: email.toLowerCase(),
          interests: interests || [],
          musicianType: musicianType || 'other',
          experience: experience || 'intermediate',
          userId: userId || null,
          status: 'pending',
          source: 'labs_page',
        },
      });

      usedDatabase = true;
    } catch (dbError) {
      // Database table doesn't exist yet, use in-memory fallback
      console.warn('[Labs] Database not ready, using in-memory storage:', dbError);

      const normalizedEmail = email.toLowerCase();
      const isUpdate = pendingSignups.has(normalizedEmail);

      pendingSignups.set(normalizedEmail, {
        email: normalizedEmail,
        userId,
        interests: interests || [],
        musicianType: musicianType || 'other',
        experience: experience || 'intermediate',
        createdAt: new Date(),
      });

      if (isUpdate) {
        return NextResponse.json({
          success: true,
          message: 'Your preferences have been updated!',
          isUpdate: true,
        });
      }
    }

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to R&R Labs! 🧪',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #9333ea;">Welcome to R&R Labs!</h1>
            <p>Thank you for joining our research program! You're now part of a community of musicians helping build the future of AI-assisted music creation.</p>
            
            <h2>What happens next?</h2>
            <ul>
              <li><strong>Phase 1 (Now):</strong> We're collecting volunteer information and preferences</li>
              <li><strong>Phase 2:</strong> You'll receive invitations to contribute recordings and MIDI files</li>
              <li><strong>Phase 3:</strong> Early access to test AI-generated stems</li>
              <li><strong>Phase 4:</strong> Beta access to AI Music Together</li>
            </ul>
            
            <p>We'll keep you updated on our progress and reach out when we need your input.</p>
            
            <p style="color: #666;">Questions? Reply to this email or reach out at labs@rnrb.app</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #999; font-size: 12px;">R&R Labs - Rock N' Roll Basement Research Division</p>
          </div>
        `,
      });
    } catch (emailError) {
      // Don't fail signup if email fails
      console.warn('Failed to send welcome email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome to R&R Labs! Check your email for details.',
      isUpdate: false,
      usedDatabase,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/labs/volunteer', method: 'POST' });
  }
}

// Get volunteer count (public)
export async function GET() {
  try {
    let dbCount = 0;

    try {
      const { prisma: db } = await import('@cronkwaters/db');
      dbCount = await db.labsVolunteer.count({
        where: { status: { in: ['pending', 'active'] } },
      });
    } catch {
      // Table doesn't exist yet
      dbCount = pendingSignups.size;
    }

    return NextResponse.json({
      volunteerCount: dbCount,
      phase: 1,
      phaseName: 'Data Collection',
      inMemorySignups: pendingSignups.size,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/labs/volunteer', method: 'GET' });
  }
}
