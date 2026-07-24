"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getSessionProfile } from "@/lib/supabase-server";

export interface DistributorFormState {
  error?: string;
}

function num(v: FormDataEntryValue | null): number {
  return Number(String(v ?? "").trim());
}

function text(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

export async function saveDistributor(
  _prev: DistributorFormState,
  formData: FormData
): Promise<DistributorFormState> {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") return { error: "Not authorized." };

  const id = text(formData.get("id")) || null;
  const payload = {
    name: text(formData.get("name")),
    area: text(formData.get("area")),
    city: text(formData.get("city")),
    lat: num(formData.get("lat")),
    lng: num(formData.get("lng")),
    service_radius_km: num(formData.get("service_radius_km")),
    subaccount_code: text(formData.get("subaccount_code")) || null,
    phone: text(formData.get("phone")) || null,
    email: text(formData.get("email")) || null,
    active: formData.get("active") === "on",
  };

  if (payload.name.length < 2) return { error: "Store name is required." };
  if (!payload.area || !payload.city)
    return { error: "Area and city are required." };
  if (!Number.isFinite(payload.lat) || !Number.isFinite(payload.lng))
    return { error: "Enter a valid latitude and longitude." };
  if (!Number.isFinite(payload.service_radius_km) || payload.service_radius_km <= 0)
    return { error: "Service radius must be a positive number of km." };

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("distributors").update(payload).eq("id", id)
    : await supabase.from("distributors").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/admin/distributors");
  redirect("/admin/distributors");
}

export async function setDistributorActive(id: string, active: boolean) {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("distributors").update({ active }).eq("id", id);
  revalidatePath("/admin/distributors");
}
