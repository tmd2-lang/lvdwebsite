-- Guests, RSVP & hospitality, per celebration.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- One row per guest, household, or table. Every guest view in the portal
-- (follow-up, meals, travel, caterer handoff, seating) is a filter over these
-- rows, so the counts can never drift between views. The fields themselves
-- live in `data` and are checked by the site before saving.

create extension if not exists pgcrypto;

create table if not exists public.client_guest_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  client_id uuid not null references public.clients(id) on delete cascade,
  kind text not null,
  data jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  updated_by text,

  constraint client_guest_records_kind_check check (kind in ('guest', 'household', 'table'))
);

create index if not exists client_guest_records_client_id_idx on public.client_guest_records (client_id, kind);

-- Setup facts, which events this celebration has, and the Counts Locked state.
create table if not exists public.client_guest_settings (
  client_id uuid primary key references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  setup jsonb not null default '{}'::jsonb,
  events jsonb not null default '["Ceremony", "Cocktail Hour", "Reception"]'::jsonb,

  counts_locked boolean not null default false,
  locked_at timestamptz,
  locked_by text,

  -- Changes made after the lock: [{at, by, guest, field, from, to}].
  exceptions jsonb not null default '[]'::jsonb,

  updated_by text
);

alter table public.client_guest_records enable row level security;
alter table public.client_guest_settings enable row level security;

drop trigger if exists client_guest_records_set_updated_at on public.client_guest_records;
create trigger client_guest_records_set_updated_at before update on public.client_guest_records
for each row execute function public.set_updated_at();

drop trigger if exists client_guest_settings_set_updated_at on public.client_guest_settings;
create trigger client_guest_settings_set_updated_at before update on public.client_guest_settings
for each row execute function public.set_updated_at();

comment on table public.client_guest_records is 'Guests, households, and tables for one celebration. Guest data is private to the studio and that couple.';
comment on column public.client_guest_settings.exceptions is 'Changes to attendance, meals, or seats made after counts were locked.';
