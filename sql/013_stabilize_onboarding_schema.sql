-- CashOfferChat Phase 3E Stabilization
-- This repair migration aligns key onboarding tables with current app expectations.

create extension if not exists pgcrypto;

-- businesses table
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.businesses
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists website text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists primary_market text,
  add column if not exists description text,
  add column if not exists is_active boolean not null default true;

update public.businesses
set name = coalesce(name, 'Unnamed Business')
where name is null;

update public.businesses
set slug = lower(regexp_replace(coalesce(slug, name, id::text), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

update public.businesses
set slug = trim(both '-' from slug)
where slug like '-%' or slug like '%-';

update public.businesses
set slug = id::text
where slug is null or slug = '';

alter table public.businesses
  alter column name set not null,
  alter column slug set not null;

create unique index if not exists idx_businesses_slug_unique on public.businesses(slug);
create index if not exists idx_businesses_is_active on public.businesses(is_active);

-- widget_sites table
create table if not exists public.widget_sites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.widget_sites
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists site_id text,
  add column if not exists name text,
  add column if not exists site_name text,
  add column if not exists domain text,
  add column if not exists allowed_domains text,
  add column if not exists is_active boolean not null default true;

update public.widget_sites
set name = coalesce(name, site_name, site_id, id::text)
where name is null;

update public.widget_sites
set site_name = coalesce(site_name, name, site_id, id::text)
where site_name is null;

update public.widget_sites
set site_id = coalesce(site_id, lower(regexp_replace(coalesce(name, id::text), '[^a-zA-Z0-9]+', '-', 'g')))
where site_id is null or site_id = '';

alter table public.widget_sites
  alter column name set not null,
  alter column site_id set not null;

create unique index if not exists idx_widget_sites_site_id_unique on public.widget_sites(site_id);
create index if not exists idx_widget_sites_business_id on public.widget_sites(business_id);
create index if not exists idx_widget_sites_is_active on public.widget_sites(is_active);

-- business_settings table
create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.business_settings
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists business_name text,
  add column if not exists website text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists primary_market text,
  add column if not exists business_description text,
  add column if not exists description text,
  add column if not exists custom_ai_instructions text,
  add column if not exists lead_notification_email text,
  add column if not exists from_email text,
  add column if not exists widget_title text default 'Seller Intake Assistant',
  add column if not exists widget_subtitle text default 'Answers questions and collects property basics',
  add column if not exists widget_bubble_text text default 'Questions? Chat with us',
  add column if not exists widget_quote_button_text text default 'Enter House Info for a Quote',
  add column if not exists widget_success_message text default 'Thanks. Your information was received. Someone from the team can review the details and follow up.',
  add column if not exists widget_header_color text default '#0f172a',
  add column if not exists widget_button_color text default '#f5b51b',
  add column if not exists widget_show_call_button boolean not null default true,
  add column if not exists widget_call_button_text text default 'Call Now',
  add column if not exists widget_allowed_domains text;

update public.business_settings
set business_description = coalesce(business_description, description)
where business_description is null;

update public.business_settings
set description = coalesce(description, business_description)
where description is null;

create index if not exists idx_business_settings_business_id on public.business_settings(business_id);

-- service_areas table
create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.service_areas
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists name text,
  add column if not exists notes text;

create index if not exists idx_service_areas_business_id on public.service_areas(business_id);

-- referral_areas table
create table if not exists public.referral_areas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.referral_areas
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists name text,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists notes text,
  add column if not exists auto_forward boolean not null default false;

create index if not exists idx_referral_areas_business_id on public.referral_areas(business_id);

-- property_buying_criteria table
create table if not exists public.property_buying_criteria (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.property_buying_criteria
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists type text,
  add column if not exists category text,
  add column if not exists label text,
  add column if not exists notes text;

create index if not exists idx_property_buying_criteria_business_id on public.property_buying_criteria(business_id);

-- business_users table
create table if not exists public.business_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.business_users
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists email text,
  add column if not exists name text,
  add column if not exists role text not null default 'owner',
  add column if not exists password_hash text,
  add column if not exists is_active boolean not null default true,
  add column if not exists last_login_at timestamptz;

create index if not exists idx_business_users_business_id on public.business_users(business_id);
create index if not exists idx_business_users_email on public.business_users(lower(email));

-- managed FAQ table
create table if not exists public.managed_faq_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.managed_faq_items
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists question text,
  add column if not exists answer text,
  add column if not exists is_enabled boolean not null default true,
  add column if not exists sort_order integer not null default 0;

create index if not exists idx_managed_faq_items_business_id on public.managed_faq_items(business_id);

-- Enable RLS where applicable. Server-side routes use service role.
alter table public.businesses enable row level security;
alter table public.widget_sites enable row level security;
alter table public.business_settings enable row level security;
alter table public.service_areas enable row level security;
alter table public.referral_areas enable row level security;
alter table public.property_buying_criteria enable row level security;
alter table public.business_users enable row level security;
alter table public.managed_faq_items enable row level security;
