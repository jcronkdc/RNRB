'use server';

import { prisma } from "@cronkwaters/db";
import { revalidatePath } from "next/cache";
import { setActiveOrgCookie } from "@cronkwaters/auth";
import { randomBytes } from "crypto";

interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string;
  userId: string;
}

export async function createOrganizationAction(input: CreateOrganizationInput) {
  const { name, slug, description, userId } = input;

  try {
    // Check if slug is already taken
    const existing = await prisma.org.findUnique({
      where: { slug }
    });

    if (existing) {
      return { success: false as const, error: "This URL slug is already taken" };
    }

    // Create organization
    const org = await prisma.org.create({
      data: {
        name,
        slug,
        description,
        memberships: {
          create: {
            userId,
            role: 'owner',
            status: 'active'
          }
        }
      }
    });

    // Generate invite code
    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await prisma.orgInvite.create({
      data: {
        orgId: org.id,
        code: inviteCode,
        expiresAt,
        createdById: userId,
        maxUses: 10 // Allow up to 10 people to use this code
      }
    });

    // Set as active org
    setActiveOrgCookie(org.id);

    revalidatePath('/onboarding/organization');
    revalidatePath('/projects');
    
    return { 
      success: true as const, 
      orgId: org.id,
      inviteCode
    };
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false as const, error: "Failed to create organization" };
  }
}

export async function joinOrganizationAction(inviteCode: string, userId: string) {
  try {
    // Find valid invite
    const invite = await prisma.orgInvite.findFirst({
      where: {
        code: inviteCode.toUpperCase(),
        expiresAt: {
          gt: new Date()
        },
        OR: [
          { maxUses: null },
          { uses: { lt: prisma.orgInvite.fields.maxUses } }
        ]
      },
      include: {
        org: true
      }
    });

    if (!invite) {
      return { success: false as const, error: "Invalid or expired invite code" };
    }

    // Check if already a member
    const existingMembership = await prisma.membership.findFirst({
      where: {
        userId,
        orgId: invite.orgId
      }
    });

    if (existingMembership) {
      // Already a member, just set as active
      setActiveOrgCookie(invite.orgId);
      return { success: true as const };
    }

    // Create membership
    await prisma.$transaction(async (tx) => {
      // Create membership
      await tx.membership.create({
        data: {
          userId,
          orgId: invite.orgId,
          role: 'member',
          status: 'active'
        }
      });

      // Increment invite usage
      await tx.orgInvite.update({
        where: { id: invite.id },
        data: { uses: { increment: 1 } }
      });
    });

    // Set as active org
    setActiveOrgCookie(invite.orgId);

    revalidatePath('/onboarding/organization');
    revalidatePath('/projects');
    
    return { success: true as const };
  } catch (error) {
    console.error('Error joining organization:', error);
    return { success: false as const, error: "Failed to join organization" };
  }
}

function generateInviteCode(): string {
  // Generate a random 8-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const bytes = randomBytes(8);
  
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i]! % chars.length];
  }
  
  return code;
}
