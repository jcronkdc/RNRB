import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@cronkwaters/db';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.DAILY_DOMAIN || 'cronkwaters.daily.co';

// POST - Create/get a live session room
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const masterclassId = params.id;

    // Get masterclass and verify instructor
    const masterclass = await prisma.masterclass.findUnique({
      where: { id: masterclassId },
      include: {
        instructor: true,
      },
    });

    if (!masterclass) {
      return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
    }

    if (masterclass.instructor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Only instructors can create rooms' }, { status: 403 });
    }

    if (masterclass.type !== 'live') {
      return NextResponse.json({ error: 'Not a live masterclass' }, { status: 400 });
    }

    // Create Daily.co room if doesn't exist
    if (!masterclass.liveStreamRoomId) {
      const roomName = `mc-${masterclass.id}-${Date.now()}`;

      const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            enable_chat: true,
            enable_screenshare: true,
            enable_recording: 'cloud',
            max_participants: masterclass.maxParticipants || 100,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Expires in 24 hours
          },
        }),
      });

      if (!roomResponse.ok) {
        const error = await roomResponse.text();
        console.error('Daily.co room creation error:', error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
      }

      const roomData = await roomResponse.json();

      // Update masterclass with room ID
      await prisma.masterclass.update({
        where: { id: masterclassId },
        data: { liveStreamRoomId: roomData.name },
      });

      return NextResponse.json({
        roomName: roomData.name,
        roomUrl: roomData.url,
      });
    }

    return NextResponse.json({
      roomName: masterclass.liveStreamRoomId,
      roomUrl: `https://${DAILY_DOMAIN}/${masterclass.liveStreamRoomId}`,
    });
  } catch (error) {
    console.error('Error creating live session:', error);
    return NextResponse.json({ error: 'Failed to create live session' }, { status: 500 });
  }
}

// GET - Get token to join live session
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const masterclassId = params.id;

    // Get masterclass
    const masterclass = await prisma.masterclass.findUnique({
      where: { id: masterclassId },
      include: {
        instructor: true,
      },
    });

    if (!masterclass) {
      return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
    }

    if (!masterclass.liveStreamRoomId) {
      return NextResponse.json({ error: 'No live room available' }, { status: 400 });
    }

    // Check if user is instructor
    const isInstructor = masterclass.instructor.userId === session.user.id;

    // If not instructor, check enrollment
    if (!isInstructor) {
      const enrollment = await prisma.masterclassEnrollment.findFirst({
        where: {
          masterclassId,
          userId: session.user.id,
          status: 'completed',
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
      }
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    // Generate Daily.co meeting token
    const tokenResponse = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: masterclass.liveStreamRoomId,
          user_name: user?.name || 'Participant',
          is_owner: isInstructor,
          enable_screenshare: isInstructor,
          start_video_off: !isInstructor,
          start_audio_off: !isInstructor,
          exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60, // 4 hours
        },
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Daily.co token error:', error);
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      token: tokenData.token,
      roomUrl: `https://${DAILY_DOMAIN}/${masterclass.liveStreamRoomId}`,
      isInstructor,
    });
  } catch (error) {
    console.error('Error getting live token:', error);
    return NextResponse.json({ error: 'Failed to get session access' }, { status: 500 });
  }
}
