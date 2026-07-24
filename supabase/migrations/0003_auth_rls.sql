-- Adepa — Phase 2: auth roles + row-level security
--
-- Enforces at the DATABASE layer that a distributor can only ever see/act on
-- their own orders + inventory, while admins manage everything. Consumer-facing
-- reads/writes go through the service-role key (getSupabaseAdmin), which bypasses
-- RLS, so nothing here changes the shopper flow. Additive only.

-- Role helpers. SECURITY DEFINER so they read profiles without triggering the
-- table's own RLS (avoids recursion) and stay cheap inside policies.
create or replace function public.jwt_role()
  returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.jwt_distributor_id()
  returns uuid language sql stable security definer set search_path = public as $$
  select distributor_id from public.profiles where id = auth.uid()
$$;

-- Every new auth user gets a profile (role 'distributor', no distributor_id →
-- sees nothing until an admin assigns them). Admins are promoted manually.
create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- profiles ----------------------------------------------------------------
-- (0002 already added "users read own profile")
create policy "admin manages profiles" on public.profiles for all to authenticated
  using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');

-- ---- orders ------------------------------------------------------------------
create policy "admin manages orders" on public.orders for all to authenticated
  using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');
create policy "distributor reads own orders" on public.orders for select to authenticated
  using (public.jwt_role() = 'distributor' and distributor_id = public.jwt_distributor_id());

-- ---- order_items -------------------------------------------------------------
create policy "admin manages order_items" on public.order_items for all to authenticated
  using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');
create policy "distributor reads own order_items" on public.order_items for select to authenticated
  using (
    public.jwt_role() = 'distributor'
    and exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.distributor_id = public.jwt_distributor_id()
    )
  );

-- ---- distributors ------------------------------------------------------------
create policy "admin manages distributors" on public.distributors for all to authenticated
  using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');
create policy "distributor reads own distributor" on public.distributors for select to authenticated
  using (public.jwt_role() = 'distributor' and id = public.jwt_distributor_id());

-- ---- products ----------------------------------------------------------------
-- (0001 already added public read of active products)
create policy "admin manages products" on public.products for all to authenticated
  using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');

-- ---- distributor_products (inventory) ---------------------------------------
-- (0002 already added public read of available inventory)
create policy "admin manages inventory" on public.distributor_products for all to authenticated
  using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');
create policy "distributor manages own inventory" on public.distributor_products for all to authenticated
  using (public.jwt_role() = 'distributor' and distributor_id = public.jwt_distributor_id())
  with check (public.jwt_role() = 'distributor' and distributor_id = public.jwt_distributor_id());

-- ---- order status transitions ------------------------------------------------
-- Distributors get NO direct UPDATE on orders; status changes flow through this
-- guarded RPC, which validates ownership + allowed transitions. Admins may set
-- any valid status.
create or replace function public.set_order_status(p_order_id uuid, p_status text)
  returns public.orders language plpgsql security definer set search_path = public as $$
declare
  v_role text := public.jwt_role();
  v_dist uuid := public.jwt_distributor_id();
  v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then raise exception 'order not found'; end if;

  if v_role = 'admin' then
    if p_status not in ('pending_payment','paid','dispatched','delivered','cancelled') then
      raise exception 'invalid status %', p_status;
    end if;
  elsif v_role = 'distributor' then
    if v_order.distributor_id is distinct from v_dist then
      raise exception 'not your order';
    end if;
    if not (
      (v_order.status = 'paid' and p_status = 'dispatched') or
      (v_order.status = 'dispatched' and p_status = 'delivered')
    ) then
      raise exception 'transition % -> % not allowed', v_order.status, p_status;
    end if;
  else
    raise exception 'not authorized';
  end if;

  update public.orders set status = p_status where id = p_order_id returning * into v_order;
  return v_order;
end $$;

revoke all on function public.set_order_status(uuid, text) from public;
grant execute on function public.set_order_status(uuid, text) to authenticated;
