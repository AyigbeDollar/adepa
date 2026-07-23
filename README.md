# adepa — everyday goods, delivered from the source

Adepa connects Ghana's FMCG distributors directly to consumers at home.
Customers share their location, Adepa routes the order to the distributor
covering that zone, in-house riders deliver, and Paystack split settlement
pays the distributor **the instant the customer pays** — the platform's cut
is deducted automatically.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · Supabase (Postgres) ·
Paystack (GHS: MTN MoMo, Telecel Cash, AT Money, cards) · Vercel.

## How the money flows

1. Checkout recomputes all prices server-side (client prices are never trusted).
2. A Paystack transaction is initialised against the distributor's
   **subaccount**, with `transaction_charge` set to
   `platform fee (10% of subtotal) + delivery fee`.
3. Paystack settles the remainder directly to the distributor — no manual
   payouts, no float held by the platform.
4. The webhook (`/api/paystack/webhook`, HMAC-verified) marks the order paid.

## Demo mode

With no env vars configured the app runs fully in **demo mode**: bundled
catalog + distributors, simulated instant payment. This is what deploys out
of the box. Configure the env vars below to go live.

## Going live

### 1. Supabase

1. Create a project at [database.new](https://database.new).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then
   `supabase/seed.sql`.
3. Copy the project URL + service role key into env vars (see `.env.example`).

### 2. Paystack

1. Create a Ghana Paystack business, get the secret key.
2. For each distributor, create a **subaccount** (Paystack dashboard →
   Subaccounts) with their settlement bank / MoMo details, and store the
   `SUB_xxx` code in the distributor's `subaccount_code` column.
3. Set the webhook URL to `https://<your-domain>/api/paystack/webhook`.

### 3. Vercel

Set the env vars from `.env.example` in Vercel → Project → Settings →
Environment Variables, then redeploy.

## Local development

```bash
npm install
cp .env.example .env.local   # optional — demo mode works with no env
npm run dev
```

## Architecture notes

- All database access goes through server-side API routes with the service
  role; RLS is enabled on every table (public read on products only).
- Distributor matching: haversine distance against active distributors'
  service radii; nearest in-zone wins, nearest overall as fallback
  (flagged `outside_zone`).
- Order ids are unguessable UUIDs and act as the order-status token.

## Roadmap

- Per-distributor inventory & pricing (`distributor_inventory`)
- Rider app + live order tracking (Supabase Realtime)
- Distributor dashboard (orders, payouts, stock)
- Customer accounts + repeat-basket one-tap reorder (Supabase Auth)
