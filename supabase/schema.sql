create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  email text not null unique,
  display_name text not null default 'Admin',
  created_at timestamptz not null default timezone('utc', now()),
  constraint admin_users_username_format check (username ~ '^[a-z0-9._-]{3,32}$'),
  constraint admin_users_username_lowercase check (username = lower(username))
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_location_lat double precision,
  customer_location_lng double precision,
  customer_location_link text,
  customer_notes text,
  items jsonb not null default '[]'::jsonb,
  item_count integer not null default 0,
  total_amount integer not null check (total_amount >= 0),
  whatsapp_message text not null,
  order_channel text not null default 'website',
  status text not null default 'baru',
  created_at timestamptz not null default timezone('utc', now()),
  constraint orders_status_check check (status in ('baru', 'diproses', 'selesai', 'dibatalkan'))
);

create table if not exists public.custom_cake_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_location_lat double precision,
  customer_location_lng double precision,
  customer_location_link text,
  flavor text not null,
  flavor_label text not null,
  size_value text not null,
  size_label text not null,
  serving_estimate text not null,
  filling_value text,
  filling_label text,
  topping_value text,
  topping_label text,
  design_style_value text,
  design_style_label text,
  cake_message text,
  estimated_price integer,
  inspiration_category_value text,
  inspiration_category_label text,
  inspiration_name text,
  customer_notes text,
  design_image_path text,
  design_image_url text,
  design_image_name text,
  design_image_mime_type text,
  design_image_size_bytes bigint,
  whatsapp_message text not null,
  request_channel text not null default 'website',
  status text not null default 'baru',
  created_at timestamptz not null default timezone('utc', now()),
  constraint custom_cake_requests_status_check check (status in ('baru', 'diproses', 'selesai', 'dibatalkan'))
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists custom_cake_requests_created_at_idx on public.custom_cake_requests (created_at desc);
create index if not exists custom_cake_requests_status_idx on public.custom_cake_requests (status);

alter table public.orders
  add column if not exists customer_email text;

alter table public.orders
  add column if not exists customer_location_lat double precision;

alter table public.orders
  add column if not exists customer_location_lng double precision;

alter table public.orders
  add column if not exists customer_location_link text;

alter table public.custom_cake_requests
  add column if not exists customer_email text;

alter table public.custom_cake_requests
  add column if not exists customer_address text;

alter table public.custom_cake_requests
  add column if not exists customer_location_lat double precision;

alter table public.custom_cake_requests
  add column if not exists customer_location_lng double precision;

alter table public.custom_cake_requests
  add column if not exists customer_location_link text;

alter table public.custom_cake_requests
  add column if not exists filling_value text;

alter table public.custom_cake_requests
  add column if not exists filling_label text;

alter table public.custom_cake_requests
  add column if not exists topping_value text;

alter table public.custom_cake_requests
  add column if not exists topping_label text;

alter table public.custom_cake_requests
  add column if not exists design_style_value text;

alter table public.custom_cake_requests
  add column if not exists design_style_label text;

alter table public.custom_cake_requests
  add column if not exists cake_message text;

alter table public.custom_cake_requests
  add column if not exists estimated_price integer;

alter table public.custom_cake_requests
  add column if not exists inspiration_category_value text;

alter table public.custom_cake_requests
  add column if not exists inspiration_category_label text;

alter table public.custom_cake_requests
  add column if not exists inspiration_name text;

alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.custom_cake_requests enable row level security;

create or replace function public.is_admin_bootstrap_available()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (
    select 1
    from public.admin_users
  );
$$;

drop policy if exists "Admin users can read their own profile" on public.admin_users;
create policy "Admin users can read their own profile"
on public.admin_users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can create custom cake requests" on public.custom_cake_requests;
create policy "Public can create custom cake requests"
on public.custom_cake_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.id = auth.uid()
  )
);

drop policy if exists "Admins can read custom cake requests" on public.custom_cake_requests;
create policy "Admins can read custom cake requests"
on public.custom_cake_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.id = auth.uid()
  )
);

drop policy if exists "Public can upload custom cake images" on storage.objects;
create policy "Public can upload custom cake images"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'custom-cake-designs');

create or replace function public.claim_first_admin_profile(
  input_username text,
  input_display_name text default null
)
returns public.admin_users
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_row public.admin_users;
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt()->>'email', ''));
  normalized_username text := lower(trim(input_username));
  normalized_display_name text := nullif(trim(input_display_name), '');
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_admin_bootstrap_available() then
    raise exception 'Admin bootstrap is no longer available';
  end if;

  if current_email = '' then
    raise exception 'Authenticated email not found';
  end if;

  insert into public.admin_users (id, username, email, display_name)
  values (
    current_user_id,
    normalized_username,
    current_email,
    coalesce(normalized_display_name, 'Admin')
  )
  returning * into inserted_row;

  return inserted_row;
end;
$$;

create or replace function public.get_admin_login_email(input_username text)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select email
  from public.admin_users
  where username = lower(trim(input_username))
  limit 1;
$$;

revoke all on function public.get_admin_login_email(text) from public;
grant execute on function public.get_admin_login_email(text) to anon, authenticated;
revoke all on function public.is_admin_bootstrap_available() from public;
grant execute on function public.is_admin_bootstrap_available() to anon, authenticated;
revoke all on function public.claim_first_admin_profile(text, text) from public;
grant execute on function public.claim_first_admin_profile(text, text) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'custom_cake_requests'
  ) then
    alter publication supabase_realtime add table public.custom_cake_requests;
  end if;
end
$$;

comment on function public.get_admin_login_email(text) is
'Dipakai login client-side untuk mengubah username admin menjadi email Supabase Auth.';

comment on function public.is_admin_bootstrap_available() is
'Mengembalikan true selama tabel admin_users masih kosong sehingga akun admin pertama bisa dibuat.';

comment on function public.claim_first_admin_profile(text, text) is
'Mendaftarkan user yang sedang login sebagai admin pertama menggunakan email dari Supabase Auth.';
