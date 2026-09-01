-- Client planning portal: celebrations and who can see them.
-- Run once in the Supabase SQL editor. Safe to re-run.

create extension if not exists pgcrypto;

-- A celebration. One row per wedding, not per person.
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Who it belongs to
  partner_one_name text not null,
  partner_two_name text,
  display_name text not null,
  email text,
  phone text,

  -- The celebration itself
  event_date date,
  date_undecided boolean not null default false,
  venue text,
  location text,
  guest_count text,

  -- What they bought. Planning package and design tier are separate choices:
  -- someone can take Full Planning with Elegant florals.
  planning_package text not null default 'custom',
  design_tier text,

  -- Where they came from, if they arrived through the website
  lead_id uuid references public.leads(id) on delete set null,

  status text not null default 'active',
  notes text,

  constraint clients_planning_package_check check (
    planning_package in ('venue_finder', 'coordinating', 'partial_planning', 'full_planning', 'custom')
  ),
  constraint clients_design_tier_check check (
    design_tier is null or design_tier in ('essentials', 'design-florals', 'production')
  ),
  constraint clients_status_check check (
    status in ('active', 'booked', 'complete', 'archived')
  )
);

create index if not exists clients_event_date_idx on public.clients (event_date);
create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_planning_package_idx on public.clients (planning_package);
create index if not exists clients_lead_id_idx on public.clients (lead_id);

-- Which sign-ins can see which celebration. A couple is two people, and a
-- parent paying the invoices may be a third, so this is deliberately a
-- separate table rather than one login per celebration.
create table if not exists public.client_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null default 'client',
  invited_email text,

  constraint client_users_relationship_check check (
    relationship in ('client', 'partner', 'family', 'guest')
  ),
  unique (client_id, user_id)
);

create index if not exists client_users_client_id_idx on public.client_users (client_id);
create index if not exists client_users_user_id_idx on public.client_users (user_id);

drop trigger if exists clients_set_updated_at on public.clients;

create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

-- Locked down by default: only the server's service key reaches these.
alter table public.clients enable row level security;
alter table public.client_users enable row level security;

comment on table public.clients is 'One row per celebration. Owned and managed by the studio.';
comment on table public.client_users is 'Links a sign-in to the celebration they are allowed to see.';
comment on column public.clients.planning_package is 'Venue Finder through Full Planning. Separate from design_tier.';
comment on column public.clients.design_tier is 'Existing floral/design tiers. Null when they have not bought one.';
