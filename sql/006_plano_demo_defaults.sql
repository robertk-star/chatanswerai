-- ChatAnswerAI Phase 2G Plano demo defaults
-- Run this after sql/005_managed_faq_settings.sql if the project was previously seeded with Austin demo settings.

update public.business_settings
set
  business_name = 'Sell My House Today Anywhere',
  website = 'https://sellmyhousetodayanywhere.com/',
  phone = '972-555-0100',
  primary_market = 'Plano, Texas and nearby North Texas areas',
  description = 'Plano-area cash home buyer demo that reviews houses as-is for possible cash offers.',
  updated_at = now()
where singleton_key = 'default';

delete from public.service_areas
where lower(city) in (
  'austin',
  'round rock',
  'cedar park',
  'pflugerville',
  'georgetown',
  'buda',
  'kyle',
  'san marcos',
  'bastrop'
);

insert into public.service_areas (city, state, notes, is_active)
select city, 'TX', null, true
from (values
  ('Plano'),
  ('Frisco'),
  ('McKinney'),
  ('Allen'),
  ('Richardson'),
  ('Carrollton'),
  ('Garland'),
  ('Lewisville'),
  ('Dallas')
) as new_areas(city)
where not exists (
  select 1 from public.service_areas existing
  where lower(existing.city) = lower(new_areas.city)
);
