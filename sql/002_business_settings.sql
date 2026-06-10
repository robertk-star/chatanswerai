-- CashOfferChat Phase 2B business settings and AI knowledge base
-- Run this after sql/001_initial_schema.sql.

create extension if not exists pgcrypto;

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null unique default 'default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_name text not null default 'Sell My House Today Anywhere',
  website text,
  phone text,
  email text,
  primary_market text,
  description text,
  preferred_tone text not null default 'Friendly, plain-English, helpful, and no-pressure.',
  custom_instructions text,
  disclose_referral_contacts boolean not null default false
);

create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  city text not null,
  state text,
  notes text,
  is_active boolean not null default true
);

create table if not exists public.referral_areas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  city text not null,
  state text,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  auto_forward boolean not null default false,
  public_disclosure boolean not null default false
);

create table if not exists public.buying_criteria (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null check (category in ('will_buy', 'will_not_buy')),
  label text not null,
  notes text
);

create table if not exists public.custom_qa_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  trigger_question text not null,
  answer text not null,
  is_active boolean not null default true
);

create index if not exists idx_service_areas_city on public.service_areas(lower(city));
create index if not exists idx_referral_areas_city on public.referral_areas(lower(city));
create index if not exists idx_buying_criteria_category on public.buying_criteria(category);
create index if not exists idx_custom_qa_items_active on public.custom_qa_items(is_active);

alter table public.business_settings enable row level security;
alter table public.service_areas enable row level security;
alter table public.referral_areas enable row level security;
alter table public.buying_criteria enable row level security;
alter table public.custom_qa_items enable row level security;

-- No public RLS policies are added in Phase 2B.
-- Server-side routes use SUPABASE_SERVICE_ROLE_KEY only.

insert into public.business_settings (
  singleton_key,
  business_name,
  website,
  phone,
  email,
  primary_market,
  description,
  preferred_tone,
  custom_instructions
)
values (
  'default',
  'Sell My House Today Anywhere',
  'https://sellmyhousetodayanywhere.com/',
  '972-555-0100',
  null,
  'Plano, Texas and nearby North Texas areas',
  'Plano-area cash home buyer demo that reviews houses as-is for possible cash offers.',
  'Friendly, plain-English, helpful, local, and no-pressure.',
  'Do not make offers over chat. Do not guarantee that the company will buy a property. Do not give legal, tax, financial, or foreclosure advice. Encourage a short intake form when the seller wants a property review.'
)
on conflict (singleton_key) do nothing;
