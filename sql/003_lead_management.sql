-- ChatAnswerAI Phase 2C lead management fields
-- Run after sql/001_initial_schema.sql and sql/002_business_settings.sql.

alter table public.seller_leads
  add column if not exists admin_notes text,
  add column if not exists last_contacted_at timestamptz;

create index if not exists idx_seller_leads_last_contacted_at on public.seller_leads(last_contacted_at desc);
