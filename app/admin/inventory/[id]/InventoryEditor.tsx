"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { saveInventory, type InventoryFormState } from "../actions";
import { formatGHS } from "@/lib/types";

export interface InvProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  price_pesewas: number;
}

export interface InvRow {
  product_id: string;
  price_pesewas: number | null;
  in_stock: boolean;
}

export default function InventoryEditor({
  distributorId,
  distributorName,
  products,
  existing,
}: {
  distributorId: string;
  distributorName: string;
  products: InvProduct[];
  existing: InvRow[];
}) {
  const [state, action, pending] = useActionState<InventoryFormState, FormData>(
    saveInventory,
    {}
  );

  const initial = useMemo(() => {
    const map = new Map(existing.map((r) => [r.product_id, r]));
    return products.map((p) => {
      const row = map.get(p.id);
      return {
        ...p,
        stocked: Boolean(row),
        price: row?.price_pesewas != null ? (row.price_pesewas / 100).toFixed(2) : "",
        inStock: row ? row.in_stock : true,
      };
    });
  }, [products, existing]);

  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => Object.fromEntries(initial.map((p) => [p.id, p.stocked]))
  );
  const stockedCount = Object.values(checked).filter(Boolean).length;

  return (
    <form action={action}>
      <input type="hidden" name="distributor_id" value={distributorId} />

      <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between bg-background/95 px-5 py-3 backdrop-blur">
        <div>
          <Link href="/admin/inventory" className="text-[12px] text-accent hover:opacity-70">
            ‹ Inventory
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">{distributorName}</h1>
          <p className="text-[12px] text-muted">{stockedCount} products stocked</p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save inventory"}
        </button>
      </div>

      {state.error && <p className="mt-2 text-[13px] text-red-600">{state.error}</p>}
      {state.ok && <p className="mt-2 text-[13px] text-green-700">Inventory saved.</p>}

      <div className="mt-3 divide-y divide-hairline rounded-2xl bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {initial.map((p) => {
          const on = checked[p.id];
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <label className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  name={`stocked_${p.id}`}
                  defaultChecked={p.stocked}
                  onChange={(e) =>
                    setChecked((c) => ({ ...c, [p.id]: e.target.checked }))
                  }
                  className="h-4 w-4 shrink-0 rounded border-hairline text-accent"
                />
                <span className="text-lg">{p.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium">{p.name}</span>
                  <span className="block text-[11px] text-muted">
                    {p.brand} · catalogue {formatGHS(p.price_pesewas)}
                  </span>
                </span>
              </label>

              <div className={`flex items-center gap-3 ${on ? "" : "pointer-events-none opacity-40"}`}>
                <label className="flex items-center gap-1.5 text-[12px] text-muted">
                  <span>GH₵</span>
                  <input
                    name={`price_${p.id}`}
                    inputMode="decimal"
                    defaultValue={p.price}
                    placeholder={(p.price_pesewas / 100).toFixed(2)}
                    className="w-20 rounded-lg border border-hairline bg-background px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-[12px] text-muted">
                  <input
                    type="checkbox"
                    name={`instock_${p.id}`}
                    defaultChecked={p.inStock}
                    className="h-4 w-4 rounded border-hairline text-accent"
                  />
                  In stock
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Leave the price blank to use the catalogue price. Uncheck a product to
        stop stocking it here. Uncheck “In stock” to keep it listed but
        temporarily unavailable.
      </p>
    </form>
  );
}
