"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { formatGHS, type Order, type OrderStatus } from "@/lib/types";

const STATUS_COPY: Record<OrderStatus, { title: string; body: string; icon: string }> = {
  pending_payment: {
    title: "Waiting for payment",
    body: "Complete the payment prompt on your phone. This page updates once Paystack confirms.",
    icon: "⏳",
  },
  paid: {
    title: "Order confirmed",
    body: "Your provisions are being packed right now. A rider will be on the way soon.",
    icon: "✅",
  },
  dispatched: {
    title: "Rider on the way",
    body: "Your order left the depot with one of our in-house riders.",
    icon: "🛵",
  },
  delivered: {
    title: "Delivered",
    body: "Enjoy! Thanks for shopping direct with Adepa.",
    icon: "📦",
  },
  cancelled: {
    title: "Order cancelled",
    body: "This order was cancelled. If you were charged, a refund is on its way.",
    icon: "↩️",
  },
};

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/order/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setOrder(json.order);
          return;
        }
      } catch {
        // fall through to local copy
      }
      const raw = localStorage.getItem(`adepa-order-${id}`);
      if (raw && !cancelled) {
        setOrder(JSON.parse(raw));
      } else if (!cancelled) {
        setNotFound(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-4xl">🔍</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Order not found
        </h1>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-[14px] font-medium text-white hover:bg-accent-dark"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center text-muted">
        Loading your order…
      </div>
    );
  }

  const status = STATUS_COPY[order.status] ?? STATUS_COPY.paid;

  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-16">
      <div className="fade-up text-center">
        <span className="text-5xl">{status.icon}</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {status.title}
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-muted">{status.body}</p>
        {order.demo && (
          <p className="mt-3 inline-block rounded-full bg-gold/10 px-3 py-1 text-[11px] font-medium text-gold">
            Demo order — payments activate once Paystack keys are configured
          </p>
        )}
      </div>

      <div className="fade-up fade-up-1 mt-8 rounded-3xl bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Order · {order.id.slice(0, 8)}
        </p>
        <div className="mt-4 space-y-2.5">
          {order.items.map((it) => (
            <div
              key={it.product_id}
              className="flex justify-between text-[14px]"
            >
              <span className="text-foreground">
                {it.qty} × {it.name}
              </span>
              <span className="font-medium">
                {formatGHS(it.unit_price_pesewas * it.qty)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-hairline pt-4 text-[13px]">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatGHS(order.subtotal_pesewas)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Delivery</span>
            <span>{formatGHS(order.delivery_fee_pesewas)}</span>
          </div>
          <div className="flex justify-between pt-1 text-[15px] font-semibold">
            <span>Total</span>
            <span>{formatGHS(order.total_pesewas)}</span>
          </div>
        </div>
      </div>

      <div className="fade-up fade-up-2 mt-4 rounded-3xl bg-surface p-6 text-[13px] leading-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-muted">Delivering to</p>
        <p className="font-medium">{order.address}</p>
        <p className="text-muted">
          {order.customer_name} · {order.phone}
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="text-[14px] font-medium text-accent hover:opacity-70"
        >
          Shop again ›
        </Link>
      </div>
    </div>
  );
}
