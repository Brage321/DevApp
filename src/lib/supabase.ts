import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/* ------------------------------------------------------------------ */
/* Supabase client — created only when env vars are provided.          */
/* Only the URL + anon key are used here; they are safe for the        */
/* browser because authorization is enforced by RLS policies.          */
/* ------------------------------------------------------------------ */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!url || !anonKey) {
      throw new Error(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
    }
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

/** Public storage bucket names (see supabase/migrations + README). */
export const STORAGE_BUCKETS = {
  avatars: 'avatars',
  covers: 'covers',
  audio: 'audio',
} as const;
