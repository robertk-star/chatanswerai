-- ChatAnswerAI Phase 18: widget color text controls
-- Adds separate font color controls for the widget header and quote button.

alter table public.business_settings
  add column if not exists widget_header_text_color text default '#ffffff',
  add column if not exists widget_button_text_color text default '#0f172a';

update public.business_settings
set
  widget_header_color = coalesce(nullif(widget_header_color, ''), '#0f172a'),
  widget_header_text_color = coalesce(nullif(widget_header_text_color, ''), '#ffffff'),
  widget_button_color = coalesce(nullif(widget_button_color, ''), '#f5b51b'),
  widget_button_text_color = coalesce(nullif(widget_button_text_color, ''), '#0f172a'),
  updated_at = now();
