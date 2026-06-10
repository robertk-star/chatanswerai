-- CashOfferChat Phase 3E repair: ensure businesses table has all expected columns

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.businesses
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists name text,
  add column if not exists website text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists primary_market text,
  add column if not exists description text,
  add column if not exists is_active boolean not null default true;

update public.businesses
set name = coalesce(name, 'Unnamed Business')
where name is null;

alter table public.businesses
  alter column name set not null;

create index if not exists idx_businesses_name on public.businesses(name);
create index if not exists idx_businesses_is_active on public.businesses(is_active);

alter table public.businesses enable row level security;
