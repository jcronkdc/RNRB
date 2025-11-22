import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: return null during build
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Safety: Correct malformed URL (missing 'h' in 'https://')
  // This handles cases where NEXT_PUBLIC_SUPABASE_URL="ttps://..." in .env
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  // Validate and correct URL format
  if (!supabaseUrl.startsWith('http')) {
    // If missing protocol entirely, add https://
    supabaseUrl = `https://${supabaseUrl}`;
  } else if (supabaseUrl.startsWith('ttps://')) {
    // Fix common typo: missing 'h' in https://
    supabaseUrl = `h${supabaseUrl}`;
  }

  // Create Supabase client for client-side usage
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  return supabaseInstance;
}

export const supabase = getSupabaseClient();

// Helper function to get current user
export async function getCurrentUser() {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

// Helper function to sign out
export async function signOut() {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return { error: new Error('Supabase client not initialized') };
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
  return { error };
}

