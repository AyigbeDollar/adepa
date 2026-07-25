import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  price_pesewas: number;
  emoji: string;
  image_url: string | null;
  active: boolean;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<Row>();
  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
      <ProductForm
        initial={{
          id: data.id,
          editing: true,
          name: data.name,
          brand: data.brand,
          category: data.category,
          unit: data.unit,
          price_ghs: (data.price_pesewas / 100).toFixed(2),
          emoji: data.emoji,
          image_url: data.image_url ?? "",
          active: data.active,
        }}
      />
    </div>
  );
}
