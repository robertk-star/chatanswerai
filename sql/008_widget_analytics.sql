-- ChatAnswerAI Phase 2I widget analytics
-- Run this after sql/007_widget_branding_settings.sql.

create table if not exists public.widget_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  site_id text not null default 'demo',
  event_name text not null,
  source_url text,
  page_domain text,
  conversation_id uuid references public.conversations(id) on delete set null,
  lead_id uuid references public.seller_leads(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_widget_events_created_at on public.widget_events(created_at desc);
create index if not exists idx_widget_events_site_event on public.widget_events(site_id, event_name);
create index if not exists idx_widget_events_source_url on public.widget_events(source_url);

alter table public.widget_events enable row level security;

-- No public RLS policies are added in Phase 2I.
-- Server-side API routes use SUPABASE_SERVICE_ROLE_KEY only.
