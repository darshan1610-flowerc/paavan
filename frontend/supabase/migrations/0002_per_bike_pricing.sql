-- Per-bike pricing: add yearly price tier to bikes table,
-- and add plan_type to bookings so new bookings don't require a plans table row.

-- Add yearly price column to bikes
alter table public.bikes
  add column if not exists price_per_year integer not null default 0
    check (price_per_year >= 0);

-- Allow bookings to carry plan_type directly (weekly / monthly / yearly)
-- instead of requiring a row in the plans table.
alter table public.bookings
  alter column plan_id drop not null;

alter table public.bookings
  add column if not exists plan_type text
    check (plan_type in ('weekly', 'monthly', 'yearly'));
