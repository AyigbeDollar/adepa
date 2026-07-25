"use client";

import { useState, useTransition } from "react";
import { portalUpdateStatus } from "./actions";

const NEXT: Record<string, { label: string; status: string }> = {
  paid: { label: "Accept & dispatch", status: "dispatched" },
  dispatched: { label: "Mark delivered", status: "delivered" },
};

export default function PortalStatusControls({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const next = NEXT[status];

  if (!next) return null;

  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await portalUpdateStatus(orderId, next.status);
            if (res?.error) setError(res.error);
          })
        }
        className="w-full rounded-full bg-accent py-2.5 text-[14px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : next.label}
      </button>
      {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
