-- Planning documents: contracts, proposals, floorplans.
-- Run once in the Supabase SQL editor. Safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  client_id uuid not null references public.clients(id) on delete cascade,

  name text not null,
  category text not null default 'Planning',
  note text,

  -- Where the file sits in storage. Never a public address: the file is
  -- fetched through the site, which checks who is asking first.
  storage_path text not null,
  content_type text,
  size_bytes bigint not null default 0,

  uploaded_by text,

  constraint documents_category_check check (
    category in ('Contracts', 'Design', 'Planning', 'Invoices')
  ),
  unique (storage_path)
);

create index if not exists documents_client_id_idx on public.documents (client_id);
create index if not exists documents_created_at_idx on public.documents (created_at desc);

alter table public.documents enable row level security;

comment on table public.documents is 'Files belonging to one celebration. The file itself lives in the private client-documents bucket.';
comment on column public.documents.storage_path is 'Path inside the private bucket. Not a URL and not publicly reachable.';
