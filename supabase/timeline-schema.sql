-- The event-day timeline, one per celebration.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- The whole timeline is one document per client: overview facts, cues,
-- production blocks, vendor call sheet, and crew roster. A client with no row
-- here starts from the starter template in src/data/timeline-template.json,
-- and the row is written the first time someone saves a change.

create table if not exists public.client_timelines (
  client_id uuid primary key references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Bumps whenever a confirmed cue or block changes, so nobody works from a
  -- stale printout.
  version integer not null default 1,

  overview jsonb not null default '{}'::jsonb,
  cues jsonb not null default '[]'::jsonb,
  production jsonb not null default '[]'::jsonb,
  vendors jsonb not null default '[]'::jsonb,
  crew jsonb not null default '[]'::jsonb,

  updated_by text,

  constraint client_timelines_version_check check (version >= 1)
);

alter table public.client_timelines enable row level security;

drop trigger if exists client_timelines_set_updated_at on public.client_timelines;
create trigger client_timelines_set_updated_at before update on public.client_timelines
for each row execute function public.set_updated_at();

comment on table public.client_timelines is 'Event-day timeline for one celebration: overview, cues, production, vendors, crew.';
comment on column public.client_timelines.version is 'Bumps when a confirmed cue or production block is edited.';
