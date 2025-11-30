/**
 * SERVER-SIDE SUPABASE CLIENT
 *
 * IMPORTANT: Use Supabase ONLY for file storage, NOT for authentication!
 *
 * Authentication is handled by NextAuth:
 *   - Use `import { auth } from '@/auth'` for server-side auth
 *   - Use `import { getCurrentUser, requireAuth } from '@/lib/session'` for utilities
 *
 * This client is for:
 *   - Server-side file uploads to Supabase Storage
 *   - Server-side realtime subscriptions (if needed)
 *   - Direct database access (prefer Prisma)
 */

import { createClient } from '@supabase/supabase-js';

let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

function getServerSupabaseClient() {
  if (supabaseServerInstance) {
    return supabaseServerInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('[Supabase Server] Missing environment variables - server features unavailable');
    return null;
  }

  // Validate and correct URL format
  let correctedUrl = supabaseUrl;
  if (!correctedUrl.startsWith('http')) {
    correctedUrl = `https://${correctedUrl}`;
  } else if (correctedUrl.startsWith('ttps://')) {
    // Fix common typo: missing 'h' in https://
    correctedUrl = `h${correctedUrl}`;
  }

  // Create Supabase server client for STORAGE ONLY
  // Auth is disabled - we use NextAuth for authentication
  supabaseServerInstance = createClient(correctedUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseServerInstance;
}

// Export the client creation function
export const createServerSupabaseClient = getServerSupabaseClient;

// Export the client directly for convenience
export const supabaseServer = getServerSupabaseClient();
