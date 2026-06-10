-- 021_widget_quick_questions.sql
-- Adds up to four custom quick-reply/common-question buttons for each business widget.

alter table public.business_settings
  add column if not exists widget_quick_question_1 text,
  add column if not exists widget_quick_question_2 text,
  add column if not exists widget_quick_question_3 text,
  add column if not exists widget_quick_question_4 text;
