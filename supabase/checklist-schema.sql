-- The master planning checklist, per celebration.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- The 121 tasks themselves live in the site code (src/data/planning-checklist.json).
-- This table only holds what the studio has changed for one client: a task
-- with no row here is simply "Not Started", unassigned beyond the template's
-- owner, with a due date suggested from the wedding date.

create extension if not exists pgcrypto;

create table if not exists public.client_checklist_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  client_id uuid not null references public.clients(id) on delete cascade,

  -- The template id, e.g. LVD-001.
  task_id text not null,

  status text not null default 'not_started',

  -- Null means use the template's owner / the suggested date.
  owner text,
  due_on date,

  -- Studio-only. Never shown to the couple.
  notes text,

  updated_by text,

  constraint client_checklist_items_task_check check (task_id ~ '^LVD-[0-9]{3}$'),
  constraint client_checklist_items_status_check check (status in (
    'not_started', 'in_progress', 'waiting_client', 'waiting_vendor', 'at_risk', 'complete', 'not_applicable'
  )),
  constraint client_checklist_items_unique unique (client_id, task_id)
);

create index if not exists client_checklist_items_client_id_idx on public.client_checklist_items (client_id);

alter table public.client_checklist_items enable row level security;

drop trigger if exists client_checklist_items_set_updated_at on public.client_checklist_items;

create trigger client_checklist_items_set_updated_at
before update on public.client_checklist_items
for each row
execute function public.set_updated_at();

comment on table public.client_checklist_items is 'Per-client changes to the master planning checklist. The task list itself is a template in the site code.';
comment on column public.client_checklist_items.notes is 'Studio-only notes. Never shown in the couple''s portal.';
