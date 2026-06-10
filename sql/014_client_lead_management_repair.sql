-- Optional safety repair for Phase 3H client lead management
-- Run only if seller_leads.admin_notes or seller_leads.last_contacted_at are missing.

alter table public.seller_leads
  add column if not exists admin_notes text,
  add column if not exists last_contacted_at timestamptz;

create index if not exists idx_seller_leads_last_contacted_at on public.seller_leads(last_contacted_at desc);
