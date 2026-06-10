-- CashOfferChat Phase 2D lead notification fields
-- Run after sql/001_initial_schema.sql, sql/002_business_settings.sql, and sql/003_lead_management.sql.

alter table public.seller_leads
  add column if not exists notification_sent_at timestamptz,
  add column if not exists notification_error text;

alter table public.business_settings
  add column if not exists lead_notification_email text,
  add column if not exists from_email text;

create index if not exists idx_seller_leads_notification_sent_at on public.seller_leads(notification_sent_at desc);
