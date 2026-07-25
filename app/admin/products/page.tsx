import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatGHS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  price_pesewas: number;
  emoji: string;
  active: boolean;
}

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, category, unit, price_pesewas, emoji, active")
    .order("category")
    .order("name");
  const rows = (data ?? []) as Row[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Catalogue</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98]"
        >
          + Add product
        </Link>
      </div>
      <p className="mt-1 text-[13px] text-muted">
        {rows.length} products in the shared catalogue. Assign them to stores
        under Inventory.
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-[14px] text-muted">No products yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full text-left text-[14px]">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr className="border-b border-hairline">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-2 font-medium hover:text-accent">
                      <span className="text-lg">{p.emoji}</span>
                      <span>
                        {p.name}
                        <span className="block text-[11px] font-normal text-muted">{p.brand}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.category}</td>
                  <td className="px-4 py-3 text-muted">{p.unit}</td>
                  <td className="px-4 py-3">{formatGHS(p.price_pesewas)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        p.active ? "bg-green-100 text-green-700" : "bg-black/5 text-muted"
                      }`}
                    >
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
