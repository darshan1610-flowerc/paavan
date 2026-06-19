-- PAAVAN admin schema: users, bikes, plans, bookings, deposits, waitlist,
-- inventory_log, admin_login_attempts + RLS policies + storage buckets.
--
-- Run this once against a fresh Supabase project (SQL editor or
-- `supabase db push`). Safe to re-run: everything is IF NOT EXISTS /
-- CREATE OR REPLACE / DROP POLICY IF EXISTS guarded.

-- ============================================================
-- USERS  (profile row, 1:1 with auth.users)
-- ============================================================

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique not null,
  name text,
  date_of_birth date,
  aadhaar_file_path text,
  aadhaar_submitted_at timestamptz,
  aadhaar_verified boolean not null default false,
  aadhaar_verified_at timestamptz,
  -- tri-state review workflow (aadhaar_verified above stays in sync as a
  -- convenience flag: true iff aadhaar_status = 'verified')
  aadhaar_status text not null default 'pending' check (aadhaar_status in ('pending', 'verified', 'rejected')),
  aadhaar_rejection_reason text,
  aadhaar_reviewed_by uuid references public.users (id),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth
-- (covers both customer phone-OTP signup and admin phone+password signup).
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, phone)
  values (new.id, coalesce(new.phone, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ============================================================
-- BIKES
-- ============================================================

create table if not exists public.bikes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  specs jsonb not null default '{}'::jsonb,
  price_per_day integer not null check (price_per_day >= 0),
  price_per_week integer not null check (price_per_week >= 0),
  price_per_month integer not null check (price_per_month >= 0),
  total_units integer not null default 0 check (total_units >= 0),
  available_units integer not null default 0 check (available_units >= 0),
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint available_units_within_total check (available_units <= total_units)
);

-- ============================================================
-- PLANS
-- ============================================================

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_days integer not null check (duration_days > 0),
  price integer not null check (price >= 0),
  type text not null check (type in ('student', 'delivery')),
  features jsonb not null default '[]'::jsonb
);

-- ============================================================
-- BOOKINGS
-- ============================================================

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text unique,
  user_id uuid not null references public.users (id) on delete restrict,
  bike_id uuid not null references public.bikes (id) on delete restrict,
  plan_id uuid not null references public.plans (id) on delete restrict,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  rental_amount integer not null check (rental_amount >= 0),
  deposit_amount integer not null default 1000 check (deposit_amount >= 0),
  platform_fee integer not null default 10 check (platform_fee >= 0),
  total_paid integer not null check (total_paid >= 0),
  payment_id text,
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_date >= start_date)
);

-- booking_ref is server-generated (format PVN-YYMM-NNNN), never client-supplied,
-- so it can't be spoofed or collide.
create sequence if not exists public.booking_ref_seq;

create or replace function public.set_booking_ref()
returns trigger
language plpgsql
as $$
begin
  if new.booking_ref is null then
    new.booking_ref := 'PVN-' || to_char(now(), 'YYMM') || '-' ||
      lpad(nextval('public.booking_ref_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_booking_ref on public.bookings;
create trigger trg_set_booking_ref
  before insert on public.bookings
  for each row execute function public.set_booking_ref();

create index if not exists idx_bookings_user_id on public.bookings (user_id);
create index if not exists idx_bookings_status on public.bookings (status);

-- ============================================================
-- DEPOSITS
-- ============================================================

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  user_id uuid not null references public.users (id) on delete restrict,
  amount integer not null default 1000 check (amount >= 0),
  status text not null default 'held' check (status in ('held', 'pending_review', 'approved', 'withheld')),
  return_video_path text,
  submitted_at timestamptz,
  window_closes_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.users (id),
  notes text,
  created_at timestamptz not null default now()
);

-- window_closes_at is always exactly submitted_at + 24h — trigger-computed,
-- never app-supplied, so the refund SLA can't be tampered with.
create or replace function public.set_deposit_window()
returns trigger
language plpgsql
as $$
begin
  if new.submitted_at is not null then
    new.window_closes_at := new.submitted_at + interval '24 hours';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_deposit_window on public.deposits;
create trigger trg_set_deposit_window
  before insert or update on public.deposits
  for each row execute function public.set_deposit_window();

create index if not exists idx_deposits_status on public.deposits (status);

-- ============================================================
-- WAITLIST
-- ============================================================

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes (id) on delete restrict,
  user_id uuid references public.users (id) on delete restrict,
  phone text not null,
  advance_deposit integer not null default 500 check (advance_deposit >= 0),
  payment_id text,
  position integer,
  status text not null default 'waiting' check (status in ('waiting', 'notified', 'converted', 'refunded')),
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_waitlist_bike_status on public.waitlist (bike_id, status);

-- ============================================================
-- APP SETTINGS  (admin/service-role only — no client policies at all)
-- ============================================================

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users (id)
);

-- ============================================================
-- INVENTORY LOG  (admin/service-role only — no client policies at all)
-- ============================================================

create table if not exists public.inventory_log (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes (id) on delete restrict,
  action text not null check (action in ('added', 'removed', 'damaged', 'repaired', 'stock_update')),
  units_changed integer not null,
  notes text,
  performed_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ADMIN LOGIN ATTEMPTS  (admin/service-role only — no client policies at all)
-- ============================================================

create table if not exists public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  ip_address text,
  success boolean not null,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_admin_login_attempts_phone_time
  on public.admin_login_attempts (phone, attempted_at desc);

-- ============================================================
-- ADMIN PASSWORD RESETS  (admin/service-role only — no client policies at all)
-- ============================================================

create table if not exists public.admin_password_resets (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_password_resets_phone
  on public.admin_password_resets (phone, created_at desc);

-- ============================================================
-- is_admin() — single source of truth for "is the current user an admin",
-- reused across every admin-all RLS policy below.
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.bikes enable row level security;
alter table public.plans enable row level security;
alter table public.bookings enable row level security;
alter table public.deposits enable row level security;
alter table public.waitlist enable row level security;
alter table public.inventory_log enable row level security;
alter table public.admin_login_attempts enable row level security;
alter table public.admin_password_resets enable row level security;
alter table public.app_settings enable row level security;

-- users: own row read/update, admin reads/writes all
drop policy if exists users_select_own_or_admin on public.users;
create policy users_select_own_or_admin on public.users
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_own_or_admin on public.users;
create policy users_update_own_or_admin on public.users
  for update using (id = auth.uid() or public.is_admin());

drop policy if exists users_admin_insert on public.users;
create policy users_admin_insert on public.users
  for insert with check (public.is_admin());

-- bikes: public read, admin write
drop policy if exists bikes_public_read on public.bikes;
create policy bikes_public_read on public.bikes
  for select using (true);

drop policy if exists bikes_admin_write on public.bikes;
create policy bikes_admin_write on public.bikes
  for all using (public.is_admin()) with check (public.is_admin());

-- plans: public read, admin write
drop policy if exists plans_public_read on public.plans;
create policy plans_public_read on public.plans
  for select using (true);

drop policy if exists plans_admin_write on public.plans;
create policy plans_admin_write on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

-- bookings: own rows, admin all
drop policy if exists bookings_select_own_or_admin on public.bookings;
create policy bookings_select_own_or_admin on public.bookings
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists bookings_admin_write on public.bookings;
create policy bookings_admin_write on public.bookings
  for insert with check (public.is_admin());

drop policy if exists bookings_admin_update on public.bookings;
create policy bookings_admin_update on public.bookings
  for update using (public.is_admin());

-- deposits: own rows, admin all
drop policy if exists deposits_select_own_or_admin on public.deposits;
create policy deposits_select_own_or_admin on public.deposits
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists deposits_admin_write on public.deposits;
create policy deposits_admin_write on public.deposits
  for all using (public.is_admin()) with check (public.is_admin());

-- waitlist: own rows, admin all
drop policy if exists waitlist_select_own_or_admin on public.waitlist;
create policy waitlist_select_own_or_admin on public.waitlist
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists waitlist_admin_write on public.waitlist;
create policy waitlist_admin_write on public.waitlist
  for all using (public.is_admin()) with check (public.is_admin());

-- inventory_log / admin_login_attempts / admin_password_resets / app_settings:
-- intentionally NO client policies. RLS is enabled with zero CREATE POLICY
-- statements, so only the service-role key (which bypasses RLS) can read or
-- write these tables.

-- ============================================================
-- STORAGE BUCKETS  (private — every file served via signed URL only)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('aadhaar-docs', 'aadhaar-docs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('return-videos', 'return-videos', false)
on conflict (id) do nothing;

-- No storage.objects policies are added for these buckets, so the anon/
-- authenticated client can never read or list them directly — every
-- access goes through a server route that mints a signed URL with the
-- service-role key.

-- bike-images is the one public bucket: bike photos are shown to every
-- visitor on the public bikes page, so a permanent public URL is correct
-- here (unlike Aadhaar docs / return videos, which are always private).
insert into storage.buckets (id, name, public)
values ('bike-images', 'bike-images', true)
on conflict (id) do nothing;

-- ============================================================
-- GRANTS  (table-level permission, separate from RLS)
-- ============================================================
-- RLS policies control which ROWS a role can see once it's allowed to
-- query the table at all — but Postgres still requires a baseline GRANT
-- before that. Tables created via the SQL Editor (as opposed to
-- Supabase's table-editor UI) don't get Supabase's usual automatic
-- grants, so we set them explicitly here. This is safe even for the
-- admin-only tables (inventory_log, admin_login_attempts,
-- admin_password_resets, app_settings): they have RLS enabled with zero
-- policies, so granting table-level access to `authenticated` doesn't
-- expose any rows — RLS still denies everything by default with no
-- matching policy. `service_role` bypasses RLS entirely once granted.

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.bikes, public.plans to anon;
