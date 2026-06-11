-- 023_widget_form_builder.sql
-- Adds a flexible widget form builder and storage for custom field answers.

create table if not exists public.widget_form_fields (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null default 'text' check (field_type in ('text', 'textarea', 'email', 'phone', 'number', 'date', 'select', 'yes_no')),
  placeholder text,
  options text,
  is_enabled boolean not null default true,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  is_system boolean not null default false
);

create unique index if not exists idx_widget_form_fields_business_key
  on public.widget_form_fields(business_id, field_key);

create index if not exists idx_widget_form_fields_business_order
  on public.widget_form_fields(business_id, sort_order);

alter table public.seller_leads
  add column if not exists custom_fields jsonb not null default '{}'::jsonb;
