import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase clients. The app runs in "demo mode" (in-memory
 * catalog, simulated payments) whenever these env vars are absent, so the
 * site works out of the box and goes live once the project is linked.
 */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

let adminClient: SupabaseClient | null = null;

/** Service-role client — server only. Never import from client components. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase is not configured");
    }
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
