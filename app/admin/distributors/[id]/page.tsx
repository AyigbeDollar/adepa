import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DistributorForm from "../DistributorForm";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  service_radius_km: number;
  subaccount_code: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
}

export default async function EditDistributorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("distributors")
    .select("*")
    .eq("id", id)
    .maybeSingle<Row>();
  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit distributor</h1>
      <DistributorForm
        initial={{
          id: data.id,
          name: data.name,
          area: data.area,
          city: data.city,
          lat: data.lat,
          lng: data.lng,
          service_radius_km: data.service_radius_km,
          subaccount_code: data.subaccount_code ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          active: data.active,
        }}
      />
    </div>
  );
}
