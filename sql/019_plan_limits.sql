-- ChatAnswerAI Phase 19: Plan limits for multiple widget sites
-- Safe to run more than once.

alter table public.businesses
  add column if not exists plan_name text not null default 'starter',
  add column if not exists max_widget_sites integer not null default 1;

update public.businesses
set plan_name = 'starter'
where plan_name is null or plan_name not in ('starter', 'pro');

update public.businesses
set max_widget_sites = case
  when plan_name = 'pro' then 4
  else 1
end
where max_widget_sites is null or max_widget_sites < 1;

alter table public.businesses
  drop constraint if exists businesses_plan_name_check;

alter table public.businesses
  add constraint businesses_plan_name_check check (plan_name in ('starter', 'pro'));
