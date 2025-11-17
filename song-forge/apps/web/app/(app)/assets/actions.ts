'use server';

import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import { randomBytes } from "crypto";

interface GenerateShareLinkInput {
  assetId: string;
  isPublic: boolean;
  expiresIn: string;
  allowDownload: boolean;
}

export async function generateShareLink(input: GenerateShareLinkInput) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const { assetId, isPublic, expiresIn, allowDownload } = input;

  try {
    // Verify user has access to the asset
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
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

    if (!asset) {
      return { success: false as const, error: "Asset not found or access denied" };
    }

    // Generate unique share token
    const shareToken = randomBytes(32).toString('hex');

    // Calculate expiration date
    let expiresAt: Date | null = null;
    if (expiresIn !== 'never') {
      expiresAt = new Date();
      switch (expiresIn) {
        case '1hour':
          expiresAt.setHours(expiresAt.getHours() + 1);
          break;
        case '1day':
          expiresAt.setDate(expiresAt.getDate() + 1);
          break;
        case '7days':
          expiresAt.setDate(expiresAt.getDate() + 7);
          break;
        case '30days':
          expiresAt.setDate(expiresAt.getDate() + 30);
          break;
      }
    }

    // Create share link record
    const shareLink = await prisma.assetShare.create({
      data: {
        assetId,
        shareCode: shareToken,
        accessType: allowDownload ? 'download' : 'view',
        expiresAt,
        createdById: session.user.id
      }
    });

    // Generate full URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/assets/${shareToken}`;

    return { 
      success: true as const, 
      shareUrl,
      shareId: shareLink.id
    };
  } catch (error) {
    console.error('Error generating share link:', error);
    return { success: false as const, error: "Failed to generate share link" };
  }
}

export async function revokeShareLink(shareId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  try {
    // Verify ownership and revoke
    const shareLink = await prisma.assetShare.findFirst({
      where: {
        id: shareId,
        createdById: session.user.id
      }
    });

    if (!shareLink) {
      return { success: false as const, error: "Share link not found" };
    }

    await prisma.assetShare.delete({
      where: { id: shareId }
    });

    return { success: true as const };
  } catch (error) {
    console.error('Error revoking share link:', error);
    return { success: false as const, error: "Failed to revoke share link" };
  }
}

export async function getAssetStats(assetId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { downloads: 0, shares: 0, views: 0 };
  }

  try {
    // Verify access
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
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

    if (!asset) {
      return { downloads: 0, shares: 0, views: 0 };
    }

    // Get share count
    const shares = await prisma.assetShare.count({
      where: { assetId }
    });

    // TODO: Implement download and view tracking
    return {
      downloads: 0,
      shares,
      views: 0
    };
  } catch (error) {
    console.error('Error getting asset stats:', error);
    return { downloads: 0, shares: 0, views: 0 };
  }
}
