/**
 * src/lib/supabase.ts
 *
 * Supabase client singleton for client-side auth.
 * Uses the public anon key — safe to expose in the browser.
 *
 * Set in .env.local:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Gracefully handle missing env vars instead of throwing on import
// (avoids blank screen when .env.local isn't set up yet)
if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '[PostureTrack] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set.\n' +
    'Copy .env.local.example to .env.local and fill in your Supabase credentials.'
  );
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder',
  {
    auth: {
      persistSession:      true,
      autoRefreshToken:    true,
      detectSessionInUrl:  true,  // handles OAuth redirect callbacks
    },
  }
);
