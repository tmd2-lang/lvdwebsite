-- Marketing workspace: to-dos, daily stats and notes. Owner-only.
-- Run once in the Supabase SQL editor. Safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.marketing_todos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  channel text not null default 'general',
  -- Null means outstanding. Set means done.
  completed_at timestamptz,
  constraint marketing_todos_title_check check (char_length(trim(title)) > 0)
);

create table if not exists public.marketing_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  channel text not null default 'general',
  body text not null,
  constraint marketing_notes_body_check check (char_length(trim(body)) > 0)
);

-- One free-text box per channel per day.
create table if not exists public.marketing_stats (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  day date not null,
  channel text not null,
  body text not null default '',
  unique (day, channel)
);

create index if not exists marketing_todos_open_idx on public.marketing_todos (completed_at, created_at);
create index if not exists marketing_notes_created_idx on public.marketing_notes (created_at desc);

alter table public.marketing_todos enable row level security;
alter table public.marketing_notes enable row level security;
alter table public.marketing_stats enable row level security;
