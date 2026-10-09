-- Oud Atelier — core schema

create extension if not exists "pgcrypto";

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Catalog -------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null,
  tagline jsonb not null,
  description jsonb not null,
  collection text not null check (collection in ('oud', 'floral', 'fresh', 'gift-sets')),
  family text not null check (family in ('oud', 'amber', 'floral', 'fresh', 'woody', 'musk')),
  gender text not null check (gender in ('feminine', 'masculine', 'unisex')),
  intensity smallint not null default 3 check (intensity between 1 and 5),
  occasions text[] not null default '{}',
  notes jsonb not null default '{"top":[],"heart":[],"base":[]}',
  images text[] not null default '{}',
  bestseller boolean not null default false,
  is_new boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('active', 'draft')),
  seo jsonb not null default '{"title":{"en":"","ar":""},"description":{"en":"","ar":""}}',
  rating numeric(2, 1) not null default 5.0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_collection_idx on public.products (collection) where status = 'active';

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size_ml integer not null check (size_ml > 0),
  price_aed numeric(10, 2) not null check (price_aed >= 0),
  compare_at_aed numeric(10, 2),
  stock integer not null default 0 check (stock >= 0),
  sku text not null unique,
  label jsonb,
  created_at timestamptz not null default now()
);

create index product_variants_product_idx on public.product_variants (product_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author text not null,
  location text,
  rating smallint not null check (rating between 1 and 5),
  title text not null,
  body text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index reviews_product_idx on public.reviews (product_id, created_at desc);

-- Commerce ------------------------------------------------------------------

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  type text not null check (type in ('percent', 'fixed')),
  value numeric(10, 2) not null check (value > 0),
  min_subtotal_aed numeric(10, 2),
  active boolean not null default true,
  usage_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('OA-' || nextval('public.order_number_seq')),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  customer_name text not null,
  items jsonb not null,
  subtotal_aed numeric(10, 2) not null,
  discount_aed numeric(10, 2) not null default 0,
  shipping_aed numeric(10, 2) not null default 0,
  gift_wrap_aed numeric(10, 2) not null default 0,
  total_aed numeric(10, 2) not null,
  discount_code text,
  gift_wrap boolean not null default false,
  gift_message text,
  shipping_method text not null check (shipping_method in ('standard', 'express', 'same-day')),
  address jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null default 'stripe' check (payment_method in ('stripe', 'demo')),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  stripe_session_id text,
  access_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
);

create index order_status_events_order_idx on public.order_status_events (order_id, created_at);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  emirate text not null
    check (emirate in ('dubai', 'abu-dhabi', 'sharjah', 'ajman', 'umm-al-quwain', 'ras-al-khaimah', 'fujairah')),
  area text not null,
  street text not null,
  building text not null,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_idx on public.addresses (user_id);

create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  email text primary key,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

-- Helpers -------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
create trigger store_settings_touch before update on public.store_settings
  for each row execute function public.touch_updated_at();

-- Decrements stock and counts discount usage once an order is paid.
create or replace function public.apply_order_inventory(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then
    return;
  end if;

  update public.product_variants pv
     set stock = greatest(0, pv.stock - li.quantity)
    from jsonb_to_recordset(v_order.items) as li("variantId" uuid, quantity int)
   where pv.id = li."variantId";

  if v_order.discount_code is not null then
    update public.discount_codes set usage_count = usage_count + 1 where code = v_order.discount_code;
  end if;
end;
$$;

revoke execute on function public.apply_order_inventory(uuid) from public, anon, authenticated;
grant execute on function public.apply_order_inventory(uuid) to service_role;

create view public.customer_summaries
with (security_invoker = true)
as
select
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.created_at,
  count(o.id) filter (where o.status not in ('pending', 'cancelled')) as orders_count,
  coalesce(sum(o.total_aed) filter (where o.status not in ('pending', 'cancelled')), 0) as total_spent_aed
from public.profiles p
left join public.orders o on o.user_id = p.id
where p.role = 'customer'
group by p.id;
