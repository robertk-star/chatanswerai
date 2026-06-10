-- ChatAnswerAI Phase 3J repair: widget_events event_type schema
-- Fixes: column widget_events.event_type does not exist

create extension if not exists pgcrypto;

create table if not exists public.widget_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.widget_events
  add column if not exists event_type text,
  add column if not exists type text,
  add column if not exists site_id text,
  add column if not exists source_url text,
  add column if not exists page_url text,
  add column if not exists domain text,
  add column if not exists conversation_id uuid references public.conversations(id) on delete set null,
  add column if not exists lead_id uuid references public.seller_leads(id) on delete set null,
  add column if not exists business_id uuid references public.businesses(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.widget_events
set event_type = coalesce(event_type, type, 'unknown')
where event_type is null or event_type = '';

update public.widget_events
set type = coalesce(type, event_type)
where type is null or type = '';

alter table public.widget_events
  alter column event_type set default 'unknown';

create index if not exists idx_widget_events_created_at on public.widget_events(created_at desc);
create index if not exists idx_widget_events_event_type on public.widget_events(event_type);
create index if not exists idx_widget_events_type on public.widget_events(type);
create index if not exists idx_widget_events_site_id on public.widget_events(site_id);
create index if not exists idx_widget_events_domain on public.widget_events(domain);
create index if not exists idx_widget_events_lead_id on public.widget_events(lead_id);
create index if not exists idx_widget_events_business_id on public.widget_events(business_id);

alter table public.widget_events enable row level security;
