-- Generic Business Chat Phase 1 Foundation
-- Run this after the existing CashOfferChat migrations.
-- Adds generic business knowledge fields and generic lead fields while keeping
-- the existing CashOfferChat table names for backward compatibility.

alter table public.business_settings
  add column if not exists business_type text default 'General Service Business',
  add column if not exists services_offered text,
  add column if not exists services_not_offered text,
  add column if not exists service_area text,
  add column if not exists target_customer text,
  add column if not exists important_disclaimers_or_limits text;

-- business_description and custom_ai_instructions already exist in some builds.
alter table public.business_settings
  add column if not exists business_description text,
  add column if not exists custom_ai_instructions text;

update public.business_settings
set business_type = coalesce(nullif(business_type, ''), 'General Service Business')
where business_type is null or business_type = '';

update public.business_settings
set service_area = coalesce(service_area, primary_market)
where service_area is null and primary_market is not null;

update public.business_settings
set services_offered = coalesce(services_offered, '')
where services_offered is null;

update public.business_settings
set services_not_offered = coalesce(services_not_offered, '')
where services_not_offered is null;

alter table public.seller_leads
  add column if not exists company text,
  add column if not exists service_needed text,
  add column if not exists message text,
  add column if not exists preferred_timeline text;

create index if not exists idx_seller_leads_service_needed on public.seller_leads(service_needed);
create index if not exists idx_business_settings_business_type on public.business_settings(business_type);

-- Optional SaffHire seed helper. Edit the WHERE clause to the correct business name/id before running manually.
-- update public.business_settings
-- set business_type = 'Background Screening',
--     business_description = 'SaffHire provides employment background screening services.',
--     services_offered = 'Employment background checks\nDrug screening\nEmployment verification\nEducation verification\nCriminal record searches',
--     services_not_offered = 'Legal advice\nAttorney services',
--     service_area = 'United States',
--     target_customer = 'Employers and HR teams that need employment background screening services.',
--     custom_ai_instructions = 'Answer questions about background checks, screening services, turnaround times, ordering services, and general employer screening questions. Do not give legal advice or pretend to be an attorney.',
--     important_disclaimers_or_limits = 'SaffHire does not provide legal advice and does not act as an attorney. Employers should consult their own counsel for legal compliance questions.',
--     updated_at = now()
-- where business_name ilike '%SaffHire%';
