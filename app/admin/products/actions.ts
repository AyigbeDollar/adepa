"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getSessionProfile } from "@/lib/supabase-server";
import { CATEGORIES } from "@/lib/demo-data";

export interface ProductFormState {
  error?: string;
}

function text(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") return { error: "Not authorized." };

  const editing = formData.get("editing") === "1";
  const id = text(formData.get("id")).toLowerCase();
  const name = text(formData.get("name"));
  const brand = text(formData.get("brand"));
  const category = text(formData.get("category"));
  const unit = text(formData.get("unit"));
  const priceGhs = Number(text(formData.get("price_ghs")));
  const emoji = text(formData.get("emoji")) || "🛒";
  const image_url = text(formData.get("image_url")) || null;
  const active = formData.get("active") === "on";

  if (!editing && !/^[a-z0-9-]{3,}$/.test(id))
    return { error: "Product ID must be a slug: lowercase letters, numbers, hyphens (e.g. p-milo-400)." };
  if (name.length < 2) return { error: "Product name is required." };
  if (!brand) return { error: "Brand is required." };
  if (!(CATEGORIES as readonly string[]).includes(category))
    return { error: "Choose a valid category." };
  if (!unit) return { error: "Unit is required (e.g. '400 g tin')." };
  if (!Number.isFinite(priceGhs) || priceGhs <= 0)
    return { error: "Enter a price in GH₵ greater than 0." };

  const payload = {
    name,
    brand,
    category,
    unit,
    price_pesewas: Math.round(priceGhs * 100),
    emoji,
    image_url,
    active,
  };

  const supabase = await createSupabaseServerClient();
  const { error } = editing
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert({ id, ...payload });

  if (error) {
    if (error.code === "23505")
      return { error: `Product ID "${id}" already exists — choose another.` };
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
