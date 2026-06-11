-- 025_editable_chat_cta.sql
-- Lets each business customize the short call-to-action appended to chat answers.

alter table public.business_settings
  add column if not exists chat_cta_text text;
