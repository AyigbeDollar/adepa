"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getSessionProfile } from "@/lib/supabase-server";

export async function portalUpdateStatus(orderId: string, status: string) {
  const profile = await getSessionProfile();
  if (profile?.role !== "distributor") return { error: "Not authorized." };

  // The RPC re-checks ownership + allowed transitions at the DB layer.
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("set_order_status", {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) return { error: error.message };

  revalidatePath("/portal");
  return { ok: true };
}
