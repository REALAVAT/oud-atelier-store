-- Oud Atelier — row level security

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.reviews enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_events enable row level security;
alter table public.addresses enable row level security;
alter table public.store_settings enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Profiles: users read their own row, admins read all. Only name/phone are user-editable.
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin update" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Catalog: everyone sees active products; admins manage everything.
create policy "products: public read active" on public.products
  for select using (status = 'active' or public.is_admin());
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "variants: public read" on public.product_variants
  for select using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.status = 'active')
  );
create policy "variants: admin write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- Reviews: public read; signed-in customers can post unverified reviews as themselves.
create policy "reviews: public read" on public.reviews
  for select using (true);
create policy "reviews: customer insert" on public.reviews
  for insert to authenticated
  with check (user_id = auth.uid() and verified = false);
create policy "reviews: admin manage" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- Discount codes are validated server-side; only admins read/write them directly.
create policy "discounts: admin" on public.discount_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- Orders are created by the server (service role). Customers read their own.
create policy "orders: read own or admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "orders: admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "order events: read own or admin" on public.order_status_events
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "order events: admin insert" on public.order_status_events
  for insert with check (public.is_admin());

-- Address book
create policy "addresses: own" on public.addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Settings: public read, admin write
create policy "settings: public read" on public.store_settings
  for select using (true);
create policy "settings: admin write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Newsletter subscribers are written by the server only.
create policy "newsletter: admin read" on public.newsletter_subscribers
  for select using (public.is_admin());
