import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatGHS } from "@/lib/types";
import StatusControls, { StatusBadge } from "./StatusControls";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "paid", label: "Awaiting dispatch" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
  { key: "pending_payment", label: "Unpaid" },
  { key: "cancelled", label: "Cancelled" },
];

interface Row {
  id: string;
  created_at: string;
  status: string;
  customer_name: string;
  phone: string;
  address: string;
  total_pesewas: number;
  distributors: { name: string } | null;
  order_items: { id: number }[];
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("orders")
    .select(
      "id, created_at, status, customer_name, phone, address, total_pesewas, distributors(name), order_items(id)"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  const { data } = await query;
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/orders?status=${f.key}`}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              status === f.key
                ? "bg-foreground text-white"
                : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-[14px] text-muted">No orders in this view yet.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {rows.map((o) => (
            <div key={o.id} className="rounded-2xl bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{o.customer_name}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {o.distributors?.name ?? "—"} · {o.order_items?.length ?? 0} items ·{" "}
                    {new Date(o.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {o.phone} · {o.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-semibold">{formatGHS(o.total_pesewas)}</p>
                </div>
              </div>
              <div className="mt-3 border-t border-hairline pt-3">
                <StatusControls orderId={o.id} status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
