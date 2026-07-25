import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: distributors }, { data: inv }, { count: productCount }] =
    await Promise.all([
      supabase.from("distributors").select("id, name, city, active").order("city"),
      supabase.from("distributor_products").select("distributor_id").eq("active", true),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
    ]);

  const counts = new Map<string, number>();
  for (const row of inv ?? []) {
    counts.set(row.distributor_id, (counts.get(row.distributor_id) ?? 0) + 1);
  }
  const total = productCount ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
      <p className="mt-1 text-[13px] text-muted">
        Choose which of the {total} catalogue products each store stocks, and set
        per-store prices. A store with <strong>no</strong> inventory shows the
        full catalogue by default.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(distributors ?? []).map((d) => {
          const n = counts.get(d.id) ?? 0;
          return (
            <Link
              key={d.id}
              href={`/admin/inventory/${d.id}`}
              className="rounded-2xl bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{d.name}</p>
                {!d.active && (
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-muted">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted">{d.city}</p>
              <p className="mt-3 text-[13px]">
                {n === 0 ? (
                  <span className="text-amber-600">
                    No inventory set — showing full catalogue
                  </span>
                ) : (
                  <span className="text-muted">
                    Stocking <strong className="text-foreground">{n}</strong> of{" "}
                    {total} products
                  </span>
                )}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
