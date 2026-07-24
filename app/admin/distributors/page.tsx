import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  area: string;
  city: string;
  service_radius_km: number;
  subaccount_code: string | null;
  active: boolean;
}

export default async function DistributorsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("distributors")
    .select("id, name, area, city, service_radius_km, subaccount_code, active")
    .order("city")
    .order("name");
  const rows = (data ?? []) as Row[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Distributors</h1>
        <Link
          href="/admin/distributors/new"
          className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98]"
        >
          + Add distributor
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-[14px] text-muted">
          No distributors yet. Add your first store to start onboarding.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full text-left text-[14px]">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr className="border-b border-hairline">
                <th className="px-4 py-3 font-medium">Store</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Radius</th>
                <th className="px-4 py-3 font-medium">Payouts</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/distributors/${d.id}`} className="font-medium hover:text-accent">
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{d.area}, {d.city}</td>
                  <td className="px-4 py-3 text-muted">{d.service_radius_km} km</td>
                  <td className="px-4 py-3">
                    {d.subaccount_code ? (
                      <span className="text-[12px] text-muted">Linked</span>
                    ) : (
                      <span className="text-[12px] text-amber-600">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        d.active
                          ? "bg-green-100 text-green-700"
                          : "bg-black/5 text-muted"
                      }`}
                    >
                      {d.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
