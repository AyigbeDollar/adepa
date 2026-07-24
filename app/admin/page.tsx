import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = await createSupabaseServerClient();
  const [dist, prod, orders, paid] = await Promise.all([
    supabase.from("distributors").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid"),
  ]);

  const tiles = [
    { label: "Distributors", value: dist.count ?? 0, href: "/admin/distributors" },
    { label: "Products", value: prod.count ?? 0, href: "/admin/products" },
    { label: "Orders", value: orders.count ?? 0, href: "/admin/orders" },
    { label: "Awaiting dispatch", value: paid.count ?? 0, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="rounded-2xl bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-semibold tracking-tight">{t.value}</p>
            <p className="mt-1 text-[12px] font-medium text-muted">{t.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
