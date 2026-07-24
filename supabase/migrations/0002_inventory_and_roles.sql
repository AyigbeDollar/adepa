-- Adepa — Phase 1: per-distributor inventory + user roles
--
-- Purpose: make product availability location/distributor-specific (the model
-- the app promises) and lay the auth foundation for the admin + distributor
-- portal. Fully ADDITIVE — no existing table or row is changed, so the live
-- site keeps working. Until a distributor has inventory rows, the app falls
-- back to the global catalog (see lib/data.ts getProductsForDistributor).

-- 1) Inventory: which products each distributor stocks, with an optional
--    per-distributor price override. `products` stays the shared FMCG catalog.
create table public.distributor_products (
  id bigint generated always as identity primary key,
  distributor_id uuid not null references public.distributors (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  price_pesewas integer check (price_pesewas is null or price_pesewas > 0), -- null = use catalog price
  in_stock boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (distributor_id, product_id)
);

create index distributor_products_distributor_idx
  on public.distributor_products (distributor_id)
  where active;

-- 2) Roles: link a Supabase auth user to a role, and (for distributor users)
--    to the distributor whose orders/inventory they may manage. Used by the
--    admin dashboard + distributor portal in later phases.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'distributor' check (role in ('admin', 'distributor')),
  distributor_id uuid references public.distributors (id) on delete set null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.distributor_products enable row level security;
alter table public.profiles enable row level security;

-- The catalog (and which store stocks what) is public; app reads go through the
-- service role server-side, so these policies are defense-in-depth, mirroring
-- the existing public-read policy on products.
create policy "public reads available inventory"
  on public.distributor_products for select
  to anon, authenticated
  using (active = true and in_stock = true);

-- A signed-in user may read only their own profile row.
create policy "users read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());
