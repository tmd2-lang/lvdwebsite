-- Studio-only documents: internal files the couple never sees.
-- Run once in the Supabase SQL editor, BEFORE deploying the matching code.
-- Safe to re-run. Existing documents stay visible to their couple.

alter table public.documents
  add column if not exists studio_only boolean not null default false;

create index if not exists documents_client_couple_idx
  on public.documents (client_id) where studio_only = false and deleted_at is null;

comment on column public.documents.studio_only is
  'True means only the studio can see or open this file. The couple portal never lists or serves it.';
