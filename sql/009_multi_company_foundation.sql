-- CashOfferChat Phase 3A schema
-- Multi-company foundation for future SaaS accounts.
-- Run after sql/008_widget_analytics.sql.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  slug text not null unique,
  owner_email text,
  status text not null default 'active',
  notes text
);

create table if not exists public.widget_sites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_id uuid references public.businesses(id) on delete cascade,
  site_id text not null unique,
  name text not null,
  domain text,
  allowed_domains text,
  is_active boolean not null default true,
  notes text
);

insert into public.businesses (name, slug, owner_email, status, notes)
values ('Sell My House Today Anywhere', 'sell-my-house-today-anywhere', null, 'active', 'Default demo business for CashOfferChat.')
on conflict (slug) do update set
  name = excluded.name,
  status = excluded.status,
  updated_at = now();

insert into public.widget_sites (business_id, site_id, name, domain, allowed_domains, is_active, notes)
select b.id,
       'demo',
       'Sell My House Today Anywhere Demo',
       'sellmyhousetodayanywhere.com',
       'sellmyhousetodayanywhere.com
www.sellmyhousetodayanywhere.com
cashofferchat.com',
       true,
       'Default demo widget site.'
from public.businesses b
where b.slug = 'sell-my-house-today-anywhere'
on conflict (site_id) do update set
  business_id = excluded.business_id,
  name = excluded.name,
  domain = excluded.domain,
  allowed_domains = excluded.allowed_domains,
  is_active = true,
  updated_at = now();

alter table public.conversations add column if not exists site_id text default 'demo';
alter table public.conversations add column if not exists business_id uuid references public.businesses(id) on delete set null;

alter table public.seller_leads add column if not exists site_id text default 'demo';
alter table public.seller_leads add column if not exists business_id uuid references public.businesses(id) on delete set null;

alter table public.widget_events add column if not exists business_id uuid references public.businesses(id) on delete set null;

update public.conversations c
set site_id = coalesce(c.site_id, 'demo'),
    business_id = coalesce(c.business_id, ws.business_id)
from public.widget_sites ws
where ws.site_id = 'demo' and (c.business_id is null or c.site_id is null);

update public.seller_leads l
set site_id = coalesce(l.site_id, 'demo'),
    business_id = coalesce(l.business_id, ws.business_id)
from public.widget_sites ws
where ws.site_id = 'demo' and (l.business_id is null or l.site_id is null);

update public.widget_events e
set business_id = coalesce(e.business_id, ws.business_id)
from public.widget_sites ws
where ws.site_id = coalesce(e.site_id, 'demo') and e.business_id is null;

create index if not exists idx_widget_sites_site_id on public.widget_sites(site_id);
create index if not exists idx_widget_sites_business_id on public.widget_sites(business_id);
create index if not exists idx_seller_leads_site_id on public.seller_leads(site_id);
create index if not exists idx_seller_leads_business_id on public.seller_leads(business_id);
create index if not exists idx_conversations_site_id on public.conversations(site_id);
create index if not exists idx_widget_events_site_id on public.widget_events(site_id);

alter table public.businesses enable row level security;
alter table public.widget_sites enable row level security;

-- No public RLS policies are added in Phase 3A.
-- Server-side API routes continue using SUPABASE_SERVICE_ROLE_KEY only.
