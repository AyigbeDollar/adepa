"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getSessionProfile } from "@/lib/supabase-server";

export async function updateOrderStatus(orderId: string, status: string) {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") return { error: "Not authorized." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("set_order_status", {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { ok: true };
}
