-- ChatAnswerAI Phase 2H: widget branding, CTA, phone, and allowed-domain settings
-- Run this after sql/006_plano_demo_defaults.sql.

alter table public.business_settings
  add column if not exists widget_title text not null default 'Seller Intake Assistant',
  add column if not exists widget_subtitle text not null default 'Answers questions and collects property basics',
  add column if not exists widget_bubble_text text not null default 'Questions? Chat with us',
  add column if not exists widget_quote_button_text text not null default 'Enter House Info for a Quote',
  add column if not exists widget_success_message text not null default 'Thanks. Your information was received. Someone from the team can review the details and follow up.',
  add column if not exists widget_primary_color text not null default '#0f2440',
  add column if not exists widget_accent_color text not null default '#f5b84b',
  add column if not exists widget_show_call_button boolean not null default true,
  add column if not exists widget_call_button_text text not null default 'Call Now',
  add column if not exists widget_allowed_domains text;

update public.business_settings
set
  widget_title = coalesce(nullif(widget_title, ''), 'Seller Intake Assistant'),
  widget_subtitle = coalesce(nullif(widget_subtitle, ''), 'Answers questions and collects property basics'),
  widget_bubble_text = coalesce(nullif(widget_bubble_text, ''), 'Questions? Chat with us'),
  widget_quote_button_text = coalesce(nullif(widget_quote_button_text, ''), 'Enter House Info for a Quote'),
  widget_success_message = coalesce(nullif(widget_success_message, ''), 'Thanks. Your information was received. Someone from the team can review the details and follow up.'),
  widget_primary_color = coalesce(nullif(widget_primary_color, ''), '#0f2440'),
  widget_accent_color = coalesce(nullif(widget_accent_color, ''), '#f5b84b'),
  widget_show_call_button = coalesce(widget_show_call_button, true),
  widget_call_button_text = coalesce(nullif(widget_call_button_text, ''), 'Call Now'),
  widget_allowed_domains = coalesce(nullif(widget_allowed_domains, ''), 'sellmyhousetodayanywhere.com
www.sellmyhousetodayanywhere.com
chatanswerai.com')
where singleton_key = 'default';
