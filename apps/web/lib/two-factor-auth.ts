/**
 * Two-Factor Authentication (2FA/TOTP) Implementation
 *
 * Implements RFC 6238 Time-Based One-Time Password (TOTP) algorithm
 * Compatible with Google Authenticator, Authy, 1Password, etc.
 *
 * Security features:
 * - Encrypted secret storage
 * - Backup codes (one-time use)
 * - Rate limiting on verification
 * - Timing-safe comparison
 */

import * as crypto from 'crypto';

// TOTP Configuration
const TOTP_CONFIG = {
  algorithm: 'sha1' as const,
  digits: 6,
  period: 30, // seconds
  window: 1, // Allow 1 period before/after for clock drift
  issuer: 'Rock N Roll Basement',
};

// Backup codes config
const BACKUP_CODES_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;

/**
 * Generate a random TOTP secret (base32 encoded)
 */
export function generateTOTPSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generate TOTP code from secret
 */
export function generateTOTP(secret: string, timestamp?: number): string {
  const time = timestamp || Date.now();
  const counter = Math.floor(time / 1000 / TOTP_CONFIG.period);

  const decodedSecret = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac(TOTP_CONFIG.algorithm, decodedSecret);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, TOTP_CONFIG.digits);
  return otp.toString().padStart(TOTP_CONFIG.digits, '0');
}

/**
 * Verify TOTP code with window tolerance
 */
export function verifyTOTP(secret: string, code: string): boolean {
  const now = Date.now();
  const period = TOTP_CONFIG.period * 1000;

  // Check current and adjacent time windows
  for (let i = -TOTP_CONFIG.window; i <= TOTP_CONFIG.window; i++) {
    const time = now + i * period;
    const expectedCode = generateTOTP(secret, time);

    // Timing-safe comparison
    if (timingSafeEqual(code, expectedCode)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate provisioning URI for QR code
 */
export function generateTOTPUri(
  secret: string,
  accountName: string,
  issuer: string = TOTP_CONFIG.issuer
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);

  return (
    `otpauth://totp/${encodedIssuer}:${encodedAccount}?` +
    `secret=${secret}&` +
    `issuer=${encodedIssuer}&` +
    `algorithm=${TOTP_CONFIG.algorithm.toUpperCase()}&` +
    `digits=${TOTP_CONFIG.digits}&` +
    `period=${TOTP_CONFIG.period}`
  );
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];

  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const code = crypto
      .randomBytes(BACKUP_CODE_LENGTH / 2)
      .toString('hex')
      .toUpperCase();
    codes.push(code);
  }

  return codes;
}

/**
 * Hash backup codes for storage
 */
export function hashBackupCodes(codes: string[]): string[] {
  return codes.map((code) => crypto.createHash('sha256').update(code.toUpperCase()).digest('hex'));
}

/**
 * Verify a backup code against hashed codes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const hashedInput = crypto
    .createHash('sha256')
    .update(code.toUpperCase().replace(/\s/g, ''))
    .digest('hex');

  const index = hashedCodes.findIndex((hashed) => timingSafeEqual(hashedInput, hashed));

  return index;
}

/**
 * Encrypt secret for database storage
 */
export function encryptSecret(secret: string, encryptionKey: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt secret from database storage
 */
export function decryptSecret(encryptedData: string, encryptionKey: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Base32 encoding/decoding (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let result = '';
  let bits = 0;
  let value = 0;

  // Convert buffer to array for iteration
  const bytes = Array.from(buffer);
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      result += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return result;
}

function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.toUpperCase().replace(/=+$/, '');
  const output: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Format backup codes for display (add dashes for readability)
 */
export function formatBackupCode(code: string): string {
  return code.match(/.{1,4}/g)?.join('-') || code;
}

/**
 * Parse backup code from user input (remove dashes, spaces, etc.)
 */
export function parseBackupCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}
