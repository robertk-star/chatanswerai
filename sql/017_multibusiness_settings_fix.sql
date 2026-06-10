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
  add column if not exists widget_title text default 'Seller Intake Assistant',
  add column if not exists widget_subtitle text default 'Answers questions and collects property basics',
  add column if not exists widget_bubble_text text default 'Questions? Chat with us',
  add column if not exists widget_quote_button_text text default 'Enter House Info for a Quote',
  add column if not exists widget_success_message text default 'Thanks. Your information was received. Someone from the team can review the details and follow up.',
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
