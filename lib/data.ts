import { DEMO_DISTRIBUTORS, DEMO_PRODUCTS } from "./demo-data";
import { haversineKm } from "./geo";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import type {
  Distributor,
  MatchedDistributor,
  Order,
  OrderItem,
  Product,
} from "./types";

export const DELIVERY_FEE_PESEWAS = 1500; // flat GH₵ 15 in-house delivery
export const PLATFORM_FEE_PERCENT = Number(
  process.env.PLATFORM_FEE_PERCENT ?? 10
);

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return DEMO_PRODUCTS;
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select("*")
    .eq("active", true)
    .order("category")
    .order("name");
  if (error) throw new Error(`products query failed: ${error.message}`);
  return data as Product[];
}

export async function getDistributors(): Promise<Distributor[]> {
  if (!isSupabaseConfigured()) return DEMO_DISTRIBUTORS;
  const { data, error } = await getSupabaseAdmin()
    .from("distributors")
    .select("*")
    .eq("active", true);
  if (error) throw new Error(`distributors query failed: ${error.message}`);
  return data as Distributor[];
}

/**
 * Pick the distributor for a customer location: nearest one whose service
 * radius covers the point; otherwise the nearest overall, flagged
 * outside_zone so the UI can set expectations.
 */
export async function matchDistributor(
  lat: number,
  lng: number
): Promise<MatchedDistributor | null> {
  const distributors = await getDistributors();
  if (distributors.length === 0) return null;
  const ranked = distributors
    .map((d) => ({ d, km: haversineKm(lat, lng, d.lat, d.lng) }))
    .sort((a, b) => a.km - b.km);
  const inZone = ranked.find((r) => r.km <= r.d.service_radius_km);
  const pick = inZone ?? ranked[0];
  return {
    ...pick.d,
    distance_km: Math.round(pick.km * 10) / 10,
    outside_zone: !inZone,
  };
}

export interface NewOrderInput {
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  distributor: Distributor;
  items: OrderItem[];
}

export function computeTotals(items: OrderItem[]) {
  const subtotal = items.reduce(
    (sum, it) => sum + it.unit_price_pesewas * it.qty,
    0
  );
  const platformFee = Math.round((subtotal * PLATFORM_FEE_PERCENT) / 100);
  const total = subtotal + DELIVERY_FEE_PESEWAS;
  return {
    subtotal_pesewas: subtotal,
    delivery_fee_pesewas: DELIVERY_FEE_PESEWAS,
    platform_fee_pesewas: platformFee,
    distributor_payout_pesewas: subtotal - platformFee,
    total_pesewas: total,
  };
}

export async function createOrder(
  input: NewOrderInput,
  demo: boolean
): Promise<Order> {
  const totals = computeTotals(input.items);
  const order: Order = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    status: demo ? "paid" : "pending_payment",
    customer_name: input.customer_name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    distributor_id: input.distributor.id,
    distributor_name: input.distributor.name,
    items: input.items,
    ...totals,
    paystack_reference: null,
    demo,
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("orders").insert({
      id: order.id,
      status: order.status,
      customer_name: order.customer_name,
      phone: order.phone,
      email: order.email,
      address: order.address,
      lat: order.lat,
      lng: order.lng,
      distributor_id: order.distributor_id,
      subtotal_pesewas: order.subtotal_pesewas,
      delivery_fee_pesewas: order.delivery_fee_pesewas,
      platform_fee_pesewas: order.platform_fee_pesewas,
      distributor_payout_pesewas: order.distributor_payout_pesewas,
      total_pesewas: order.total_pesewas,
      demo: order.demo,
    });
    if (error) throw new Error(`order insert failed: ${error.message}`);
    const { error: itemsError } = await sb.from("order_items").insert(
      order.items.map((it) => ({
        order_id: order.id,
        product_id: it.product_id,
        name: it.name,
        unit: it.unit,
        qty: it.qty,
        unit_price_pesewas: it.unit_price_pesewas,
      }))
    );
    if (itemsError)
      throw new Error(`order items insert failed: ${itemsError.message}`);
  }

  return order;
}

export async function setOrderReference(
  orderId: string,
  reference: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await getSupabaseAdmin()
    .from("orders")
    .update({ paystack_reference: reference })
    .eq("id", orderId);
  if (error) throw new Error(`order update failed: ${error.message}`);
}

export async function markOrderPaidByReference(
  reference: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await getSupabaseAdmin()
    .from("orders")
    .update({ status: "paid" })
    .eq("paystack_reference", reference)
    .eq("status", "pending_payment");
  if (error) throw new Error(`order paid update failed: ${error.message}`);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*), distributors(name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`order query failed: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    created_at: data.created_at,
    status: data.status,
    customer_name: data.customer_name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    distributor_id: data.distributor_id,
    distributor_name: data.distributors?.name ?? "",
    items: (data.order_items ?? []).map(
      (it: Record<string, unknown>) =>
        ({
          product_id: it.product_id,
          name: it.name,
          unit: it.unit,
          qty: it.qty,
          unit_price_pesewas: it.unit_price_pesewas,
        }) as OrderItem
    ),
    subtotal_pesewas: data.subtotal_pesewas,
    delivery_fee_pesewas: data.delivery_fee_pesewas,
    platform_fee_pesewas: data.platform_fee_pesewas,
    distributor_payout_pesewas: data.distributor_payout_pesewas,
    total_pesewas: data.total_pesewas,
    paystack_reference: data.paystack_reference,
    demo: data.demo,
  };
}
