import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import InventoryEditor, { type InvProduct, type InvRow } from "./InventoryEditor";

export const dynamic = "force-dynamic";

export default async function DistributorInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: distributor }, { data: products }, { data: existing }] =
    await Promise.all([
      supabase.from("distributors").select("id, name").eq("id", id).maybeSingle(),
      supabase
        .from("products")
        .select("id, name, brand, category, emoji, price_pesewas")
        .eq("active", true)
        .order("category")
        .order("name"),
      supabase
        .from("distributor_products")
        .select("product_id, price_pesewas, in_stock")
        .eq("distributor_id", id),
    ]);

  if (!distributor) notFound();

  return (
    <InventoryEditor
      distributorId={distributor.id}
      distributorName={distributor.name}
      products={(products ?? []) as InvProduct[]}
      existing={(existing ?? []) as InvRow[]}
    />
  );
}
