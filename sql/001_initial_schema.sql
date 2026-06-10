-- CashOfferChat Phase 1 schema
-- Run this in the Supabase SQL editor before testing chat/lead storage.

create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_url text,
  status text not null default 'active'
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null
);

create table if not exists public.seller_leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new',
  name text not null,
  phone text not null,
  email text,
  property_address text,
  property_city text,
  timeline text,
  situation text,
  property_condition text,
  notes text,
  source_url text
);

create index if not exists idx_conversation_messages_conversation_id on public.conversation_messages(conversation_id);
create index if not exists idx_seller_leads_created_at on public.seller_leads(created_at desc);
create index if not exists idx_seller_leads_status on public.seller_leads(status);

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.seller_leads enable row level security;

-- No public RLS policies are added in Phase 1.
-- Server-side API routes use SUPABASE_SERVICE_ROLE_KEY only.
