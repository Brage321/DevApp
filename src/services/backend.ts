import type { Backend } from '@/types';
import { supabaseConfigured } from '@/lib/supabase';
import { demoBackend } from '@/services/demoBackend';
import { supabaseBackend } from '@/services/supabaseBackend';

/* ------------------------------------------------------------------ */
/* Backend selector                                                    */
/*                                                                     */
/* - If Supabase env vars are configured → production backend.         */
/* - Otherwise → DEMO backend (browser-local, seeded demo profiles).   */
/*                                                                     */
/* The demo backend exists so the static site works on Surge without   */
/* any server. It is clearly labeled in the UI and NOT production      */
/* data storage. See README → "Demo mode".                             */
/* ------------------------------------------------------------------ */

let instance: Backend | null = null;

export function getBackend(): Backend {
  if (!instance) {
    instance = supabaseConfigured ? supabaseBackend : demoBackend;
  }
  return instance;
}

export function backendMode(): 'demo' | 'supabase' {
  return supabaseConfigured ? 'supabase' : 'demo';
}

export const isDemoMode = !supabaseConfigured;
