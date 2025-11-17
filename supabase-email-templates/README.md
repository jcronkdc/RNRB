# Supabase Email Templates for Rock N' Roll Basement

## How to Use These Templates

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/diimrrmirodykpnlgerh
2. Navigate to **Authentication** → **Email Templates**
3. Select the template type (Magic Link, Confirm Signup, etc.)
4. Copy the HTML from the corresponding file
5. Paste into Supabase
6. Click **Save**

## Template Files:

- `01-magic-link-signin.html` - Magic Link / OTP Sign-In (PRIMARY)
- `02-confirm-signup.html` - Email Confirmation  
- `03-invite-user.html` - Invite User to Platform
- `04-change-email.html` - Confirm Email Change
- `05-reset-password.html` - Reset Password
- `06-reauthentication.html` - Reauthentication for Sensitive Actions

## Current Status:

✅ **ALL 6 TEMPLATES CREATED!**

## Installation Order (Recommended):

1. **01-magic-link-signin.html** (MOST IMPORTANT - use this first!)
2. **02-confirm-signup.html** (for new user signups)
3. **05-reset-password.html** (for password resets)
4. **04-change-email.html** (when users change email)
5. **03-invite-user.html** (for team invitations)
6. **06-reauthentication.html** (for sensitive operations)

## Brand Colors Used:

- Primary Purple: #8b5cf6
- Secondary Blue: #6366f1
- Pink Accent: #d946ef
- Dark Background: #050816
- Card Background: #0f172a
- Text: #ffffff / #94a3b8

## Variables Available in Templates:

- `{{ .ConfirmationURL }}` - The magic link / confirmation URL
- `{{ .Token }}` - The OTP token (if using OTP instead of magic link)
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address
- `{{ .RedirectTo }}` - Redirect URL after confirmation


