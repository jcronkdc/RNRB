/**
 * Spam Protection Utility for Messaging
 *
 * Features:
 * - Rate limiting per user (messages per minute/hour)
 * - Duplicate content detection
 * - Spam content filtering
 * - User blocking system
 * - Connection requirements (must be friends/following to message)
 * - Cooldown between messages to same recipient
 */

import { prisma } from '@cronkwaters/db';

// In-memory rate limit store (use Redis in production for multi-instance)
const messageLimits = new Map<
  string,
  { count: number; firstMessageAt: number; lastMessageAt: number }
>();
const recentMessages = new Map<string, { content: string; sentAt: number }[]>();
const blockedUsers = new Map<string, Set<string>>(); // userId -> Set of blocked userIds

// Rate limit configurations
const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: 10, // Max 10 messages per minute
  MESSAGES_PER_HOUR: 100, // Max 100 messages per hour
  MESSAGES_PER_DAY: 500, // Max 500 messages per day
  COOLDOWN_SAME_RECIPIENT_MS: 5000, // 5 seconds between messages to same person
  DUPLICATE_WINDOW_MS: 60000, // 1 minute window to check for duplicates
  MAX_MESSAGE_LENGTH: 5000, // Max message length
  MIN_MESSAGE_LENGTH: 1, // Min message length
};

// Spam keywords and patterns
const SPAM_PATTERNS = [
  /\b(buy now|free money|click here|act now|limited time)\b/i,
  /\b(viagra|crypto|nft|invest now|make \$\d+)\b/i,
  /(\b\w+\b)(\s+\1){4,}/i, // Repeated words (5+ times)
  /(.)\1{9,}/i, // Repeated characters (10+ times)
  /(https?:\/\/[^\s]+){3,}/i, // Multiple URLs (3+)
];

// Suspicious patterns that increase spam score
const SUSPICIOUS_PATTERNS = [
  /[A-Z]{10,}/g, // Long sequences of caps
  /!{3,}/g, // Multiple exclamation marks
  /\${1,}\d+/g, // Dollar amounts
];

interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
  spamScore: number;
}

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfterMs?: number;
}

interface RateLimitReservation {
  allowed: boolean;
  reason?: string;
  retryAfterMs?: number;
  /** Call this to release the reservation if the operation fails (e.g., DB write fails) */
  release: () => void;
}

/**
 * Check if a message is spam
 */
export function checkMessageForSpam(content: string): SpamCheckResult {
  let spamScore = 0;
  const reasons: string[] = [];

  // Check message length
  if (content.length > RATE_LIMITS.MAX_MESSAGE_LENGTH) {
    return { isSpam: true, reason: 'Message too long', spamScore: 100 };
  }

  if (content.trim().length < RATE_LIMITS.MIN_MESSAGE_LENGTH) {
    return { isSpam: true, reason: 'Message too short', spamScore: 100 };
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      spamScore += 50;
      reasons.push('Contains spam patterns');
      break;
    }
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      spamScore += 10 * matches.length;
      reasons.push('Suspicious content patterns');
    }
  }

  // Check for excessive links
  const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 2) {
    spamScore += 15 * (urlCount - 2);
    reasons.push('Too many links');
  }

  // Check for all caps (excluding short messages)
  if (content.length > 20) {
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.7) {
      spamScore += 20;
      reasons.push('Excessive caps');
    }
  }

  return {
    isSpam: spamScore >= 50,
    reason: reasons.length > 0 ? reasons.join(', ') : undefined,
    spamScore,
  };
}

/**
 * Check rate limits for a user
 */
export function checkRateLimits(userId: string, recipientId?: string): RateLimitResult {
  const now = Date.now();
  const userKey = `msg:${userId}`;
  const recipientKey = recipientId ? `msg:${userId}:${recipientId}` : null;

  // Check cooldown to same recipient
  if (recipientKey) {
    const lastToRecipient = messageLimits.get(recipientKey);
    if (lastToRecipient) {
      const timeSinceLast = now - lastToRecipient.lastMessageAt;
      if (timeSinceLast < RATE_LIMITS.COOLDOWN_SAME_RECIPIENT_MS) {
        return {
          allowed: false,
          reason: 'Please wait before sending another message to this person',
          retryAfterMs: RATE_LIMITS.COOLDOWN_SAME_RECIPIENT_MS - timeSinceLast,
        };
      }
    }
  }

  // Check per-minute rate limit
  let userLimit = messageLimits.get(userKey);

  if (!userLimit) {
    userLimit = { count: 0, firstMessageAt: now, lastMessageAt: now };
    messageLimits.set(userKey, userLimit);
  }

  // Reset if over a minute
  if (now - userLimit.firstMessageAt > 60000) {
    userLimit.count = 0;
    userLimit.firstMessageAt = now;
  }

  if (userLimit.count >= RATE_LIMITS.MESSAGES_PER_MINUTE) {
    return {
      allowed: false,
      reason: 'Too many messages. Please slow down.',
      retryAfterMs: 60000 - (now - userLimit.firstMessageAt),
    };
  }

  return { allowed: true };
}

/**
 * Record a sent message for rate limiting
 */
export function recordMessage(userId: string, recipientId?: string, content?: string): void {
  const now = Date.now();
  const userKey = `msg:${userId}`;

  // Update user rate limit
  let userLimit = messageLimits.get(userKey);
  if (!userLimit) {
    userLimit = { count: 0, firstMessageAt: now, lastMessageAt: now };
  }
  userLimit.count++;
  userLimit.lastMessageAt = now;
  messageLimits.set(userKey, userLimit);

  // Update recipient cooldown
  if (recipientId) {
    const recipientKey = `msg:${userId}:${recipientId}`;
    messageLimits.set(recipientKey, { count: 1, firstMessageAt: now, lastMessageAt: now });
  }

  // Store recent message for duplicate detection
  if (content) {
    const recentKey = `recent:${userId}`;
    let recent = recentMessages.get(recentKey) || [];

    // Remove old messages outside window
    recent = recent.filter((m) => now - m.sentAt < RATE_LIMITS.DUPLICATE_WINDOW_MS);

    // Add new message
    recent.push({ content, sentAt: now });
    recentMessages.set(recentKey, recent);
  }
}

/**
 * Check for duplicate messages
 */
export function checkDuplicateMessage(userId: string, content: string): boolean {
  const recentKey = `recent:${userId}`;
  const recent = recentMessages.get(recentKey) || [];
  const now = Date.now();

  // Check for exact duplicates in the window
  const duplicateCount = recent.filter(
    (m) => m.content === content && now - m.sentAt < RATE_LIMITS.DUPLICATE_WINDOW_MS
  ).length;

  return duplicateCount >= 2; // Allow 1 repeat, block on 3rd
}

/**
 * Message delivery type - determines where the message goes
 */
export type MessageDeliveryType = 'direct' | 'request' | 'blocked';

/**
 * Check if a user can message another user and where the message should go
 */
export async function canUserMessage(
  senderId: string,
  recipientId: string
): Promise<{ allowed: boolean; deliveryType: MessageDeliveryType; reason?: string }> {
  // Check if blocked
  const senderBlocked = blockedUsers.get(recipientId);
  if (senderBlocked?.has(senderId)) {
    return { allowed: false, deliveryType: 'blocked', reason: 'You cannot message this user' };
  }

  // Also check database for blocks
  try {
    const block = await prisma.userBlock.findFirst({
      where: {
        blockerId: recipientId,
        blockedId: senderId,
      },
    });
    if (block) {
      // Cache it
      let blocked = blockedUsers.get(recipientId);
      if (!blocked) {
        blocked = new Set();
        blockedUsers.set(recipientId, blocked);
      }
      blocked.add(senderId);
      return { allowed: false, deliveryType: 'blocked', reason: 'You cannot message this user' };
    }
  } catch {
    // UserBlock model might not exist
  }

  // Check connection status
  try {
    // Check if they follow each other (mutual = friends) or have any connection
    const [senderFollowsRecipient, recipientFollowsSender] = await Promise.all([
      prisma.userFollow.findFirst({
        where: { followerId: senderId, followingId: recipientId },
      }),
      prisma.userFollow.findFirst({
        where: { followerId: recipientId, followingId: senderId },
      }),
    ]);

    const isFriends = senderFollowsRecipient && recipientFollowsSender;
    const isConnected = senderFollowsRecipient || recipientFollowsSender;

    if (isFriends) {
      // Friends can message directly
      return { allowed: true, deliveryType: 'direct' };
    } else if (isConnected) {
      // One-way follow: goes to direct inbox but could be marked
      return { allowed: true, deliveryType: 'direct' };
    } else {
      // No connection: goes to Message Requests
      return { allowed: true, deliveryType: 'request' };
    }
  } catch (error) {
    console.error('Error checking message permissions:', error);
    // Default to request for safety
    return { allowed: true, deliveryType: 'request' };
  }
}

/**
 * Check if a conversation is a message request (from non-friend)
 */
export async function isMessageRequest(userId: string, otherUserId: string): Promise<boolean> {
  try {
    const [userFollowsOther, otherFollowsUser] = await Promise.all([
      prisma.userFollow.findFirst({
        where: { followerId: userId, followingId: otherUserId },
      }),
      prisma.userFollow.findFirst({
        where: { followerId: otherUserId, followingId: userId },
      }),
    ]);

    // It's a request if there's no mutual connection
    return !userFollowsOther && !otherFollowsUser;
  } catch {
    return false;
  }
}

/**
 * Block a user
 */
export async function blockUser(userId: string, blockedUserId: string): Promise<void> {
  let blocked = blockedUsers.get(userId);
  if (!blocked) {
    blocked = new Set();
    blockedUsers.set(userId, blocked);
  }
  blocked.add(blockedUserId);

  // Also save to database for persistence
  try {
    await prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: blockedUserId,
        },
      },
      create: {
        blockerId: userId,
        blockedId: blockedUserId,
      },
      update: {},
    });
  } catch (error) {
    // UserBlock model might not exist yet, log and continue with in-memory
    console.warn('Could not persist user block:', error);
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(userId: string, blockedUserId: string): Promise<void> {
  const blocked = blockedUsers.get(userId);
  if (blocked) {
    blocked.delete(blockedUserId);
  }

  try {
    await prisma.userBlock.delete({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: blockedUserId,
        },
      },
    });
  } catch {
    // Ignore if not found
  }
}

/**
 * Load blocked users from database
 */
export async function loadBlockedUsers(userId: string): Promise<Set<string>> {
  try {
    const blocks = await prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });

    const blocked = new Set(blocks.map((b) => b.blockedId));
    blockedUsers.set(userId, blocked);
    return blocked;
  } catch {
    return new Set();
  }
}

/**
 * Comprehensive spam check - combines all checks
 * Returns delivery type to determine if message goes to inbox or requests
 */
export async function validateMessage(
  senderId: string,
  recipientId: string,
  content: string
): Promise<{ valid: boolean; error?: string; deliveryType?: MessageDeliveryType }> {
  // 1. Check rate limits
  const rateLimit = checkRateLimits(senderId, recipientId);
  if (!rateLimit.allowed) {
    return { valid: false, error: rateLimit.reason };
  }

  // 2. Check for spam content
  const spamCheck = checkMessageForSpam(content);
  if (spamCheck.isSpam) {
    return { valid: false, error: 'Message flagged as spam' };
  }

  // 3. Check for duplicates
  if (checkDuplicateMessage(senderId, content)) {
    return { valid: false, error: 'Please avoid sending duplicate messages' };
  }

  // 4. Check if user can message recipient and get delivery type
  const canMessage = await canUserMessage(senderId, recipientId);
  if (!canMessage.allowed) {
    return { valid: false, error: canMessage.reason };
  }

  // NOTE: Do NOT call recordMessage here - it's called in the route handler
  // AFTER successful database write to prevent counting failed messages

  return { valid: true, deliveryType: canMessage.deliveryType };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const hourAgo = now - 3600000;

  for (const [key, value] of messageLimits.entries()) {
    if (value.lastMessageAt < hourAgo) {
      messageLimits.delete(key);
    }
  }

  for (const [key, messages] of recentMessages.entries()) {
    const filtered = messages.filter((m) => now - m.sentAt < RATE_LIMITS.DUPLICATE_WINDOW_MS);
    if (filtered.length === 0) {
      recentMessages.delete(key);
    } else {
      recentMessages.set(key, filtered);
    }
  }
}, 300000); // Clean every 5 minutes
