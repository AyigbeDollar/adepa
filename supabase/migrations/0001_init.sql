-- Adepa — initial schema
-- Distributors, products, orders. All access from the app goes through
-- server-side API routes using the service role; RLS is enabled everywhere
-- as defense in depth, with a public read policy only on products.

create table public.distributors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null,
  city text not null,
  lat double precision not null,
  lng double precision not null,
  service_radius_km double precision not null default 15,
  subaccount_code text, -- Paystack subaccount (SUB_xxx) for split settlement
  phone text,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key, -- stable slug ids, e.g. "p-gino-210"
  name text not null,
  brand text not null,
  category text not null,
  unit text not null,
  price_pesewas integer not null check (price_pesewas > 0),
  emoji text not null default '🛒',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key,
  created_at timestamptz not null default now(),
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','dispatched','delivered','cancelled')),
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  lat double precision,
  lng double precision,
  distributor_id uuid not null references public.distributors (id),
  subtotal_pesewas integer not null,
  delivery_fee_pesewas integer not null,
  platform_fee_pesewas integer not null,
  distributor_payout_pesewas integer not null,
  total_pesewas integer not null,
  paystack_reference text unique,
  demo boolean not null default false
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  unit text not null,
  qty integer not null check (qty between 1 and 99),
  unit_price_pesewas integer not null
);

create index orders_distributor_idx on public.orders (distributor_id, created_at desc);
create index orders_reference_idx on public.orders (paystack_reference);
create index order_items_order_idx on public.order_items (order_id);

alter table public.distributors enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Catalog is public; everything else is service-role only (no policies).
create policy "public can read active products"
  on public.products for select
  to anon, authenticated
  using (active = true);
