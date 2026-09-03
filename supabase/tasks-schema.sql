-- Planning tasks the studio sets for a celebration.
-- Run once in the Supabase SQL editor. Safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.client_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  client_id uuid not null references public.clients(id) on delete cascade,

  title text not null,
  note text,
  due_on date,

  -- Whose job it is. Both sides can tick a task off either way; this only
  -- says who it is waiting on, so the couple's list is not cluttered with
  -- the studio's own reminders.
  owner text not null default 'client',

  -- Null means outstanding. Set means done.
  completed_at timestamptz,
  completed_by text,

  -- Manual ordering, lowest first.
  position integer not null default 0,

  created_by text,

  constraint client_tasks_owner_check check (owner in ('client', 'studio')),
  constraint client_tasks_title_check check (char_length(trim(title)) > 0)
);

create index if not exists client_tasks_client_id_idx on public.client_tasks (client_id);
create index if not exists client_tasks_due_on_idx on public.client_tasks (due_on);

alter table public.client_tasks enable row level security;

drop trigger if exists client_tasks_set_updated_at on public.client_tasks;

create trigger client_tasks_set_updated_at
before update on public.client_tasks
for each row
execute function public.set_updated_at();

comment on table public.client_tasks is 'Planning tasks for one celebration. The studio creates them; either side can tick them off.';
comment on column public.client_tasks.owner is 'client = waiting on the couple, studio = waiting on us.';
comment on column public.client_tasks.completed_at is 'Null means outstanding. Set means done.';
