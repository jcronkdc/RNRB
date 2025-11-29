/**
 * Security Utilities Tests
 *
 * Integration tests for security.ts utilities.
 * These tests import the actual code modules to verify functionality
 * and contribute to coverage metrics.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  validateId,
  validateCursor,
  validateLimit,
  validateOffset,
  sanitizeSearchQuery,
  validateEmail,
  sanitizeContent,
  validateUrl,
  validateVisibility,
  validateContentType,
  checkRateLimit,
  rateLimitUser,
  rateLimitIp,
  getClientIp,
  escapeSql,
  validateIdArray,
} from '../security';

describe('Security Utilities', () => {
  describe('validateId', () => {
    it('should return null for null/undefined', () => {
      expect(validateId(null)).toBeNull();
      expect(validateId(undefined)).toBeNull();
    });

    it('should accept valid CUID format', () => {
      // CUID: c + 24 lowercase alphanumeric chars = 25 total
      const validCuid = 'cm4a0b1c2d3e4f5g6h7i8j9kl';
      expect(validateId(validCuid)).toBe(validCuid);
    });

    it('should accept valid UUID format', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(validateId(validUuid)).toBe(validUuid);
    });

    it('should reject invalid ID formats', () => {
      expect(validateId('invalid')).toBeNull();
      expect(validateId('12345')).toBeNull();
      expect(validateId('<script>alert(1)</script>')).toBeNull();
      expect(validateId("'; DROP TABLE users;--")).toBeNull();
    });

    it('should reject CUIDs with wrong prefix', () => {
      expect(validateId('am4a0b1c2d3e4f5g6h7i8j9kl')).toBeNull();
      expect(validateId('Cm4a0b1c2d3e4f5g6h7i8j9kl')).toBeNull();
    });

    it('should reject CUIDs with wrong length', () => {
      expect(validateId('cm4a0')).toBeNull();
      expect(validateId('cm4a0b1c2d3e4f5g6h7i8j9klm')).toBeNull(); // 27 chars
    });
  });

  describe('validateCursor', () => {
    it('should delegate to validateId', () => {
      const validCuid = 'cm4a0b1c2d3e4f5g6h7i8j9kl';
      expect(validateCursor(validCuid)).toBe(validCuid);
      expect(validateCursor(null)).toBeNull();
      expect(validateCursor('invalid')).toBeNull();
    });
  });

  describe('validateLimit', () => {
    it('should return default for null/undefined', () => {
      expect(validateLimit(null)).toBe(20);
      expect(validateLimit(undefined)).toBe(20);
    });

    it('should parse valid numeric strings', () => {
      expect(validateLimit('10')).toBe(10);
      expect(validateLimit('50')).toBe(50);
    });

    it('should clamp to max value', () => {
      expect(validateLimit('200')).toBe(100); // default max is 100
      expect(validateLimit('50', 30)).toBe(30);
    });

    it('should return default for invalid values', () => {
      expect(validateLimit('abc')).toBe(20);
      expect(validateLimit('-5')).toBe(20);
      expect(validateLimit('0')).toBe(20);
    });

    it('should use custom default value', () => {
      expect(validateLimit(null, 100, 50)).toBe(50);
    });
  });

  describe('validateOffset', () => {
    it('should return 0 for null/undefined', () => {
      expect(validateOffset(null)).toBe(0);
      expect(validateOffset(undefined)).toBe(0);
    });

    it('should parse valid numeric strings', () => {
      expect(validateOffset('100')).toBe(100);
      expect(validateOffset('0')).toBe(0);
    });

    it('should clamp to max value', () => {
      expect(validateOffset('20000')).toBe(10000); // default max
      expect(validateOffset('500', 200)).toBe(200);
    });

    it('should return 0 for invalid values', () => {
      expect(validateOffset('abc')).toBe(0);
      expect(validateOffset('-5')).toBe(0);
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitizeSearchQuery(null)).toBe('');
      expect(sanitizeSearchQuery(undefined)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeSearchQuery('  hello  ')).toBe('hello');
    });

    it('should remove SQL injection patterns', () => {
      expect(sanitizeSearchQuery("'; DROP TABLE users;--")).not.toContain("'");
      expect(sanitizeSearchQuery("'; DROP TABLE users;--")).not.toContain(';');
      expect(sanitizeSearchQuery('/*comment*/')).not.toContain('/*');
    });

    it('should remove HTML/XSS patterns', () => {
      expect(sanitizeSearchQuery('<script>alert(1)</script>')).not.toContain('<');
      expect(sanitizeSearchQuery('<script>alert(1)</script>')).not.toContain('>');
      expect(sanitizeSearchQuery('onclick=alert(1)')).not.toContain('onclick=');
    });

    it('should truncate to max length', () => {
      const longString = 'a'.repeat(300);
      expect(sanitizeSearchQuery(longString).length).toBeLessThanOrEqual(200);
    });
  });

  describe('validateEmail', () => {
    it('should return null for null/undefined', () => {
      expect(validateEmail(null)).toBeNull();
      expect(validateEmail(undefined)).toBeNull();
    });

    it('should accept valid email formats', () => {
      expect(validateEmail('user@example.com')).toBe('user@example.com');
      expect(validateEmail('User@Example.Com')).toBe('user@example.com'); // lowercase
      expect(validateEmail('user+test@example.com')).toBe('user+test@example.com');
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBeNull();
      expect(validateEmail('user@')).toBeNull();
      expect(validateEmail('@example.com')).toBeNull();
      expect(validateEmail('user@.com')).toBeNull();
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBeNull();
    });
  });

  describe('sanitizeContent', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitizeContent(null)).toBe('');
      expect(sanitizeContent(undefined)).toBe('');
    });

    it('should escape HTML tags', () => {
      expect(sanitizeContent('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;/script&gt;'
      );
      expect(sanitizeContent('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
    });

    it('should remove null bytes', () => {
      expect(sanitizeContent('hello\x00world')).toBe('helloworld');
    });

    it('should truncate to max length', () => {
      const longContent = 'a'.repeat(20000);
      expect(sanitizeContent(longContent).length).toBeLessThanOrEqual(10000);
    });

    it('should trim whitespace', () => {
      expect(sanitizeContent('  hello world  ')).toBe('hello world');
    });
  });

  describe('validateUrl', () => {
    it('should return null for null/undefined', () => {
      expect(validateUrl(null)).toBeNull();
      expect(validateUrl(undefined)).toBeNull();
    });

    it('should accept valid HTTP/HTTPS URLs', () => {
      expect(validateUrl('http://example.com')).toBe('http://example.com/');
      expect(validateUrl('https://example.com')).toBe('https://example.com/');
      expect(validateUrl('https://example.com/path?query=1')).toBe(
        'https://example.com/path?query=1'
      );
    });

    it('should reject non-HTTP protocols', () => {
      expect(validateUrl('javascript:alert(1)')).toBeNull();
      expect(validateUrl('ftp://example.com')).toBeNull();
      expect(validateUrl('file:///etc/passwd')).toBeNull();
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not a url')).toBeNull();
      expect(validateUrl('example.com')).toBeNull(); // no protocol
    });
  });

  describe('validateVisibility', () => {
    it('should accept valid visibility values', () => {
      expect(validateVisibility('public')).toBe('public');
      expect(validateVisibility('friends')).toBe('friends');
      expect(validateVisibility('private')).toBe('private');
    });

    it('should return "public" for invalid values', () => {
      expect(validateVisibility(null)).toBe('public');
      expect(validateVisibility(undefined)).toBe('public');
      expect(validateVisibility('invalid')).toBe('public');
    });
  });

  describe('validateContentType', () => {
    it('should accept valid content types', () => {
      expect(validateContentType('text')).toBe('text');
      expect(validateContentType('audio')).toBe('audio');
      expect(validateContentType('image')).toBe('image');
      expect(validateContentType('video')).toBe('video');
      expect(validateContentType('link')).toBe('link');
    });

    it('should return "text" for invalid values', () => {
      expect(validateContentType(null)).toBe('text');
      expect(validateContentType(undefined)).toBe('text');
      expect(validateContentType('invalid')).toBe('text');
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Clear the rate limit store between tests by waiting or using unique keys
    });

    it('should allow requests within limit', () => {
      const key = `test-${Date.now()}-${Math.random()}`;
      const result = checkRateLimit(key, 5, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests over limit', () => {
      const key = `test-block-${Date.now()}-${Math.random()}`;

      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5, 60000);
      }

      // Next request should be blocked
      const result = checkRateLimit(key, 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const key = `test-reset-${Date.now()}-${Math.random()}`;

      // Make a request with very short window
      const result1 = checkRateLimit(key, 5, 10);
      expect(result1.allowed).toBe(true);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Should be reset
      const result2 = checkRateLimit(key, 5, 10);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(4);
    });
  });

  describe('rateLimitUser', () => {
    it('should create unique key per user and action', () => {
      const userId = `user-${Date.now()}-${Math.random()}`;

      const allowed = rateLimitUser(userId, 'test-action', 100);
      expect(allowed).toBe(true);
    });
  });

  describe('rateLimitIp', () => {
    it('should create unique key per IP and action', () => {
      const ip = `127.0.0.${Date.now() % 255}`;

      const allowed = rateLimitIp(ip, 'test-action', 50);
      expect(allowed).toBe(true);
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      expect(getClientIp(request)).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      });

      expect(getClientIp(request)).toBe('192.168.1.2');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
        },
      });

      expect(getClientIp(request)).toBe('192.168.1.1');
    });

    it('should return "unknown" when no IP headers present', () => {
      const request = new Request('http://localhost');
      expect(getClientIp(request)).toBe('unknown');
    });
  });

  describe('escapeSql', () => {
    it('should escape single quotes', () => {
      expect(escapeSql("O'Reilly")).toBe("O''Reilly");
      expect(escapeSql("'; DROP TABLE--")).toBe("''; DROP TABLE--");
    });

    it('should handle strings without quotes', () => {
      expect(escapeSql('hello world')).toBe('hello world');
    });
  });

  describe('validateIdArray', () => {
    it('should filter valid IDs', () => {
      const validCuid1 = 'cm4a0b1c2d3e4f5g6h7i8j9kl';
      const validCuid2 = 'cn5b1c2d3e4f5g6h7i8j9k0lm';
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const result = validateIdArray([validCuid1, 'invalid', validCuid2, '<script>', validUuid]);

      expect(result).toHaveLength(3);
      expect(result).toContain(validCuid1);
      expect(result).toContain(validCuid2);
      expect(result).toContain(validUuid);
    });

    it('should return empty array for all invalid IDs', () => {
      const result = validateIdArray(['invalid', 'also-invalid', '12345']);
      expect(result).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const result = validateIdArray([]);
      expect(result).toHaveLength(0);
    });
  });
});
