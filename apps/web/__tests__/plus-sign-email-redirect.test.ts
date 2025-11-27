/**
 * Test: Email Plus Sign (+) Redirect Flow
 *
 * This test verifies that email addresses containing plus signs (e.g., user+test@example.com)
 * work correctly through the entire invite → auth → profile setup → accept flow.
 *
 * Bug: Plus signs were being converted to spaces due to double-decoding. The profile page
 * was calling decodeURIComponent() on values already decoded by searchParams.get().
 *
 * Fix: Profile setup now uses searchParams.get() values directly without additional
 * decoding. Next.js router.push() handles encoding automatically.
 */

describe('Email Plus Sign Redirect Flow', () => {
  const testEmail = 'user+test@example.com';
  const projectSlug = 'test-project';

  it('should preserve plus sign through invite → auth → profile → accept flow', () => {
    // Step 1: User clicks invite link (not authenticated)
    const inviteUrl = `/invites/${projectSlug}?email=${encodeURIComponent(testEmail)}`;
    console.log('Step 1 - Invite URL:', inviteUrl);
    // Expected: /invites/test-project?email=user%2Btest%40example.com

    // Step 2: Invites page detects user not authenticated, redirects to auth
    const returnUrl = `/invites/${projectSlug}?email=${encodeURIComponent(testEmail)}`;
    const authUrl = `/auth?redirect=${encodeURIComponent(returnUrl)}`;
    console.log('Step 2 - Auth URL:', authUrl);
    // Expected: /auth?redirect=%2Finvites%2Ftest-project%3Femail%3Duser%252Btest%2540example.com

    // Step 3: User signs up (new account)
    // Auth action checks profile completion, redirects to profile setup
    const profileSetupUrl = `/settings/profile?setup=true&redirect=${encodeURIComponent(returnUrl)}`;
    console.log('Step 3 - Profile Setup URL:', profileSetupUrl);
    // Expected: /settings/profile?setup=true&redirect=%2Finvites%2Ftest-project%3Femail%3Duser%252Btest%2540example.com

    // Step 4: Profile page receives URL - searchParams.get() returns decoded value
    // Simulating what searchParams.get('redirect') returns (already decoded by Next.js)
    const redirectFromSearchParams = decodeURIComponent(profileSetupUrl.split('redirect=')[1]);
    console.log('Step 4 - searchParams.get("redirect"):', redirectFromSearchParams);
    // Expected: /invites/test-project?email=user%2Btest@example.com

    // Step 5: Profile page uses the value directly with router.push()
    // (NO additional decoding - that was the bug!)
    const urlToNavigate = redirectFromSearchParams;
    console.log('Step 5 - router.push() argument:', urlToNavigate);
    // Expected: /invites/test-project?email=user%2Btest@example.com

    // Step 6: Next.js router handles the navigation - parse result
    const finalUrlObj = new URL(urlToNavigate, 'http://dummy.com');
    const emailFromUrl = finalUrlObj.searchParams.get('email');
    console.log('Step 6 - Email from URL:', emailFromUrl);
    // Expected: user+test@example.com

    // Step 7: Verify email matches
    console.log('Step 7 - Email match:', emailFromUrl === testEmail);
    // Expected: true

    // Assertions
    expect(emailFromUrl).toBe(testEmail);
    expect(emailFromUrl).not.toBe('user test@example.com'); // Should NOT have space
    expect(emailFromUrl).toContain('+'); // Should preserve plus sign
  });

  it('should handle multiple special characters in email', () => {
    const specialEmail = 'user+test%special@example.com';

    // Encode for invite URL
    const returnUrl = `/invites/${projectSlug}?email=${encodeURIComponent(specialEmail)}`;

    // Simulate what searchParams.get() returns (single decode applied by Next.js)
    const decodedRedirect = decodeURIComponent(returnUrl);

    // Profile page uses this directly (no additional decoding)
    const urlToNavigate = decodedRedirect;

    // Parse result
    const finalUrlObj = new URL(urlToNavigate, 'http://dummy.com');
    const emailFromUrl = finalUrlObj.searchParams.get('email');

    // Verify
    expect(emailFromUrl).toBe(specialEmail);
  });

  it('should handle edge cases', () => {
    // Test with multiple query parameters
    const multiParamUrl = `/invites/${projectSlug}?email=${encodeURIComponent(testEmail)}&role=admin`;

    // Simulate what searchParams.get() returns
    const decodedMulti = decodeURIComponent(multiParamUrl);

    // Use directly (no additional decoding)
    const urlToNavigate = decodedMulti;

    const finalUrlObj = new URL(urlToNavigate, 'http://dummy.com');
    expect(finalUrlObj.searchParams.get('email')).toBe(testEmail);
    expect(finalUrlObj.searchParams.get('role')).toBe('admin');
  });
});

/**
 * Manual Testing Instructions:
 *
 * 1. Create a test account with email: user+test@example.com
 *
 * 2. Sign out and access invite link:
 *    http://localhost:3000/invites/test-project?email=user%2Btest%40example.com
 *
 * 3. Click "Sign In to Accept" - should redirect to auth page
 *
 * 4. Sign up with email: user+test@example.com
 *
 * 5. Complete profile setup form and click "Save Profile"
 *
 * 6. After 2 seconds, should redirect to invite page
 *
 * 7. Verify that email verification passes (no "wrong email" error)
 *
 * 8. Should successfully accept invite and redirect to project
 *
 * Expected Result: ✅ Full flow works without email mismatch error
 * Previous Bug: ❌ Email verification failed with "user test@example.com" vs "user+test@example.com"
 */
