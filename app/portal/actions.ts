"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getSessionProfile } from "@/lib/supabase-server";
import { withSpan } from "@/lib/telemetry";

export async function portalUpdateStatus(orderId: string, status: string) {
  const profile = await getSessionProfile();
  if (profile?.role !== "distributor") return { error: "Not authorized." };

  // The RPC re-checks ownership + allowed transitions at the DB layer.
  const supabase = await createSupabaseServerClient();
  const { error } = await withSpan(
    "order.set_status",
    { "app.order.id": orderId, "app.order.new_status": status, "app.actor.role": "distributor" },
    async (span) => {
      const res = await supabase.rpc("set_order_status", {
        p_order_id: orderId,
        p_status: status,
      });
      if (res.error) span.setAttributes({ error: true, "exception.slug": "order.set_status.rejected" });
      return res;
    }
  );
  if (error) return { error: error.message };

  revalidatePath("/portal");
  return { ok: true };
}
