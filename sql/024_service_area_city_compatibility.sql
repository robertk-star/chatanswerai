-- 024_service_area_city_compatibility.sql
-- Fixes onboarding failures when older databases still require service_areas.city,
-- while newer ChatarAI code writes service area values into service_areas.name.

alter table public.service_areas
  add column if not exists name text;

update public.service_areas
set city = coalesce(city, name, 'General Service Area')
where city is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'service_areas'
      and column_name = 'city'
  ) then
    alter table public.service_areas alter column city drop not null;
  end if;
end $$;

-- Referral areas had the same older city-based shape in some installs.
alter table public.referral_areas
  add column if not exists name text;

update public.referral_areas
set city = coalesce(city, name, 'General Referral Area')
where city is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referral_areas'
      and column_name = 'city'
  ) then
    alter table public.referral_areas alter column city drop not null;
  end if;
end $$;
