import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";
import DistributorForm from "../DistributorForm";
import AccessSection, { type Login } from "../AccessSection";

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

  // Logins linked to this store, with their emails (from the auth admin API).
  const admin = getSupabaseAdmin();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("distributor_id", id);
  let logins: Login[] = [];
  if (profiles && profiles.length > 0) {
    const { data: userList } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const emailById = new Map(
      (userList?.users ?? []).map((u) => [u.id, u.email ?? null])
    );
    logins = profiles.map((p) => ({
      id: p.id,
      fullName: p.full_name,
      email: emailById.get(p.id) ?? null,
    }));
  }

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
      <AccessSection distributorId={data.id} logins={logins} />
    </div>
  );
}
