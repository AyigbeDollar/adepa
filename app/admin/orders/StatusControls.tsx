"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "./actions";

const NEXT: Record<string, { label: string; status: string; danger?: boolean }[]> = {
  pending_payment: [{ label: "Cancel", status: "cancelled", danger: true }],
  paid: [
    { label: "Mark dispatched", status: "dispatched" },
    { label: "Cancel", status: "cancelled", danger: true },
  ],
  dispatched: [{ label: "Mark delivered", status: "delivered" }],
  delivered: [],
  cancelled: [],
};

export default function StatusControls({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const actions = NEXT[status] ?? [];

  if (actions.length === 0) {
    return <span className="text-[12px] text-muted">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((a) => (
        <button
          key={a.status}
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const res = await updateOrderStatus(orderId, a.status);
              if (res?.error) setError(res.error);
            })
          }
          className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-all active:scale-[0.97] disabled:opacity-50 ${
            a.danger
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-accent text-white hover:bg-accent-dark"
          }`}
        >
          {a.label}
        </button>
      ))}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-700",
    paid: "bg-blue-100 text-blue-700",
    dispatched: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-black/5 text-muted",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status] ?? "bg-black/5 text-muted"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
