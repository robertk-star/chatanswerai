-- CashOfferChat Phase 2F Hotfix: managed FAQ knowledge base mode
-- Run this after sql/004_lead_notifications.sql.

alter table public.business_settings
  add column if not exists use_custom_faq_knowledge_base boolean not null default false;
