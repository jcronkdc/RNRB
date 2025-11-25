import { signIn } from '@cronkwaters/auth';
import { NextResponse } from 'next/server';

/**
 * AUTO-LOGIN ENDPOINT - For testing purposes
 * Uses NextAuth signIn to create a proper JWT session, then redirects to dashboard
 * Usage: GET /api/auto-login?email=test@test.com&password=pass123
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    
    console.log('[AUTO-LOGIN] Attempting login for:', email?.substring(0, 5) + '***');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required in query params' }, { status: 400 });
    }

    // Use NextAuth signIn which will handle JWT token creation properly
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    console.log('[AUTO-LOGIN] SignIn result:', result);

    // Check if sign-in was successful
    if (result?.error) {
      console.error('[AUTO-LOGIN] Sign-in failed:', result.error);
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('[AUTO-LOGIN] Error:', error);
    return NextResponse.json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

