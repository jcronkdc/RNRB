/**
 * SUPABASE CLIENT
 * 
 * IMPORTANT: Use Supabase ONLY for file storage, NOT for authentication!
 * 
 * Authentication is handled by NextAuth:
 *   - Use `import { auth } from '@/auth'` for server-side auth
 *   - Use `import { getCurrentUser, requireAuth } from '@/lib/session'` for utilities
 * 
 * This client is for:
 *   - File uploads to Supabase Storage
 *   - Realtime subscriptions (if needed)
 *   - Direct database access (prefer Prisma)
 */

import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: return null during build to prevent errors
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing environment variables - storage features unavailable');
    return null;
  }

  // Validate and correct URL format
  if (!supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
  } else if (supabaseUrl.startsWith('ttps://')) {
    // Fix common typo: missing 'h' in https://
    supabaseUrl = `h${supabaseUrl}`;
  }

  // Create Supabase client for STORAGE ONLY
  // Auth is disabled - we use NextAuth for authentication
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return supabaseInstance;
}

/**
 * Supabase client for storage operations
 * NOTE: Do NOT use for authentication - use NextAuth
 */
export const supabase = getSupabaseClient();

/**
 * Create browser client for storage
 * NOTE: Do NOT use for authentication - use NextAuth
 */
export function createBrowserClient() {
  return getSupabaseClient();
}

// ============================================
// STORAGE HELPERS
// ============================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? false,
    });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get public URL for a file in Supabase Storage
 */
export function getPublicUrl(bucket: string, path: string): string | null {
  if (!supabase) {
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, paths: string[]) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    throw error;
  }
}
