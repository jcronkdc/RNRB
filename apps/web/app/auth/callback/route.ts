import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Safety: Correct malformed URL (missing 'h' in 'https://')
    // This handles cases where NEXT_PUBLIC_SUPABASE_URL="ttps://..." in .env
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/auth?error=Configuration', requestUrl.origin));
    }

    // Validate and correct URL format
    if (!supabaseUrl.startsWith('http')) {
      // If missing protocol entirely, add https://
      supabaseUrl = `https://${supabaseUrl}`;
    } else if (supabaseUrl.startsWith('ttps://')) {
      // Fix common typo: missing 'h' in https://
      supabaseUrl = `h${supabaseUrl}`;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Bug Fix: Wrap exchangeCodeForSession in try-catch
    // This method can throw on invalid codes, network errors, or auth failures
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/auth?error=AuthenticationFailed', requestUrl.origin));
    }
  }

  // URL to redirect to after sign in process completes
  // Redirect to dashboard instead of homepage for better UX
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
