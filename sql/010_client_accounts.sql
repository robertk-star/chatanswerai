-- ChatAnswerAI Phase 3B: Client accounts + scoped dashboard
-- Run after prior migrations.

create extension if not exists pgcrypto;

create table if not exists public.business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null,
  name text,
  role text not null default 'owner',
  password_hash text not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  unique(email)
);

create index if not exists idx_business_users_business_id on public.business_users(business_id);
create index if not exists idx_business_users_email on public.business_users(lower(email));

alter table public.business_users enable row level security;

-- No public RLS policies are added in this phase.
-- Server-side routes use SUPABASE_SERVICE_ROLE_KEY only.
