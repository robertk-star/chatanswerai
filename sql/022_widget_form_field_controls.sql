-- 022_widget_form_field_controls.sql
-- Lets each business choose which fields show in the widget inquiry form.

alter table public.business_settings
  add column if not exists widget_form_show_name boolean not null default true,
  add column if not exists widget_form_show_email boolean not null default true,
  add column if not exists widget_form_show_phone boolean not null default true,
  add column if not exists widget_form_show_company boolean not null default true,
  add column if not exists widget_form_show_service_needed boolean not null default true,
  add column if not exists widget_form_show_preferred_timeline boolean not null default true,
  add column if not exists widget_form_show_message boolean not null default true;
