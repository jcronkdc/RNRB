import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.id;

    // Extract profile completion flag
    const { profileCompleted, ...profileData } = data;

    // Update user profile completion status
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileCompleted: profileCompleted ?? false,
        // Update name if provided in display_name
        ...(profileData.display_name && { name: profileData.display_name }),
      },
    });

    // Note: The profile data (username, bio, etc.) would typically be stored in a separate Profile table
    // For now, we're just updating the User model's profileCompleted flag
    // You can extend this to save additional profile fields to a Profile table if needed

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PROFILE] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
