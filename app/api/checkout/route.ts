import { NextResponse } from "next/server";
import {
  computeTotals,
  createOrder,
  getDistributors,
  getProductsForDistributor,
  setOrderReference,
} from "@/lib/data";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack";
import type { OrderItem } from "@/lib/types";
import { annotate, markError, withSpan } from "@/lib/telemetry";

interface CheckoutBody {
  customer_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  distributor_id?: string;
  items?: { product_id: string; qty: number }[];
}

const GH_PHONE = /^0\d{9}$/;

/** 400 response that also tags the trace with why checkout was rejected. */
function reject(reason: string, error: string) {
  annotate({ "app.checkout.outcome": "rejected", "app.checkout.reject_reason": reason });
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return reject("invalid_json", "Invalid JSON");
  }

  const name = (body.customer_name ?? "").trim();
  const phone = (body.phone ?? "").replace(/\s/g, "");
  const address = (body.address ?? "").trim();
  const email = (body.email ?? "").trim() || null;
  const items = body.items ?? [];

  annotate({
    "app.checkout.cart_lines": items.length,
    "app.checkout.has_email": email !== null,
    "app.checkout.has_location": body.lat != null && body.lng != null,
  });

  if (name.length < 2) return reject("missing_name", "Please enter your name");
  if (!GH_PHONE.test(phone))
    return reject("invalid_phone", "Enter a valid Ghana phone number, e.g. 0241234567");
  if (address.length < 5)
    return reject("missing_address", "Please enter your delivery address");
  if (items.length === 0) return reject("empty_cart", "Your cart is empty");

  try {
    const distributors = await getDistributors();
    const distributor = distributors.find((d) => d.id === body.distributor_id);
    if (!distributor)
      return reject(
        "unknown_distributor",
        "Your delivery area needs re-selecting — go back and set your location again."
      );
    annotate({ "app.distributor.id": distributor.id });
    // Price authority from the distributor's own inventory (honours per-store
    // pricing); falls back to the full catalogue when none is configured.
    const products = await getProductsForDistributor(distributor.id);

    // Server-side price authority: never trust client prices.
    const orderItems: OrderItem[] = [];
    for (const it of items) {
      const product = products.find((p) => p.id === it.product_id);
      const qty = Math.floor(Number(it.qty));
      if (!product || !Number.isFinite(qty) || qty < 1 || qty > 99) {
        return reject(product ? "invalid_qty" : "unknown_product", "Invalid cart item");
      }
      orderItems.push({
        product_id: product.id,
        name: product.name,
        unit: product.unit,
        qty,
        unit_price_pesewas: product.price_pesewas,
      });
    }

    const totals = computeTotals(orderItems);
    const usePaystack = isPaystackConfigured();
    annotate({
      "app.order.item_count": orderItems.reduce((n, it) => n + it.qty, 0),
      "app.order.subtotal_pesewas": totals.subtotal_pesewas,
      "app.order.total_pesewas": totals.total_pesewas,
      "app.payment.mode": usePaystack ? "paystack" : "demo",
      "app.distributor.has_subaccount": Boolean(distributor.subaccount_code),
    });

    const order = await withSpan("order.create", {}, () => createOrder(
      {
        customer_name: name,
        phone,
        email,
        address,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        distributor,
        items: orderItems,
      },
      !usePaystack
    ));
    annotate({ "app.order.id": order.id });

    if (!usePaystack) {
      // Demo mode: no payment provider configured — simulate instant success.
      annotate({ "app.checkout.outcome": "demo_paid" });
      return NextResponse.json({ order, payment_url: null, demo: true });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      new URL(req.url).origin.replace(/\/$/, "");
    const reference = `adepa_${order.id}`;
    const tx = await initializeTransaction({
      email: email ?? `${phone}@adepa.store`,
      amountPesewas: totals.total_pesewas,
      reference,
      callbackUrl: `${siteUrl}/order/${order.id}`,
      subaccountCode: distributor.subaccount_code ?? null,
      platformCutPesewas:
        totals.platform_fee_pesewas + totals.delivery_fee_pesewas,
      metadata: {
        order_id: order.id,
        distributor_id: distributor.id,
        custom_fields: [
          {
            display_name: "Order",
            variable_name: "order_id",
            value: order.id,
          },
        ],
      },
    });
    await setOrderReference(order.id, reference);
    annotate({ "app.checkout.outcome": "payment_started" });

    return NextResponse.json({
      order: { ...order, paystack_reference: reference },
      payment_url: tx.authorization_url,
      demo: false,
    });
  } catch (err) {
    console.error("checkout failed", err);
    annotate({ "app.checkout.outcome": "error" });
    markError("checkout.failed", err);
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
