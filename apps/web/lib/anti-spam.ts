// Anti-Spam Utilities for Guest Posting
import { headers } from 'next/headers';

// Disposable email domains to block
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'throwaway.email',
  'getnada.com',
  'temp-mail.org',
  'fakeinbox.com',
  'trashmail.com',
  'yopmail.com',
];

// Spam keywords (case-insensitive)
const SPAM_KEYWORDS = [
  /\bcrypto\b/i,
  /\bbitcoin\b/i,
  /\bviagra\b/i,
  /\bforex\b/i,
  /work from home/i,
  /make money fast/i,
  /click here now/i,
  /limited time offer/i,
  /congratulations/i,
  /\bcasino\b/i,
  /\bsex\b/i,
  /\bporn\b/i,
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = {
  tooManyLinks: (text: string) => (text.match(/https?:\/\//g) || []).length > 3,
  mostlyUppercase: (text: string) => {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    const uppercase = text.replace(/[^A-Z]/g, '');
    return letters.length > 10 && uppercase.length / letters.length > 0.7;
  },
  repeatedChars: (text: string) => /(.)\1{6,}/.test(text),
  tooShort: (text: string) => text.trim().length < 20,
  noSpaces: (text: string) => text.length > 50 && !text.includes(' '),
};

interface SpamCheckResult {
  isSpam: boolean;
  score: number; // 0-100 (higher = more likely spam)
  reasons: string[];
}

/**
 * Check if email is from a disposable domain
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

/**
 * Check content for spam indicators
 */
export function checkContentForSpam(title: string, description?: string): SpamCheckResult {
  const content = `${title} ${description || ''}`;
  const reasons: string[] = [];
  let score = 0;

  // Check for spam keywords
  SPAM_KEYWORDS.forEach((pattern) => {
    if (pattern.test(content)) {
      score += 30;
      reasons.push(`Contains spam keyword: ${pattern.source}`);
    }
  });

  // Check suspicious patterns
  if (SUSPICIOUS_PATTERNS.tooManyLinks(content)) {
    score += 20;
    reasons.push('Too many links');
  }

  if (SUSPICIOUS_PATTERNS.mostlyUppercase(content)) {
    score += 15;
    reasons.push('Excessive uppercase');
  }

  if (SUSPICIOUS_PATTERNS.repeatedChars(content)) {
    score += 15;
    reasons.push('Repeated characters');
  }

  if (SUSPICIOUS_PATTERNS.tooShort(title)) {
    score += 10;
    reasons.push('Title too short');
  }

  if (SUSPICIOUS_PATTERNS.noSpaces(content)) {
    score += 10;
    reasons.push('No spaces in long text');
  }

  // Check for only HTTP links (require HTTPS)
  if (content.match(/http:\/\//g)) {
    score += 10;
    reasons.push('Contains insecure HTTP links');
  }

  return {
    isSpam: score >= 40, // Threshold for auto-rejection
    score,
    reasons,
  };
}

/**
 * Get client IP address
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const real = headersList.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }

  return 'unknown';
}

/**
 * Get user agent
 */
export async function getUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get('user-agent') || 'unknown';
}

/**
 * Validate honeypot field (should be empty)
 */
export function validateHoneypot(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Validate form submission timing (should take >5 seconds)
 */
export function validateTiming(formOpenedAt: number): boolean {
  const submitTime = Date.now() - formOpenedAt;
  return submitTime >= 5000; // 5 seconds minimum
}

/**
 * Calculate trust score for guest poster
 */
export function calculateTrustScore(guestPoster: {
  approvedPosts: number;
  rejectedPosts: number;
  spamReports: number;
  completedGigs: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  firstSeenAt: Date;
}): number {
  let score = 0;

  // Positive factors
  score += guestPoster.approvedPosts * 10;
  score += guestPoster.completedGigs * 20;
  score += guestPoster.emailVerified ? 30 : 0;
  score += guestPoster.phoneVerified ? 30 : 0;

  // Account age bonus (1 point per day, max 90)
  const daysOld = Math.floor(
    (Date.now() - guestPoster.firstSeenAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  score += Math.min(daysOld, 90);

  // Negative factors
  score -= guestPoster.rejectedPosts * 20;
  score -= guestPoster.spamReports * 50;

  return Math.max(0, score); // Never go negative
}

/**
 * Determine if guest poster is trusted (auto-approve)
 */
export function isTrustedPoster(trustScore: number, approvedPosts: number): boolean {
  return trustScore >= 100 && approvedPosts >= 1;
}

/**
 * Rate limiting thresholds
 */
export const RATE_LIMITS = {
  PER_HOUR_BY_IP: 3,
  PER_DAY_BY_EMAIL: 5,
  PER_HOUR_BY_EMAIL: 2,
} as const;
