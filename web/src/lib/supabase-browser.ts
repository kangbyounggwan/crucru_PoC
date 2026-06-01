"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (public anon/publishable key).
 * Handles Supabase Auth social login (Kakao / Google / Apple).
 * detectSessionInUrl parses the session returned in the redirect hash.
 */
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
