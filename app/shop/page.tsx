"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { CATEGORIES } from "@/lib/demo-data";
import {
  formatGHS,
  type MatchedDistributor,
  type Order,
  type Product,
} from "@/lib/types";

const DELIVERY_FEE_PESEWAS = 1500;

const CITY_PRESETS = [
  { label: "Accra", lat: 5.556, lng: -0.1969 },
  { label: "Tema", lat: 5.6698, lng: -0.0166 },
  { label: "Kumasi", lat: 6.6885, lng: -1.6244 },
  { label: "Takoradi", lat: 4.8956, lng: -1.7557 },
];

interface MatchState {
  distributor: MatchedDistributor;
  products: Product[];
  lat: number;
  lng: number;
}

export default function ShopPage() {
  const router = useRouter();
  const cart = useCart();
  const [match, setMatch] = useState<MatchState | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const restored = useRef(false);

  // Restore a previous match; open cart if ?cart=1.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = sessionStorage.getItem("adepa-match");
      if (raw) setMatch(JSON.parse(raw));
    } catch {
      // ignore
    }
    if (new URLSearchParams(window.location.search).get("cart") === "1") {
      setCartOpen(true);
    }
  }, []);

  const fetchMatch = useCallback(async (lat: number, lng: number) => {
    setLocating(true);
    setLocError(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Matching failed");
      const state: MatchState = {
        distributor: json.distributor,
        products: json.products,
        lat,
        lng,
      };
      setMatch(state);
      sessionStorage.setItem("adepa-match", JSON.stringify(state));
    } catch (err) {
      setLocError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLocating(false);
    }
  }, []);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError("Location is not available on this device — pick your city.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchMatch(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLocating(false);
        setLocError("We couldn't read your location — pick your city instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchMatch]);

  const products = useMemo(() => {
    if (!match) return [];
    return category === "All"
      ? match.products
      : match.products.filter((p) => p.category === category);
  }, [match, category]);

  const submitCheckout = useCallback(
    async (form: FormData) => {
      if (!match) return;
      setSubmitting(true);
      setFormError(null);
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: form.get("name"),
            phone: form.get("phone"),
            email: form.get("email"),
            address: form.get("address"),
            lat: match.lat,
            lng: match.lng,
            distributor_id: match.distributor.id,
            items: cart.items.map((it) => ({
              product_id: it.product.id,
              qty: it.qty,
            })),
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Checkout failed");
        const order: Order = json.order;
        localStorage.setItem(`adepa-order-${order.id}`, JSON.stringify(order));
        cart.clear();
        if (json.payment_url) {
          window.location.href = json.payment_url;
        } else {
          router.push(`/order/${order.id}`);
        }
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Checkout failed. Try again."
        );
        setSubmitting(false);
      }
    },
    [match, cart, router]
  );

  /* ---------------------------------- UI ---------------------------------- */

  if (!match) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 pb-24 pt-24 text-center">
        <div className="fade-up text-5xl">📍</div>
        <h1 className="fade-up fade-up-1 mt-6 text-4xl font-semibold tracking-tight">
          Where should we deliver?
        </h1>
        <p className="fade-up fade-up-2 mt-3 text-[15px] leading-6 text-muted">
          Adepa routes your order to the distributor covering your
          neighbourhood, so it arrives fast and fresh.
        </p>
        <button
          onClick={useMyLocation}
          disabled={locating}
          className="fade-up fade-up-3 mt-8 w-full rounded-full bg-accent px-7 py-3.5 text-[15px] font-medium text-white shadow-sm transition-all hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
        >
          {locating ? "Finding your distributor…" : "Use my location"}
        </button>
        <div className="fade-up fade-up-3 mt-6 w-full">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted">
            or pick your city
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CITY_PRESETS.map((c) => (
              <button
                key={c.label}
                disabled={locating}
                onClick={() => fetchMatch(c.lat, c.lng)}
                className="rounded-2xl bg-surface px-4 py-3 text-[14px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {locError && (
          <p className="mt-5 text-[13px] text-red-600">{locError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-28">
      {/* Distributor banner */}
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-surface px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Your distributor
          </p>
          <p className="mt-0.5 truncate text-[15px] font-semibold tracking-tight">
            {match.distributor.name}
          </p>
          <p className="truncate text-[12px] text-muted">
            {match.distributor.area} · {match.distributor.distance_km} km away
            {match.distributor.outside_zone && " · extended delivery"}
          </p>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem("adepa-match");
            setMatch(null);
            setCategory("All");
          }}
          className="ml-4 shrink-0 text-[13px] font-medium text-accent hover:opacity-70"
        >
          Change
        </button>
      </div>

      {/* Category pills */}
      <div className="no-scrollbar sticky top-12 z-30 -mx-5 flex gap-2 overflow-x-auto bg-background/95 px-5 py-4 backdrop-blur">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
              category === c
                ? "bg-foreground text-white"
                : "bg-surface text-muted shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Floating cart bar */}
      {cart.count > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-5 z-40 px-5">
          <button
            onClick={() => setCartOpen(true)}
            className="mx-auto flex w-full max-w-md items-center justify-between rounded-full bg-foreground py-3.5 pl-6 pr-5 text-white shadow-xl transition-transform active:scale-[0.98]"
          >
            <span className="text-[14px] font-medium">
              View basket · {cart.count} item{cart.count > 1 ? "s" : ""}
            </span>
            <span className="text-[15px] font-semibold">
              {formatGHS(cart.subtotalPesewas)}
            </span>
          </button>
        </div>
      )}

      {/* Cart / checkout sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => !submitting && setCartOpen(false)}
          />
          <div className="sheet-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-2xl">
            <div className="hairline-b flex items-center justify-between px-6 py-4">
              <h2 className="text-[17px] font-semibold tracking-tight">
                {checkingOut ? "Checkout" : "Your basket"}
              </h2>
              <button
                onClick={() =>
                  checkingOut ? setCheckingOut(false) : setCartOpen(false)
                }
                className="text-[13px] font-medium text-accent hover:opacity-70"
              >
                {checkingOut ? "‹ Back" : "Close"}
              </button>
            </div>

            {cart.items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <span className="text-4xl">🧺</span>
                <p className="mt-4 text-[15px] font-medium">
                  Your basket is empty
                </p>
                <p className="mt-1 text-[13px] text-muted">
                  Add a few essentials to get started.
                </p>
              </div>
            ) : checkingOut ? (
              <form
                action={submitCheckout}
                className="flex flex-1 flex-col overflow-y-auto px-6 py-5"
              >
                <div className="space-y-3">
                  <Field name="name" label="Full name" placeholder="Ama Mensah" />
                  <Field
                    name="phone"
                    label="Mobile money number"
                    placeholder="0241234567"
                    inputMode="tel"
                  />
                  <Field
                    name="email"
                    label="Email (optional)"
                    placeholder="ama@example.com"
                    type="email"
                    required={false}
                  />
                  <Field
                    name="address"
                    label="Delivery address"
                    placeholder="House 12, Osu Oxford Street, Accra"
                  />
                </div>
                <Totals subtotal={cart.subtotalPesewas} />
                {formError && (
                  <p className="mt-3 text-[13px] text-red-600">{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 w-full rounded-full bg-accent py-3.5 text-[15px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting
                    ? "Placing your order…"
                    : `Pay ${formatGHS(cart.subtotalPesewas + DELIVERY_FEE_PESEWAS)}`}
                </button>
                <p className="mb-2 mt-3 text-center text-[11px] leading-4 text-muted">
                  Secured by Paystack — MTN MoMo, Telecel Cash, AT Money &
                  cards. Your distributor is paid the instant you are charged.
                </p>
              </form>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {cart.items.map((it) => (
                    <div
                      key={it.product.id}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        {it.product.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium">
                          {it.product.name}
                        </p>
                        <p className="text-[12px] text-muted">
                          {formatGHS(it.product.price_pesewas)} · {it.product.unit}
                        </p>
                      </div>
                      <Stepper
                        qty={it.qty}
                        onChange={(q) => cart.setQty(it.product.id, q)}
                      />
                    </div>
                  ))}
                </div>
                <div className="hairline-b border-t border-hairline px-6 pb-6 pt-2">
                  <Totals subtotal={cart.subtotalPesewas} />
                  <button
                    onClick={() => setCheckingOut(true)}
                    className="mt-4 w-full rounded-full bg-accent py-3.5 text-[15px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98]"
                  >
                    Continue to checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ sub-components ----------------------------- */

function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const inCart = cart.items.find((it) => it.product.id === product.id);
  return (
    <div className="group flex flex-col rounded-3xl bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="flex h-24 items-center justify-center rounded-2xl bg-background text-5xl transition-transform group-hover:scale-105">
        {product.emoji}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted">
        {product.brand}
      </p>
      <p className="mt-0.5 text-[14px] font-semibold leading-5 tracking-tight">
        {product.name}
      </p>
      <p className="text-[12px] text-muted">{product.unit}</p>
      <div className="mt-3 flex flex-1 items-end justify-between">
        <span className="text-[14px] font-semibold">
          {formatGHS(product.price_pesewas)}
        </span>
        {inCart ? (
          <Stepper
            qty={inCart.qty}
            onChange={(q) => cart.setQty(product.id, q)}
          />
        ) : (
          <button
            onClick={() => cart.add(product)}
            aria-label={`Add ${product.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-lg font-medium text-white transition-all hover:bg-accent-dark active:scale-90"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({
  qty,
  onChange,
}: {
  qty: number;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-background p-1">
      <button
        onClick={() => onChange(qty - 1)}
        aria-label="Decrease quantity"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[15px] text-muted transition-colors hover:bg-black/5"
      >
        −
      </button>
      <span className="w-5 text-center text-[13px] font-semibold">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        aria-label="Increase quantity"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[15px] text-muted transition-colors hover:bg-black/5"
      >
        +
      </button>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  inputMode,
  required = true,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  inputMode?: "tel" | "email" | "text";
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-black/25 focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}

function Totals({ subtotal }: { subtotal: number }) {
  return (
    <div className="mt-4 space-y-1.5 text-[13px]">
      <div className="flex justify-between text-muted">
        <span>Subtotal</span>
        <span>{formatGHS(subtotal)}</span>
      </div>
      <div className="flex justify-between text-muted">
        <span>Delivery (in-house riders)</span>
        <span>{formatGHS(DELIVERY_FEE_PESEWAS)}</span>
      </div>
      <div className="flex justify-between pt-1 text-[15px] font-semibold">
        <span>Total</span>
        <span>{formatGHS(subtotal + DELIVERY_FEE_PESEWAS)}</span>
      </div>
    </div>
  );
}
