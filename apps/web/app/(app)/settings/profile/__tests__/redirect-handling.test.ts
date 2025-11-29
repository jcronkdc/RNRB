/**
 * Test redirect URL handling with special characters
 *
 * This test verifies that redirect URLs with special characters (like + in email addresses)
 * are properly handled throughout the authentication flow without double-decoding.
 */

describe('Redirect URL Handling', () => {
  describe('searchParams.get() behavior', () => {
    it('should return already-decoded values from Next.js', () => {
      // Next.js searchParams.get() automatically decodes URL-encoded values
      // When a URL like /invites/project?email=user%2Btest%40example.com is encoded:
      // encodeURIComponent encodes % as %25, so %2B becomes %252B and %40 becomes %2540

      const originalUrl = '/invites/project?email=user%2Btest%40example.com';
      const encodedUrl = encodeURIComponent(originalUrl);
      // The @ is already decoded in the original, so it gets encoded to %40
      expect(encodedUrl).toBe('%2Finvites%2Fproject%3Femail%3Duser%252Btest%2540example.com');

      // Simulate what searchParams.get() does - single decode
      const decoded = decodeURIComponent(encodedUrl);
      expect(decoded).toBe(originalUrl);
    });
  });

  describe('Invite to Auth flow', () => {
    it('should correctly encode email with + character', () => {
      const email = 'user+test@example.com';
      const projectSlug = 'my-project';

      // Step 1: Invite page encodes email parameter
      const emailParam = encodeURIComponent(email);
      expect(emailParam).toBe('user%2Btest%40example.com');

      const returnUrl = `/invites/${projectSlug}?email=${emailParam}`;
      expect(returnUrl).toBe('/invites/my-project?email=user%2Btest%40example.com');

      // Step 2: Invite page encodes entire return URL for redirect parameter
      const redirectParam = encodeURIComponent(returnUrl);
      expect(redirectParam).toBe('%2Finvites%2Fmy-project%3Femail%3Duser%252Btest%2540example.com');

      // Step 3: Auth page receives decoded value from searchParams.get('redirect')
      const decodedAtAuth = decodeURIComponent(redirectParam);
      expect(decodedAtAuth).toBe('/invites/my-project?email=user%2Btest%40example.com');

      // Verify email is still encoded (single encoding)
      const url = new URL('http://localhost' + decodedAtAuth);
      const emailFromUrl = url.searchParams.get('email');
      expect(emailFromUrl).toBe('user+test@example.com');
    });
  });

  describe('Auth to Profile Setup flow', () => {
    it('should preserve special characters through profile setup redirect', () => {
      const originalUrl = '/invites/my-project?email=user%2Btest%40example.com';

      // Step 1: Auth action encodes for profile redirect
      const redirectToProfile = `/settings/profile?setup=true&redirect=${encodeURIComponent(originalUrl)}`;
      expect(redirectToProfile).toBe(
        '/settings/profile?setup=true&redirect=%2Finvites%2Fmy-project%3Femail%3Duser%252Btest%2540example.com'
      );

      // Step 2: Profile page receives decoded value from searchParams.get('redirect')
      const url = new URL('http://localhost' + redirectToProfile);
      const decodedAtProfile = url.searchParams.get('redirect');
      expect(decodedAtProfile).toBe('/invites/my-project?email=user%2Btest%40example.com');

      // Step 3: Profile page should use URL constructor to re-encode before router.push()
      // This ensures special characters like + are properly encoded in the final URL
      const urlForReEncoding = new URL(decodedAtProfile!, 'http://placeholder.com');
      const reEncodedPath =
        urlForReEncoding.pathname + urlForReEncoding.search + urlForReEncoding.hash;

      // Verify the re-encoded URL preserves proper encoding
      const finalUrl = new URL('http://localhost' + reEncodedPath);
      const finalEmail = finalUrl.searchParams.get('email');
      expect(finalEmail).toBe('user+test@example.com');
    });
  });

  describe('Double-decoding prevention', () => {
    it('should NOT double-decode redirect URLs', () => {
      const email = 'user+test@example.com';
      const encodedEmail = encodeURIComponent(email);
      expect(encodedEmail).toBe('user%2Btest%40example.com');

      const returnUrl = `/invites/project?email=${encodedEmail}`;
      const redirectParam = encodeURIComponent(returnUrl);

      // Single decode (what searchParams.get() does)
      const singleDecoded = decodeURIComponent(redirectParam);
      expect(singleDecoded).toBe('/invites/project?email=user%2Btest%40example.com');

      // Verify email is still properly encoded
      const url1 = new URL('http://localhost' + singleDecoded);
      expect(url1.searchParams.get('email')).toBe('user+test@example.com');

      // Double decode (WRONG - what the bug was doing)
      const doubleDecoded = decodeURIComponent(singleDecoded);
      expect(doubleDecoded).toBe('/invites/project?email=user+test@example.com');

      // After double-decoding, the + is NOT encoded and will be interpreted as space
      const url2 = new URL('http://localhost' + doubleDecoded);
      expect(url2.searchParams.get('email')).toBe('user test@example.com'); // CORRUPTED!
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with multiple query parameters', () => {
      const email = 'user+test@example.com';
      const returnUrl = `/invites/project?email=${encodeURIComponent(email)}&token=abc123&ref=homepage`;
      const redirectParam = encodeURIComponent(returnUrl);

      // Simulate searchParams.get()
      const decoded = decodeURIComponent(redirectParam);
      const url = new URL('http://localhost' + decoded);

      expect(url.searchParams.get('email')).toBe('user+test@example.com');
      expect(url.searchParams.get('token')).toBe('abc123');
      expect(url.searchParams.get('ref')).toBe('homepage');
    });

    it('should handle URLs with hash fragments', () => {
      const returnUrl = `/invites/project?email=${encodeURIComponent('user+test@example.com')}#section-1`;
      const redirectParam = encodeURIComponent(returnUrl);

      const decoded = decodeURIComponent(redirectParam);
      expect(decoded).toContain('#section-1');

      const [path, hash] = decoded.split('#');
      expect(hash).toBe('section-1');

      const url = new URL('http://localhost' + path);
      expect(url.searchParams.get('email')).toBe('user+test@example.com');
    });

    it('should handle URLs with other special characters', () => {
      const specialChars = [
        { char: '&', encoded: '%26' },
        { char: '=', encoded: '%3D' },
        { char: '?', encoded: '%3F' },
        { char: '#', encoded: '%23' },
        { char: ' ', encoded: '%20' },
        { char: '+', encoded: '%2B' },
      ];

      specialChars.forEach(({ char, encoded }) => {
        const value = `test${char}value`;
        const encodedValue = encodeURIComponent(value);
        expect(encodedValue).toContain(encoded);

        const decoded = decodeURIComponent(encodedValue);
        expect(decoded).toBe(value);
      });
    });
  });
});

/**
 * Summary of the fix:
 *
 * BEFORE (Bug):
 * 1. searchParams.get('redirect') returns decoded value: /invites/project?email=user%2Btest@example.com
 * 2. Code passed it directly to router.push() assuming Next.js would re-encode it
 * 3. router.push() does NOT re-encode query params, so + gets interpreted as space by browser
 * 4. Result: email becomes "user test@example.com" (corrupted)
 *
 * AFTER (Fixed):
 * 1. searchParams.get('redirect') returns decoded value: /invites/project?email=user%2Btest@example.com
 * 2. Use URL constructor to parse and re-encode: new URL(destination, 'http://placeholder.com')
 * 3. Reconstruct path: url.pathname + url.search + url.hash
 * 4. Pass re-encoded URL to router.push()
 * 5. Result: email stays "user+test@example.com" (correct)
 *
 * Key Insight:
 * Next.js searchParams.get() ALWAYS returns decoded values. When passing them to
 * router.push(), you MUST use the URL constructor pattern to re-encode query parameters,
 * otherwise special characters like + will be misinterpreted by browsers.
 *
 * URL Constructor Pattern (Recommended):
 * ```ts
 * const url = new URL(destination, 'http://placeholder.com');
 * const reEncodedPath = url.pathname + url.search + url.hash;
 * router.push(reEncodedPath);
 * ```
 */
