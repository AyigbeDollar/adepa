import { NextResponse } from "next/server";
import {
  computeTotals,
  createOrder,
  getDistributors,
  getProducts,
  setOrderReference,
} from "@/lib/data";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack";
import type { OrderItem } from "@/lib/types";

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

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.customer_name ?? "").trim();
  const phone = (body.phone ?? "").replace(/\s/g, "");
  const address = (body.address ?? "").trim();
  const email = (body.email ?? "").trim() || null;
  const items = body.items ?? [];

  if (name.length < 2)
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!GH_PHONE.test(phone))
    return NextResponse.json(
      { error: "Enter a valid Ghana phone number, e.g. 0241234567" },
      { status: 400 }
    );
  if (address.length < 5)
    return NextResponse.json(
      { error: "Please enter your delivery address" },
      { status: 400 }
    );
  if (items.length === 0)
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });

  try {
    const [products, distributors] = await Promise.all([
      getProducts(),
      getDistributors(),
    ]);
    const distributor = distributors.find((d) => d.id === body.distributor_id);
    if (!distributor)
      return NextResponse.json(
        { error: "Unknown distributor" },
        { status: 400 }
      );

    // Server-side price authority: never trust client prices.
    const orderItems: OrderItem[] = [];
    for (const it of items) {
      const product = products.find((p) => p.id === it.product_id);
      const qty = Math.floor(Number(it.qty));
      if (!product || !Number.isFinite(qty) || qty < 1 || qty > 99) {
        return NextResponse.json(
          { error: "Invalid cart item" },
          { status: 400 }
        );
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

    const order = await createOrder(
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
    );

    if (!usePaystack) {
      // Demo mode: no payment provider configured — simulate instant success.
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

    return NextResponse.json({
      order: { ...order, paystack_reference: reference },
      payment_url: tx.authorization_url,
      demo: false,
    });
  } catch (err) {
    console.error("checkout failed", err);
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
