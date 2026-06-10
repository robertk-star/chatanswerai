-- CashOfferChat Phase 3E repair: ensure businesses.slug exists and is populated

alter table public.businesses
  add column if not exists slug text;

update public.businesses
set slug = lower(regexp_replace(coalesce(name, id::text), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

update public.businesses
set slug = trim(both '-' from slug)
where slug like '-%' or slug like '%-';

update public.businesses
set slug = id::text
where slug is null or slug = '';

create unique index if not exists idx_businesses_slug_unique on public.businesses(slug);

alter table public.businesses
  alter column slug set not null;
