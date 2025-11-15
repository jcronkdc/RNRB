import { NextRequest, NextResponse } from 'next/server';

/**
 * Custom error handler for NextAuth errors
 * This prevents 500 errors when auth configuration issues occur
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // User-friendly error messages
  const errorMessages: Record<string, string> = {
    Configuration: 'Email authentication is not configured yet. Please set up Resend API key in Vercel environment variables, or use Google sign-in.',
    AccessDenied: 'Access denied. You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used. Please request a new magic link.',
    OAuthSignin: 'Error occurred during OAuth sign-in. Please try again.',
    OAuthCallback: 'Error occurred during OAuth callback. Please try again.',
    OAuthCreateAccount: 'Could not create OAuth account. Please try again.',
    EmailCreateAccount: 'Could not create email account. Please try again.',
    Callback: 'Error occurred during authentication callback. Please try again.',
    OAuthAccountNotLinked: 'This email is already linked to another account. Please use a different sign-in method.',
    EmailSignin: 'The email could not be sent. Please check your email configuration.',
    CredentialsSignin: 'Invalid credentials provided. Please check and try again.',
    SessionRequired: 'You must be signed in to access this page.',
    Default: errorDescription || 'An authentication error occurred. Please try again.',
  };

  const userMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  // Return a proper HTML error page instead of 500
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Error - CronkWaters</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
    }
    .error-container {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 {
      color: #ef4444;
      margin-bottom: 1rem;
    }
    p {
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 0 0.5rem;
      transition: background 0.2s;
    }
    .button:hover {
      background: #5568d3;
    }
    .button-secondary {
      background: #6b7280;
    }
    .button-secondary:hover {
      background: #4b5563;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>Authentication Error</h1>
    <p>${userMessage}</p>
    ${error === 'Configuration' || error === 'EmailSignin' ? `
    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: left;">
      <strong>Setup Instructions:</strong>
      <ol style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.9rem;">
        <li>Go to <a href="https://resend.com" target="_blank" style="color: #667eea;">resend.com</a> and create a free account</li>
        <li>Get your API key from the dashboard</li>
        <li>Add these in Vercel → Settings → Environment Variables:</li>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          <li><code>EMAIL_SERVER_URL=smtp://resend:YOUR_API_KEY@smtp.resend.com:587</code></li>
          <li><code>EMAIL_FROM=onboarding@resend.dev</code></li>
        </ul>
        <li>Redeploy your application</li>
      </ol>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #92400e;">Or use Google sign-in which works immediately!</p>
    </div>
    ` : ''}
    <div>
      <a href="/auth" class="button">Try Again</a>
      <a href="/" class="button button-secondary">Go Home</a>
    </div>
  </div>
</body>
</html>
  `;

  // Return 400 (Bad Request) instead of 500 for auth errors
  return new NextResponse(html, {
    status: 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
