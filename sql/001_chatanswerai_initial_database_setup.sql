-- ChatAnswerAI Initial Database Setup
-- Fresh Supabase setup script for the new generic service-business chat product.
-- This is NOT a ChatAnswerAI migration.
-- Run this once in a new Supabase project before testing the app.
--
-- Phase 1 keeps some internal legacy table names such as seller_leads and
-- property_buying_criteria so the current ChatAnswerAI-derived code can run.
-- User-facing labels are generic in the app. Internal table renaming can be
-- handled in a later cleanup phase after the product is stable.


-- ============================================================
-- Source setup section: 001_initial_schema.sql
-- ============================================================
-- ChatAnswerAI Phase 1 schema
-- Run this in the Supabase SQL editor before testing chat/lead storage.

create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_url text,
  status text not null default 'active'
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null
);

create table if not exists public.seller_leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new',
  name text not null,
  phone text not null,
  email text,
  property_address text,
  property_city text,
  timeline text,
  situation text,
  property_condition text,
  notes text,
  source_url text
);

create index if not exists idx_conversation_messages_conversation_id on public.conversation_messages(conversation_id);
create index if not exists idx_seller_leads_created_at on public.seller_leads(created_at desc);
create index if not exists idx_seller_leads_status on public.seller_leads(status);

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.seller_leads enable row level security;

-- No public RLS policies are added in Phase 1.
-- Server-side API routes use SUPABASE_SERVICE_ROLE_KEY only.


-- ============================================================
-- Source setup section: 002_business_settings.sql
-- ============================================================
-- ChatAnswerAI Phase 2B business settings and AI knowledge base
-- Run this after sql/001_initial_schema.sql.

create extension if not exists pgcrypto;

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null unique default 'default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_name text not null default 'ChatAnswerAI Demo Business',
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
  'ChatAnswerAI Demo Business',
  'https://chatanswerai.com/',
  '972-555-0100',
  null,
  'United States',
  'Generic service-business demo that answers questions, captures service inquiries, and saves leads.',
  'Friendly, plain-English, helpful, local, and no-pressure.',
  'Answer based on the business settings and FAQs. Do not make unsupported claims. Do not give legal, medical, financial, or tax advice. Encourage the visitor to submit a service inquiry when they want help.'
)
on conflict (singleton_key) do nothing;


-- ============================================================
-- Source setup section: 003_lead_management.sql
-- ============================================================
-- ChatAnswerAI Phase 2C lead management fields
-- Run after sql/001_initial_schema.sql and sql/002_business_settings.sql.

alter table public.seller_leads
  add column if not exists admin_notes text,
  add column if not exists last_contacted_at timestamptz;

create index if not exists idx_seller_leads_last_contacted_at on public.seller_leads(last_contacted_at desc);


-- ============================================================
-- Source setup section: 004_lead_notifications.sql
-- ============================================================
-- ChatAnswerAI Phase 2D lead notification fields
-- Run after sql/001_initial_schema.sql, sql/002_business_settings.sql, and sql/003_lead_management.sql.

alter table public.seller_leads
  add column if not exists notification_sent_at timestamptz,
  add column if not exists notification_error text;

alter table public.business_settings
  add column if not exists lead_notification_email text,
  add column if not exists from_email text;

create index if not exists idx_seller_leads_notification_sent_at on public.seller_leads(notification_sent_at desc);


-- ============================================================
-- Source setup section: 005_managed_faq_settings.sql
-- ============================================================
-- ChatAnswerAI Phase 2F Hotfix: managed FAQ knowledge base mode
-- Run this after sql/004_lead_notifications.sql.

alter table public.business_settings
  add column if not exists use_custom_faq_knowledge_base boolean not null default false;


-- ============================================================
-- Source setup section: 007_widget_branding_settings.sql
-- ============================================================
-- ChatAnswerAI Phase 2H: widget branding, CTA, phone, and allowed-domain settings
-- Run this after sql/006_plano_demo_defaults.sql.

alter table public.business_settings
  add column if not exists widget_title text not null default 'Service Inquiry Assistant',
  add column if not exists widget_subtitle text not null default 'Answers questions and collects service inquiry details',
  add column if not exists widget_bubble_text text not null default 'Questions? Chat with us',
  add column if not exists widget_quote_button_text text not null default 'Request Information',
  add column if not exists widget_success_message text not null default 'Thanks. Your inquiry was received. Someone from the team can review the details and follow up.',
  add column if not exists widget_primary_color text not null default '#0f2440',
  add column if not exists widget_accent_color text not null default '#f5b84b',
  add column if not exists widget_show_call_button boolean not null default true,
  add column if not exists widget_call_button_text text not null default 'Call Now',
  add column if not exists widget_allowed_domains text;

update public.business_settings
set
  widget_title = coalesce(nullif(widget_title, ''), 'Service Inquiry Assistant'),
  widget_subtitle = coalesce(nullif(widget_subtitle, ''), 'Answers questions and collects service inquiry details'),
  widget_bubble_text = coalesce(nullif(widget_bubble_text, ''), 'Questions? Chat with us'),
  widget_quote_button_text = coalesce(nullif(widget_quote_button_text, ''), 'Request Information'),
  widget_success_message = coalesce(nullif(widget_success_message, ''), 'Thanks. Your inquiry was received. Someone from the team can review the details and follow up.'),
  widget_primary_color = coalesce(nullif(widget_primary_color, ''), '#0f2440'),
  widget_accent_color = coalesce(nullif(widget_accent_color, ''), '#f5b84b'),
  widget_show_call_button = coalesce(widget_show_call_button, true),
  widget_call_button_text = coalesce(nullif(widget_call_button_text, ''), 'Call Now'),
  widget_allowed_domains = coalesce(nullif(widget_allowed_domains, ''), 'chatanswerai.com
www.chatanswerai.com
chatanswerai.com')
where singleton_key = 'default';


-- ============================================================
-- Source setup section: 008_widget_analytics.sql
-- ============================================================
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


-- ============================================================
-- Source setup section: 009_multi_company_foundation.sql
-- ============================================================
-- ChatAnswerAI Phase 3A schema
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
values ('ChatAnswerAI Demo Business', 'chatanswerai-demo-business', null, 'active', 'Default generic demo business for ChatAnswerAI.')
on conflict (slug) do update set
  name = excluded.name,
  status = excluded.status,
  updated_at = now();

insert into public.widget_sites (business_id, site_id, name, domain, allowed_domains, is_active, notes)
select b.id,
       'demo',
       'ChatAnswerAI Demo Business Demo',
       'chatanswerai.com',
       'chatanswerai.com
www.chatanswerai.com
chatanswerai.com',
       true,
       'Default demo widget site.'
from public.businesses b
where b.slug = 'chatanswerai-demo-business'
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


-- ============================================================
-- Source setup section: 010_client_accounts.sql
-- ============================================================
-- ChatAnswerAI Phase 3B: Client accounts + scoped dashboard
-- Run after prior migrations.

create extension if not exists pgcrypto;

create table if not exists public.business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null,
  name text,
  role text not null default 'owner',
  password_hash text not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  unique(email)
);

create index if not exists idx_business_users_business_id on public.business_users(business_id);
create index if not exists idx_business_users_email on public.business_users(lower(email));

alter table public.business_users enable row level security;

-- No public RLS policies are added in this phase.
-- Server-side routes use SUPABASE_SERVICE_ROLE_KEY only.


-- ============================================================
-- Source setup section: 011_repair_businesses_columns.sql
-- ============================================================
-- ChatAnswerAI Phase 3E repair: ensure businesses table has all expected columns

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


-- ============================================================
-- Source setup section: 012_repair_business_slug.sql
-- ============================================================
-- ChatAnswerAI Phase 3E repair: ensure businesses.slug exists and is populated

alter table public.businesses
  add column if not exists slug text;

update public.businesses
set slug = lower(regexp_replace(coalesce(name, id::text), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

update public.businesses
set slug = trim(both '-' from slug)
where slug like '-%' or slug like '%-';

update public.businesses
set slug = id::text
where slug is null or slug = '';

create unique index if not exists idx_businesses_slug_unique on public.businesses(slug);

alter table public.businesses
  alter column slug set not null;


-- ============================================================
-- Source setup section: 013_stabilize_onboarding_schema.sql
-- ============================================================
-- ChatAnswerAI Phase 3E Stabilization
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
  add column if not exists widget_title text default 'Service Inquiry Assistant',
  add column if not exists widget_subtitle text default 'Answers questions and collects service inquiry details',
  add column if not exists widget_bubble_text text default 'Questions? Chat with us',
  add column if not exists widget_quote_button_text text default 'Request Information',
  add column if not exists widget_success_message text default 'Thanks. Your inquiry was received. Someone from the team can review the details and follow up.',
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


-- ============================================================
-- Source setup section: 014_client_lead_management_repair.sql
-- ============================================================
-- Optional safety repair for Phase 3H client lead management
-- Run only if seller_leads.admin_notes or seller_leads.last_contacted_at are missing.

alter table public.seller_leads
  add column if not exists admin_notes text,
  add column if not exists last_contacted_at timestamptz;

create index if not exists idx_seller_leads_last_contacted_at on public.seller_leads(last_contacted_at desc);


-- ============================================================
-- Source setup section: 015_widget_events_event_type_repair.sql
-- ============================================================
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


-- ============================================================
-- Source setup section: 016_webhook_integrations.sql
-- ============================================================
-- ChatAnswerAI Phase 3M: Webhook / CRM integrations

alter table public.business_settings
  add column if not exists webhook_enabled boolean not null default false,
  add column if not exists webhook_url text,
  add column if not exists webhook_secret text;

alter table public.seller_leads
  add column if not exists webhook_sent_at timestamptz,
  add column if not exists webhook_error text;

create index if not exists idx_seller_leads_webhook_sent_at on public.seller_leads(webhook_sent_at desc);


-- ============================================================
-- Source setup section: 017_multibusiness_settings_fix.sql
-- ============================================================
-- ChatAnswerAI Hotfix: business_settings multi-business support
-- Fixes old singleton constraint from single-business demo stage.

create extension if not exists pgcrypto;

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
  add column if not exists widget_title text default 'Service Inquiry Assistant',
  add column if not exists widget_subtitle text default 'Answers questions and collects service inquiry details',
  add column if not exists widget_bubble_text text default 'Questions? Chat with us',
  add column if not exists widget_quote_button_text text default 'Request Information',
  add column if not exists widget_success_message text default 'Thanks. Your inquiry was received. Someone from the team can review the details and follow up.',
  add column if not exists widget_header_color text default '#0f172a',
  add column if not exists widget_button_color text default '#f5b51b',
  add column if not exists widget_show_call_button boolean not null default true,
  add column if not exists widget_call_button_text text default 'Call Now',
  add column if not exists widget_allowed_domains text,
  add column if not exists webhook_enabled boolean not null default false,
  add column if not exists webhook_url text,
  add column if not exists webhook_secret text;

-- If the old singleton_key column exists, make its values unique per row so it no longer blocks multi-business settings.
alter table public.business_settings
  add column if not exists singleton_key text;

update public.business_settings
set singleton_key = coalesce(business_id::text, id::text)
where singleton_key is null
   or singleton_key = ''
   or singleton_key = 'default';

-- Drop old unique constraints/indexes related to singleton_key if present.
alter table public.business_settings
  drop constraint if exists business_settings_singleton_key_key;

drop index if exists public.business_settings_singleton_key_key;
drop index if exists public.idx_business_settings_singleton_key_unique;

-- Attach any old settings row with missing business_id to the first business, if possible.
update public.business_settings
set business_id = (
  select id from public.businesses order by created_at asc limit 1
)
where business_id is null
  and exists (select 1 from public.businesses);

-- Keep description fields in sync where possible.
update public.business_settings
set business_description = coalesce(business_description, description)
where business_description is null;

update public.business_settings
set description = coalesce(description, business_description)
where description is null;

-- Each business should have one settings row.
create unique index if not exists idx_business_settings_business_id_unique
on public.business_settings(business_id)
where business_id is not null;

create index if not exists idx_business_settings_business_id
on public.business_settings(business_id);

alter table public.business_settings enable row level security;


-- ============================================================
-- Source setup section: 018_widget_color_text_controls.sql
-- ============================================================
-- ChatAnswerAI Phase 18: widget color text controls
-- Adds separate font color controls for the widget header and quote button.

alter table public.business_settings
  add column if not exists widget_header_text_color text default '#ffffff',
  add column if not exists widget_button_text_color text default '#0f172a';

update public.business_settings
set
  widget_header_color = coalesce(nullif(widget_header_color, ''), '#0f172a'),
  widget_header_text_color = coalesce(nullif(widget_header_text_color, ''), '#ffffff'),
  widget_button_color = coalesce(nullif(widget_button_color, ''), '#f5b51b'),
  widget_button_text_color = coalesce(nullif(widget_button_text_color, ''), '#0f172a'),
  updated_at = now();


-- ============================================================
-- Source setup section: 019_plan_limits.sql
-- ============================================================
-- ChatAnswerAI Phase 19: Plan limits for multiple widget sites
-- Safe to run more than once.

alter table public.businesses
  add column if not exists plan_name text not null default 'starter',
  add column if not exists max_widget_sites integer not null default 1;

update public.businesses
set plan_name = 'starter'
where plan_name is null or plan_name not in ('starter', 'pro');

update public.businesses
set max_widget_sites = case
  when plan_name = 'pro' then 4
  else 1
end
where max_widget_sites is null or max_widget_sites < 1;

alter table public.businesses
  drop constraint if exists businesses_plan_name_check;

alter table public.businesses
  add constraint businesses_plan_name_check check (plan_name in ('starter', 'pro'));


-- ============================================================
-- Chat Answer AI Foundation Fields
-- ============================================================
-- Chat Answer AI Phase 1 Foundation
-- Adds generic business knowledge fields and generic lead fields while keeping
-- legacy internal table names are kept for Phase 1 code compatibility.

alter table public.business_settings
  add column if not exists business_type text default 'General Service Business',
  add column if not exists services_offered text,
  add column if not exists services_not_offered text,
  add column if not exists service_area text,
  add column if not exists target_customer text,
  add column if not exists important_disclaimers_or_limits text;

-- business_description and custom_ai_instructions already exist in some builds.
alter table public.business_settings
  add column if not exists business_description text,
  add column if not exists custom_ai_instructions text;

update public.business_settings
set business_type = coalesce(nullif(business_type, ''), 'General Service Business')
where business_type is null or business_type = '';

update public.business_settings
set service_area = coalesce(service_area, primary_market)
where service_area is null and primary_market is not null;

update public.business_settings
set services_offered = coalesce(services_offered, '')
where services_offered is null;

update public.business_settings
set services_not_offered = coalesce(services_not_offered, '')
where services_not_offered is null;

alter table public.seller_leads
  add column if not exists company text,
  add column if not exists service_needed text,
  add column if not exists message text,
  add column if not exists preferred_timeline text;

create index if not exists idx_seller_leads_service_needed on public.seller_leads(service_needed);
create index if not exists idx_business_settings_business_type on public.business_settings(business_type);

-- Optional SaffHire seed helper. Edit the WHERE clause to the correct business name/id before running manually.
-- update public.business_settings
-- set business_type = 'Background Screening',
--     business_description = 'SaffHire provides employment background screening services.',
--     services_offered = 'Employment background checks\nDrug screening\nEmployment verification\nEducation verification\nCriminal record searches',
--     services_not_offered = 'Legal advice\nAttorney services',
--     service_area = 'United States',
--     target_customer = 'Employers and HR teams that need employment background screening services.',
--     custom_ai_instructions = 'Answer questions about background checks, screening services, turnaround times, ordering services, and general employer screening questions. Do not give legal advice or pretend to be an attorney.',
--     important_disclaimers_or_limits = 'SaffHire does not provide legal advice and does not act as an attorney. Employers should consult their own counsel for legal compliance questions.',
--     updated_at = now()
-- where business_name ilike '%SaffHire%';


-- ============================================================
-- Final Phase 1 Generic Defaults
-- ============================================================

update public.business_settings
set
  business_type = coalesce(nullif(business_type, ''), 'General Service Business'),
  business_description = coalesce(nullif(business_description, ''), 'ChatAnswerAI Demo Business uses an AI chat widget to answer service-business questions and capture service inquiries.'),
  services_offered = coalesce(nullif(services_offered, ''), 'General service inquiries\nCustomer questions\nConsultation requests\nLead capture'),
  services_not_offered = coalesce(nullif(services_not_offered, ''), 'Legal advice\nMedical advice\nFinancial advice\nTax advice'),
  service_area = coalesce(nullif(service_area, ''), 'United States'),
  target_customer = coalesce(nullif(target_customer, ''), 'Visitors who have questions or want to request information from a service business.'),
  custom_ai_instructions = coalesce(nullif(custom_ai_instructions, ''), 'Answer based on the configured business knowledge and managed FAQs. If the answer is not supported, say the team can follow up instead of guessing.'),
  important_disclaimers_or_limits = coalesce(nullif(important_disclaimers_or_limits, ''), 'This chat does not provide legal, medical, financial, or tax advice.'),
  widget_title = coalesce(nullif(widget_title, ''), 'Service Inquiry Assistant'),
  widget_subtitle = coalesce(nullif(widget_subtitle, ''), 'Ask a question or request information'),
  widget_bubble_text = coalesce(nullif(widget_bubble_text, ''), 'Questions? Chat with us'),
  widget_quote_button_text = coalesce(nullif(widget_quote_button_text, ''), 'Request Information'),
  widget_success_message = coalesce(nullif(widget_success_message, ''), 'Thanks. Your inquiry was received. Someone from the team can review the details and follow up.'),
  updated_at = now();
