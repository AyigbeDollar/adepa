export type Category =
  | "Staples & Grains"
  | "Beverages"
  | "Cooking Essentials"
  | "Snacks & Biscuits"
  | "Home & Cleaning"
  | "Personal Care";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  unit: string;
  price_pesewas: number;
  emoji: string;
  /** Public path or URL to a licensed product photo. Falls back to emoji. */
  image_url?: string | null;
  active?: boolean;
}

export interface Distributor {
  id: string;
  name: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  service_radius_km: number;
  subaccount_code?: string | null;
  active?: boolean;
}

export interface MatchedDistributor extends Distributor {
  distance_km: number;
  outside_zone: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product_id: string;
  name: string;
  unit: string;
  qty: number;
  unit_price_pesewas: number;
}

export interface Order {
  id: string;
  created_at: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  distributor_id: string;
  distributor_name: string;
  items: OrderItem[];
  subtotal_pesewas: number;
  delivery_fee_pesewas: number;
  platform_fee_pesewas: number;
  distributor_payout_pesewas: number;
  total_pesewas: number;
  paystack_reference: string | null;
  demo: boolean;
}

export function formatGHS(pesewas: number): string {
  return `GH₵ ${(pesewas / 100).toFixed(2)}`;
}
