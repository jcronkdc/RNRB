# Test Plan: Invite Redirect Fix

**Agent**: 148  
**Date**: 2025-11-27

---

## Test Scenario 1: New User from Invite Link (Primary Use Case)

### Setup

- **User**: New user (no account yet)
- **Starting Point**: Invite link `/invites/my-band-project?email=newuser@example.com`

### Expected Flow

1. **Click invite link**
   - URL: `/invites/my-band-project?email=newuser@example.com`
   - Not authenticated → redirects to:

   ```
   /auth?redirect=%2Finvites%2Fmy-band-project%3Femail%3Dnewuser%40example.com
   ```

2. **Create account**
   - User fills in email, password, name
   - Clicks "Create account"
   - Auth page calls:

   ```typescript
   signInWithCredentials({
     email,
     password,
     isNewUser: true,
     redirectTo: '/invites/my-band-project?email=newuser@example.com',
   });
   ```

3. **Profile check**
   - New user has `profileCompleted: false`
   - Auth function preserves redirect and creates:

   ```
   /settings/profile?setup=true&redirect=%2Finvites%2Fmy-band-project%3Femail%3Dnewuser%40example.com
   ```

4. **Complete profile**
   - User fills in username, bio, etc.
   - Clicks "Save Profile"
   - Profile page reads `redirect` param
   - After 2 seconds, redirects to:

   ```
   /invites/my-band-project?email=newuser@example.com
   ```

5. **Accept invite**
   - User lands on invite acceptance page ✅
   - Clicks "Accept & Join"
   - Successfully joins the project ✅

### Expected Result

✅ New user completes profile and lands on invite page (not dashboard)

---

## Test Scenario 2: New User Without Custom Redirect

### Setup

- **User**: New user (no account yet)
- **Starting Point**: Direct navigation to `/auth?signup=true`

### Expected Flow

1. **Create account**
   - User fills in email, password, name
   - Auth function calls:

   ```typescript
   signInWithCredentials({
     email,
     password,
     isNewUser: true,
     redirectTo: undefined, // No custom redirect
   });
   ```

2. **Profile check**
   - New user has `profileCompleted: false`
   - `redirectTo` defaults to `/dashboard`
   - Since it's the default, no redirect param is added:

   ```
   /settings/profile?setup=true
   ```

3. **Complete profile**
   - User fills in profile info
   - Profile page finds no `redirect` param
   - Redirects to `/dashboard`

### Expected Result

✅ New user without custom redirect goes to dashboard (default behavior)

---

## Test Scenario 3: Existing User with Profile from Invite Link

### Setup

- **User**: Existing user with completed profile
- **Starting Point**: Invite link `/invites/my-band-project?email=existing@example.com`

### Expected Flow

1. **Click invite link**
   - Not authenticated → redirects to:

   ```
   /auth?redirect=%2Finvites%2Fmy-band-project%3Femail%3Dexisting%40example.com
   ```

2. **Sign in**
   - User enters credentials
   - Auth function calls:

   ```typescript
   signInWithCredentials({
     email,
     password,
     redirectTo: '/invites/my-band-project?email=existing@example.com',
   });
   ```

3. **Profile check**
   - User has `profileCompleted: true`
   - **Skips profile setup** ✅
   - Redirects directly to:
   ```
   /invites/my-band-project?email=existing@example.com
   ```

### Expected Result

✅ Existing user skips profile setup and goes directly to invite page

---

## Test Scenario 4: Security - Open Redirect Attempt

### Setup

- **User**: New user attempting malicious redirect
- **Starting Point**: `/auth?redirect=//evil.com/phishing`

### Expected Flow

1. **Create account**
   - Auth function receives `redirectTo=//evil.com/phishing`
   - **Validation fails** (line 46 in `auth.ts`):

   ```typescript
   if (redirectTo && (!redirectTo.startsWith('/') || redirectTo.startsWith('//'))) {
     redirectTo = '/dashboard';
   }
   ```

   - `redirectTo` is reset to `/dashboard`

2. **Profile setup**
   - Redirects to `/settings/profile?setup=true` (no malicious redirect param)

3. **Complete profile**
   - No `redirect` param found
   - Defaults to `/dashboard`

### Expected Result

✅ Malicious redirect is blocked, user goes to dashboard

---

## Test Scenario 5: Edge Case - URL-Encoded Invite Link

### Setup

- **User**: New user
- **Starting Point**: Invite link with complex email
  ```
  /invites/my-band?email=user%2Btest@example.com
  ```

### Expected Flow

1. **Full encoded flow**
   - Auth URL:
   ```
   /auth?redirect=%2Finvites%2Fmy-band%3Femail%3Duser%252Btest%40example.com
   ```

   - Profile URL:
   ```
   /settings/profile?setup=true&redirect=%2Finvites%2Fmy-band%3Femail%3Duser%252Btest%40example.com
   ```

   - Final destination:
   ```
   /invites/my-band?email=user%2Btest@example.com
   ```

### Expected Result

✅ Complex URL encoding is preserved through entire flow

---

## Manual Testing Steps

1. **Setup test account**

   ```bash
   # Delete test user if exists
   psql $DATABASE_URL -c "DELETE FROM \"User\" WHERE email = 'testinvite@example.com';"
   ```

2. **Test flow**
   - Navigate to: `http://localhost:3000/invites/test-project?email=testinvite@example.com`
   - Should redirect to auth page
   - Create account with:
     - Email: `testinvite@example.com`
     - Password: `Test1234!`
     - Name: `Test User`
   - Should redirect to profile setup page with URL like:
     ```
     /settings/profile?setup=true&redirect=%2Finvites%2Ftest-project%3Femail%3Dtestinvite%40example.com
     ```
   - Fill in profile:
     - Username: `testinvite`
     - Display name: `Test User`
   - Click "Save Profile"
   - Wait 2 seconds
   - **VERIFY**: Should land on `/invites/test-project?email=testinvite@example.com`

3. **Verify email param**
   - Check that the invite page shows:
     ```
     Invited: testinvite@example.com
     ```

4. **Complete invite acceptance**
   - Click "Accept & Join"
   - Should join the project successfully

---

## Automated Test (Future)

```typescript
describe('Invite Redirect Flow', () => {
  it('preserves redirect through profile setup for new users', async () => {
    const inviteUrl = '/invites/test-project?email=newuser@example.com';

    // Click invite link (not authenticated)
    const authRedirect = await page.goto(inviteUrl);
    expect(authRedirect.url()).toContain('/auth?redirect=');

    // Sign up
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'Test1234!');
    await page.fill('[name="name"]', 'New User');
    await page.click('button[type="submit"]');

    // Should redirect to profile setup with redirect param
    await page.waitForURL(/\/settings\/profile\?setup=true&redirect=/);
    expect(page.url()).toContain('redirect=%2Finvites%2Ftest-project');

    // Complete profile
    await page.fill('[name="username"]', 'newuser');
    await page.click('button:has-text("Save Profile")');

    // Should redirect to invite page after 2 seconds
    await page.waitForURL(inviteUrl, { timeout: 5000 });
    expect(page.url()).toBe(inviteUrl);
  });
});
```

---

## Success Criteria

✅ **Primary**: New user from invite link completes profile and lands on invite page  
✅ **Default**: New user without redirect goes to dashboard  
✅ **Existing**: User with profile skips setup and goes to destination  
✅ **Security**: Malicious redirects are blocked  
✅ **Encoding**: Complex URLs are preserved correctly

---

**Status**: Ready for testing  
**Token Count**: ~65K / 200K (32.5% used)
