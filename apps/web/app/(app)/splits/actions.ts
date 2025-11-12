'use server';

import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import { revalidatePath } from "next/cache";

interface CreateSplitInput {
  songId: string;
  contributors: Array<{
    email: string;
    percentage: number;
    role: string;
  }>;
  notes?: string;
}

export async function createSplitAction(input: CreateSplitInput) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const { songId, contributors, notes } = input;

  // Validate percentages total 100
  const totalPercentage = contributors.reduce((sum, c) => sum + c.percentage, 0);
  if (totalPercentage !== 100) {
    return { success: false as const, error: "Split percentages must total 100%" };
  }

  try {
    // Verify song exists and user has access
    const song = await prisma.song.findFirst({
      where: {
        id: songId,
        project: {
          org: {
            memberships: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      }
    });

    if (!song) {
      return { success: false as const, error: "Song not found or access denied" };
    }

    // Create splits for each contributor
    const splitPromises = contributors.map(async (contributor) => {
      // Find or create user by email
      let user = await prisma.user.findUnique({
        where: { email: contributor.email }
      });

      if (!user) {
        // Create pending user account
        user = await prisma.user.create({
          data: {
            email: contributor.email,
            name: contributor.email.split('@')[0], // Default name from email
          }
        });
      }

      // Create the split
      return prisma.songSplit.create({
        data: {
          songId,
          userId: user.id,
          percentage: contributor.percentage,
          role: contributor.role,
          confirmed: user.id === session.user.id, // Auto-confirm for creator
        }
      });
    });

    await Promise.all(splitPromises);

    // TODO: Send email notifications to contributors

    revalidatePath('/splits');
    return { success: true as const };
  } catch (error) {
    console.error('Error creating split:', error);
    return { success: false as const, error: "Failed to create split agreement" };
  }
}

export async function confirmSplitAction(splitId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  try {
    // Verify split exists and belongs to user
    const split = await prisma.songSplit.findFirst({
      where: {
        id: splitId,
        userId: session.user.id,
        confirmed: false
      }
    });

    if (!split) {
      return { success: false as const, error: "Split not found or already confirmed" };
    }

    // Confirm the split
    await prisma.songSplit.update({
      where: { id: splitId },
      data: { confirmed: true }
    });

    revalidatePath('/splits');
    return { success: true as const };
  } catch (error) {
    console.error('Error confirming split:', error);
    return { success: false as const, error: "Failed to confirm split" };
  }
}

export async function updateSplitAction(splitId: string, percentage: number) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  try {
    // Verify split exists and user has permission
    const split = await prisma.songSplit.findFirst({
      where: {
        id: splitId,
        song: {
          project: {
            org: {
              memberships: {
                some: {
                  userId: session.user.id,
                  role: { in: ['owner', 'admin'] }
                }
              }
            }
          }
        }
      },
      include: {
        song: {
          include: {
            splits: true
          }
        }
      }
    });

    if (!split) {
      return { success: false as const, error: "Split not found or access denied" };
    }

    // Calculate new total
    const otherSplits = split.song.splits.filter(s => s.id !== splitId);
    const newTotal = otherSplits.reduce((sum, s) => sum + s.percentage, 0) + percentage;

    if (newTotal > 100) {
      return { success: false as const, error: "Total percentage would exceed 100%" };
    }

    // Update the split
    await prisma.songSplit.update({
      where: { id: splitId },
      data: { 
        percentage,
        confirmed: false // Reset confirmation when percentage changes
      }
    });

    revalidatePath('/splits');
    return { success: true as const };
  } catch (error) {
    console.error('Error updating split:', error);
    return { success: false as const, error: "Failed to update split" };
  }
}

export async function deleteSplitAction(splitId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  try {
    // Verify split exists and user has permission
    const split = await prisma.songSplit.findFirst({
      where: {
        id: splitId,
        song: {
          project: {
            org: {
              memberships: {
                some: {
                  userId: session.user.id,
                  role: { in: ['owner', 'admin'] }
                }
              }
            }
          }
        }
      }
    });

    if (!split) {
      return { success: false as const, error: "Split not found or access denied" };
    }

    // Delete the split
    await prisma.songSplit.delete({
      where: { id: splitId }
    });

    revalidatePath('/splits');
    return { success: true as const };
  } catch (error) {
    console.error('Error deleting split:', error);
    return { success: false as const, error: "Failed to delete split" };
  }
}
