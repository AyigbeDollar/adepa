import { createBrowserClient } from "@supabase/ssr";

/** User-scoped Supabase client for Client Components (login, portal actions). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
