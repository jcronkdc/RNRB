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

  // Note: NEXT_PUBLIC_SUPABASE_URL has typo in env (missing 'h' in https)
  // Correcting it here
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http') 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL 
    : `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('ttps://', '')}`;

  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return null;
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

