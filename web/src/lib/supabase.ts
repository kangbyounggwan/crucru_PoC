import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

/**
 * Server-side Supabase client using the SERVICE ROLE key.
 * Bypasses RLS — must never be exposed to the browser.
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
