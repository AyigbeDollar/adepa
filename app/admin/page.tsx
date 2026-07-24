import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") redirect("/portal");

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
        Admin
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Operations dashboard
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        Signed in as {profile.email}. Distributors, catalogue, inventory and
        orders land here in Phase 3.
      </p>
      <form action="/auth/signout" method="post" className="mt-8">
        <button className="rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-white">
          Sign out
        </button>
      </form>
    </div>
  );
}
