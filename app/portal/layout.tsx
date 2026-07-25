import { redirect } from "next/navigation";
import { createSupabaseServerClient, getSessionProfile } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/portal");
  if (profile.role === "admin") redirect("/admin");

  let storeName = "";
  if (profile.distributorId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("distributors")
      .select("name")
      .eq("id", profile.distributorId)
      .maybeSingle<{ name: string }>();
    storeName = data?.name ?? "";
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <header className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            adepa · distributor
          </p>
          <p className="text-[15px] font-semibold tracking-tight">
            {storeName || "Your store"}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-full bg-surface px-4 py-2 text-[12px] font-medium text-muted shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:text-foreground">
            Sign out
          </button>
        </form>
      </header>

      {!profile.distributorId ? (
        <div className="mt-10 rounded-2xl bg-surface p-6 text-center">
          <p className="text-[15px] font-medium">No store linked yet</p>
          <p className="mt-2 text-[13px] text-muted">
            Your account isn’t connected to a store. Please contact Adepa to be
            assigned.
          </p>
        </div>
      ) : (
        <main className="mt-6">{children}</main>
      )}
    </div>
  );
}
