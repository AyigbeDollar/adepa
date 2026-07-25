"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getSessionProfile } from "@/lib/supabase-server";

export interface InventoryFormState {
  error?: string;
  ok?: boolean;
}

function text(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

export async function saveInventory(
  _prev: InventoryFormState,
  formData: FormData
): Promise<InventoryFormState> {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") return { error: "Not authorized." };

  const distributorId = text(formData.get("distributor_id"));
  if (!distributorId) return { error: "Missing distributor." };

  const supabase = await createSupabaseServerClient();
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id");
  if (pErr) return { error: pErr.message };

  const stocked: {
    distributor_id: string;
    product_id: string;
    price_pesewas: number | null;
    in_stock: boolean;
    active: boolean;
  }[] = [];

  for (const { id } of products ?? []) {
    if (formData.get(`stocked_${id}`) !== "on") continue;
    const priceStr = text(formData.get(`price_${id}`));
    const priceGhs = priceStr ? Number(priceStr) : NaN;
    const price_pesewas =
      priceStr && Number.isFinite(priceGhs) && priceGhs > 0
        ? Math.round(priceGhs * 100)
        : null;
    stocked.push({
      distributor_id: distributorId,
      product_id: id,
      price_pesewas,
      in_stock: formData.get(`instock_${id}`) === "on",
      active: true,
    });
  }

  // Upsert everything currently stocked…
  if (stocked.length > 0) {
    const { error } = await supabase
      .from("distributor_products")
      .upsert(stocked, { onConflict: "distributor_id,product_id" });
    if (error) return { error: error.message };
  }

  // …then remove rows for products no longer stocked by this distributor.
  const stockedIds = stocked.map((s) => s.product_id);
  let del = supabase
    .from("distributor_products")
    .delete()
    .eq("distributor_id", distributorId);
  if (stockedIds.length > 0) {
    del = del.not("product_id", "in", `(${stockedIds.join(",")})`);
  }
  const { error: delErr } = await del;
  if (delErr) return { error: delErr.message };

  revalidatePath(`/admin/inventory/${distributorId}`);
  revalidatePath("/admin/inventory");
  return { ok: true };
}
