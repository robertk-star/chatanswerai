-- CashOfferChat Phase 3M: Webhook / CRM integrations

alter table public.business_settings
  add column if not exists webhook_enabled boolean not null default false,
  add column if not exists webhook_url text,
  add column if not exists webhook_secret text;

alter table public.seller_leads
  add column if not exists webhook_sent_at timestamptz,
  add column if not exists webhook_error text;

create index if not exists idx_seller_leads_webhook_sent_at on public.seller_leads(webhook_sent_at desc);
