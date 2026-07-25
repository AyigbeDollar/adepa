import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatGHS } from "@/lib/types";
import PortalStatusControls from "./PortalStatusControls";

export const dynamic = "force-dynamic";

interface Item {
  name: string;
  unit: string;
  qty: number;
}
interface Row {
  id: string;
  created_at: string;
  status: string;
  customer_name: string;
  phone: string;
  address: string;
  total_pesewas: number;
  order_items: Item[];
}

export default async function PortalHome() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, created_at, status, customer_name, phone, address, total_pesewas, order_items(name, unit, qty)"
    )
    .in("status", ["paid", "dispatched"])
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as unknown as Row[];

  const toDispatch = rows.filter((r) => r.status === "paid");
  const inTransit = rows.filter((r) => r.status === "dispatched");

  return (
    <div className="space-y-8">
      <Section
        title="New orders"
        subtitle="Paid — pick these and dispatch"
        rows={toDispatch}
        empty="No new orders right now."
      />
      <Section
        title="Out for delivery"
        subtitle="Dispatched — mark delivered on arrival"
        rows={inTransit}
        empty="Nothing out for delivery."
      />
    </div>
  );
}

function Section({
  title,
  subtitle,
  rows,
  empty,
}: {
  title: string;
  subtitle: string;
  rows: Row[];
  empty: string;
}) {
  return (
    <section>
      <h2 className="text-[17px] font-semibold tracking-tight">
        {title} {rows.length > 0 && <span className="text-accent">({rows.length})</span>}
      </h2>
      <p className="text-[12px] text-muted">{subtitle}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-[13px] text-muted">{empty}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {rows.map((o) => (
            <div key={o.id} className="rounded-2xl bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-[12px] text-muted">
                    {new Date(o.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="text-[15px] font-semibold">{formatGHS(o.total_pesewas)}</p>
              </div>

              <ul className="mt-3 space-y-1 border-y border-hairline py-3 text-[13px]">
                {(o.order_items ?? []).map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{it.name}</span>
                    <span className="text-muted">×{it.qty} · {it.unit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-col gap-2">
                <a href={`tel:${o.phone}`} className="text-[13px] text-accent hover:opacity-70">
                  📞 {o.phone}
                </a>
                <p className="text-[13px] text-muted">📍 {o.address}</p>
                <PortalStatusControls orderId={o.id} status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
