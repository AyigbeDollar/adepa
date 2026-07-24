import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/portal");
  if (profile.role !== "distributor") redirect("/admin");

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
        Distributor portal
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your orders</h1>

      {profile.distributorId ? (
        <p className="mt-2 text-[14px] text-muted">
          Signed in as {profile.email}. Incoming orders and pick → dispatch →
          deliver land here in Phase 4.
        </p>
      ) : (
        <div className="mt-6 rounded-2xl bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-[15px] font-medium">No store linked yet</p>
          <p className="mt-1 text-[13px] text-muted">
            Your account isn&apos;t linked to a distributor store. Ask the Adepa
            admin to assign you before you can see orders.
          </p>
        </div>
      )}

      <form action="/auth/signout" method="post" className="mt-8">
        <button className="rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-white">
          Sign out
        </button>
      </form>
    </div>
  );
}
