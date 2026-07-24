import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * User-scoped Supabase client for Server Components / Route Handlers. Unlike the
 * service-role admin client (lib/supabase.ts), this carries the signed-in user's
 * session, so RLS applies — the basis of admin/distributor access control.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore; the
            // middleware refreshes the session cookie instead.
          }
        },
      },
    }
  );
}

export type UserRole = "admin" | "distributor";

export interface SessionProfile {
  userId: string;
  email: string | null;
  role: UserRole;
  distributorId: string | null;
  fullName: string | null;
}

/** The signed-in user's profile (role + distributor), or null if not signed in. */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, distributor_id, full_name")
    .eq("id", user.id)
    .maybeSingle<{
      role: UserRole;
      distributor_id: string | null;
      full_name: string | null;
    }>();
  if (!profile) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    role: profile.role,
    distributorId: profile.distributor_id,
    fullName: profile.full_name,
  };
}
