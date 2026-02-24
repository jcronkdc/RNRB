/**
 * SOCIAL UTILITIES
 *
 * Shared helpers for social features: block-checking, relationship queries,
 * and privacy enforcement. All social API routes should use these.
 */

import { prisma } from '@cronkwaters/db';

/**
 * Get the set of user IDs that the given user has blocked OR is blocked by.
 * Used to filter social queries bidirectionally — if either party blocked the other,
 * they should not appear in each other's social results.
 */
export async function getBlockedUserIds(userId: string): Promise<Set<string>> {
  const [blockedByMe, blockedMe] = await Promise.all([
    prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    }),
    prisma.userBlock.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    }),
  ]);

  const ids = new Set<string>();
  blockedByMe.forEach((b) => ids.add(b.blockedId));
  blockedMe.forEach((b) => ids.add(b.blockerId));
  return ids;
}

/**
 * Check if a specific user pair has a block relationship (either direction).
 */
export async function isBlocked(userA: string, userB: string): Promise<boolean> {
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
  });
  return !!block;
}

/**
 * Build a Prisma `NOT` filter clause to exclude blocked users from queries.
 * Returns a condition suitable for use in `where` clauses on user ID fields.
 */
export function excludeBlockedFilter(blockedIds: Set<string>): string[] {
  return Array.from(blockedIds);
}

/**
 * Check if the current user is allowed to interact with a target user.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export async function canInteractWith(
  currentUserId: string,
  targetUserId: string
): Promise<{ allowed: boolean; reason?: string }> {
  if (currentUserId === targetUserId) {
    return { allowed: false, reason: 'Cannot interact with yourself' };
  }

  const blocked = await isBlocked(currentUserId, targetUserId);
  if (blocked) {
    return { allowed: false, reason: 'User not found' }; // Intentionally vague for privacy
  }

  return { allowed: true };
}

/**
 * Get mutual friend count between two users.
 * A "friend" is a mutual follow (A follows B AND B follows A).
 */
export async function getMutualFriendCount(userA: string, userB: string): Promise<number> {
  const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM (
      SELECT f1."followingId" as friend_id
      FROM "UserFollow" f1
      INNER JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
      WHERE f1."followerId" = ${userA}
      INTERSECT
      SELECT f1."followingId" as friend_id
      FROM "UserFollow" f1
      INNER JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
      WHERE f1."followerId" = ${userB}
    ) mutual
  `;
  return Number(result[0]?.count || 0);
}

/**
 * Check if two users are friends (mutual follow).
 */
export async function areFriends(userA: string, userB: string): Promise<boolean> {
  const [aFollowsB, bFollowsA] = await Promise.all([
    prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId: userA, followingId: userB } },
    }),
    prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId: userB, followingId: userA } },
    }),
  ]);
  return !!(aFollowsB && bFollowsA);
}
