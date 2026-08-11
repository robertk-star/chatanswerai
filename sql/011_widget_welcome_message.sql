-- ChatarAI / ChatAnswerAI: editable widget welcome message
-- Safe to run more than once.

alter table public.business_settings
  add column if not exists widget_welcome_message text;

update public.business_settings
set widget_welcome_message = 'Hi! I can answer questions about this business and help collect a service inquiry. What can I help you with today?'
where widget_welcome_message is null or trim(widget_welcome_message) = '';
